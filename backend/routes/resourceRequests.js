const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ResourceRequest = require('../models/ResourceRequest');
const auth = require('../middleware/auth');
const { SCHOOLS, SCHOOL_DEPARTMENTS } = require('../constants/schools');

// Create a new resource request
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request must include at least one item'
      });
    }

    // Get the requesting user's details
    console.log('Finding requesting user with ID:', req.user._id);
    const requestingUser = await User.findById(req.user._id);
    
    if (!requestingUser) {
      console.error('Requesting user not found:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'Requesting user not found'
      });
    }

    console.log('Found requesting user:', {
      id: requestingUser._id,
      department: requestingUser.department,
      role: requestingUser.role
    });

    // Find the department head
    console.log('Finding department head for department:', requestingUser.department);
    const departmentHead = await User.findOne({
      department: requestingUser.department,
      role: 'department_head',
      status: 'approved'
    }).select('_id fullName department role');

    if (!departmentHead) {
      console.error('No department head found for department:', requestingUser.department);
      return res.status(400).json({
        success: false,
        message: `No approved department head found for ${requestingUser.department}. Please contact system administrator.`
      });
    }

    console.log('Found department head:', {
      id: departmentHead._id,
      department: departmentHead.department,
      role: departmentHead.role
    });

    const currentDate = new Date();
    
    // Generate a unique request number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get the latest request number for today
    const latestRequest = await ResourceRequest.findOne({
      requestNumber: new RegExp(`^RR-${year}${month}${day}-`)
    }).sort({ requestNumber: -1 });
    
    let sequenceNumber = 1;
    if (latestRequest) {
      const lastSequence = parseInt(latestRequest.requestNumber.split('-')[2]);
      sequenceNumber = lastSequence + 1;
    }
    
    const requestNumber = `RR-${year}${month}${day}-${String(sequenceNumber).padStart(3, '0')}`;
    
    // Create the resource request
    const resourceRequest = new ResourceRequest({
      requestNumber,
      requestedBy: req.user._id,
      department: req.user.department, // Add department information
      requestedItems: items.map(item => ({
        resource: item.resource,  // Resource ID is required
        itemNo: item.itemNo,
        description: item.description,
        unitOfMeasure: item.unitOfMeasure,
        quantityRequested: parseInt(item.quantityRequested) || 1,
        unitPrice: {
          birr: parseInt(item.price?.birr) || 0,
          cents: parseInt(item.price?.cents) || 0
        },
        totalAmount: {
          birr: parseInt(item.totalAmount?.birr) || 0,
          cents: parseInt(item.totalAmount?.cents) || 0
        },
        remark: item.remarks || ''
      })),
      status: 'pending',
      requestedDivisionHead: {
        name: departmentHead.fullName || '',
        date: currentDate,
        signature: ''
      },
      requestedAndReceivedBy: {
        name: requestingUser.fullName || '',
        date: currentDate,
        signature: ''
      },
      certifiedBy: {
        name: departmentHead.fullName || '',
        date: currentDate,
        signature: ''
      },
      assignedTo: {
        userId: departmentHead._id,
        name: departmentHead.fullName || '',
        role: 'department_head'
      }
    });

    try {
      console.log('Attempting to save resource request...');
      const savedRequest = await resourceRequest.save();
      console.log('Resource request saved successfully:', savedRequest._id);

      // Populate necessary fields for response
      const populatedRequest = await ResourceRequest.findById(savedRequest._id)
        .populate('requestedBy', 'fullName department')
        .populate('assignedTo.userId', 'fullName department role');

      res.status(201).json({
        success: true,
        message: 'Resource request created successfully',
        data: populatedRequest
      });
    } catch (error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }));
        console.error('Validation errors:', validationErrors);
        
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating resource request',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Unhandled error in request creation:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Error creating resource request',
      error: error.message
    });
  }
});

// Get resource requests with filtering
router.get('/', auth, async (req, res) => {
  try {
    const { status, department } = req.query;
    const filter = {};

    // Get full user details including school
    const user = await User.findById(req.user._id).select('role department school').lean();
    console.log('Full user details:', user);

    // Role-based filtering
    switch (req.user.role) {
      case 'department_head':
        // Department heads see requests from their department
        filter['department'] = department || req.user.department;
        filter['departmentHeadStatus'] = status || 'pending';
        break;

      case 'school_dean':
        console.log('Processing request for School Dean');
        console.log('Dean\'s details:', user);

        if (!user.school) {
          console.error('No school assigned to dean:', user);
          return res.status(400).json({
            success: false,
            message: 'No school assigned to dean'
          });
        }

        // Get all departments under this school
        const schoolDepartments = SCHOOL_DEPARTMENTS[user.school];
        
        if (!schoolDepartments) {
          console.error('Invalid school assigned to dean:', user.school);
          return res.status(400).json({
            success: false,
            message: 'Invalid school assigned to dean'
          });
        }

        console.log('Departments in dean\'s school:', schoolDepartments);

        // School deans only see requests that are:
        // 1. Approved by department heads
        // 2. From departments within their school
        filter['departmentHeadStatus'] = 'approved';
        filter['schoolDeanStatus'] = status || 'pending';
        filter['department'] = { $in: schoolDepartments };

        // If a specific department is requested, ensure it's within the dean's school
        if (department && !schoolDepartments.includes(department)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Department is not within your school'
          });
        }
        if (department) {
          filter['department'] = department;
        }
        break;

      case 'staff':
        // Staff can only see their own requests
        filter['requestedBy'] = req.user._id;
        break;

      default:
        // For other roles (if any)
        if (status) filter['status'] = status;
        if (department) filter['department'] = department;
    }

    // Overall status is managed separately from role-specific statuses
    if (status && !['department_head', 'school_dean'].includes(req.user.role)) {
      filter.status = status;
    }

    console.log('Applying filter:', filter);
    console.log('Department head filter:', filter);
    
    const requests = await ResourceRequest.find(filter)
      .populate('requestedBy', 'fullName department')
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();
    
    console.log('Found requests for department head:', requests.length);

    console.log('Found requests:', requests);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching resource requests' 
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

// Handle request approval/rejection
router.patch('/:requestId/status', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be either "approve" or "reject"'
      });
    }

    const request = await ResourceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update the appropriate status based on user role
    const updateData = {};
    
    switch (req.user.role) {
      case 'department_head':
        // Department head can only update departmentHeadStatus
        if (request.department !== req.user.department) {
          return res.status(403).json({
            success: false,
            message: 'You can only manage requests from your department'
          });
        }
        updateData.departmentHeadStatus = newStatus;
        // If rejected by department head, update overall status
        if (newStatus === 'rejected') {
          updateData.status = 'rejected';
        }
        break;

      case 'school_dean':
        // School dean can only update schoolDeanStatus for department-approved requests
        if (request.departmentHeadStatus !== 'approved') {
          return res.status(403).json({
            success: false,
            message: 'Can only manage requests approved by department head'
          });
        }
        updateData.schoolDeanStatus = newStatus;
        // Update overall status based on school dean's decision
        updateData.status = newStatus;
        break;

      default:
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to approve/reject requests'
        });
    }

    // Update the request
    const updatedRequest = await ResourceRequest.findByIdAndUpdate(
      requestId,
      { $set: updateData },
      { new: true }
    ).populate('requestedBy', 'fullName department');

    res.json({
      success: true,
      message: `Request ${action}ed successfully`,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating request status'
    });
  }
});

module.exports = router;
