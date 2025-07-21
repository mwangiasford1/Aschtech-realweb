# AshTech

AshTech is a full-stack MERN application designed as a one-stop solution for web design, tutorials, Q&A, real-time chat, notifications, and appointment booking. It features user authentication (with 2FA), an admin dashboard, and a modern, interactive UI built with React and Material UI.

## Features

- User authentication with 2FA (register, login, password reset)
- User profile management (with image upload)
- Tutorials: create, view, edit, delete, and search
- Q&A: ask questions, answer, tag, search, and moderate
- Real-time private chat between users
- Real-time notifications
- Appointment booking system
- Admin dashboard for analytics, user management, content moderation, notifications, and audit logs
- Responsive, modern UI with Material UI

## Directory Structure

```
ashtech/
  backend/      # Express.js + MySQL backend API
    src/
      controllers/
      middleware/
      models/
      routes/
      app.js
      server.js
      mysql.js
    config/
      config.json
    uploads/     # Uploaded files (images, etc.)
    migrations/  # DB migrations (if any)
  frontend/     # React + Vite frontend
    src/
      pages/
      context/
      routes/
      config/
      assets/
      App.jsx
      main.jsx
    public/
    package.json
    vite.config.js
    ...
  uploads/      # (project-level, may be used by backend)
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (comes with Node.js)
- MySQL (local or remote)

### Backend Setup
1. **Install dependencies:**
   ```bash
   cd ashtech/backend
   npm install
   ```
2. **Configure database:**
   - Edit `src/mysql.js` or `config/config.json` if your MySQL credentials differ (default: user `root`, password `1234`, db `ashtech`).
   - Ensure MySQL is running and the `ashtech` database exists.
3. **Run the backend server:**
   ```bash
   node src/server.js
   ```
   The backend runs on [http://localhost:5000](http://localhost:5000) by default.

### Frontend Setup
1. **Install dependencies:**
   ```bash
   cd ashtech/frontend
   npm install
   ```
2. **Run the frontend dev server:**
   ```bash
   npm run dev
   ```
   The frontend runs on [http://localhost:5173](http://localhost:5173) by default and proxies API requests to the backend.

## Usage
- Register a new user or log in.
- Explore tutorials, ask/answer questions, chat, and book appointments.
- Admin users can access the admin dashboard for analytics and management.

## Configuration
- **Backend:**
  - Database: `ashtech` (MySQL, see `src/mysql.js` and `config/config.json`)
  - Environment variables: You can use a `.env` file for sensitive config (see `src/app.js` for usage)
- **Frontend:**
  - API proxy is set in `vite.config.js` to forward `/api` requests to the backend.

## Deployment
- Deploy backend and frontend separately (e.g., Render, Vercel, Netlify, etc.)
- Set environment variables and database credentials as needed for production.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](../LICENSE) (or specify your license here) 