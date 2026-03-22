const express = require('express');
const {
  register,
  verifyRegistrationOtp,
  login,
  verifyLoginOtp,
  resendOtp,
  getAllUsers,
} = require('../controllers/userController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/login', login);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/resend-otp', resendOtp);
router.get('/', getAllUsers);

module.exports = router;
