const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
    console.log('Upload directory:', uploadDir);
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created upload directory');
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'profile-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, department } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password,
      role,
      department
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

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
            phoneNumber: user.phoneNumber,
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
            profilePhoto: user.profilePhoto,
            phoneNumber: user.phoneNumber
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
router.put('/profile', auth, upload.single('profilePhoto'), async (req, res) => {
  try {
    console.log('Profile update request:', req.body);
    console.log('User ID from token:', req.user.id);

    const { fullName, email, phoneNumber, currentPassword, newPassword } = req.body;

    // Find user by id (from auth middleware)
    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare update object
    const updates = {};

    // Handle fullName update
    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || fullName.trim().length === 0) {
        return res.status(400).json({ message: 'Valid name is required' });
      }
      updates.fullName = fullName.trim();
    }

    // Handle email update
    if (email === undefined || email === null) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email format is required' });
    }
    const trimmedEmail = email.trim();
    if (trimmedEmail !== user.email) {
      const existingUser = await User.findOne({ email: trimmedEmail, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    updates.email = trimmedEmail;

    // Handle phone update
    if (phoneNumber !== undefined) {
      if (phoneNumber && typeof phoneNumber !== 'string') {
        return res.status(400).json({ message: 'Phone number must be a string' });
      }
      updates.phoneNumber = phoneNumber.trim();
    }

    // Handle password update
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    // Always preserve required fields
    updates.role = user.role;
    updates.department = user.department;
    updates.password = updates.password || user.password; // Keep existing password if not updating

    // Handle profile photo
    if (req.file) {
      // Delete old profile photo if it exists
      if (user.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
        try {
          if (fs.existsSync(oldPhotoPath) && !oldPhotoPath.includes('default-avatar')) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (error) {
          console.error('Error deleting old profile photo:', error);
        }
      }
      // Save new profile photo path - store only the relative path
      console.log('Original file path:', req.file.path);
      console.log('File info:', req.file);
      
      // Ensure we have a valid path
      const uploadDir = path.join(__dirname, '..', 'uploads');
      const relativePath = path.relative(uploadDir, req.file.path);
      updates.profilePhoto = relativePath.replace(/\\/g, '/');
      
      console.log('Final profile photo path:', updates.profilePhoto);
    }

    // Update user
    try {
      console.log('Updating user with:', updates);

      // First find and update the user
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { 
          new: true, // Return the updated document
          runValidators: false, // Disable validation since we're handling it manually
          select: '-password' // Exclude password from response
        }
      );

      if (!updatedUser) {
        console.error('User not found');
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('User updated successfully:', updatedUser._id);
      res.json({ user: updatedUser });
    } catch (updateError) {
      console.error('Update error:', updateError);
      if (updateError.name === 'ValidationError') {
        return res.status(400).json({ 
          message: updateError.message,
          errors: updateError.errors
        });
      }
      if (updateError.code === 11000) {
        return res.status(400).json({ 
          message: 'Email already exists',
          errors: { email: 'This email is already registered' }
        });
      }
      return res.status(500).json({ 
        message: 'Server error during update',
        error: updateError.message
      });
    }
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ 
      message: 'Server error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        phoneNumber: user.phoneNumber,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
