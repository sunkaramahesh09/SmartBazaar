# 🛒 Smart Bazaar — Full-Stack Grocery App

A production-grade grocery e-commerce platform with **store pickup only**, AI-powered features, and a full admin panel.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or MongoDB Atlas URI

---

### 1. Setup Server

```bash
cd server
npm install
# Edit .env if needed (MONGO_URI, SMTP settings, etc.)
node seed.js          # Seed database with sample data
npm run dev           # Starts on http://localhost:5000
```

### 2. Setup Client

```bash
cd client
npm install
npm run dev           # Starts on http://localhost:5173
```

---

## 🔑 Default Logins (after seed)

| Role  | Email                       | Password     |
|-------|-----------------------------|--------------|
| Admin | admin@smartbazaar.com     | Admin@1234   |
| User  | mahesh@example.com          | User@1234    |

---

## 📁 Project Structure

```
Smart-Bazaar/
├── server/
│   ├── config/         # DB connection
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, uploads, errors
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── utils/          # Mailer, helpers
│   ├── uploads/        # Uploaded images
│   ├── seed.js         # DB seeder
│   └── index.js        # Entry point
│
└── client/
    └── src/
        ├── components/
        │   ├── layout/   # Navbar, Footer
        │   ├── common/   # ProductCard, SearchBar, AIChatbot
        │   └── admin/    # AdminLayout
        ├── contexts/     # AuthContext, CartContext
        ├── pages/        # All user pages
        │   └── admin/    # All admin pages
        └── services/     # Axios API client
```

---

## ✨ Features

### Customer Side
- 🏠 **Home** — Hero, categories, featured products, store highlights
- 🔍 **Product Search** — Text, Voice (supports Telugu: "naaku chicken masala kavali"), Image/OCR
- 🛒 **Cart** — Persistent, qty controls, price summary
- 🏪 **Checkout** — Select store, place order → get numeric token
- 📦 **Orders** — Status stepper + pickup token display
- 🤖 **AI Chatbot** — Budget suggestions, dish ingredients, Add to Cart inline

### Admin Panel (`/admin`)
- 📊 **Dashboard** — Stats + recent orders
- 📦 **Products** — Add/Edit/Delete with image upload, featured toggle
- 🏷️ **Categories** — CRUD with categories auto-appearing on customer side
- 🏪 **Stores** — Add/Edit/Delete stores (instantly visible at checkout)
- 🧾 **Orders** — Live status update + token view
- 📉 **Inventory** — Track stock, set thresholds, auto email if stock < threshold

### Advanced Search
| Type  | How it works |
|-------|-------------|
| Text  | Debounced input → MongoDB text search |
| Voice | Web Speech API (lang: te-IN, falls back to en-IN) |
| Image | Tesseract.js OCR → extracted text → search |

### AI Chatbot
- Budget: *"Items under ₹500"* → filters by maxPrice
- Dish: *"Chicken curry"* → searches ingredients
- Add to Cart inline from chatbot results
- Floating button on all pages

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | – | Register |
| POST | `/api/auth/login` | – | Login |
| GET  | `/api/auth/me` | User | Profile |
| GET  | `/api/products` | – | List products (search, filter, paginate) |
| GET  | `/api/products/:id` | – | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT  | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Remove product |
| GET  | `/api/categories` | – | All categories |
| GET  | `/api/stores` | – | All stores |
| POST | `/api/orders` | User | Place order |
| GET  | `/api/orders/my` | User | My orders |
| GET  | `/api/orders/admin/all` | Admin | All orders |
| PUT  | `/api/orders/admin/:id/status` | Admin | Update order status |
| GET  | `/api/inventory` | Admin | View inventory |
| PUT  | `/api/inventory/:productId` | Admin | Update stock + trigger alert |

---

## 🎨 Design System

Colors extracted from Smart Bazaar logo:
- **Primary**: `#C0191D` (Crimson Red)
- **Primary Dark**: `#8B1013`
- **Primary Light**: `#E63035`

Font: **Inter** (Google Fonts)

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```
MONGO_URI=mongodb://localhost:27017/smart-bazaar
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
PORT=5000
ADMIN_EMAIL=admin@smartbazaar.com
ADMIN_PASSWORD=Admin@1234
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
ALERT_EMAIL=alerts@smartbazaar.com
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000
```

---

## 📋 Order System

- **Store Pickup Only** (no delivery)
- Token generated on order placement (4-digit numeric, e.g. `7689`)
- Token visible to: **customer** and **admin only**
- Status flow: `Pending → Preparing → Ready for Pickup → Completed`

---

## 📧 Inventory Alerts

When admin sets stock below the threshold via Inventory page, a styled **email alert** is automatically sent via Nodemailer to the configured `ALERT_EMAIL`.

---

*Built with ❤️ for Smart Bazaar*
