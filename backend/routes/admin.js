const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { DEPARTMENTS_LIST } = require('../constants/departments');

// Get all users
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user by ID
router.get('/users/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Delete user by ID
router.delete('/users/:userId', auth, async (req, res) => {
  try {
    // Check if the requesting user is a system_admin
    if (req.user.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only system administrators can delete users.'
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.userId);
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// Update user by ID
router.put('/users/:userId', auth, async (req, res) => {
  try {
    // Check if the requesting user is a system_admin
    if (req.user.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only system administrators can update users.'
      });
    }

    const { fullName, email, role, department, school, phoneNumber } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate role-specific fields
    if (role === 'school_dean' && !school) {
      return res.status(400).json({
        success: false,
        message: 'School is required for School Dean role'
      });
    }
    if (['staff', 'department_head'].includes(role) && !department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required for Staff and Department Head roles'
      });
    }

    // Validate department if provided
    if (department && !DEPARTMENTS_LIST.includes(department)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department. Must be one of: ' + DEPARTMENTS_LIST.join(', ')
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          fullName,
          email,
          role,
          department,
          school,
          phoneNumber,
          updatedAt: Date.now()
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

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

    // Get department filter from query params
    const { department } = req.query;
    
    // Build query
    const query = { status: 'pending' };
    if (department && DEPARTMENTS_LIST.includes(department)) {
      query.department = department;
    }

    const pendingUsers = await User.find(query)
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

    const { department } = req.query;
    
    // Build query
    const query = { status: 'approved' };
    if (department && DEPARTMENTS_LIST.includes(department)) {
      query.department = department;
    }

    const approvedUsers = await User.find(query)
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

// Update user status (approve/reject)
router.put('/users/:userId/status', auth, async (req, res) => {
  try {
    // Check if the requesting user is a system_admin
    if (req.user.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only system administrators can update user status.'
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
