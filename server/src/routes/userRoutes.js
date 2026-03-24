const express = require('express');
const {
  register,
  verifyRegistrationOtp,
  login,
  verifyLoginOtp,
  resendOtp,
  getAllUsers,
  updateWallpaper,
  getWallpaper,
  lockChat,
  unlockChat,
  verifyChatLock,
  getLockedChats,
  updateProfilePicture,
  getProfilePicture,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/login', login);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/resend-otp', resendOtp);
router.get('/', getAllUsers);

// Wallpaper routes (require authentication)
router.post('/wallpaper', authMiddleware, updateWallpaper);
router.get('/wallpaper', authMiddleware, getWallpaper);

// Chat lock routes (require authentication)
router.post('/chat-lock', authMiddleware, lockChat);
router.post('/chat-unlock', authMiddleware, unlockChat);
router.post('/chat-verify-lock', authMiddleware, verifyChatLock);
router.get('/locked-chats', authMiddleware, getLockedChats);

// Profile picture routes (require authentication)
router.post('/profile-picture', authMiddleware, updateProfilePicture);
router.get('/profile-picture', getProfilePicture);

module.exports = router;
