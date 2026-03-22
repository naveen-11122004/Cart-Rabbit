# WhatsApp Clone - Setup & Testing Guide

## Complete Setup Instructions

### Phase 1: Environment Setup (5 mins)

#### 1.1 Check Prerequisites
```bash
node --version    # Should be v14 or higher
npm --version     # Should be v6 or higher
```

#### 1.2 MongoDB Setup
**Option A: Local MongoDB**
- Download: https://www.mongodb.com/try/download/community
- Install following platform-specific instructions
- Start: `mongod` (Windows/Mac/Linux)

**Option B: MongoDB Atlas (Cloud)**
- Sign up: https://www.mongodb.com/cloud/atlas
- Create cluster
- Get connection string
- Update `server/.env` with your connection string

---

### Phase 2: Backend Setup (5 mins)

#### 2.1 Navigate & Install
```bash
cd D:\CartRabbit\whatsapp-clone\server
npm install
```

#### 2.2 Create `.env` file
Create `server/.env` with:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp-clone
CLIENT_URL=http://localhost:5173
JWT_SECRET=whatsapp_clone_secret_key_2024
```

#### 2.3 Verify Connection
```bash
npm run dev
```

**Expected Output:**
```
Server running on http://localhost:5000
MongoDB connected
```

#### ✅ Backend Ready!

---

### Phase 3: Frontend Setup (5 mins)

#### 3.1 Open New Terminal & Navigate
```bash
cd D:\CartRabbit\whatsapp-clone\client
npm install
```

#### 3.2 Create `.env` file
Create `client/.env` with:
```env
VITE_API_URL=http://localhost:5000
```

#### 3.3 Start Dev Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v4.3.9  ready in 256 ms
➜  Local:   http://localhost:5173/
```

#### ✅ Frontend Ready!

---

## Testing Guide

### Test Case 1: User Registration & Login

**Step 1: Register User 1**
1. Visit http://localhost:5173
2. Click "Register"
3. Fill form:
   - Username: `alice`
   - Email: `alice@test.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Register"
5. ✅ Should redirect to chat page

**Step 2: Register User 2**
1. Click "Logout" (bottom right)
2. Click "Register"
3. Fill form:
   - Username: `bob`
   - Email: `bob@test.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Register"
5. ✅ Should redirect to chat page

---

### Test Case 2: View Users in Sidebar

**Step 1: As Alice**
1. Login as alice@test.com
2. Left sidebar should show:
   - Bob's name
   - "Start conversation with Bob" message preview
3. ✅ Bob should be visible

**Step 2: As Bob**
1. Logout and login as bob@test.com
2. Left sidebar should show:
   - Alice's name
   - "Start conversation with Alice" message preview
3. ✅ Alice should be visible

---

### Test Case 3: Send & Receive Messages (Real-time)

**Setup: Two Browser Tabs**
```
Tab 1: http://localhost:5173 (Alice logged in)
Tab 2: http://localhost:5173 (Bob logged in - use Incognito)
```

**Step 1: Alice Sends Message**
1. In Tab 1, click "bob" in left sidebar
2. Right panel opens showing empty chat
3. Type "Hello Bob! 👋" in message input
4. Click "Send"
5. Message appears on RIGHT side (green bubble) in Tab 1
6. ✅ Message shown on RIGHT with correct timestamp

**Step 2: Real-time Reception**
1. In Tab 2 (Bob's browser), Alice should already be selected (or select Alice)
2. The message from Alice appears on LEFT side (grey bubble) automatically
3. ✅ Real-time reception works!

**Step 3: Bob Replies**
1. In Tab 2, type "Hi Alice! How are you? 😊"
2. Click "Send"
3. Message appears on RIGHT side (green) in Tab 2
4. In Tab 1 (Alice's browser), message appears on LEFT side (grey) automatically
5. ✅ Bi-directional real-time messaging works!

---

### Test Case 4: Message Persistence

**Step 1: Close Tab**
1. Close Tab 2 (Bob's browser)

**Step 2: Refresh Alice's Position**
1. In Tab 1, click "alice" in sidebar (or another user)
2. Click "bob" again
3. Previous messages should still appear in the correct order:
   - "Hello Bob! 👋" (Alice - right, green)
   - "Hi Alice! How are you? 😊" (Bob - left, grey)
4. ✅ Messages persisted in MongoDB!

**Step 3: Login Again**
1. Close Tab 1 completely
2. Open new browser tab
3. Go to http://localhost:5173
4. Login as alice@test.com
5. Click "bob" in sidebar
6. All previous messages should still be there
7. ✅ Persistence across sessions confirmed!

---

### Test Case 5: Multiple Conversations

**Setup: Three Users**
```
Register:
- charlie@test.com (username: charlie)
```

**Step 1: Alice Talks to Bob AND Charlie**
1. Login as alice@test.com
2. Sidebar shows: Bob and Charlie
3. Click "bob" → chat with bob
4. Send message: "Bob's message"
5. Click "charlie" → chat with charlie (empty)
6. Send message: "Charlie's message"
7. Click "bob" → previous message "Bob's message" still there
8. ✅ Separate conversation threads work!

---

### Test Case 6: Empty Message Prevention

**Step 1: Try to Send Empty Message**
1. Select any user in chat
2. Try clicking "Send" without typing
3. ✅ Send button should be disabled (greyed out)

**Step 2: Try Whitespace Only**
1. Type "   " (spaces only)
2. ✅ Send button should remain disabled
3. Type actual text
4. ✅ Send button becomes enabled

---

### Test Case 7: Protected Routes

**Step 1: Logout Check**
1. Login as any user
2. URL shows: http://localhost:5173/chat
3. Click "Logout"
4. ✅ Redirected to http://localhost:5173/login

**Step 2: Direct URL Access (Not Logged In)**
1. Open new incognito tab
2. Go to http://localhost:5173/chat directly
3. ✅ Redirected to http://localhost:5173/login

**Step 3: Access Protected Route (Logged In)**
1. Register/login
2. Go to http://localhost:5173/chat
3. ✅ Chat page loads normally

---

### Test Case 8: UI/UX Features

**Step 1: Message Styling**
1. Login as alice and bob (two tabs)
2. Alice sends message
3. In Alice's tab: Message on RIGHT, green background (#dcf8c6)
4. In Bob's tab: Message on LEFT, grey background (#e5e5ea)
5. ✅ Styling differentiation works!

**Step 2: Timestamps**
1. Send a message
2. Each message bubble shows timestamp below
3. Format: "10:30 AM" or similar
4. ✅ Timestamps visible and formatted!

**Step 3: Auto-scroll**
1. Open a chat with existing messages
2. Scroll up to middle of conversation
3. Send a new message
4. Chat automatically scrolls to bottom
5. ✅ Auto-scroll works!

**Step 4: User Avatar**
1. Look at sidebar user items
2. Each user has a colored circle with initials
3. Alice → "AL", Bob → "BO", Charlie → "CH"
4. Colors are consistent across reloads
5. ✅ Avatar generation works!

**Step 5: Responsive Layout**
1. Open DevTools (F12)
2. Resize browser to mobile size (375px width)
3. Layout adjusts appropriately
4. ✅ Responsive design works!

---

## Monitoring & Debugging

### Backend Logs to Watch

```bash
# Normal startup
User connected: socket/abc123
User <userId> joined room
Message from <senderId> to <receiverId>: Hello!
User disconnected: socket/abc123
```

### Frontend Console (F12)

```javascript
// Normal logs
Connected to socket server
User <userId> joined room
receiveMessage event received
```

### Database Verification (MongoDB)

```bash
# Connect to MongoDB
mongo

# Switch to database
use whatsapp-clone

# View collections
show collections

# Check users
db.users.find()

# Check messages
db.messages.find()
```

---

## Performance Testing

### Test: 100 Messages Between Two Users

1. Login as alice and bob
2. Send 100 messages sequentially
3. Measure response time: Should be < 500ms each
4. Check database size: `db.messages.count()`
5. Verify all messages retrieved: Sidebar shows last message

---

## Clean Up / Reset

### Reset Database (Development Only)

```bash
# Connect to MongoDB
mongo

# Drop database
use whatsapp-clone
db.dropDatabase()

# Exit
exit
```

### Clear Browser Storage

```javascript
// Run in browser console (F12)
localStorage.clear()
sessionStorage.clear()
```

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| "Cannot GET /chat" | Frontend not running on port 5173 |
| "MongoDB connection failed" | `mongod` not running / wrong MONGO_URI |
| "CORS error" | Check CLIENT_URL in backend .env |
| "Socket connection timeout" | Backend not running / firewall blocking |
| "Message not sending" | Check browser console for errors |
| "Old messages disappeared" | Database was reset / wrong MongoDB connection |
| "Styles look broken" | Hard refresh: Ctrl+Shift+R |

---

## Summary Checklist

- [ ] MongoDB running (mongod)
- [ ] Backend installed & running (npm run dev on port 5000)
- [ ] Frontend installed & running (npm run dev on port 5173)
- [ ] Can register new users
- [ ] Can login
- [ ] Can see other users in sidebar
- [ ] Can send messages
- [ ] Can receive messages in real-time
- [ ] Messages persist after refresh
- [ ] Can logout
- [ ] Responsive design works

✅ **All checks passed? You're ready to go!**

---

## Next Steps

1. **Customize Styling:** Edit `.css` files in components and pages
2. **Add Features:** 
   - Read receipts
   - Typing indicators
   - Group chats
   - File sharing
3. **Deploy:**
   - Backend: Render, Heroku, Railway
   - Frontend: Vercel, Netlify
   - Database: MongoDB Atlas

---

## Support Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

**Happy Testing! 🚀**
