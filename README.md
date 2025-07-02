## 🥗 FoodShare App

**FoodShare** is a community-driven platform that connects food donors with people in need. The app allows users to post surplus food items, view available donations, and help reduce food waste by sharing instead of discarding.

---

### 🚀 Features

* 🌍 **Geo-location** support for pickup addresses
* 📸 **Image upload** (via file or URL) with preview support
* 📅 **Expiry tracking** of food items
* 📦 **Categorized donations** for easy browsing
* 👤 **User authentication & profile management**
* 🧭 **Step-by-step carousel-style donation form**
* 🔔 **Success notifications** and error handling

---

### 🛠️ Tech Stack

| Frontend             | Backend                | Other Tools    |
| -------------------- | ---------------------- | -------------- |
| React + Tailwind CSS | Node.js + Express.js   | Axios          |
| React Context API    | PostgreSQL             | Lucide Icons   |
| React Router         | Multer (image uploads) | Vite / Webpack |

---

### ⚙️ Local Development Setup

1. **Clone the repo**

```bash
git clone https://github.com/theotsori/foodshare-app.git
cd foodshare-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Set environment variables**

Create a `.env` file and add:

```
API_BASE_URL=http://localhost:4000
```

> *Backend should be running on port 4000.*

4. **Run the development server**

```bash
npm run dev
```

---

### 📁 Folder Structure

```
src/
├── components/       # Reusable components (e.g., DonateModal)
├── hooks/            # Custom hooks (e.g., useFoodSharing)
├── pages/            # Route-based pages (Home, Matches, etc.)
├── context/          # Global state (user, categories)
└── App.jsx           # Main app component
```

---

### 📦 API Overview

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| POST   | `/api/donations`     | Create a new donation |
| GET    | `/api/donations`     | Get all donations     |
| GET    | `/api/donations/:id` | Get single donation   |
| POST   | `/api/auth/login`    | User login            |
| POST   | `/api/auth/register` | User registration     |

> *See backend repo or Swagger docs for more.*

---

### ✨ Contribution Guide

1. Fork the project
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a new Pull Request

---

### 📄 License

MIT License © 2025 \foodshare

---

### 💡 Inspiration

FoodShare was inspired by the desire to **fight hunger and reduce food waste** in local communities. A simple donation can make a big difference.
