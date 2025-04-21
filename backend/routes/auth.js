const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
// Delete user by ID
router.delete('/users/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Update user by ID
router.put('/users/:userId', auth, async (req, res) => {
  try {
    const { fullName, email, role, department, school, phoneNumber } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate role-specific fields
    if (role === 'school_dean' && !school) {
      return res.status(400).json({ message: 'School is required for School Dean role' });
    }
    if (['staff', 'department_head'].includes(role) && !department) {
      return res.status(400).json({ message: 'Department is required for Staff and Department Head roles' });
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
    );

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid input data', errors: Object.values(error.errors).map(err => err.message) });
    }
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

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

router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { fullName, email, password, role, department, school, phoneNumber } = req.body;

    // Accept status from request or default to 'pending'
    let { status } = req.body;
    if (!status) status = 'pending';

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with all fields
    const newUser = new User({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      department,
      school,
      phoneNumber,
      status
    });

    // Validate user (this will run all schema validations)
    try {
      await newUser.validate();
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    try {
      // Try to save the user
      await newUser.save();
      console.log('User saved successfully');
    } catch (error) {
      // Handle duplicate key error
      if (error.code === 11000) {
        console.log('Duplicate email error:', error);
        return res.status(400).json({
          success: false,
          message: 'Email is already registered'
        });
      }
      // Handle other errors
      throw error;
    }

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        school: newUser.school
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check user status if not system_admin
    if (user.role !== 'system_admin' && user.status !== 'approved') {
      return res.status(403).json({ 
        message: 'Your account is pending approval from the system administrator'
      });
    }

    // Create token
    const payload = {
      id: user.id,
      role: user.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            department: user.department,
            profilePhoto: user.profilePhoto
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, email, phoneNumber, department, school } = req.body;
    
    // Find user by id (from auth middleware)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If email is being changed, check if new email already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (department) user.department = department;
    if (school) user.school = school;

    await user.save();

    // Return updated user without password
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      school: user.school,
      phoneNumber: user.phoneNumber
    };

    res.json({ user: userData });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
