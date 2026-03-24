const User = require('../models/User');
const { sendOtpEmail, sendWelcomeEmail } = require('../utils/emailService');

// ─── Helper ────────────────────────────────────────────────────────────────
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── Register (Step 1) ─────────────────────────────────────────────────────
// Creates user, sends OTP. Returns { pendingOtp: true, email }
exports.register = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    username = username.trim();
    email = email.trim().toLowerCase();

    // Check for existing user by email or username
    const userByEmail = await User.findOne({ email });
    const userByUsername = await User.findOne({ username });

    if (userByEmail) {
      if (!userByEmail.isEmailVerified) {
        const otp = generateOTP();
        userByEmail.otp = otp;
        userByEmail.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
        userByEmail.otpPurpose = 'registration';
        await userByEmail.save();
        
        try { await sendOtpEmail(email, otp, 'registration'); } catch (_) { 
          console.log(`👉 OTP for ${email}: ${otp} 👈`); 
        }

        return res.status(200).json({
          message: 'OTP resent to your email.',
          pendingOtp: true,
          email,
        });
      }
      return res.status(400).json({ message: 'Email already exists' });
    }

    if (userByUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const otp = generateOTP();
    const user = new User({
      username,
      email,
      password,
      isEmailVerified: false,
      otp,
      otpExpiry: new Date(Date.now() + OTP_TTL_MS),
      otpPurpose: 'registration',
    });
    await user.save();

    // Send email in background — don't wait for it (non-blocking)
    sendOtpEmail(email, otp, 'registration').catch((emailError) => {
      console.log('\n❌ ============================================= ❌');
      console.log('EMAIL FAILED: Your local Antivirus or Firewall is blocking node.exe from sending emails.');
      console.log(`Don't worry! Use this OTP to verify your account right now:`);
      console.log(`👉 OTP for ${email}: ${otp} 👈`);
      console.log('❌ ============================================= ❌\n');
      // Continue — user was saved; they can still verify with the OTP shown in server logs
    });

    res.status(201).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      pendingOtp: true,
      email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Verify Registration OTP (Step 2) ──────────────────────────────────────
exports.verifyRegistrationOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' });

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isEmailVerified)
      return res.status(400).json({ message: 'Email already verified. Please login.' });

    if (!user.otp || user.otpPurpose !== 'registration')
      return res.status(400).json({ message: 'No pending OTP. Please register again.' });

    if (new Date() > user.otpExpiry)
      return res.status(400).json({ message: 'OTP has expired. Please register again.' });

    if (user.otp !== otp.trim())
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpPurpose = null;
    await user.save();

    sendWelcomeEmail(user.email, user.username).catch(() => {});

    res.status(200).json({
      message: 'Email verified! You can now login.',
      verified: true,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Login (Step 1) ────────────────────────────────────────────────────────
// Validates credentials, sends OTP. Returns { pendingOtp: true, email }
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.isEmailVerified)
      return res.status(403).json({
        message: 'Email not verified. Please complete registration first.',
      });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid password' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    user.otpPurpose = 'login';
    await user.save();

    // Send email in background — don't wait for it (non-blocking)
    sendOtpEmail(email, otp, 'login').catch((emailError) => {
      console.log('\n❌ ============================================= ❌');
      console.log('EMAIL FAILED: Your local Antivirus or Firewall is blocking node.exe from sending emails.');
      console.log(`Don't worry! Use this OTP to verify your account right now:`);
      console.log(`👉 OTP for ${email}: ${otp} 👈`);
      console.log('❌ ============================================= ❌\n');
    });

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to complete login.',
      pendingOtp: true,
      email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Verify Login OTP (Step 2) ─────────────────────────────────────────────
exports.verifyLoginOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' });

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || user.otpPurpose !== 'login')
      return res.status(400).json({ message: 'No pending OTP. Please login again.' });

    if (new Date() > user.otpExpiry)
      return res.status(400).json({ message: 'OTP has expired. Please login again.' });

    if (user.otp !== otp.trim())
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

    user.otp = null;
    user.otpExpiry = null;
    user.otpPurpose = null;
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Resend OTP ────────────────────────────────────────────────────────────
exports.resendOtp = async (req, res) => {
  try {
    let { email, purpose } = req.body;
    if (!email || !purpose)
      return res.status(400).json({ message: 'Email and purpose are required' });

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (purpose === 'registration' && user.isEmailVerified)
      return res.status(400).json({ message: 'Email already verified. Please login.' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    user.otpPurpose = purpose;
    await user.save();

    // Send email in background — don't wait for it (non-blocking)
    sendOtpEmail(email, otp, purpose).catch((emailError) => {
      console.log('\n❌ ============================================= ❌');
      console.log('EMAIL FAILED: Your local Antivirus or Firewall is blocking node.exe from sending emails.');
      console.log(`Don't worry! Use this new OTP to verify your account right now:`);
      console.log(`👉 RESENT OTP for ${email}: ${otp} 👈`);
      console.log('❌ ============================================= ❌\n');
    });

    res.status(200).json({ message: 'New OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
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
