const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const MONGODB_URI = process.env.DATABASE_ONLINE;
console.log('Connecting to MongoDB Atlas...');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Drop existing indexes
    try {
      await conn.connection.collection('users').dropIndexes();
      console.log('Dropped all indexes from users collection');
    } catch (error) {
      console.log('No existing indexes to drop');
    }

    // Create new indexes
    try {
      await conn.connection.collection('users').createIndex(
        { email: 1 },
        { unique: true, collation: { locale: 'en', strength: 2 } }
      );
      console.log('Created unique case-insensitive index on email field');
    } catch (error) {
      console.error('Error creating index:', error);
    }

    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

connectDB();

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/profile', require('./routes/userProfile'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Routes configured:');
  console.log('- /api/auth');
  console.log('- /api/profile');
});
