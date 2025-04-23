const express = require('express');
const router = express.Router();
const ResourceRequest = require('../models/ResourceRequest');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

// Create a new resource request
router.post('/', auth, async (req, res) => {
  try {
    const {
      division,
      requestedItems,
      requestedDivisionHead,
      requestedAndReceivedBy,
      certifiedBy
    } = req.body;

    // Create new resource request
    const resourceRequest = new ResourceRequest({
      requestedBy: req.user._id,
      division,
      requestedItems: requestedItems.map(item => ({
        ...item,
        resource: item.resourceId
      })),
      requestedDivisionHead,
      requestedAndReceivedBy,
      certifiedBy
    });

    // Save the request
    const savedRequest = await resourceRequest.save();

    res.status(201).json({
      status: 'success',
      data: savedRequest
    });
  } catch (error) {
    console.error('Error creating resource request:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get all resource requests for a user
router.get('/', auth, async (req, res) => {
  try {
    const requests = await ResourceRequest.find({ requestedBy: req.user._id })
      .populate('requestedItems.resource')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: requests
    });
  } catch (error) {
    console.error('Error fetching resource requests:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get a single resource request
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await ResourceRequest.findById(req.params.id)
      .populate('requestedItems.resource');

    if (!request) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resource request not found'
      });
    }

    // Check if user has permission to view this request
    if (request.requestedBy.toString() !== req.user._id.toString() && 
        !['system_admin', 'ddu_asset_manager', 'iot_asset_manager'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view this request'
      });
    }

    res.json({
      status: 'success',
      data: request
    });
  } catch (error) {
    console.error('Error fetching resource request:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update resource request status (for asset managers)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    // Check if user is an asset manager
    if (!['system_admin', 'ddu_asset_manager', 'iot_asset_manager'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Only asset managers can update request status'
      });
    }

    const request = await ResourceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resource request not found'
      });
    }

    request.status = status;
    await request.save();

    res.json({
      status: 'success',
      data: request
    });
  } catch (error) {
    console.error('Error updating resource request status:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
