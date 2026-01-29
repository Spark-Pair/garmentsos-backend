const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Subscription check middleware
app.use((req, res, next) => {
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
    message: 'Wonder Fashion API is running',
    poweredBy: process.env.POWERED_BY 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Powered by ${process.env.POWERED_BY}`);
});
