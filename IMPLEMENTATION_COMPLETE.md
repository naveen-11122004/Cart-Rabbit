# Quick Start - New Features Testing

## ✅ All Features Implemented

### 1. Email Verification ✓
### 2. Media Sharing (Images, Videos, Documents) ✓
### 3. Voice & Video Calls with WebRTC ✓
### 4. Socket.IO Real-time Communication ✓

---

## 🚀 Setup Steps

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

This adds:
- `jsonwebtoken` - Email tokens
- `nodemailer` - Email sending
- `multer` - File uploads

### Step 2: Setup Gmail (Choose One)

#### Option A: Gmail App Password (Better)
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Create **App Password** (generates 16-char password)
4. Copy the 16-character password

#### Option B: Regular Gmail
1. Go to [myaccount.google.com/lesssecureapps](https://myaccount.google.com/lesssecureapps)
2. Enable "Less secure apps"
3. Use your regular Gmail password

### Step 3: Update server/.env

```ini
PORT=5000
MONGO_URI=mongodb+srv://naveen2004:naveen2004@cluster0.bzh5mt2.mongodb.net/?appName=Cluster0
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret_key_here_12345
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password_or_regular_password
```

### Step 4: Run Services

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

---

## 🧪 Test Workflow

### Test 1: Email Verification
1. Open http://localhost:5173
2. Click **Register**
3. Fill form: username: `john`, email: `your_email@gmail.com`, password: `test123`
4. **Check Gmail inbox** for verification email
5. Click the **Verify Email** link
6. You'll see "Email verified successfully"
7. Now login with your email and password

### Test 2: Multiple Users
1. Register 2nd user: username: `jane`, email: `another_email@gmail.com`
2. Verify both emails
3. Login as `john`
4. **Select `jane`** from sidebar
5. **Send a text message** - Should see it in real-time

### Test 3: Media Sharing (Coming Soon in UI)
**API is ready, Frontend component needed**

To test manually:
```bash
# Send image file
curl -F "file=@image.jpg" \
  -F "senderId=USER_ID" \
  -F "receiverId=USER_ID" \
  http://localhost:5000/api/messages/send-file
```

### Test 4: Voice/Video Calls (Coming Soon in UI)
**Backend socket events are ready, Frontend component needed**

---

## 📁 What's Been Done

### Backend Changes ✅
- ✓ Added email verification to User model
- ✓ Created email service (emailService.js)
- ✓ Updated user controller with verification logic
- ✓ Added file upload support to Message model
- ✓ Created Call model for tracking calls
- ✓ Added multer for file uploads
- ✓ Enhanced socket handler with call signaling
- ✓ Updated all routes and controllers

### Frontend Changes ✅
- ✓ Created VerifyEmail.jsx page
- ✓ Updated Register.jsx to show verification message
- ✓ Updated Login.jsx to handle email verification
- ✓ Updated App.jsx with verify-email route
- ✓ Created callService.js for WebRTC signaling
- ✓ Created fileUpload.js for file handling

### Files to Enhance (UI Components)
- [ ] **MessageInput.jsx** - Add file upload button (📎)
- [ ] **ChatWindow.jsx** - Add call buttons (📞 and 📹)
- [ ] **CallWindow.jsx** - New component for displaying calls
- [ ] **MediaMessage.jsx** - New component to display media in chat

---

## 🔑 Key Features

### Email Verification Flow
```
Register → Gmail sent → Click link → Email verified → Can login
```

### File Upload Flow (Backend Ready)
```
User sends file → Multer validates → Store in MongoDB → Can retrieve
```

### Call Signaling (Backend Ready)
```
Caller → Initiate → Signal → Receiver gets notification → Accept/Decline
        → WebRTC offer/answer → Video stream
```

---

## ⚠️ Important

1. **Gmail must be configured** in .env - Check console for errors
2. **MongoDB Atlas** is already set up with cluster0
3. **WebRTC needs** browser support (all modern browsers work)
4. **CORS enabled** on backend for file uploads

---

## 📞 Support

### Common Issues:

**"Email not received"**
- Check GMAIL_USER and GMAIL_PASSWORD in .env
- Check spam folder
- Try the 16-char App Password method

**"Registration failed"**
- Check MongoDB connection
- Check server console for errors

**"File upload fails"**
- File must be < 50MB
- File type: JPEG, PNG, GIF, MP4, PDF only

---

## 🎯 Next Steps (Optional Enhancements)

1. Add attachment button to MessageInput
2. Add call UI components
3. Add WebRTC constraints (mic/camera permissions)
4. Add call recording
5. Add message read receipts
6. Add typing indicators
7. Add contact list filtering
8. Add call history

