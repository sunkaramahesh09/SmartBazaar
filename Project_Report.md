# Project Report: Smart Bazaar
**A Full-Stack O2O (Online-to-Offline) Grocery E-Commerce Platform**

---

## 1. Project Overview
**Smart Bazaar** is a modern, full-stack web application designed to bridge the gap between digital convenience and local grocery shopping. It operates on an O2O (Online-to-Offline) model, allowing users to browse fresh produce and daily essentials online, place orders, and pick them up instantly at their nearest physical branch (BOPIS - Buy Online, Pick Up In Store), eliminating delivery fees and waiting times.

The platform includes two distinct interfaces:
1. **The User Portal**: A fully responsive frontend for customers to browse categories, use AI-powered features, manage their cart, and track orders in real-time.
2. **The Admin Dashboard**: A secure, comprehensive backend management system for store administrators to handle inventory, track multiple store locations, manage product catalogs, and process incoming orders.

---

## 2. Core Features & Capabilities

### For Customers
*   **Intuitive Shopping Experience**: Users can browse products by category, search by name, or explore currently featured items.
*   **Multi-Store Selection**: Before checkout, users select their preferred local branch/store for pickup.
*   **Smart AI Assistant**: 
    *   **Recipe Suggestions**: Users can ask the chatbot for recipes (e.g., "Chicken curry under ₹500"). The AI provides the recipe steps and automatically lists the exact ingredients available in the store with an "Add All" to cart button.
    *   **Image Analysis**: Users can upload a photo of a recipe list or a physical ingredient. An external Python AI vision API processes the image, identifies the items, and directly matches them with real products currently in stock at Smart Bazaar.
*   **Real-Time Order Tracking**: Once an order is placed, users receive a unique token. Their personal dashboard updates instantly (via WebSockets) as the admin changes the order status (Pending → Preparing → Ready for Pickup).

### For Administrators
*   **Centralized Dashboard**: Provides at-a-glance analytics on total products, overall sales, active stores, and low-inventory warnings.
*   **Product Management System**: Full CRUD (Create, Read, Update, Delete) capabilities for the product catalog. Ensures data integrity (e.g., stopping deletion of products tied to historical orders by implementing "soft deletes" instead).
*   **Dynamic Inventory Control**: Admin can monitor all stock levels. The system visually flags items falling below their specified "threshold," allowing for proactive restocking.
*   **Real-Time Order Fulfillment**: Admins see incoming orders appear instantly without refreshing the page. They process the orders and update the status, which pushes an immediate notification to the waiting customer.

---

## 3. Technology Stack & Architecture

Smart Bazaar is built using the **MERN** stack, enhanced with real-time bidirectional communication and external AI integrations.

### Frontend (Client Tier)
*   **Framework**: React.js (built with Vite for fast HMR and optimized builds)
*   **Styling**: Tailwind CSS (Utility-first CSS framework for rapid, responsive UI design)
*   **Routing**: React Router DOM v6
*   **State Management**: React Context API (`AuthContext`, `CartContext`)
*   **Real-Time Comms**: Socket.io-client
*   **Icons & Toasts**: Lucide React, React Hot Toast

### Backend (Server Tier)
*   **Environment**: Node.js
*   **Framework**: Express.js (RESTful API architecture)
*   **Database**: MongoDB (NoSQL) with Mongoose ODM
*   **Authentication**: JSON Web Tokens (JWT) & bcryptjs for password hashing
*   **Real-Time Comms**: Socket.io
*   **Image Handling**: Multer (Memory Storage) 
*   **External APIs**: Axios (communicating with the Python `recipifyai` external service)

---

## 4. System Architecture Workflow

### 4.1 Authentication & Authorization
1.  **Login/Register**: Users submit credentials. The backend hashes the password (bcrypt) during registration. On login, if passwords match, the backend generates a signed JWT.
2.  **Protection**: The frontend stores the JWT in `localStorage`. Every subsequent API request uses Axios interceptors to attach this token in the `Authorization: Bearer <token>` header.
3.  **Role-Based Access Control (RBAC)**: The database schema includes a `role` field (`user` or `admin`). Admin routes (e.g., `/api/admin/orders`) have middleware that verify the token *and* check if the role is exactly `admin`.

### 4.2 Database Relational Strategy (NoSQL)
Even though MongoDB is NoSQL, our system relies on critical references (`ref`) to maintain data structure across Collections:
*   **Products**: Base catalog items.
*   **Stores**: Physical locations.
*   **Orders**: Contains embedded arrays of items at the time of purchase (snapshotting the price so historical orders aren't affected by future price changes), and `ref`s to the `User` and the `Store`.

### 4.3 The AI Integration Flow
1.  **Image Upload**: The user uploads an image via the chatbot in the React frontend.
2.  **Node.js Proxy**: The frontend sends the file as `multipart/form-data` to our Node.js backend (`/api/ai/extract`).
3.  **Data Fetching**: The Node backend intercepts this, queries the MongoDB database for a list of *all currently available products*, and structures this into a JSON array.
4.  **External Request**: Using Node's `form-data` library, the server builds a new payload combining the raw image buffer and the JSON string of available products. It sends this to the Python/Flask `recipifyai` endpoint.
5.  **Fuzzy Matching**: The Python API returns identified ingredients. Our Node backend runs a fuzzy string matching algorithm to pair the AI's generic responses ("Potatoes") with our exact database items ("Potato (kg)"), attaching exact prices and `_id`s before sending it back to React.

### 4.4 Real-Time WebSockets Lifecycle
1.  When the React application loads, it establishes a persistent `Socket.io` connection to the Express server.
2.  An admin logs into the dashboard and clicks "Mark as Ready" on an order.
3.  The React app sends a standard HTTP `PUT` request to `/api/orders/:id/status`.
4.  The Express controller updates the database, and then executes `io.emit('order:updated', {...data})`.
5.  The Node server broadcasts this message to *every* connected WebSocket across all browsers currently on the website.
6.  The user's React application receives the `order:updated` event and updates its local React state instantly, changing the UI badge from blue ("Preparing") to green ("Ready") without reloading the browser.

---

## 5. Teammate Deep Dive: How to Navigate the Codebase

For teammates picking up development, here is a mental map of the folder structure:

### `/server` (Backend)
*   **`/models`**: The Mongoose schemas. If you need to add a new field to a Product or User, this is where you do it.
*   **`/controllers`**: The business logic. If an API route is behaving badly, look here. `orderController.js` handles checkout, `recipeController.js` handles the AI proxying.
*   **`/routes`**: The Express routers that map URLs (like `/api/products`) to the functions inside `/controllers`. Also contains the middleware (like `auth.js` for checking JWTs).
*   **`index.js`**: The absolute entry point. It connects to MongoDB, sets up Socket.io, and mounts all the routes.

### `/client` (Frontend)
*   **`/src/pages`**: The main bulk of the application. `HomePage.jsx`, `OrdersPage.jsx`, etc. Admin pages sit inside `/pages/admin`.
*   **`/src/components`**: Reusable UI parts.
    *   `/common`: `ProductCard.jsx`, `AIChatbot.jsx`, `ScrollToTop.jsx`.
    *   `/layout`: Unchanging parts of the screen like `Navbar.jsx` and `Footer.jsx`.
*   **`/src/contexts`**: Global state management that avoids "prop drilling".
    *   `AuthContext.jsx`: Wrapper that provides `user` data and `hasRole` functions to the whole app.
    *   `CartContext.jsx`: Wrapper that handles adding/removing items from the shopping cart globally.
*   **`/src/services`**:
    *   `api.js`: The central Axios instance configuring the base URL and JWT interceptors.
    *   `socket.js`: The singleton WebSocket client.

---

## 6. Future Scope & Scalability

While Smart Bazaar is a production-ready MVP, future enhancements could include:
1.  **Online Payment Gateway**: Integration with Stripe or Razorpay to allow pre-payment before pickup.
2.  **Delivery Routing**: Expanding from BOPIS to home delivery by integrating Maps apis for driver routing.
3.  **Advanced Caching**: Implementing Redis on the backend to cache the product catalog, significantly reducing database load during high-traffic periods.
4.  **Pagination Optimization**: Currently relying on basic skipping; transitioning to cursor-based pagination for massive product catalogs.
