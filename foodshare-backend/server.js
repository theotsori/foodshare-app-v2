const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Multer Setup for File Uploads ---
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Test DB connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database!'))
  .catch(err => console.error('Connection error', err.stack));

// --- User Management ---

// Register a new user
app.post('/api/users/register', async (req, res) => {
  const { role, name, email, password_hash, phone, address, latitude, longitude } = req.body;
  try {
    const query = `
      INSERT INTO users (role, name, email, password_hash, phone, address, location)
      VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326))
      RETURNING user_id, name, email, role, phone, address, ST_X(location) as longitude, ST_Y(location) as latitude, created_at, is_verified;
    `;
    const result = await pool.query(query, [role, name, email, password_hash, phone, address, longitude, latitude]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error registering user:', err.message, err.stack);
    if (err.code === '23505') { // Unique violation for email
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login (simplified - in a real app, use proper authentication like JWT)
app.post('/api/users/login', async (req, res) => {
  const { email, password_hash } = req.body; // Assuming password_hash is sent directly for simplicity
  try {
    const query = `
      SELECT user_id, role, name, email, phone, address, ST_X(location) as longitude, ST_Y(location) as latitude, is_verified
      FROM users
      WHERE email = $1 AND password_hash = $2;
    `;
    const result = await pool.query(query, [email, password_hash]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Error during login:', err.message, err.stack);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get user profile by ID
app.get('/api/users/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const query = `
      SELECT user_id, role, name, email, phone, address, ST_X(location) as longitude, ST_Y(location) as latitude, created_at, updated_at, is_verified
      FROM users
      WHERE user_id = $1;
    `;
    const result = await pool.query(query, [user_id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error fetching user:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching user' });
  }
});


// --- Categories ---

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

// --- Donations ---

// Get all available donations (with optional proximity search)
app.get('/api/donations', async (req, res) => {
  try {
    const { lat, lng, distance, category_id, search_term } = req.query; // distance in meters
    let query = `
      SELECT d.donation_id, d.title, d.description, d.quantity, d.expiry_date, d.photo_url, d.status,
             d.pickup_address, ST_X(d.location) AS longitude, ST_Y(d.location) AS latitude,
             u.user_id AS donor_user_id, u.name AS donor_name, c.name AS category_name, c.icon AS category_icon
      FROM donations d
      JOIN users u ON d.user_id = u.user_id
      JOIN categories c ON d.category_id = c.category_id
      WHERE d.status = 'available'
    `;
    const params = [];
    let paramIndex = 1;

    if (lat && lng && distance) {
      query += ` AND ST_DWithin(d.location, ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326), $${paramIndex++})`;
      params.push(parseFloat(lng), parseFloat(lat), parseFloat(distance));
    }
    if (category_id) {
      query += ` AND d.category_id = $${paramIndex++}`;
      params.push(parseInt(category_id));
    }
    if (search_term) {
      query += ` AND (d.title ILIKE $${paramIndex} OR d.description ILIKE $${paramIndex})`;
      params.push(`%${search_term}%`);
    }

    query += ` ORDER BY d.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching donations:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching donations' });
  }
});

// Get a single donation by ID
app.get('/api/donations/:donation_id', async (req, res) => {
  const { donation_id } = req.params;
  try {
    const query = `
      SELECT d.donation_id, d.title, d.description, d.quantity, d.expiry_date, d.photo_url, d.status,
             d.pickup_address, ST_X(d.location) AS longitude, ST_Y(d.location) AS latitude,
             u.user_id AS donor_user_id, u.name AS donor_name, u.email AS donor_email, u.phone AS donor_phone,
             c.name AS category_name, c.icon AS category_icon
      FROM donations d
      JOIN users u ON d.user_id = u.user_id
      JOIN categories c ON d.category_id = c.category_id
      WHERE d.donation_id = $1;
    `;
    const result = await pool.query(query, [donation_id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Donation not found' });
    }
  } catch (err) {
    console.error('Error fetching donation by ID:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching donation' });
  }
});

// Get all donations for a specific user
app.get('/api/users/:user_id/donations', async (req, res) => {
  const { user_id } = req.params;
  try {
    const query = `
      SELECT
        d.donation_id,
        d.title,
        d.quantity,
        d.status,
        d.expiry_date
      FROM donations d
      WHERE d.user_id = $1
      ORDER BY d.created_at DESC;
    `;
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user donations:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching user donations' });
  }
});


// Create a donation (now handles file uploads)
app.post('/api/donations', upload.single('photo_file'), async (req, res) => {
  const { user_id, category_id, title, description, quantity, expiry_date, photo_url, pickup_address, latitude, longitude } = req.body;
  
  // Use the path to the stored file if it exists, otherwise use the provided URL or null.
  // The frontend should ensure that if a file is uploaded, the photo_url is cleared.
  const finalPhotoUrl = req.file ? `/uploads/${req.file.filename}` : photo_url || null;
  const photo_file_path = req.file ? req.file.path : null;

  try {
    const result = await pool.query(
      `INSERT INTO donations (user_id, category_id, title, description, quantity, expiry_date, photo_url, photo_file, pickup_address, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_SetSRID(ST_MakePoint($10, $11), 4326))
       RETURNING donation_id, title, description, quantity, expiry_date, photo_url, photo_file, status, pickup_address, ST_X(location) as longitude, ST_Y(location) as latitude, created_at`,
      [user_id, category_id, title, description, quantity, expiry_date, finalPhotoUrl, photo_file_path, pickup_address, longitude, latitude]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error posting donation:', err.message, err.stack);
    res.status(500).json({ error: 'Server error posting donation' });
  }
});


// Update donation status
app.put('/api/donations/:donation_id/status', async (req, res) => {
  const { donation_id } = req.params;
  const { status } = req.body; // e.g., 'claimed', 'completed', 'expired'
  try {
    const result = await pool.query(
      `UPDATE donations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE donation_id = $2 RETURNING *`,
      [status, donation_id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Donation not found' });
    }
  } catch (err) {
    console.error('Error updating donation status:', err.message, err.stack);
    res.status(500).json({ error: 'Server error updating donation status' });
  }
});


// --- Requests ---

// Create a request
app.post('/api/requests', async (req, res) => {
  const { user_id, donation_id, pickup_time_preference, notes } = req.body;
  try {
    // Optional: Check if donation is still available before creating request
    const donationCheck = await pool.query('SELECT status FROM donations WHERE donation_id = $1', [donation_id]);
    if (donationCheck.rows.length === 0 || donationCheck.rows[0].status !== 'available') {
      return res.status(400).json({ error: 'Donation is not available for request.' });
    }

    const result = await pool.query(
      `INSERT INTO requests (user_id, donation_id, pickup_time_preference, notes, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING request_id, user_id, donation_id, pickup_time_preference, notes, status, created_at`,
      [user_id, donation_id, pickup_time_preference, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating request:', err.message, err.stack);
    res.status(500).json({ error: 'Server error creating request' });
  }
});

// Get requests for a specific user (either as a requester or for their donations)
app.get('/api/users/:user_id/requests', async (req, res) => {
  const { user_id } = req.params;
  try {
    const query = `
      SELECT
        r.request_id, r.pickup_time_preference, r.notes, r.status AS request_status, r.created_at AS request_created_at,
        d.donation_id, d.title AS donation_title, d.quantity AS donation_quantity, d.expiry_date AS donation_expiry_date,
        u_donor.user_id AS donor_id, u_donor.name AS donor_name, u_donor.phone AS donor_phone, u_donor.email AS donor_email,
        u_requester.user_id AS requester_id, u_requester.name AS requester_name, u_requester.phone AS requester_phone, u_requester.email AS requester_email
      FROM requests r
      JOIN donations d ON r.donation_id = d.donation_id
      JOIN users u_donor ON d.user_id = u_donor.user_id
      JOIN users u_requester ON r.user_id = u_requester.user_id
      WHERE r.user_id = $1 OR d.user_id = $1
      ORDER BY r.created_at DESC;
    `;
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user requests:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching user requests' });
  }
});


// Update request status (e.g., by donor: accept/reject)
app.put('/api/requests/:request_id/status', async (req, res) => {
  const { request_id } = req.params;
  const { status, donor_id } = req.body; // status: 'accepted', 'rejected'
  try {
    // Verify that the user changing status is the donor of the related donation
    const verification = await pool.query(`
      SELECT d.user_id AS donor_id
      FROM requests r
      JOIN donations d ON r.donation_id = d.donation_id
      WHERE r.request_id = $1;
    `, [request_id]);

    if (verification.rows.length === 0 || verification.rows[0].donor_id !== donor_id) {
      return res.status(403).json({ error: 'Unauthorized to update this request.' });
    }

    const result = await pool.query(
      `UPDATE requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE request_id = $2 RETURNING *`,
      [status, request_id]
    );

    if (result.rows.length > 0) {
      // If request is accepted, create a match and update donation status to 'claimed'
      if (status === 'accepted') {
        const acceptedRequest = result.rows[0];
        const { user_id: recipient_id, donation_id } = acceptedRequest;

        const donationDetails = await pool.query('SELECT user_id FROM donations WHERE donation_id = $1', [donation_id]);
        const donor_id_from_donation = donationDetails.rows[0].user_id;

        await pool.query('BEGIN'); // Start transaction

        // Create match
        const matchResult = await pool.query(
          `INSERT INTO matches (donation_id, request_id, donor_id, recipient_id, pickup_date, status)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'scheduled')
           RETURNING *`,
          [donation_id, request_id, donor_id_from_donation, recipient_id]
        );

        // Update donation status to claimed
        await pool.query(`UPDATE donations SET status = 'claimed' WHERE donation_id = $1`, [donation_id]);

        // Mark other pending requests for the same donation as rejected
        await pool.query(`
          UPDATE requests
          SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
          WHERE donation_id = $1 AND request_id != $2 AND status = 'pending'
        `, [donation_id, request_id]);

        // Create notifications (simplified, in real app use a notification service)
        await pool.query(`
          INSERT INTO notifications (user_id, type, message)
          VALUES ($1, 'request_accepted', 'Your request for "${donationDetails.rows[0].title}" has been accepted! A match has been created.'),
                 ($2, 'match', 'A new match has been created for your donation "${donationDetails.rows[0].title}".');
        `, [recipient_id, donor_id_from_donation]);


        await pool.query('COMMIT'); // Commit transaction
        res.json({ request: result.rows[0], match: matchResult.rows[0] });
      } else {
        res.json(result.rows[0]);
      }
    } else {
      res.status(404).json({ error: 'Request not found' });
    }
  } catch (err) {
    await pool.query('ROLLBACK'); // Rollback transaction on error
    console.error('Error updating request status:', err.message, err.stack);
    res.status(500).json({ error: 'Server error updating request status' });
  }
});


// --- Matches ---

// Get matches for a user (either as donor or recipient)
app.get('/api/users/:user_id/matches', async (req, res) => {
  const { user_id } = req.params;
  try {
    const query = `
      SELECT
        m.match_id, m.match_date, m.pickup_date, m.status AS match_status,
        d.donation_id, d.title AS donation_title, d.quantity AS donation_quantity,
        d.pickup_address AS donation_pickup_address,
        u_donor.user_id AS donor_id, u_donor.name AS donor_name, u_donor.phone AS donor_phone, u_donor.email AS donor_email,
        u_recipient.user_id AS recipient_id, u_recipient.name AS recipient_name, u_recipient.phone AS recipient_phone, u_recipient.email AS recipient_email
      FROM matches m
      JOIN donations d ON m.donation_id = d.donation_id
      JOIN users u_donor ON m.donor_id = u_donor.user_id
      JOIN users u_recipient ON m.recipient_id = u_recipient.user_id
      WHERE m.donor_id = $1 OR m.recipient_id = $1
      ORDER BY m.match_date DESC;
    `;
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user matches:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching user matches' });
  }
});

// Update match status (e.g., 'completed', 'canceled')
app.put('/api/matches/:match_id/status', async (req, res) => {
  const { match_id } = req.params;
  const { status, user_id } = req.body;

  // Validate inputs
  if (!match_id || !status || !user_id) {
    return res.status(400).json({ error: 'Missing required fields: match_id, status, or user_id' });
  }
  if (!['scheduled', 'completed', 'canceled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be scheduled, completed, or canceled' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify match exists
    const match = await client.query(
      'SELECT donor_id, recipient_id, donation_id FROM matches WHERE match_id = $1',
      [match_id]
    );
    if (match.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Match not found' });
    }

    const { donor_id, recipient_id, donation_id } = match.rows[0];

    // Verify user authorization
    if (user_id !== donor_id && user_id !== recipient_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Unauthorized to update this match' });
    }

    // Verify donation exists
    const donation = await client.query(
      'SELECT donation_id, status, title FROM donations WHERE donation_id = $1',
      [donation_id]
    );
    if (donation.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Associated donation not found' });
    }

    // Update match status
    const result = await client.query(
      `UPDATE matches SET status = $1 WHERE match_id = $2 RETURNING *`,
      [status, match_id]
    );

    // Update donation status
    if (status === 'completed') {
      await client.query(
        `UPDATE donations SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE donation_id = $1`,
        [donation_id]
      );
    } else if (status === 'canceled') {
      await client.query(
        `UPDATE donations SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE donation_id = $1`,
        [donation_id]
      );
    }

    // Create notifications using 'match' type
    const notificationMessage = status === 'completed'
      ? `Match for donation ${donation.rows[0].title} marked as completed`
      : `Match for donation ${donation.rows[0].title} canceled`;
    await client.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES ($1, 'match', $2), ($3, 'match', $2)`,
      [donor_id, notificationMessage, recipient_id]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating match status:', err.message, err.stack);
    res.status(500).json({ error: `Server error updating match status: ${err.message}` });
  } finally {
    client.release();
  }
});


// --- Feedback ---

// Submit feedback for a match
app.post('/api/feedback', async (req, res) => {
  const { match_id, donor_id, recipient_id, rating, comment } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO feedback (match_id, donor_id, recipient_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [match_id, donor_id, recipient_id, rating, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error submitting feedback:', err.message, err.stack);
    res.status(500).json({ error: 'Server error submitting feedback' });
  }
});

// Get feedback for a user (either given or received)
app.get('/api/users/:user_id/feedback', async (req, res) => {
  const { user_id } = req.params;
  try {
    const query = `
      SELECT
        f.feedback_id, f.rating, f.comment, f.created_at,
        u_donor.user_id AS donor_id, u_donor.name AS donor_name,
        u_recipient.user_id AS recipient_id, u_recipient.name AS recipient_name,
        m.match_id, d.title AS donation_title
      FROM feedback f
      JOIN matches m ON f.match_id = m.match_id
      JOIN users u_donor ON f.donor_id = u_donor.user_id
      JOIN users u_recipient ON f.recipient_id = u_recipient.user_id
      JOIN donations d ON m.donation_id = d.donation_id
      WHERE f.donor_id = $1 OR f.recipient_id = $1
      ORDER BY f.created_at DESC;
    `;
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user feedback:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching user feedback' });
  }
});


// --- Notifications ---

// Get user notifications
app.get('/api/users/:user_id/notifications', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT notification_id, type, message, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications:', err.message, err.stack);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:notification_id/read', async (req, res) => {
  const { notification_id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE notification_id = $1 RETURNING *`,
      [notification_id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (err) {
    console.error('Error marking notification as read:', err.message, err.stack);
    res.status(500).json({ error: 'Server error marking notification as read' });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
