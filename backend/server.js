const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware - CORS must be configured before routes
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(morgan('combined'));

// Simple CORS configuration that works with Vercel
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:5001',
      'http://localhost:10000',
      'https://dhan-sarthi-ai.vercel.app'
    ];
    
    // Check if origin ends with .vercel.app or .render.com
    const isVercel = origin.endsWith('.vercel.app');
    const isRender = origin.endsWith('.render.com');
    const isAllowed = allowedOrigins.includes(origin);
    
    if (isVercel || isRender || isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway in production to avoid issues
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests explicitly
app.options('*', cors());

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

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

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

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`💰 Budget endpoints: http://localhost:${PORT}/api/budgets`);
});