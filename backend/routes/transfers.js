const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transfer = require('../models/Transfer');
const User = require('../models/User');

// Create a new transfer
router.post('/', auth, async (req, res) => {
  try {
    const {
      transferNo,
      date,
      fromDivision,
      toDivision,
      items,
      assetTransferorName,
      assetTransferorDate,
      propertyHeadName,
      propertyHeadDate,
      witnessName,
      recipientName
    } = req.body;

    // Create transfer document
    const transfer = new Transfer({
      transferNo,
      date: new Date(date),
      fromDivision,
      toDivision,
      items: items.map(item => ({
        ...item,
        fainDate: new Date(item.fainDate)
      })),
      assetTransferor: {
        name: assetTransferorName,
        date: new Date(assetTransferorDate)
      },
      propertyHead: {
        name: propertyHeadName,
        date: propertyHeadDate ? new Date(propertyHeadDate) : null
      },
      witness: {
        name: witnessName
      },
      recipient: {
        name: recipientName
      },
      createdBy: req.user._id
    });

    await transfer.save();

    res.status(201).json({
      status: 'success',
      message: 'Transfer created successfully',
      data: transfer
    });
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to create transfer'
    });
  }
});

// Get transfers based on user role and division
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    const user = req.user;

    switch (user.role) {
      case 'school_dean':
        // Get all departments under this school
        const departmentsInSchool = await User.distinct('department', { 
          school: user.school,
          department: { $exists: true, $ne: '' }
        });

        // School dean sees:
        // 1. All transfers at school level
        // 2. All transfers from/to departments under their school
        query = {
          $or: [
            // School level transfers
            { fromDivision: user.school },
            { toDivision: user.school },
            // Department level transfers (for all departments under the school)
            { fromDivision: { $in: departmentsInSchool } },
            { toDivision: { $in: departmentsInSchool } },
            // Transfers created by users in their school
            { 'createdBy': { $in: await User.find({ school: user.school }).distinct('_id') } }
          ]
        };
        break;

      case 'department_head':
        // Department head sees:
        // 1. All transfers from/to their department
        // 2. All transfers created by users in their department
        query = {
          $or: [
            { fromDivision: user.department },
            { toDivision: user.department },
            // Include transfers created by users in their department
            { 'createdBy': { $in: await User.find({ department: user.department }).distinct('_id') } }
          ]
        };
        break;

      case 'staff':
        // Staff only sees their own transfers
        query = { 'createdBy': user._id };
        break;

      case 'admin':
        // Admin sees all transfers
        break;

      default:
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized access'
        });
    }

    // Get transfers with populated creator info
    const transfers = await Transfer.find(query)
      .populate({
        path: 'createdBy',
        select: 'fullName email department school',
        populate: {
          path: 'department school',
          select: 'name'
        }
      })
      .sort('-createdAt');

    res.json({
      status: 'success',
      data: transfers
    });
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch transfers'
    });
  }
});

// Get transfer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('createdBy', 'fullName email department');

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found'
      });
    }

    res.json({
      status: 'success',
      data: transfer
    });
  } catch (error) {
    console.error('Error fetching transfer:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch transfer'
    });
  }
});

// Update transfer status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    // Only property head can approve/reject transfers
    if (req.user.role !== 'property_head') {
      return res.status(403).json({
        status: 'error',
        message: 'Only property head can approve or reject transfers'
      });
    }

    const transfer = await Transfer.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        'propertyHead.name': req.user.fullName,
        'propertyHead.date': new Date()
      },
      { new: true }
    );

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found'
      });
    }

    res.json({
      status: 'success',
      message: `Transfer ${status} successfully`,
      data: transfer
    });
  } catch (error) {
    console.error('Error updating transfer status:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update transfer status'
    });
  }
});

module.exports = router;
