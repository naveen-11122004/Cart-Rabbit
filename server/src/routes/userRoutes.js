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

module.exports = router;
