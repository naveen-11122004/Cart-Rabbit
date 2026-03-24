
const nodemailer = require('nodemailer');
require('dotenv').config();

const testSmtp = async () => {
  const configs = [
    { host: 'smtp.gmail.com', port: 465, secure: true },
    { host: 'smtp.gmail.com', port: 587, secure: false },
    { service: 'gmail', secure: true }
  ];

  for (const config of configs) {
    console.log('Testing:', config);
    const transporter = nodemailer.createTransport({
      ...config,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASSWORD },
      tls: { rejectUnauthorized: false }
    });
    try {
      await transporter.verify();
      console.log('SUCCESS:', config.port || config.service);
    } catch (e) {
      console.log('FAILED:', config.port || config.service, e.message);
    }
  }
};
testSmtp();
