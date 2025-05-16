const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const AppError = require('./utils/appError');
const authRoutes = require('../routes/auth');
const adminRoutes = require('../routes/admin');
const resourceRoutes = require('../routes/resource');
const resourceRequestRoutes = require('../routes/resourceRequests');
const notificationRoutes = require('../routes/notifications');
const assetAssignmentRoutes = require('../routes/assetAssignments');
const transferRoutes = require('../routes/transfers');

const app = express();

// Enable CORS with proper configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],  // Allow both default ports
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['x-auth-token'],
  credentials: true
}));

// Handle preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  next();
});

// Handle OPTIONS preflight
app.options('*', cors());

// Set security HTTP headers with proper configuration for image serving
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
      },
    },
  })
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'profile-images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Copy default avatar if it doesn't exist
const defaultAvatarSrc = path.join(__dirname, 'public', 'default-avatar.jpg');
const defaultAvatarDest = path.join(uploadsDir, 'default-avatar.jpg');
if (!fs.existsSync(defaultAvatarDest) && fs.existsSync(defaultAvatarSrc)) {
  fs.copyFileSync(defaultAvatarSrc, defaultAvatarDest);
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/resource-requests', resourceRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/asset-assignments', assetAssignmentRoutes);
app.use('/api/transfers', transferRoutes);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;