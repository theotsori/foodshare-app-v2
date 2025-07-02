-- Schema for FoodShare Application
-- Enable PostGIS extension for geolocation support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TYPE user_role AS ENUM ('donor', 'recipient', 'admin');
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    location GEOMETRY(POINT, 4326), -- PostGIS point for latitude/longitude
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users USING GIST (location);

-- Categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(10)
);
CREATE INDEX idx_categories_name ON categories(name);

-- Donations table
CREATE TYPE donation_status AS ENUM ('available', 'claimed', 'completed', 'expired');
CREATE TABLE donations (
    donation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE RESTRICT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    quantity VARCHAR(50) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    photo_url VARCHAR(255),
    photo_file VARCHAR(255),
    status donation_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_address TEXT,
    location GEOMETRY(POINT, 4326),
    CONSTRAINT chk_expiry_date CHECK (expiry_date > created_at)
);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_location ON donations USING GIST (location);

-- Requests table
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
CREATE TABLE requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    donation_id UUID REFERENCES donations(donation_id) ON DELETE CASCADE,
    pickup_time_preference VARCHAR(50),
    notes TEXT,
    status request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_requests_donation_status ON requests(donation_id, status);

-- Matches table
CREATE TYPE match_status AS ENUM ('scheduled', 'completed', 'canceled');
CREATE TABLE matches (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID REFERENCES donations(donation_id) ON DELETE CASCADE,
    request_id UUID REFERENCES requests(request_id) ON DELETE CASCADE,
    donor_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_date TIMESTAMP,
    status match_status NOT NULL DEFAULT 'scheduled',
    CONSTRAINT chk_donor_recipient_different CHECK (donor_id != recipient_id)
);
CREATE INDEX idx_matches_donation_recipient ON matches(donation_id, recipient_id);

-- Feedback table
CREATE TABLE feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(match_id) ON DELETE CASCADE,
    donor_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_feedback_match_id ON feedback(match_id);
CREATE INDEX idx_feedback_donor_recipient ON feedback(donor_id, recipient_id);

-- Notifications table
CREATE TYPE notification_type AS ENUM ('match', 'request_accepted', 'request_rejected', 'donation_expiring');
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_donations_timestamp
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_requests_timestamp
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
