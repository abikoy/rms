const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching notifications for user:', req.user);

    // Get full user details
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Build query for notifications
    const query = {
      $or: [
        // Personal notifications
        { recipient: req.user._id },
        // Role-based notifications
        { role: user.role },
        // Department-based notifications (if user has a department)
        ...(user.department ? [{ department: user.department }] : []),
        // School-based notifications (if user has a school)
        ...(user.school ? [{ school: user.school }] : [])
      ]
    };

    console.log('Notification query:', JSON.stringify(query, null, 2));

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .populate('relatedResource')
      .populate('relatedRequest');

    console.log('Found notifications:', notifications.length);

    res.json({
      status: 'success',
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Mark a notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    console.log('Marking notification as read:', req.params.id);
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    console.log('Updated notification:', notification);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    res.json({
      status: 'success',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    console.log('Marking all notifications as read for user:', req.user._id);

    // Get full user details
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Build query for notifications to mark as read
    const query = {
      $or: [
        { recipient: req.user._id },
        { role: user.role },
        ...(user.department ? [{ department: user.department }] : []),
        ...(user.school ? [{ school: user.school }] : [])
      ],
      read: false
    };

    const result = await Notification.updateMany(query, { read: true });
    console.log('Update result:', result);

    res.json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
