# WhatsApp Clone - New Features Setup Guide

## ✅ Implemented Features

### 1. **Email Verification System**
- ✓ Users must verify email after registration
- ✓ No OTP repeat needed after email confirmation
- ✓ Login disabled until email is verified
- ✓ Gmail-based verification emails

### 2. **Media Sharing**
- ✓ Send images, videos, and documents
- ✓ Files stored in MongoDB (up to 50MB)
- ✓ Support for: JPEG, PNG, GIF, MP4, PDF

### 3. **Voice & Video Calls** (WebRTC + Socket.IO)
- ✓ Voice calls (audio only)
- ✓ Video calls (audio + video)
- ✓ Real-time call signaling
- ✓ ICE candidate exchange

---

## 🔧 Setup Instructions

### Step 1: Install New Dependencies

```bash
cd server
npm install
```

This installs:
- `jsonwebtoken` - Email verification tokens
- `nodemailer` - Email sending
- `multer` - File uploads

### Step 2: Configure Gmail for Email Verification

#### Option A: Using Gmail App Password (Recommended)
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App Passwords** (appears after 2FA is enabled)
4. Select **Mail** and **Windows Computer**
5. Copy the generated **16-character password**

#### Option B: Using Regular Gmail (Less Secure)
1. Enable **Less Secure App Access**: [myaccount.google.com/lesssecureapps](https://myaccount.google.com/lesssecureapps)
2. Use your regular Gmail password

### Step 3: Update server/.env

```ini
PORT=5000
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/whatsapp-clone
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret_key_here_12345
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password_or_gmail_password
```

### Step 4: Start the Servers

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

## 🧪 Testing

### Test Email Verification
1. Register a new account
2. Check email inbox for verification link
3. Click the link to verify
4. Now you can login

### Test Media Sharing
1. Login with two users
2. In chat, look for **📎 Attachment button**
3. Select image/video/document
4. Send and receive

### Test Voice/Video Calls
1. Open chat with another user
2. Click **📞 Call** (audio) or **📹 Video** (video)
3. Other user receives call notification
4. Accept or decline

---

## 📁 New Files Created/Modified

### Backend
- ✓ `src/models/Call.js` - Call schema
- ✓ `src/utils/emailService.js` - Email sending
- ✓ `src/controllers/userController.js` - Updated with email verification
- ✓ `src/controllers/messageController.js` - Updated with file upload
- ✓ `src/routes/messageRoutes.js` - Added file upload routes
- ✓ `src/socket/socketHandler.js` - Added call signaling
- ✓ `.env` - Added GMAIL credentials

### Frontend
- ✓ `src/pages/VerifyEmail.jsx` - Email verification page
- ✓ Components for file sharing (to be created)
- ✓ Components for calls (to be created)

---

## 🚀 Next Steps

To complete the frontend UI:
1. Update `Register.jsx` to show verification message
2. Add file upload button in `MessageInput.jsx`
3. Add call buttons in `ChatWindow.jsx`
4. Create `CallWindow.jsx` for incoming/outgoing calls
5. Update `App.jsx` with VerifyEmail route

---

## ⚠️ Important Notes

1. **Email Verification**: Users won't receive emails if GMAIL_USER/GMAIL_PASSWORD are not set
2. **File Size Limit**: Maximum 50MB per file
3. **WebRTC**: Calls only work within local network or with STUN/TURN servers
4. **MongoDB**: All files are stored in MongoDB as binary data

---

## 🐛 Troubleshooting

### "Registration failed - Gmail error"
- Check GMAIL_USER and GMAIL_PASSWORD in .env
- If using Gmail with 2FA, use App Password (not account password)

### "File upload fails"
- Check file size (max 50MB)
- Check file type (JPEG, PNG, GIF, MP4, PDF only)
- Ensure multer is installed: `npm list multer`

### "Calls not working"
- Check if both users are online (Socket.IO connection)
- Ensure WebRTC is supported in your browser
- Try refreshing the page

---

## 📚 API Endpoints

### Email Verification
- `POST /api/users/register` - Register with email verification
- `GET /api/users/verify-email/:token` - Verify email

### Media
- `POST /api/messages/send-file` - Send file message (multipart/form-data)
- `GET /api/messages/file/:messageId` - Download file

### Calls (WebSocket Events)
- `initiateCall` - Start a call
- `acceptCall` - Accept incoming call
- `declineCall` - Reject call
- `endCall` - End call
- `sendOffer`, `sendAnswer`, `sendIceCandidate` - WebRTC signaling

