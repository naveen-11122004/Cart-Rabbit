# Dependencies & Version Guide

## Backend Dependencies

### package.json (server/)

```json
{
  "name": "whatsapp-clone-server",
  "version": "1.0.0",
  "description": "WhatsApp Clone Backend Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "mongoose": "^7.0.3",
    "socket.io": "^4.6.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

### Backend Dependencies Explained

| Package | Version | Purpose |
|---------|---------|---------|
| **express** | 4.18.2 | Web framework for creating REST APIs |
| **mongoose** | 7.0.3 | MongoDB object modeling and validation |
| **socket.io** | 4.6.1 | Real-time bidirectional communication |
| **bcryptjs** | 2.4.3 | Password hashing and comparison |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing middleware |
| **dotenv** | 16.0.3 | Environment variable management |
| **nodemon** | 2.0.22 | Auto-restart server on file changes (dev only) |

### Why These Versions?

- **express@4.18.2**: Latest v4 (stable LTS)
- **mongoose@7.0.3**: Latest v7 with better TypeScript support
- **socket.io@4.6.1**: Latest v4 with improved performance
- **bcryptjs@2.4.3**: Pure JS implementation (cross-platform)
- **cors@2.8.5**: Latest stable version
- **dotenv@16.0.3**: Latest v16

### Installation

```bash
cd server
npm install
# or
npm install --save
```

This creates `node_modules/` and `package-lock.json`

---

## Frontend Dependencies

### package.json (client/)

```json
{
  "name": "whatsapp-clone-client",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.2",
    "axios": "^1.4.0",
    "socket.io-client": "^4.6.1"
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9"
  }
}
```

### Frontend Dependencies Explained

| Package | Version | Purpose |
|---------|---------|---------|
| **react** | 18.2.0 | UI library |
| **react-dom** | 18.2.0 | React rendering to DOM |
| **react-router-dom** | 6.11.2 | Client-side routing (pages) |
| **axios** | 1.4.0 | HTTP client for API calls |
| **socket.io-client** | 4.6.1 | Real-time client communication |
| **vite** | 4.3.9 | Build tool and dev server |
| **@vitejs/plugin-react** | 4.0.0 | React plugin for Vite |
| **@types/react** | 18.0.28 | TypeScript types for React |
| **@types/react-dom** | 18.0.11 | TypeScript types for React DOM |

### Why These Versions?

- **react@18.2.0**: Latest v18 (current stable)
- **react-router-dom@6.11.2**: Latest v6 with improved hooks
- **axios@1.4.0**: Latest v1 with promise-based API
- **socket.io-client@4.6.1**: Matches server version
- **vite@4.3.9**: Latest v4 (very fast dev server)

### Installation

```bash
cd client
npm install
# or
npm install --save
```

---

## Node.js & npm Version Requirements

### Minimum Required

```bash
node >= 14.0.0
npm >= 6.0.0
```

### Recommended

```bash
node >= 16.0.0 (LTS)
npm >= 8.0.0
```

### Check Your Versions

```bash
node --version
npm --version
```

### Upgrade Node.js

- **Windows/Mac**: Download from [nodejs.org](https://nodejs.org/)
- **with nvm (Linux/Mac)**: 
  ```bash
  nvm install 18
  nvm use 18
  ```

---

## MongoDB Version

### Minimum Required

```
MongoDB >= 4.0
```

### Recommended

```
MongoDB >= 5.0 (or Atlas latest)
```

### Check MongoDB Version

```bash
mongod --version
```

### For MongoDB Atlas

- No local installation needed
- Always latest version
- Auto-managed backups

---

## Port & Environment Setup

### Ports Used

| Service | Port | URL |
|---------|------|-----|
| Backend | 5000 | http://localhost:5000 |
| Frontend | 5173 | http://localhost:5173 |
| MongoDB | 27017 | mongodb://localhost:27017 |

### Development vs Production

**Development:**
- Backend: `npm run dev` (uses nodemon for auto-reload)
- Frontend: `npm run dev` (Vite dev server with HMR)

**Production:**
- Backend: `npm start` (simple node process)
- Frontend: `npm run build` (creates optimized dist/)

---

## Security Considerations

### Password Hashing
- **bcryptjs**: Hashes passwords with salt rounds = 10
- Passwords are never stored in plain text
- Each password gets unique salt

### CORS Setup
- Backend configured to accept requests from frontend
- **CLIENT_URL** environment variable controls this

### Environment Variables
- `.env` files are NOT committed to git
- Contains sensitive data (MongoDB URI, secrets)
- Use `.env.example` for documentation

---

## Adding New Dependencies

### Backend Example

```bash
cd server
npm install package-name --save
```

Updates `package.json` and `package-lock.json`

### Frontend Example

```bash
cd client
npm install package-name --save
```

---

## Removing Dependencies

### Backend

```bash
cd server
npm uninstall package-name --save
```

### Frontend

```bash
cd client
npm uninstall package-name --save
```

---

## Dependency Version Syntax

### Caret (^)
```
^1.2.3 means >= 1.2.3 and < 2.0.0
Allows minor and patch updates
```

### Tilde (~)
```
~1.2.3 means >= 1.2.3 and < 1.3.0
Allows patch updates only
```

### Exact Version
```
1.2.3 means exactly 1.2.3
```

### Common in This Project
- All dependencies use `^` (caret)
- Allows automatic minor updates
- Major versions don't auto-update

---

## Lock Files

### package-lock.json (Backend)
- Locks exact dependency versions
- Ensures consistency across machines
- Created by `npm install`
- Should be committed to git

### package-lock.json (Frontend)
- Same purpose as backend
- Separate lock file
- Created by `npm install`
- Should be committed to git

---

## Installation Troubleshooting

### Issue: npm ERR! code ENOENT

**Solution:**
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules
rm -rf node_modules
# Reinstall
npm install
```

### Issue: Module not found after git clone

**Solution:**
```bash
npm install
```

### Issue: Version conflict

**Solution:**
```bash
# See installed versions
npm list
# Update all packages
npm update
```

---

## Verifying Installation

### Backend Check

```bash
cd server
npm list
```

Shows all installed packages with versions.

**Expected output (partial):**
```
whatsapp-clone-server@1.0.0
├── bcryptjs@2.4.3
├── cors@2.8.5
├── dotenv@16.0.3
├── express@4.18.2
├── mongoose@7.0.3
├── socket.io@4.6.1
└── nodemon@2.0.22
```

### Frontend Check

```bash
cd client
npm list
```

**Expected output (partial):**
```
whatsapp-clone-client@0.0.1
├── @types/react@18.0.28
├── @types/react-dom@18.0.11
├── @vitejs/plugin-react@4.0.0
├── axios@1.4.0
├── react@18.2.0
├── react-dom@18.2.0
├── react-router-dom@6.11.2
├── socket.io-client@4.6.1
└── vite@4.3.9
```

---

## Updating Dependencies (Optional)

### Check for outdated packages

```bash
npm outdated
```

### Update all packages

```bash
npm update
```

### Update specific package

```bash
npm install package@latest --save
```

⚠️ **Warning:** Major version updates may break code. Test thoroughly!

---

## Files Created

### Backend Files
```
server/
├── src/models/User.js        (Mongoose schema)
├── src/models/Message.js     (Mongoose schema)
├── src/controllers/userController.js
├── src/controllers/messageController.js
├── src/routes/userRoutes.js
├── src/routes/messageRoutes.js
├── src/socket/socketHandler.js
├── src/app.js                (Express app)
├── server.js                 (Entry point)
├── package.json              (Dependencies)
└── .env                      (Config)
```

### Frontend Files
```
client/
├── src/components/Sidebar.jsx
├── src/components/ChatWindow.jsx
├── src/components/MessageBubble.jsx
├── src/components/MessageInput.jsx
├── src/components/UserAvatar.jsx
├── src/pages/Login.jsx
├── src/pages/Register.jsx
├── src/pages/ChatPage.jsx
├── src/context/AuthContext.jsx
├── src/utils/socket.js
├── src/App.jsx
├── src/main.jsx
├── src/index.css
├── index.html
├── vite.config.js
├── package.json
└── .env
```

---

## Summary

### Total Packages
- **Backend:** 6 dependencies + 1 dev dependency
- **Frontend:** 5 dependencies + 3 dev dependencies

### Total Size (Estimated)
- **Backend node_modules:** ~150 MB
- **Frontend node_modules:** ~500 MB

### Installation Time
- **Backend:** ~2 minutes
- **Frontend:** ~3 minutes

---

## Quick Reference

```bash
# Backend setup
cd server && npm install && npm run dev

# Frontend setup (new terminal)
cd client && npm install && npm run dev
```

---

**All dependencies are production-tested and ready to use! 🚀**
