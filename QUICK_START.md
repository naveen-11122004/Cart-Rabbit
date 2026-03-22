# WhatsApp Clone - Quick Start Guide

## 🚀 Quick Start (2 Minutes)

### Prerequisites
- Node.js installed
- MongoDB running locally or Atlas account

### Step 1: Start MongoDB
```bash
mongod
```
(Skip if using MongoDB Atlas - just update MONGO_URI)

### Step 2: Install & Start Backend
```bash
cd whatsapp-clone/server
npm install
npm run dev
```
✅ Backend should run on http://localhost:5000

### Step 3: Install & Start Frontend (New Terminal)
```bash
cd whatsapp-clone/client
npm install
npm run dev
```
✅ Frontend should run on http://localhost:5173

### Step 4: Test the App
1. Open http://localhost:5173
2. Register with: `user1@test.com` / username: `alice` / password: `password123`
3. Logout and register another: `user2@test.com` / username: `bob` / password: `password123`
4. Login as alice, select bob from sidebar, and send a message
5. Open a new incognito tab, login as bob
6. You'll see real-time messaging! 🎉

---

## 📁 Directory Structure

```
whatsapp-clone/
├── server/           # Backend (Port 5000)
│   ├── src/
│   │   ├── models/   # User & Message schemas
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── socket/   # Socket.IO handlers
│   ├── package.json
│   └── .env
│
├── client/           # Frontend (Port 5173)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/  # Auth state
│   │   └── utils/    # Socket setup
│   ├── package.json
│   └── .env
│
└── README.md         # Full documentation
```

---

## 📋 Environment Files

### server/.env
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp-clone
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret
```

### client/.env
```env
VITE_API_URL=http://localhost:5000
```

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Start MongoDB with `mongod` |
| Port 5000 already in use | Change PORT in .env to 5001 |
| Messages not real-time | Restart backend & frontend |
| Component styles missing | Hard refresh: Ctrl+Shift+R |

---

## ✅ Features Included

- ✅ User registration & login (hashed passwords)
- ✅ View all users in sidebar
- ✅ Real-time messaging with Socket.IO
- ✅ Message persistence (MongoDB)
- ✅ Auto-scroll to latest messages
- ✅ Sent/Received message styling
- ✅ Timestamps on messages
- ✅ Protected routes
- ✅ Logout functionality

---

## 📚 Full Documentation

See README.md for:
- Complete API documentation
- Socket.IO event details
- Troubleshooting guide
- Testing multiple users

---

**Happy coding! 🎉**
