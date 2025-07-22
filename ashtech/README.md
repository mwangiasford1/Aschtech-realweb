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
  backend/      # Express.js + MongoDB backend API (Mongoose)
    src/
      controllers/
      middleware/
      models/
      routes/
      app.js
      server.js
      mongo.js
    uploads/     # Uploaded files (images, etc.)
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
- MongoDB (local installation or Atlas account)

### Backend Setup
1. **Install dependencies:**
   ```bash
   cd ashtech/backend
   npm install
   ```
2. **Configure MongoDB:**
   - By default, the backend connects to `mongodb://localhost:27017/ashtech`.
   - To use a different MongoDB URI (e.g., Atlas), set the `MONGO_URI` environment variable in a `.env` file:
     ```env
     MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/ashtech?retryWrites=true&w=majority
     ```
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
  - Database: MongoDB (see `src/mongo.js`)
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

## Demo

- **Video Demo:** [Watch on Google Drive](https://drive.google.com/file/d/1kD2KOy1kU40rBPdgf2yis8Jkzs9oeLFH/view?usp=drive_link)
- **Live Demo:** [https://aschtech-frontend.onrender.com](https://aschtech-frontend.onrender.com) 