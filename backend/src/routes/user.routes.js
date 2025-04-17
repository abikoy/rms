const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user.model');
const { auth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, authorize('system_admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/', [
  auth,
  authorize('system_admin'),
  body('username').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn([
    'system_admin',
    'ddu_asset_manager',
    'iot_asset_manager',
    'staff',
    'technical_team',
    'school_dean',
    'department_head'
  ]),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userExists = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.email }
      ]
    });

    if (userExists) {
      return res.status(400).json({
        message: 'Username or email already exists'
      });
    }

    const user = new User(req.body);
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        school: user.school
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
router.put('/:id', [
  auth,
  authorize('system_admin'),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn([
    'system_admin',
    'ddu_asset_manager',
    'iot_asset_manager',
    'staff',
    'technical_team',
    'school_dean',
    'department_head'
  ])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    delete updates.password; // Password should be updated through a separate endpoint

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, authorize('system_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users by department (for department heads and school deans)
router.get('/department/:department', [
  auth,
  authorize('department_head', 'school_dean', 'system_admin')
], async (req, res) => {
  try {
    const users = await User.find({
      department: req.params.department,
      isActive: true
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
