const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');
const AssetAssignment = require('../models/AssetAssignment');
const mongoose = require('mongoose');
const User = require('../models/User'); // Added User model

// Create a new asset assignment
router.post('/', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { resourceId, requestId, requisitionDivision, items, requestedBy, receivedBy, certifiedBy } = req.body;

        // Validate required fields
        if (!resourceId || !requestId || !requisitionDivision || !items || !requestedBy || !receivedBy || !certifiedBy) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide all required fields'
            });
        }

        // Check if resource exists and has enough quantity
        const resource = await Resource.findById(resourceId).session(session);
        if (!resource) {
            throw new Error('Resource not found');
        }

        // Get the requested quantity from items
        const totalRequestedQuantity = items.reduce((total, item) => total + item.quantity, 0);

        // Check if enough quantity is available
        if (totalRequestedQuantity > resource.quantity) {
            throw new Error(`Cannot assign more than available quantity. Available: ${resource.quantity}, Requested: ${totalRequestedQuantity}`);
        }

        // Create the assignment
        const assignment = new AssetAssignment({
            resource: resourceId,
            requestId,
            requisitionDivision,
            items,
            requestedBy,
            receivedBy,
            certifiedBy,
            status: 'assigned',
            assignedBy: req.user._id, // Set the assignedBy to the current user's ID
            assignedAt: new Date()
        });

        // Save the assignment
        await assignment.save({ session });

        // Update resource quantity
        resource.quantity -= totalRequestedQuantity;
        await resource.save({ session });

        // Commit transaction
        await session.commitTransaction();

        res.status(201).json({
            status: 'success',
            message: 'Asset assigned successfully',
            data: assignment
        });
    } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        
        console.error('Error creating assignment:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to assign asset'
        });
    } finally {
        session.endSession();
    }
});

// Get all asset assignments based on user's role
router.get('/', auth, async (req, res) => {
    try {
        // Get the current user with their role
        const user = await User.findById(req.user._id).select('role');
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Build query based on user role
        let query = {};
        
        // Check if user is either DDU or IOT asset manager
        if (user.role === 'ddu_asset_manager' || user.role === 'iot_asset_manager') {
            // Find assignments where assignedBy user has the same role
            const assignersWithSameRole = await User.find({ role: user.role }).select('_id');
            const assignerIds = assignersWithSameRole.map(u => u._id);
            
            query = { assignedBy: { $in: assignerIds } };
        } else {
            // For other roles, don't show any assignments
            return res.status(403).json({
                status: 'error',
                message: 'Only DDU and IOT asset managers can view assignments'
            });
        }

        const assignments = await AssetAssignment.find(query)
            .populate({
                path: 'resource',
                select: 'name serialNumber status school'
            })
            .populate({
                path: 'assignedBy',
                select: 'fullName email role department school'
            })
            .sort({ assignedAt: -1 });

        res.json({
            status: 'success',
            data: assignments.map(assignment => ({
                id: assignment._id,
                resourceName: assignment.resource?.name || 'N/A',
                serialNumber: assignment.resource?.serialNumber || 'N/A',
                department: assignment.requisitionDivision,
                requestedBy: assignment.requestedBy?.name || 'N/A',
                status: assignment.status,
                assignedAt: assignment.assignedAt,
                items: assignment.items,
                certifiedBy: assignment.certifiedBy,
                receivedBy: assignment.receivedBy,
                requestId: assignment.requestId,
                assignedBy: {
                    name: assignment.assignedBy?.fullName || 'N/A',
                    role: assignment.assignedBy?.role || 'N/A',
                    department: assignment.assignedBy?.department || 'N/A'
                }
            }))
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch assignments'
        });
    }
});

// Get a single asset assignment
router.get('/:id', auth, async (req, res) => {
    try {
        const assignment = await AssetAssignment.findById(req.params.id)
            .populate('resource')
            .populate('assignedBy', 'name email');

        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                message: 'Assignment not found'
            });
        }

        res.json({
            status: 'success',
            data: assignment
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
