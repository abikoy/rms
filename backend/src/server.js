const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const resourceRoutes = require('../routes/resource');
const resourceRequestRoutes = require('../routes/resourceRequests');
const userRoutes = require('../routes/user');
const notificationRoutes = require('../routes/notifications');

const app = require('./app');

app.use('/api/resources', resourceRoutes);
app.use('/api/resource-requests', resourceRequestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const DB = process.env.DATABASE_ONLINE;

mongoose
  .connect(DB)
  .then(() => console.log('Database connection successful! 🎉'))
  .catch(err => console.error('Database connection error:', err));

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Initialize socket.io
const { initializeSocket } = require('../socket/socketServer');
initializeSocket(server);

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});