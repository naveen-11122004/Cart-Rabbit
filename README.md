# WhatsApp Web Clone

A full-stack real-time messaging application built with React, Node.js, MongoDB, and Socket.IO.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [MongoDB Setup](#mongodb-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Testing with Multiple Users](#testing-with-multiple-users)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

WhatsApp Web Clone is a fully functional messaging application that replicates the core features of WhatsApp Web. It supports user registration and authentication, real-time messaging with Socket.IO, message persistence with MongoDB, and a responsive two-panel UI similar to WhatsApp Web.

**Live Features:**
- ✅ User registration and login with password hashing
- ✅ Real-time messaging with Socket.IO
- ✅ Message history and persistence
- ✅ User list with last message preview
- ✅ Automatic message fetching on chat selection
- ✅ Protected routes (authentication required)
- ✅ Responsive UI (desktop-first)

---

## Tech Stack

### Frontend
- **React.js** (18.2.0) - UI library
- **React Router** (6.11.2) - Client-side routing
- **Axios** (1.4.0) - HTTP client
- **Socket.IO Client** (4.6.1) - Real-time communication
- **Vite** - Build tool and dev server
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime
- **Express.js** (4.18.2) - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** (7.0.3) - ODM for MongoDB
- **Socket.IO** (4.6.1) - Real-time bidirectional communication
- **bcryptjs** (2.4.3) - Password hashing
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

---

## Project Structure

```
whatsapp-clone/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── UserAvatar.jsx
│   │   │   └── *.css
│   │   ├── pages/          # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── *.css
│   │   ├── context/        # React Context for state management
│   │   │   └── AuthContext.jsx
│   │   ├── utils/          # Utility functions
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
└── server/                 # Node.js Backend
    ├── src/
    │   ├── models/         # Mongoose schemas
    │   │   ├── User.js
    │   │   └── Message.js
    │   ├── controllers/    # Route handlers
    │   │   ├── userController.js
    │   │   └── messageController.js
    │   ├── routes/         # API routes
    │   │   ├── userRoutes.js
    │   │   └── messageRoutes.js
    │   ├── socket/         # Socket.IO handlers
    │   │   └── socketHandler.js
    │   └── app.js          # Express app setup
    ├── server.js           # Server entry point
    ├── package.json
    └── .env
```

---

## Prerequisites

Before you proceed, ensure you have installed:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (Local or Atlas) - [Download](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas)
3. **npm** or **yarn** - Usually comes with Node.js

**Check installation:**
```bash
node --version
npm --version
mongod --version  # For local MongoDB
```

---

## MongoDB Setup

### Option 1: Local MongoDB

1. **Install MongoDB Community Edition:**
   - Windows: Download from [here](https://www.mongodb.com/try/download/community)
   - macOS: Use Homebrew `brew install mongodb-community`
   - Linux: Follow [official docs](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB:**
   ```bash
   mongod
   ```
   This will run MongoDB on `mongodb://localhost:27017` by default.

3. **Verify connection:**
   ```bash
   mongo
   # In MongoDB shell, run: db.version()
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project and cluster
3. Get your connection string: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`
4. Update the `MONGO_URI` in server `.env` file

---

## Backend Setup

### 1. Navigate to Server Directory

```bash
cd whatsapp-clone/server
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- express (web framework)
- mongoose (database ODM)
- socket.io (real-time communication)
- bcryptjs (password hashing)
- cors (cross-origin handling)
- dotenv (environment variables)

### 3. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp-clone
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret_key_here
```

**Explanation:**
- `PORT`: Server port (default 5000)
- `MONGO_URI`: MongoDB connection string
  - Local: `mongodb://localhost:27017/whatsapp-clone`
  - Atlas: `mongodb+srv://user:password@cluster.mongodb.net/whatsapp-clone?retryWrites=true&w=majority`
- `CLIENT_URL`: Frontend URL for CORS
- `JWT_SECRET`: Secret key (can be any string)

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Expected output:**
```
Server running on http://localhost:5000
MongoDB connected
```

---

## Frontend Setup

### 1. Navigate to Client Directory

```bash
cd whatsapp-clone/client
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- react & react-dom
- react-router-dom (routing)
- axios (HTTP client)
- socket.io-client (real-time communication)
- vite (build tool)

### 3. Configure Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
```

**Explanation:**
- `VITE_API_URL`: Backend API URL for axios and socket.io connection

### 4. Start the Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v4.3.9  ready in 256 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Running the Application

### Step-by-Step:

1. **Start MongoDB** (if using local):
   ```bash
   mongod
   ```

2. **Start Backend Server** (in a terminal):
   ```bash
   cd whatsapp-clone/server
   npm run dev
   ```
   Should see: `Server running on http://localhost:5000`

3. **Start Frontend** (in another terminal):
   ```bash
   cd whatsapp-clone/client
   npm run dev
   ```
   Should see: `Local: http://localhost:5173/`

4. **Open in Browser:**
   - Navigate to `http://localhost:5173`
   - You'll be redirected to `/login`

---

## Features

### ✅ Implemented Features

| Feature | Status |
|---------|--------|
| User Registration | ✅ Complete |
| User Login | ✅ Complete |
| Password Hashing | ✅ bcryptjs |
| View All Users | ✅ Complete |
| Select User to Chat | ✅ Complete |
| Send Messages | ✅ Complete |
| Receive Messages | ✅ Real-time via Socket.IO |
| Message Persistence | ✅ MongoDB |
| Message History | ✅ Complete |
| Chronological Ordering | ✅ Complete |
| Message Styling | ✅ Sent (right, green) / Received (left, grey) |
| Show Timestamps | ✅ Complete |
| Auto-scroll | ✅ Complete |
| Protected Routes | ✅ Complete |
| Responsive Design | ✅ Two-panel layout |
| Real-time Sync | ✅ Socket.IO |
| Logout | ✅ Complete |

---

## Testing with Multiple Users

### Test Scenario:

1. **Create Users:**
   - User 1: Register with email `user1@test.com` / password `password123` / username `Alice`
   - User 2: Register with email `user2@test.com` / password `password123` / username `Bob`

2. **Test Real-time Messaging:**
   - Open browser tab 1: Login as User 1
   - Open browser tab 2 (incognito): Login as User 2
   - In Tab 1: Select Bob from sidebar and send "Hello Bob"
   - In Tab 2: Message should appear immediately in real-time from Alice

3. **Test Message Persistence:**
   - Close Tab 2
   - Refresh Tab 1 (or navigate away from chat)
   - Select Bob again
   - Previous messages should still be there

4. **Test Features:**
   - Verify sent messages appear on the RIGHT (green)
   - Verify received messages appear on the LEFT (grey)
   - Verify timestamps show below each message
   - Verify messages auto-scroll to latest
   - Verify sidebar shows last message preview

---

## API Documentation

### User Endpoints

#### POST `/api/users/register`
Register a new user.

**Request:**
```json
{
  "username": "alice",
  "email": "alice@test.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": "507f1f77bcf86cd799439011",
  "username": "alice"
}
```

---

#### POST `/api/users/login`
Login with email and password.

**Request:**
```json
{
  "email": "alice@test.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "userId": "507f1f77bcf86cd799439011",
  "username": "alice",
  "email": "alice@test.com"
}
```

---

#### GET `/api/users?currentUserId={userId}`
Get all users except the current user.

**Response (200):**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "username": "bob",
      "email": "bob@test.com"
    }
  ]
}
```

---

### Message Endpoints

#### POST `/api/messages/send`
Send a message.

**Request:**
```json
{
  "senderId": "507f1f77bcf86cd799439011",
  "receiverId": "507f1f77bcf86cd799439012",
  "content": "Hello Bob!"
}
```

**Response (201):**
```json
{
  "message": "Message sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "senderId": { "_id": "507f1f77bcf86cd799439011", "username": "alice" },
    "receiverId": { "_id": "507f1f77bcf86cd799439012", "username": "bob" },
    "content": "Hello Bob!",
    "read": false,
    "createdAt": "2024-03-18T10:30:45.123Z"
  }
}
```

---

#### GET `/api/messages/:userId1/:userId2`
Get all messages between two users.

**Response (200):**
```json
{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "senderId": { "_id": "507f1f77bcf86cd799439011", "username": "alice" },
      "receiverId": { "_id": "507f1f77bcf86cd799439012", "username": "bob" },
      "content": "Hello Bob!",
      "read": false,
      "createdAt": "2024-03-18T10:30:45.123Z"
    }
  ]
}
```

---

### Socket.IO Events

#### Client → Server: `join`
User joins their room.
```javascript
socket.emit('join', userId);
```

#### Client → Server: `sendMessage`
Send a message in real-time.
```javascript
socket.emit('sendMessage', {
  senderId: "507f1f77bcf86cd799439011",
  receiverId: "507f1f77bcf86cd799439012",
  content: "Hello!",
  timestamp: "2024-03-18T10:30:45.123Z"
});
```

#### Server → Client: `receiveMessage`
Receive a message in real-time.
```javascript
socket.on('receiveMessage', (messageData) => {
  // messageData: { senderId, receiverId, content, timestamp }
});
```

---

## Troubleshooting

### Issue: MongoDB Connection Failed

**Error:** `MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
1. Ensure MongoDB is running: `mongod`
2. Check `MONGO_URI` in `.env` is correct
3. If using Atlas, ensure IP is whitelisted and connection string is correct

---

### Issue: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change PORT in `.env` to an unused port (e.g., 5001)
2. Or kill the process using the port:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
   - Mac/Linux: `lsof -i :5000` then `kill -9 <PID>`

---

### Issue: Socket.IO Connection Error

**Error:** `Socket connection error: Error: xhr poll error`

**Solution:**
1. Ensure backend is running and accessible
2. Check `VITE_API_URL` in client `.env` matches backend URL
3. Verify CORS is configured: `origin: process.env.CLIENT_URL`

---

### Issue: Messages Not Appearing in Real-time

**Diagnosis:**
1. Check browser console for errors
2. Open DevTools → Network → look for Socket.IO connection
3. Check server logs for socket events

**Solution:**
1. Restart both frontend and backend
2. Clear browser cache and localStorage
3. Ensure both tabs have different user sessions

---

### Issue: Authentication Not Working

**Error:** `User not found` or `Invalid password`

**Solution:**
1. Ensure user was registered correctly
2. Check email and password are correct (case-sensitive)
3. If first attempt fails, try registering a new user
4. Clear localStorage: `localStorage.clear()` in browser console

---

### Issue: CSS Not Loading / Styling Not Applied

**Solution:**
1. Ensure all `.css` files are imported in components
2. Restart frontend with `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## Environment Variables Reference

### Backend (.env)
```env
PORT=5000                          # Server port
MONGO_URI=mongodb://localhost:27017/whatsapp-clone  # MongoDB connection
CLIENT_URL=http://localhost:5173   # Frontend URL for CORS
JWT_SECRET=your_secret_key_here    # Secret key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000 # Backend API URL
```

---

## Development Tips

### Hot Module Reloading (HMR)
- Backend changes: Restart server with `npm run dev` (uses nodemon)
- Frontend changes: Auto-reload with Vite

### Debugging
- Frontend: Open DevTools (F12) → Console
- Backend: Check terminal logs
- Database: Use MongoDB Compass or Atlas UI

### Code Structure
- Components are in `client/src/components/`
- Pages are in `client/src/pages/`
- Controllers handle business logic in `server/src/controllers/`
- Models define schemas in `server/src/models/`

---

## License

ISC

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [API Documentation](#api-documentation)
3. Check browser console and server logs for errors

---

**Happy Messaging! 🚀**
