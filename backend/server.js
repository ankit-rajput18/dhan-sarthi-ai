const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configure CORS to allow multiple origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:5001',
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL, // For Vercel deployments
      'https://your-vercel-app.vercel.app' // Replace with your actual Vercel URL
    ].filter(Boolean); // Remove any undefined values
    
    // Check if the origin is in our allowed list or is undefined (for server-to-server requests)
    if (!origin || allowedOrigins.includes(origin) || 
        allowedOrigins.some(allowedOrigin => 
          allowedOrigin && origin.startsWith(allowedOrigin.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dhan-sarthi', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/budgets', require('./routes/budgets'));

// Root API route
app.get('/api', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dhan-Sarthi API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions',
      loans: '/api/loans',
      goals: '/api/goals',
      budgets: '/api/budgets',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dhan-Sarthi API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      message: 'CORS error: Origin not allowed',
      error: 'Not allowed by CORS'
    });
  }
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`💰 Budget endpoints: http://localhost:${PORT}/api/budgets`);
});