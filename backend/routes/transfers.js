const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Transfer = require('../models/Transfer');
const User = require('../models/User');
const Resource = require('../models/Resource');
const AssetAssignment = require('../models/AssetAssignment');
const Notification = require('../models/Notification');
const validateTransferDestination = require('../middleware/validateTransferDestination');

// Validation middleware
const validateTransferData = (req, res, next) => {
  const { transferNo, items } = req.body;

  // Validate transfer number (must be numeric)
  if (!/^\d+$/.test(transferNo)) {
    return res.status(400).json({
      status: 'error',
      message: 'Transfer number must be numeric'
    });
  }

  // Validate items
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'At least one item is required'
    });
  }

  // Validate each item has required fields
  for (const item of items) {
    if (!item.resourceId || !item.resourceSerialNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Each item must have resourceId and resourceSerialNumber'
      });
    }

    if (!item.quantity || item.quantity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Each item must have a positive quantity'
      });
    }
  }

  for (const item of items) {
    // Validate FAIN number if provided
    if (item.fainNo && !/^\d+$/.test(item.fainNo)) {
      return res.status(400).json({
        status: 'error',
        message: 'FAIN number must be numeric'
      });
    }

    // Validate price
    if (!item.price || typeof item.price !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid price format'
      });
    }

    const { birr, cents } = item.price;

    // Validate birr (must be positive number)
    if (isNaN(birr) || parseFloat(birr) < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Price (Birr) must be a positive number'
      });
    }

    // Validate cents (must be between 0 and 99)
    if (isNaN(cents) || parseInt(cents) < 0 || parseInt(cents) > 99) {
      return res.status(400).json({
        status: 'error',
        message: 'Cents must be between 0 and 99'
      });
    }
  }

  next();
};

// Create a new transfer
router.post('/', [auth, validateTransferData, validateTransferDestination], async (req, res) => {
  try {
    console.log('Creating transfer with user:', {
      _id: req.user._id,
      fullName: req.user.fullName,
      role: req.user.role,
      department: req.user.department,
      school: req.user.school
    });

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

    // Validate that all required fields are present
    if (!transferNo || !date || !fromDivision || !toDivision || !items || !assetTransferorName) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields for transfer'
      });
    }

    // Check if transfer number already exists
    const existingTransfer = await Transfer.findOne({ transferNo });
    if (existingTransfer) {
      return res.status(400).json({
        status: 'error',
        message: 'This transfer number is already in use. Please use a different transfer number.'
      });
    }

    console.log('Transfer data:', {
      recipientName,
      toDivision
    });

    // Create transfer document with sequential transfer item numbers
    const transfer = new Transfer({
      transferNo,
      date: new Date(date),
      fromDivision,
      toDivision,
      items: items.map((item, index) => ({
        ...item,
        transferItemNo: index + 1, // Sequential number for transfer items
        fainDate: item.fainDate ? new Date(item.fainDate) : null,
        resourceId: item.resourceId, // Include resource reference
        resourceSerialNumber: item.resourceSerialNumber // Include resource serial number
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
      status: 'pending',
      transferStatus: 'initiated',
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
    
    // Handle duplicate key error
    if (error.code === 11000 && error.keyPattern?.transferNo) {
      return res.status(400).json({
        status: 'error',
        message: 'This transfer number is already in use. Please use a different transfer number.'
      });
    }

    // Handle other errors
    res.status(400).json({
      status: 'error',
      message: 'Failed to create transfer. Please check your input and try again.'
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

// Get pending transfers for current user
router.get('/pending', auth, async (req, res) => {
  try {
    console.log('Fetching pending transfers for user:', {
      _id: req.user._id,
      fullName: req.user.fullName,
      role: req.user.role,
      status: req.user.status,
      department: req.user.department,
      school: req.user.school
    });

    if (!req.user.fullName) {
      return res.status(400).json({
        status: 'error',
        message: 'User fullName is required but not found'
      });
    }

    console.log('Fetching pending transfers for user:', {
      fullName: req.user.fullName,
      division: req.user.department || req.user.school
    });

    const query = {
      'recipient.name': req.user.fullName,
      toDivision: req.user.department || req.user.school,
      status: 'pending'
    };

    // Log the query
    console.log('Pending transfers query:', JSON.stringify(query, null, 2));

    console.log('Query:', JSON.stringify(query, null, 2));

    const transfers = await Transfer.find(query)
      .populate('createdBy', 'fullName department school')
      .sort('-createdAt');

    // Log the results
    console.log('Found transfers:', transfers.length);
    if (transfers.length === 0) {
      console.log('No transfers found matching query');
    } else {
      console.log('Transfer recipients:', transfers.map(t => t.recipient.name));
      console.log('Transfer divisions:', transfers.map(t => t.toDivision));
    }

    console.log('Found transfers:', transfers.length);

    res.json({
      status: 'success',
      data: transfers
    });
  } catch (error) {
    console.error('Error fetching pending transfers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending transfers'
    });
  }
});

// Handle transfer action (accept/reject)
router.patch('/:id/action', auth, async (req, res) => {
  try {
    const { action } = req.body;
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action'
      });
    }

    // Fetch transfer with populated creator info
    const transfer = await Transfer.findById(req.params.id)
      .populate({
        path: 'createdBy',
        select: 'fullName department school'
      });

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found'
      });
    }

    // Ensure we have the creator's info
    if (!transfer.createdBy || !transfer.createdBy.fullName) {
      return res.status(400).json({
        status: 'error',
        message: 'Transfer creator information is missing'
      });
    }

    // Verify the user is the intended recipient
    if (transfer.recipient.name !== req.user.fullName || 
        transfer.toDivision !== (req.user.department || req.user.school)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to perform this action'
      });
    }

    if (action === 'accept') {
      // Start a database transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Update transfer status
        transfer.status = 'accepted';
        transfer.transferStatus = 'accepted';
        transfer.actionDate = new Date();
        transfer.acceptedAt = new Date();
        transfer.actionBy = req.user._id;

        // Create new asset assignments and update resources for each transferred item
        for (const item of transfer.items) {
          // Find and update the resource status
          const resource = await Resource.findById(item.resourceId).session(session);
          if (!resource) {
            throw new Error(`Resource ${item.resourceId} not found`);
          }

          // Verify serial number matches
          if (resource.serialNumber !== item.resourceSerialNumber) {
            throw new Error(`Serial number mismatch for resource ${item.resourceId}`);
          }

          // Update resource status and assignment
          resource.status = 'assigned';
          await resource.save({ session });

          // Create new asset assignment
          const currentDate = new Date();
          const transferDate = transfer.date || currentDate;

          const newAssignment = new AssetAssignment({
            resource: item.resourceId,
            requestId: transfer._id.toString(),
            requestedBy: {
              name: transfer.createdBy.fullName,
              department: transfer.fromDivision,
              date: transferDate
            },
            receivedBy: {
              name: req.user.fullName,
              department: transfer.toDivision,
              date: currentDate
            },
            certifiedBy: {
              name: req.user.fullName,
              department: transfer.toDivision,
              date: currentDate
            },
            assignedBy: transfer.createdBy._id,
            assignedAt: currentDate,
            status: 'assigned',
            items: [{
              description: item.assetDescription || resource.name,
              unitOfMeasure: item.unitOfMeasure || 'piece',
              quantity: item.quantity,
              unitPrice: item.price?.birr || resource.unitPrice?.birr || 0,
              remark: item.remark || ''
            }],
            requisitionDivision: transfer.toDivision
          });

          await newAssignment.save({ session });

          // Create notification for transfer
          const notification = new Notification({
            type: 'success',
            title: 'Transfer Accepted',
            message: `Resource ${resource.name} (${resource.serialNumber}) has been transferred to ${req.user.fullName}`,
            recipient: transfer.createdBy._id,
            relatedResource: item.resourceId,
            department: transfer.fromDivision,
            createdAt: new Date()
          });

          await notification.save({ session });
        }

        await transfer.save({ session });
        await session.commitTransaction();

        res.json({
          status: 'success',
          message: 'Transfer accepted and resources assigned successfully',
          data: transfer
        });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      // Handle rejection
      transfer.status = 'rejected';
      transfer.actionDate = new Date();
      transfer.actionBy = req.user._id;
      await transfer.save();

      res.json({
        status: 'success',
        message: 'Transfer rejected successfully',
        data: transfer
      });
    }

  } catch (error) {
    console.error('Error handling transfer action:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process transfer action'
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

// Handle transfer acceptance or rejection
router.patch('/:id/transfer-action', auth, async (req, res) => {
  try {
    const { action } = req.body; // action can be 'accept' or 'reject'
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfer not found'
      });
    }

    // Verify the user is the intended recipient
    if (transfer.recipient.name !== req.user.fullName || 
        transfer.toDivision !== (req.user.department || req.user.school)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to perform this action'
      });
    }

    // Handle acceptance
    if (action === 'accept') {
      transfer.transferStatus = 'accepted';
      transfer.acceptedAt = new Date();
      transfer.status = 'accepted';

      // Update resource quantities in receiver's inventory
      // This would be handled by your resource management system
      // You might want to create a new resource record or update existing quantities

    } 
    // Handle rejection
    else if (action === 'reject') {
      transfer.transferStatus = 'rejected';
      transfer.rejectedAt = new Date();
      transfer.status = 'rejected';
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action. Must be either accept or reject.'
      });
    }

    await transfer.save();

    res.json({
      status: 'success',
      message: `Transfer ${action}ed successfully`,
      data: transfer
    });

  } catch (error) {
    console.error('Error handling transfer action:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process transfer action'
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
