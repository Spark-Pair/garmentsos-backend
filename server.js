const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const appConfig = require('./app.config.json');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());

// Subscription check middleware
app.use((req, res, next) => {
  const expiryDate = new Date(appConfig.license.expiry);
  if (new Date() > expiryDate) {
    return res.status(403).json({
      success: false,
      message: 'Subscription expired. Please contact SparkPair to renew.',
      expiredOn: appConfig.license.expiry
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
    message: 'GarmetnsOS API is running',
    poweredBy: appConfig.developer.powered_by 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: appConfig.app.developer === 'development' ? err.message : undefined
  });
});

const PORT = appConfig.app.port || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Powered by ${appConfig.developer.powered_by}`);
});
