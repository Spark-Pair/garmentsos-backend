const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB (safe for Vercel)
connectDB();

// Subscription check middleware
app.use((req, res, next) => {
  if (!process.env.SUBSCRIPTION_EXPIRY) return next();

  const expiryDate = new Date(process.env.SUBSCRIPTION_EXPIRY);
  if (new Date() > expiryDate) {
    return res.status(403).json({
      success: false,
      message: 'Subscription expired. Please contact SparkPair to renew.',
      expiredOn: process.env.SUBSCRIPTION_EXPIRY
    });
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/config', require('./routes/configRoutes'));
app.use('/api/options', require('./routes/optionsRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GarmentsOS API is running on Vercel',
    poweredBy: process.env.POWERED_BY
  });
});

module.exports = app;
