const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');
const AssetAssignment = require('../models/AssetAssignment');
const mongoose = require('mongoose');
const User = require('../models/User');

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

        // Validate expiration date for non-fixed assets
        if (resource.type === 'non_fixed_assets') {
            const expirationDate = items[0]?.expirationDate;
            if (!expirationDate) {
                throw new Error('Please select an expiration date for this non-fixed asset');
            }

            // Ensure expiration date is in the future
            const tomorrow = new Date();
            tomorrow.setHours(0, 0, 0, 0);
            tomorrow.setDate(tomorrow.getDate() + 1);

            if (new Date(expirationDate) < tomorrow) {
                const tomorrowFormatted = tomorrow.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                throw new Error(`Please select a date starting from ${tomorrowFormatted} for this non-fixed asset`);
            }

            // Update resource expiration date
            resource.expirationDate = expirationDate;
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
            assignedBy: req.user._id,
            assignedAt: new Date()
        });

        // Save the assignment
        await assignment.save({ session });

        // Update resource quantity
        resource.quantity -= totalRequestedQuantity;
        
        // Only update status to 'assigned' if no quantity remains
        if (resource.quantity === 0) {
            resource.status = 'assigned';
        } else {
            resource.status = 'available'; // Keep as available if there's remaining quantity
        }
        
        await resource.save({ session });

        // Commit transaction
        await session.commitTransaction();

        // Fetch the complete assignment with populated fields
        const populatedAssignment = await AssetAssignment.findById(assignment._id)
            .populate({
                path: 'resource',
                select: 'name serialNumber status type expirationDate'
            })
            .populate('assignedBy', 'fullName email role department');

        res.status(201).json({
            status: 'success',
            message: 'Asset assigned successfully',
            data: populatedAssignment
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
                select: 'name serialNumber status type expirationDate'
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
                type: assignment.resource?.type || 'N/A',
                expirationDate: assignment.resource?.expirationDate,
                isNonFixed: assignment.resource?.type === 'non_fixed_assets',
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

// Get school resources
router.get('/school-resources', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || user.role !== 'school_dean') {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. School Dean access required.'
            });
        }

        const assignments = await AssetAssignment.find({
            requisitionDivision: user.school,
            status: 'assigned'
        })
        .populate({
            path: 'resource',
            select: 'name type quantity status description serialNumber unitPrice'
        })
        .populate('assignedBy', 'fullName')
        .sort({ assignedAt: -1 });

        res.json({
            status: 'success',
            data: assignments
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get department resources
router.get('/department-resources', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || user.role !== 'department_head') {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Department Head access required.'
            });
        }

        const assignments = await AssetAssignment.find({
            $or: [
                { "requestedBy.department": user.department },
                { "receivedBy.department": user.department },
                { "certifiedBy.department": user.department }
            ],
            status: 'assigned'
        })
        .populate({
            path: 'resource',
            select: 'name type quantity status description serialNumber unitPrice'
        })
        .populate('assignedBy', 'fullName')
        .sort({ assignedAt: -1 });

        res.json({
            status: 'success',
            data: assignments
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get staff's personal resources
router.get('/staff-resources', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied.'
            });
        }

        const assignments = await AssetAssignment.find({
            "receivedBy.name": user.fullName,
            status: 'assigned'
        })
        .populate({
            path: 'resource',
            select: 'name type quantity status description serialNumber unitPrice'
        })
        .populate('assignedBy', 'fullName')
        .sort({ assignedAt: -1 });

        res.json({
            status: 'success',
            data: assignments
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get a single asset assignment
router.get('/:id', auth, async (req, res) => {
    try {
        const assignment = await AssetAssignment.findById(req.params.id)
            .populate({
                path: 'resource',
                select: 'name serialNumber status type expirationDate'
            })
            .populate('assignedBy', 'fullName email role department');

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

// Delete an asset assignment
router.delete('/:id', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the assignment
        const assignment = await AssetAssignment.findById(req.params.id)
            .populate('resource')
            .session(session);

        if (!assignment) {
            throw new Error('Assignment not found');
        }

        // Check if user has permission (only the same department manager can delete)
        const user = await User.findById(req.user._id).select('role');
        const assignedByUser = await User.findById(assignment.assignedBy).select('role');
        
        if (user.role !== assignedByUser.role && user.role !== 'system_admin') {
            throw new Error('You do not have permission to delete this assignment');
        }

        // Get the resource and update its status
        const resource = assignment.resource;
        const totalQuantity = assignment.items.reduce((total, item) => total + item.quantity, 0);
        
        // Update resource
        resource.status = 'available';
        resource.quantity += totalQuantity;
        if (resource.type === 'non_fixed_assets') {
            resource.expirationDate = null;
        }
        
        await resource.save({ session });

        // Delete the assignment
        await assignment.deleteOne({ session });

        // Commit transaction
        await session.commitTransaction();

        res.json({
            status: 'success',
            message: 'Assignment deleted successfully'
        });
    } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        
        console.error('Error deleting assignment:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to delete assignment'
        });
    } finally {
        session.endSession();
    }
});

module.exports = router;
