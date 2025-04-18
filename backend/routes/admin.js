const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Debug middleware for admin routes
router.use((req, res, next) => {
  console.log('Admin route accessed:', req.method, req.path);
  next();
});

// Get all pending users
router.get('/pending-users', auth, async (req, res) => {
  console.log('Fetching pending users...');
  console.log('User role:', req.user?.role);
  try {
    // Check if the requesting user is a system_admin
    if (req.user.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only system administrators can view pending users.'
      });
    }

    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    console.log('Found pending users:', pendingUsers.length);

    res.json({
      success: true,
      users: pendingUsers
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending users'
    });
  }
});

// Get all approved users
router.get('/approved-users', auth, async (req, res) => {
  console.log('Fetching approved users...');
  try {
    // Check if the requesting user is a system_admin
    if (req.user.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only system administrators can view approved users.'
      });
    }

    const approvedUsers = await User.find({ status: 'approved' })
      .select('-password')
      .sort({ createdAt: -1 });

    console.log('Found approved users:', approvedUsers.length);

    res.json({
      success: true,
      users: approvedUsers
    });
  } catch (error) {
    console.error('Error fetching approved users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching approved users'
    });
  }
});

// Approve or reject a user
router.put('/users/:userId/status', auth, async (req, res) => {
  try {
    // Check if the requesting user is a system_admin
    if (req.user.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only system administrators can approve/reject users.'
      });
    }

    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be either "approved" or "rejected".'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user,
      message: `User ${status === 'approved' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

module.exports = router;
