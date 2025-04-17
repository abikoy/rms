const express = require('express');
const { body, validationResult } = require('express-validator');
const Request = require('../models/request.model');
const Resource = require('../models/resource.model');
const { auth, authorize, departmentAccess } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all requests with filtering
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      department,
      startDate,
      endDate
    } = req.query;

    const filter = {};
    
    // Status filter
    if (status) filter.status = status;

    // Date range filter
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    // Department access control
    if (req.user.role !== 'system_admin') {
      if (req.user.role === 'school_dean') {
        // Logic to filter by school's departments
        // This would need to be expanded based on school-department mapping
      } else if (req.user.role === 'department_head') {
        filter.department = req.user.department;
      } else {
        filter.requestor = req.user._id;
      }
    } else if (department) {
      filter.department = department;
    }

    const requests = await Request.find(filter)
      .populate('requestor', 'username firstName lastName')
      .populate('resource')
      .populate('approvalChain.approver', 'username firstName lastName role');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new request
router.post('/', [
  auth,
  body('resource').isMongoId(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('purpose').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check resource availability
    const resource = await Resource.findById(req.body.resource);
    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: 'Resource not found or inactive' });
    }

    // Check for time conflicts
    const conflictingRequest = await Request.findOne({
      resource: req.body.resource,
      status: { $in: ['approved', 'pending'] },
      $or: [
        {
          startTime: { $lte: new Date(req.body.startTime) },
          endTime: { $gt: new Date(req.body.startTime) }
        },
        {
          startTime: { $lt: new Date(req.body.endTime) },
          endTime: { $gte: new Date(req.body.endTime) }
        }
      ]
    });

    if (conflictingRequest) {
      return res.status(400).json({ message: 'Resource is not available for the requested time period' });
    }

    const request = new Request({
      ...req.body,
      requestor: req.user._id,
      department: req.user.department,
      approvalChain: [{
        approver: null, // Will be set based on approval workflow
        status: 'pending'
      }]
    });

    await request.save();

    // Notify through Socket.IO
    const io = req.app.get('io');
    io.emit('request:created', {
      requestId: request._id,
      resourceId: resource._id,
      requestor: req.user.username
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status (approve/reject)
router.put('/:id/status', [
  auth,
  authorize('department_head', 'school_dean', 'system_admin'),
  body('status').isIn(['approved', 'rejected']),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('resource')
      .populate('requestor', 'username department');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user has authority to approve/reject
    if (req.user.role === 'department_head' && request.department !== req.user.department) {
      return res.status(403).json({ message: 'Unauthorized to modify this request' });
    }

    // Update approval chain
    request.approvalChain.push({
      approver: req.user._id,
      status: req.body.status,
      comment: req.body.comment,
      timestamp: new Date()
    });

    // Update request status
    request.status = req.body.status;

    // If approved, update resource status
    if (req.body.status === 'approved') {
      const resource = request.resource;
      resource.status = 'reserved';
      resource.currentAssignment = {
        user: request.requestor._id,
        startTime: request.startTime,
        endTime: request.endTime
      };
      await resource.save();
    }

    await request.save();

    // Notify through Socket.IO
    const io = req.app.get('io');
    io.emit('request:statusUpdated', {
      requestId: request._id,
      resourceId: request.resource._id,
      status: request.status,
      updatedBy: req.user.username
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel request
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only requestor or admin can cancel
    if (!request.requestor.equals(req.user._id) && req.user.role !== 'system_admin') {
      return res.status(403).json({ message: 'Unauthorized to cancel this request' });
    }

    request.status = 'cancelled';
    await request.save();

    // If request was approved, update resource status
    if (request.status === 'approved') {
      const resource = await Resource.findById(request.resource);
      resource.status = 'available';
      resource.currentAssignment = null;
      await resource.save();
    }

    // Notify through Socket.IO
    const io = req.app.get('io');
    io.emit('request:cancelled', {
      requestId: request._id,
      resourceId: request.resource,
      cancelledBy: req.user.username
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
