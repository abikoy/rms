const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ResourceRequest = require('../models/ResourceRequest');
const { SCHOOLS, SCHOOL_DEPARTMENTS } = require('../constants/schools');
const { sendNotification } = require('../socket/socketServer');

// Constants for roles and request status
const ROLES = {
  SCHOOL_DEAN: 'school_dean',
  DEPARTMENT_HEAD: 'department_head',
  STAFF: 'staff',
  IOT_ASSET_MANAGER: 'iot_asset_manager',
  DDU_ASSET_MANAGER: 'ddu_asset_manager'
};

const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Helper function to find asset manager based on school
const findAssetManager = async (school) => {
  // Get the actual school values, not the keys
  const iotSchools = [SCHOOLS.COMPUTING, SCHOOLS.CIVIL, SCHOOLS.ELECTRICAL].map(s => s);
  const dduSchools = [SCHOOLS.NATURAL, SCHOOLS.SOCIAL, SCHOOLS.BUSINESS, SCHOOLS.HEALTH].map(s => s);

  let assetManagerRole;

  if (iotSchools.includes(school)) {
    assetManagerRole = ROLES.IOT_ASSET_MANAGER;
  } else if (dduSchools.includes(school)) {
    assetManagerRole = ROLES.DDU_ASSET_MANAGER;
  } else {
    throw new Error(`Invalid school: ${school}`);
  }
  
  const assetManager = await User.findOne({
    role: assetManagerRole,
    status: 'approved'
  }).select('_id fullName role');

  if (!assetManager) {
    throw new Error(`No approved asset manager found for ${school}`);
  }

  return assetManager;
};

// Helper function to find department head
const findDepartmentHead = async (department) => {
  const departmentHead = await User.findOne({
    department,
    role: ROLES.DEPARTMENT_HEAD,
    status: 'approved'
  }).select('_id fullName role department');

  if (!departmentHead) {
    throw new Error(`No approved department head found for ${department}`);
  }

  return departmentHead;
};

// Helper function to find school dean
const findSchoolDean = async (school) => {
  const schoolDean = await User.findOne({
    school,
    role: ROLES.SCHOOL_DEAN,
    status: 'approved'
  }).select('_id fullName role school');

  if (!schoolDean) {
    throw new Error(`No approved school dean found for ${school}`);
  }

  return schoolDean;
};

// Helper function to get approval chain based on role
const getApprovalChain = async (requestingUser, school) => {
  const { role, department } = requestingUser;
  const approvers = [];

  try {
    switch (role) {
      case ROLES.STAFF:
        // Staff -> Department Head -> School Dean -> Asset Manager
        const departmentHead = await findDepartmentHead(department);
        // Use the school provided in the request instead of department head's school
        const staffSchoolDean = await findSchoolDean(school);
        const staffAssetManager = await findAssetManager(school);
        
        approvers.push(
          {
            userId: departmentHead._id,
            name: departmentHead.fullName,
            role: departmentHead.role,
            status: REQUEST_STATUS.PENDING
          },
          {
            userId: staffSchoolDean._id,
            name: staffSchoolDean.fullName,
            role: staffSchoolDean.role,
            status: REQUEST_STATUS.PENDING
          },
          {
            userId: staffAssetManager._id,
            name: staffAssetManager.fullName,
            role: staffAssetManager.role,
            status: REQUEST_STATUS.PENDING
          }
        );
        break;

      case ROLES.DEPARTMENT_HEAD:
        // Department Head -> School Dean -> Asset Manager
        const deptHeadSchoolDean = await findSchoolDean(school);
        const deptHeadAssetManager = await findAssetManager(school);

        approvers.push(
          {
            userId: deptHeadSchoolDean._id,
            name: deptHeadSchoolDean.fullName,
            role: deptHeadSchoolDean.role,
            status: REQUEST_STATUS.PENDING
          },
          {
            userId: deptHeadAssetManager._id,
            name: deptHeadAssetManager.fullName,
            role: deptHeadAssetManager.role,
            status: REQUEST_STATUS.PENDING
          }
        );
        break;

      case ROLES.SCHOOL_DEAN:
        // School Dean -> Asset Manager
        const schoolDeanAssetManager = await findAssetManager(school);
        approvers.push({
          userId: schoolDeanAssetManager._id,
          name: schoolDeanAssetManager.fullName,
          role: schoolDeanAssetManager.role,
          status: REQUEST_STATUS.PENDING
        });
        break;

      default:
        throw new Error('Invalid role for resource request');
    }

    return approvers;
  } catch (error) {
    throw new Error(`Failed to create approval chain: ${error.message}`);
  }
};

// Create a new resource request
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log('Received request body:', req.body);
    const { items, role, school } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one item'
      });
    }

    // Validate role and required fields
    if (role === ROLES.SCHOOL_DEAN && !school) {
      return res.status(400).json({
        success: false,
        message: 'School is required for school dean requests'
      });
    }

    // Get the requesting user's details
    console.log('Finding requesting user with ID:', req.user._id);
    const requestingUser = await User.findById(req.user._id)
      .select('_id fullName role status school department')
      .lean();
    
    if (!requestingUser) {
      console.error('Requesting user not found:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'Requesting user not found'
      });
    }

    console.log('User details:', {
      role: requestingUser.role,
      department: requestingUser.department,
      school: requestingUser.school
    });

    // Validate user role
    if (requestingUser.role !== role) {
      return res.status(400).json({
        success: false,
        message: 'Role mismatch'
      });
    }

    console.log('Processing request for:', {
      id: requestingUser._id,
      role: requestingUser.role,
      school: requestingUser.school
    });

    // For staff and department head, ensure we have the correct school
    let userSchool = school;
    if (!userSchool && requestingUser.school) {
      userSchool = requestingUser.school;
    } else if (!userSchool && requestingUser.department) {
      // Find school from department
      for (const [schoolName, departments] of Object.entries(SCHOOL_DEPARTMENTS)) {
        if (departments.includes(requestingUser.department)) {
          userSchool = schoolName;
          break;
        }
      }
      if (!userSchool) {
        console.error('Could not determine school for department:', requestingUser.department);
        return res.status(400).json({
          success: false,
          message: `Could not determine school for department: ${requestingUser.department}. Please ensure department name matches exactly with the system configuration.`
        });
      }
    }

    console.log('Determined school:', userSchool);

    // Get approval chain based on user's role
    let approvers;
    try {
      approvers = await getApprovalChain(requestingUser, userSchool);
    } catch (error) {
      console.error('Error getting approval chain:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Log the approvers for debugging
    console.log('Approval chain:', approvers);

    const today = new Date();
    const year = today.getFullYear().toString();  // Use full year instead of last 2 digits
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Get the latest sequence number for today
    const latestRequest = await ResourceRequest.findOne({
      requestNumber: new RegExp(`^RR-${year}${month}${day}`)
    }).sort({ requestNumber: -1 });

    let sequenceNumber = 1;
    if (latestRequest) {
      const currentSequence = parseInt(latestRequest.requestNumber.split('-')[2]);
      sequenceNumber = currentSequence + 1;
    }

    const requestNumber = `RR-${year}${month}${day}-${String(sequenceNumber).padStart(3, '0')}`;
    
    // Create the resource request
    const resourceRequest = new ResourceRequest({
      requestNumber,
      requestedBy: req.user._id,
      role: role,
      ...(role === ROLES.SCHOOL_DEAN ? { 
        school,
        schoolDeanStatus: 'approved',  // Auto-approve for school dean
        assetManagerStatus: 'pending'  // Set pending for asset manager review
      } : role === ROLES.DEPARTMENT_HEAD ? {
        department: requestingUser.department,
        school: requestingUser.school,  // Add school from department head's profile
        departmentHeadStatus: 'approved',  // Auto-approve for department head
        schoolDeanStatus: 'pending',
        assetManagerStatus: 'pending'
      } : { 
        department: requestingUser.department,
        school: requestingUser.school,  // Add school from user's profile
        departmentHeadStatus: 'pending',
        schoolDeanStatus: 'pending',
        assetManagerStatus: 'pending'
      }),
      requestedItems: items.map(item => ({
        resource: item.resource,
        itemNo: item.itemNo,
        description: item.description,
        unitOfMeasure: item.unitOfMeasure,
        quantityRequested: item.quantityRequested,
        unitPrice: item.unitPrice,
        totalAmount: item.totalAmount,
        remarks: item.remarks
      })),
      status: REQUEST_STATUS.PENDING,
      approvers: approvers,
      requestedDivisionHead: {
        name: requestingUser.fullName,
        date: new Date()
      },
      requestedAndReceivedBy: {
        name: requestingUser.fullName,
        date: new Date()
      },
      certifiedBy: {
        name: requestingUser.fullName,
        date: new Date()
      }
    });

    // Save the request
    await resourceRequest.save();

    // Create notification for the first approver if exists
    if (approvers && approvers.length > 0) {
      const firstApprover = approvers[0];
      
      // For school dean requests, notify asset manager directly
      const recipientId = role === ROLES.SCHOOL_DEAN ? 
        firstApprover.userId : // Asset manager ID
        firstApprover.userId;  // Department head or other approver ID

      await Notification.create({
        recipient: recipientId,
        title: 'New Resource Request',
        message: `New resource request ${requestNumber} requires your approval`,
        type: 'resource_request',
        resourceRequestId: resourceRequest._id
      });

      // Send real-time notification if socket exists
      sendNotification(recipientId, {
        title: 'New Resource Request',
        message: `New resource request ${requestNumber} requires your approval`
      });
    }

    await session.commitTransaction();
    res.json({
      success: true,
      message: 'Resource request created successfully',
      requestNumber
    });
  
  } catch (error) {
    await session.abortTransaction();
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
  } finally {
    session.endSession();
  }
});

// Get a specific resource request by ID
router.get('/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Find the request and populate necessary fields
    const request = await ResourceRequest.findOne({ requestNumber: requestId })
      .populate('requestedBy', 'fullName department')
      .populate('requestedItems.resource', 'name description quantity unitPrice')
      .lean();
    
    // Log the request data for debugging
    console.log('Found request:', JSON.stringify(request, null, 2));

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found',
        details: {
          notFound: true,
          requestNumber: requestId
        }
      });
    }

    res.json({
      status: 'success',
      data: request
    });
  } catch (error) {
    console.error('Error fetching request details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch request details',
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
    const role = req.query.role || req.user.role;
    switch (role) {
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

      case 'ddu_asset_manager':
        // DDU Asset Managers see requests from Business and Health schools that are approved by deans
        filter['school'] = { $in: [SCHOOLS.BUSINESS, SCHOOLS.HEALTH, SCHOOLS.NATURAL, SCHOOLS.SOCIAL] };
        filter['schoolDeanStatus'] = 'approved';
        filter['assetManagerStatus'] = status || 'pending';
        filter['status'] = { $ne: 'rejected' };
        break;

      case 'iot_asset_manager':
        // IOT Asset Managers see requests from Computing school that are approved by deans
        filter['school'] ={ $in: [ SCHOOLS.COMPUTING,SCHOOLS.ELECTRICAL, SCHOOLS.CIVIL]};
        filter['schoolDeanStatus'] = 'approved';
        filter['assetManagerStatus'] = status || 'pending';
        filter['status'] = { $ne: 'rejected' };
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
      .populate({
        path: 'requestedBy',
        select: 'fullName department school'
      })
      .populate({
        path: 'requestedItems.resource',
        select: 'name description'
      })
      .sort({ createdAt: -1 })
      .select('requestNumber requestedItems requestedBy createdAt schoolDeanStatus assetManagerStatus status')
      .lean();

    // Transform the data to match frontend expectations
    const transformedRequests = requests.map(request => {
      // Ensure requestedBy is properly populated and extract the name
      const requestedByName = request.requestedBy?.fullName || 'Unknown User';
      
      return {
        _id: request._id,
        idResource: request.requestNumber || 'N/A', // Request ID
        requestName: request.requestedItems[0]?.resource?.name || 'Unknown Resource', // Resource Requested
        requestedBy: requestedByName, // Now it's a string, not an object
        date: request.createdAt,
        status: request.schoolDeanStatus === 'approved' ? 
          (request.assetManagerStatus === 'pending' ? 'Pending Asset Manager Review' : request.assetManagerStatus) : 
          request.schoolDeanStatus
      };
    });
    
    console.log('Found requests for department head:', requests.length);

    console.log('Found requests:', requests);

    res.json({
      success: true,
      data: transformedRequests
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
      'requestedBy': req.user._id
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
      'approvers.userId': req.user._id
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

// Get a single resource request by request number
router.get('/:requestNumber', auth, async (req, res) => {
  try {
    const request = await ResourceRequest.findOne({ 
      requestNumber: req.params.requestNumber 
    })
    .populate('requestedBy', 'fullName department')
    .populate('requestedItems.resource', 'name description quantity unitPrice');

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found',
        details: {
          notFound: true,
          requestNumber: req.params.requestNumber
        }
      });
    }

    // Get department head for the requester's department if exists
    const departmentHead = await User.findOne({
      department: request.department,
      role: 'department_head'
    });

    // Format the response
    res.json({
      status: 'success',
      data: {
        ...request.toObject(),
        departmentHead: departmentHead ? {
          name: departmentHead.fullName,
          department: departmentHead.department
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching resource request:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch resource request details',
      error: error.message
    });
  }
});

// Handle request approval/rejection
router.patch('/:requestId/status', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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
        // If rejected by school dean, update overall status
        if (newStatus === 'rejected') {
          updateData.status = 'rejected';
        } else if (newStatus === 'approved') {
          // When school dean approves, set it for asset manager review
          updateData.status = 'pending';
          updateData.assetManagerStatus = 'pending';
          updateData.school = req.user.school;  // Set the school from the dean's profile
        }
        break;

      case 'ddu_asset_manager':
      case 'iot_asset_manager':
        // Asset managers should see requests that are:
        // 1. Approved by school dean
        // 2. Still pending for asset manager review
        // 3. From their assigned schools
        const filter = {};
        filter['schoolDeanStatus'] = 'approved';
        filter['assetManagerStatus'] = 'pending';

        // DDU asset manager handles schools
        // IOT asset manager handles school
        const userSchools = req.user.role === 'ddu_asset_manager' ?
          [SCHOOLS.BUSINESS, SCHOOLS.HEALTH, SCHOOLS.NATURAL, SCHOOLS.SOCIAL] : [SCHOOLS.COMPUTING, SCHOOLS.CIVIL, SCHOOLS.ELECTRICAL];
        
        // Add school filter
        filter['school'] = { $in: userSchools };

        if (!userSchools.includes(request.school)) {
          return res.status(403).json({
            success: false,
            message: 'You can only manage requests from your assigned schools'
          });
        }

        updateData.assetManagerStatus = newStatus;
        // Update overall status based on school dean's decision
        updateData.status = newStatus;
        break;

      default:
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to approve/reject requests'
        });
    }

    // Start a transaction for atomic updates
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log('Updating request:', { requestId, updateData });
      
      // Update the request
      const updatedRequest = await ResourceRequest.findByIdAndUpdate(
        requestId,
        { $set: updateData },
        { new: true, session }
      ).populate('requestedBy', 'fullName department');

      if (!updatedRequest) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }

      // Create and send notifications based on the role and action
      const notifications = [];

      // Notification for the staff member who created the request
      const staffNotification = new Notification({
        recipient: updatedRequest.requestedBy._id,
        type: action === 'approve' ? 'success' : 'error',
        title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Your resource request ${updatedRequest.requestNumber} has been ${action}ed by ${req.user.role === 'department_head' ? 'Department Head' : req.user.role === 'school_dean' ? 'School Dean' : 'Asset Manager'}`,
        relatedRequest: updatedRequest._id
      });
      notifications.push(staffNotification);

      // If department head approves, notify school dean
      if (req.user.role === 'department_head' && action === 'approve') {
        const schoolDean = await User.findOne({
          role: 'school_dean',
          school: updatedRequest.school
        });

        if (schoolDean) {
          const deanNotification = new Notification({
            recipient: schoolDean._id,
            type: 'resource_request',
            title: 'New Request for Review',
            message: `A new resource request ${updatedRequest.requestNumber} from ${updatedRequest.department} department needs your review`,
            relatedRequest: updatedRequest._id,
            school: updatedRequest.school,
            role: 'school_dean'
          });
          notifications.push(deanNotification);
        }
      }

      // If school dean approves, notify asset manager
      if (req.user.role === 'school_dean' && action === 'approve') {

        const iotSchools = [SCHOOLS.COMPUTING, SCHOOLS.CIVIL, SCHOOLS.ELECTRICAL];
        const dduSchools = [SCHOOLS.NATURAL, SCHOOLS.SOCIAL, SCHOOLS.BUSINESS, SCHOOLS.HEALTH];

        let assetManagerRole;

        if (iotSchools.includes(updatedRequest.school)) {
          assetManagerRole = 'iot_asset_manager';
        } else if (dduSchools.includes(updatedRequest.school)) {
          assetManagerRole = 'ddu_asset_manager';
        } else {
          throw new Error(`Invalid school: ${updatedRequest.school}`);
        }
        const assetManager = await User.findOne({
          role: assetManagerRole,
          status: 'approved'
        });

        if (assetManager) {
          const managerNotification = new Notification({
            recipient: assetManager._id,
            type: 'resource_request',
            title: 'New Request for Review',
            message: `A new resource request ${updatedRequest.requestNumber} from ${updatedRequest.department} department needs your review`,
            relatedRequest: updatedRequest._id,
            role: assetManagerRole
          });
          notifications.push(managerNotification);
        }
      }

      try {
        // Save notifications and send them via socket
        const savedNotifications = await Notification.insertMany(notifications, { session });
        
        // Send each notification via socket
        for (const notification of savedNotifications) {
          await sendNotification(notification);
        }

        // Commit transaction
        await session.commitTransaction();

        // Send response after successful transaction
        res.json({
          success: true,
          message: `Request ${action}ed successfully`,
          data: updatedRequest
        });

        console.log(`Successfully sent ${savedNotifications.length} notifications`);
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        // Even if notification sending fails, we want to complete the request update
        await session.commitTransaction();
        res.json({
          success: true,
          message: `Request ${action}ed successfully`,
          data: updatedRequest
        });
      }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Error updating request status:', error);
    if (session) {
      try {
        await session.abortTransaction();
      } catch (sessionError) {
        console.error('Error cleaning up session:', sessionError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update request status'
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

module.exports = router;
