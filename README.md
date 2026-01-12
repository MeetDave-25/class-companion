# AttendEasy

Full-stack attendance management system with QR code scanning, geolocation verification, and real-time updates.

## 🚀 Quick Start

### Frontend (Vite + React)
```bash
npm install
npm run dev
```

### Backend (Node.js + Express)
```bash
cd server
npm install
npm start
```

## 📁 Project Structure

```
class-companion/
├── src/              # React frontend
├── server/           # Node.js backend API
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── config/   # Database config
│   │   └── db/       # SQL schemas
│   └── package.json
├── render.yaml       # Deployment config
└── package.json
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deploying to Render.com + Netlify.

## 🔑 Default Accounts

**Teacher:**
- Email: `teacher@college.edu`
- Password: `teacher123`

**Student:**
- Email: `student@college.edu`
- Password: `student123`

## 📚 Features

- ✅ QR code attendance with expiration
- ✅ Geolocation verification
- ✅ Real-time attendance updates
- ✅ Student and teacher portals
- ✅ Attendance history and analytics
- ✅ JWT authentication

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Vite, TailwindCSS, Framer Motion  
**Backend:** Node.js, Express, PostgreSQL  
**Deployment:** Netlify (frontend), Render (backend + database)
