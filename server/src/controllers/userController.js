const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

// ─── Helper ────────────────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your_secret_key_here', {
    expiresIn: '7d',
  });
};

// ─── Register ──────────────────────────────────────────────────────────────
// Creates user and logs them in immediately (no OTP needed)
exports.register = async (req, res) => {
  try {
    let { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    username = username.trim();
    email = email.trim().toLowerCase();

    // Check for existing user
    const userByEmail = await User.findOne({ email });
    if (userByEmail)
      return res.status(400).json({ message: 'Email already exists' });

    const userByUsername = await User.findOne({ username });
    if (userByUsername)
      return res.status(400).json({ message: 'Username is already taken' });

    // Create user
    const user = new User({
      username,
      email,
      password,
      isEmailVerified: true, // Auto-verify for simple flow
    });
    await user.save();

    // Send welcome email in background (non-blocking)
    sendWelcomeEmail(email, username).catch((err) => {
      console.log(`ℹ️ Welcome email failed for ${email}: ${err.message}`);
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful!',
      token,
      userId: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────
// Simple email/password login without OTP
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Verify OTP (kept for backward compatibility, returns error)
exports.verifyRegistrationOtp = async (req, res) => {
  return res.status(400).json({ message: 'OTP verification is no longer needed. Please use simple login.' });
};

exports.verifyLoginOtp = async (req, res) => {
  return res.status(400).json({ message: 'OTP verification is no longer needed. Please use simple login.' });
};

// ─── Resend OTP (kept for backward compatibility, returns error)
exports.resendOtp = async (req, res) => {
  return res.status(400).json({ message: 'OTP is no longer used. Please use simple email/password login.' });
};

// ─── Get All Users ─────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.query.currentUserId;
    if (!currentUserId)
      return res.status(400).json({ message: 'Current user ID is required' });

    const users = await User.find({ _id: { $ne: currentUserId } }).select(
      '_id username email'
    );
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
