const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const statusRoutes = require('./routes/statusRoutes');

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/status', statusRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'WhatsApp Clone Backend is running' });
});

module.exports = app;
