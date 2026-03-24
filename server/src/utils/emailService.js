const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL/TLS for port 465
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Helps bypass some local firewall/antivirus TLS issues
  },
  // 10sec timeouts; enough for slow networks, but doesn't hang the app forever if blocked
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify configuration on startup
if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
  console.warn('⚠️ GMAIL_USER or GMAIL_PASSWORD is not defined. Email service will not work.');
  console.warn('  GMAIL_USER:', process.env.GMAIL_USER ? '✓ Set' : '✗ Missing');
  console.warn('  GMAIL_PASSWORD:', process.env.GMAIL_PASSWORD ? '✓ Set' : '✗ Missing');
}

exports.sendOtpEmail = async (email, otp, purpose) => {
  const isLogin = purpose === 'login';
  const subject = isLogin
    ? 'Your Login OTP - WhatsApp Clone'
    : 'Verify Your Email - WhatsApp Clone';

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f9f9f9; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="background: #25d366; width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="font-size: 28px;">💬</span>
          </div>
          <h2 style="margin: 0; color: #111; font-size: 22px;">WhatsApp Clone</h2>
        </div>

        <div style="background: white; border-radius: 10px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <p style="margin: 0 0 12px; color: #444; font-size: 15px;">
            ${isLogin ? 'Use the OTP below to complete your login.' : 'Use the OTP below to verify your email and activate your account.'}
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <div style="background: #f0fdf4; border: 2px dashed #25d366; border-radius: 10px; padding: 20px 16px; display: inline-block; min-width: 200px;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #777; letter-spacing: 1px; text-transform: uppercase;">Your OTP</p>
              <p style="margin: 0; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #111; font-family: 'Courier New', monospace;">${otp}</p>
            </div>
          </div>

          <p style="margin: 0; color: #888; font-size: 13px; text-align: center;">
            ⏳ This OTP expires in <strong>10 minutes</strong>.
          </p>
          <p style="margin: 12px 0 0; color: #aaa; font-size: 12px; text-align: center;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('\n--- NODEMAILER SMTP ERROR ---');
    console.error('Error Code:', error.code || 'UNKNOWN');
    console.error('Message:', error.message);
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET' || error.message.includes('Greeting')) {
      console.log('\n💡 TROUBLESHOOTING:');
      console.log('1. Your Antivirus (McAfee, Avast, etc.) or Windows Firewall is likely blocking Node.exe.');
      console.log('2. Whitelist Node.exe in your security software or try disabling it temporarily to test.');
      console.log('3. GOOD NEWS: Your account was still created! Use the OTP shown in the console below to continue.\n');
    }
    
    console.error('---------------------------\n');
    throw error;
  }
};

exports.sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Welcome to WhatsApp Clone!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #25d366; text-align: center;">Welcome, ${username}! 🎉</h2>
        <p style="color: #444;">Your account is verified and ready. Start messaging!</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};
