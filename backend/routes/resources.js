const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');
const ResourceTransfer = require('../models/ResourceTransfer');

// @route   GET /api/resources
// @desc    Get all resources
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const resources = await Resource.find()
      .select('name serialNumber type assetClass model location status managerType price quantity createdAt updatedAt')
      .lean(); // Convert to plain JavaScript objects

    // Log the first resource for debugging
    if (resources.length > 0) {
      console.log('Sample resource:', resources[0]);
    }

    res.json({
      status: 'success',
      data: resources
    });
  } catch (err) {
    console.error('Error fetching resources:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch resources',
      error: err.message
    });
  }
});

// @route   POST /resources/transfer
// @desc    Transfer resources between departments
// @access  Private
router.post('/transfer', auth, async (req, res) => {
  try {
    const { resourceId, fromDepartment, toDepartment, quantity, reason } = req.body;

    // Validate request
    if (!resourceId || !fromDepartment || !toDepartment || !quantity || !reason) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if resource exists and has sufficient quantity
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    // Create transfer record
    const transfer = new ResourceTransfer({
      resource: resourceId,
      fromDepartment,
      toDepartment,
      quantity,
      reason,
      requestedBy: req.user.id,
      status: 'pending'
    });

    // Save transfer record
    await transfer.save();

    // Update resource quantity
    resource.quantity -= quantity;
    await resource.save();

    // Create new resource in target department if it doesn't exist
    let targetResource = await Resource.findOne({
      name: resource.name,
      department: toDepartment
    });

    if (!targetResource) {
      targetResource = new Resource({
        name: resource.name,
        description: resource.description,
        category: resource.category,
        department: toDepartment,
        quantity: quantity
      });
    } else {
      targetResource.quantity += quantity;
    }

    await targetResource.save();

    res.json({ transfer, message: 'Transfer initiated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /resources/transfers
// @desc    Get resource transfers for a department
// @access  Private
router.get('/transfers', auth, async (req, res) => {
  try {
    const transfers = await ResourceTransfer.find({
      $or: [
        { fromDepartment: req.user.department },
        { toDepartment: req.user.department }
      ]
    })
      .populate('resource')
      .populate('requestedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;