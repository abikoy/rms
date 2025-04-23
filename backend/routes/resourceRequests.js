const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ResourceRequest = require('../models/ResourceRequest');
const auth = require('../middleware/auth');

// Create a new resource request
router.post('/', auth, async (req, res) => {
  try {
    const { formNumber, requestDate, requestedBy, items } = req.body;

    // Verify the requesting user
    if (req.user._id.toString() !== requestedBy.userId) {
      return res.status(403).json({
        success: false,
        message: 'User ID mismatch'
      });
    }

    // Get the user's department from their profile
    const requestingUser = await User.findById(req.user._id);
    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: 'Requesting user not found'
      });
    }

    // Find the department head
    const departmentHead = await User.findOne({
      department: requestingUser.department,
      role: 'department_head',
      status: 'approved' // Ensure the department head is an approved user
    });

    if (!departmentHead) {
      return res.status(400).json({
        success: false,
        message: `No department head found for ${requestingUser.department}`
      });
    }

    // Create a unique request number
    const requestNumber = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the resource request
    const resourceRequest = new ResourceRequest({
      requestNumber,
      requestedBy: req.user._id,
      division: requestingUser.department,
      requestedItems: items.map(item => ({
        itemNo: item.itemNo,
        description: item.description,
        unitOfMeasure: item.unitOfMeasure,
        quantityRequested: item.quantityRequested,
        unitPrice: {
          birr: item.price.birr,
          cents: item.price.cents
        },
        totalAmount: {
          birr: item.totalAmount.birr,
          cents: item.totalAmount.cents
        }
      })),
      items,
      status: 'pending',
      assignedTo: {
        userId: departmentHead._id,
        name: departmentHead.fullName,
        role: departmentHead.role
      }
    });

    await resourceRequest.save();

    res.json({
      success: true,
      message: 'Resource request submitted successfully',
      request: resourceRequest
    });
  } catch (error) {
    console.error('Error creating resource request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating resource request'
    });
  }
});

// Get resource requests with filtering
router.get('/', auth, async (req, res) => {
  try {
    const { department, status, assignedTo } = req.query;
    const filter = {};

    // If user is department head, only show their department's requests
    if (req.user.role === 'department_head') {
      filter['requestedBy.department'] = req.user.department;
      filter['assignedTo.userId'] = req.user._id;
    }

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    const requests = await ResourceRequest.find(filter)
      .sort({ requestDate: -1 })
      .select('-__v')
      .lean();

    res.json(requests);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get resource requests for a user
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await ResourceRequest.find({
      'requestedBy.userId': req.user._id
    }).sort({ requestDate: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching resource requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resource requests'
    });
  }
});

// Get requests assigned to a department head
router.get('/assigned-requests', auth, async (req, res) => {
  try {
    // Verify user is a department head
    if (req.user.role !== 'department_head') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only department heads can view assigned requests.'
      });
    }

    const requests = await ResourceRequest.find({
      'assignedTo.userId': req.user._id
    }).sort({ requestDate: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching assigned requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned requests'
    });
  }
});

module.exports = router;
