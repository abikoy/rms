const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');
const AssetAssignment = require('../models/AssetAssignment');
const mongoose = require('mongoose');
const User = require('../models/User');

// Get resources available to staff (from school dean and department head)
router.get('/staff-available-resources', auth, async (req, res) => {
    try {
        console.log('Processing staff available resources request...');
        console.log('User from auth:', req.user);

        // Use the user info from auth middleware
        const staff = req.user;

        if (staff.role !== 'staff') {
            console.log('Invalid role:', staff.role);
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Staff access only.'
            });
        }

        console.log('Looking for superiors with criteria:', {
            schoolDean: { role: 'school_dean', school: staff.school },
            departmentHead: { role: 'department_head', department: staff.department }
        });

        // Find school dean and department head
        const [schoolDean, departmentHead] = await Promise.all([
            User.findOne({
                role: 'school_dean',
                school: staff.school,
                status: 'approved'
            }).select('_id fullName').lean(),
            User.findOne({
                role: 'department_head',
                department: staff.department,
                status: 'approved'
            }).select('_id fullName').lean()
        ]);

        console.log('Found superiors:', {
            schoolDean: schoolDean ? {
                _id: schoolDean._id,
                fullName: schoolDean.fullName,
                school: schoolDean.school,
                department: schoolDean.department
            } : 'Not found',
            departmentHead: departmentHead ? {
                _id: departmentHead._id,
                fullName: departmentHead.fullName,
                school: departmentHead.school,
                department: departmentHead.department
            } : 'Not found'
        });

        console.log('Querying resources with criteria:', {
            schoolDean: schoolDean ? {
                id: schoolDean._id,
                name: schoolDean.fullName
            } : 'Not found',
            departmentHead: departmentHead ? {
                id: departmentHead._id,
                name: departmentHead.fullName
            } : 'Not found'
        });

        // Get assigned resources that are marked as available
        const [schoolResources, deptResources] = await Promise.all([
            schoolDean ? AssetAssignment.find({
                $or: [
                    { "receivedBy.department": staff.school },
                    { requisitionDivision: staff.school }
                ],
                status: 'assigned'
            })
            .populate({
                path: 'resource',
                select: 'name serialNumber type assetClass model location status expirationDate price quantity unitPrice description'
            })
            .populate('assignedBy')
            .sort({ updatedAt: -1 })
            .lean()
            .then(async assignments => {
                // First, group all assignments by resource ID to check availability
                const resourceAvailability = new Map();
                const resourceMap = new Map();
                
                // First pass: Check availability status of latest assignments
                assignments.forEach(assignment => {
                    if (!assignment.resource) return;
                    const resourceId = assignment.resource._id.toString();
                    
                    // If we haven't seen this resource, or this assignment is newer
                    if (!resourceAvailability.has(resourceId) ||
                        assignment.updatedAt > resourceAvailability.get(resourceId).updatedAt) {
                        resourceAvailability.set(resourceId, {
                            isAvailable: assignment.isAvailable,
                            updatedAt: assignment.updatedAt
                        });
                    }
                });
                
                // Second pass: Only process resources where latest assignment is available
                assignments.forEach(assignment => {
                    if (!assignment.resource) return;
                    const resourceId = assignment.resource._id.toString();
                    
                    // Skip if the latest assignment for this resource is not available
                    const availability = resourceAvailability.get(resourceId);
                    if (!availability?.isAvailable) return;
                    
                    if (!resourceMap.has(resourceId)) {
                        resourceMap.set(resourceId, {
                            assignment: assignment,
                            items: [],
                            totalQuantity: 0
                        });
                    }
                    
                    const data = resourceMap.get(resourceId);
                    if (assignment.items && assignment.items.length > 0) {
                        assignment.items.forEach(item => {
                            data.totalQuantity += (item.quantity || 0);
                            data.items.push(item);
                        });
                    }
                });
                
                return Array.from(resourceMap.values()).map(data => ({
                    ...data.assignment,
                    items: data.items,
                    totalQuantity: data.totalQuantity
                }));
            }) : [],
            
            departmentHead ? AssetAssignment.find({
                $or: [
                    { "receivedBy.department": staff.department },
                    { requisitionDivision: staff.department }
                ],
               status: 'assigned'
            })
            .populate({
                path: 'resource',
                select: 'name serialNumber type assetClass model location status expirationDate price quantity unitPrice description'
            })
            .populate('assignedBy')
            .sort({ updatedAt: -1 })
            .lean()
            .then(async assignments => {
                // First, group all assignments by resource ID to check availability
                const resourceAvailability = new Map();
                const resourceMap = new Map();
                
                // First pass: Check availability status of latest assignments
                assignments.forEach(assignment => {
                    if (!assignment.resource) return;
                    const resourceId = assignment.resource._id.toString();
                    
                    // If we haven't seen this resource, or this assignment is newer
                    if (!resourceAvailability.has(resourceId) ||
                        assignment.updatedAt > resourceAvailability.get(resourceId).updatedAt) {
                        resourceAvailability.set(resourceId, {
                            isAvailable: assignment.isAvailable,
                            updatedAt: assignment.updatedAt
                        });
                    }
                });
                
                // Second pass: Only process resources where latest assignment is available
                assignments.forEach(assignment => {
                    if (!assignment.resource) return;
                    const resourceId = assignment.resource._id.toString();
                    
                    // Skip if the latest assignment for this resource is not available
                    const availability = resourceAvailability.get(resourceId);
                    if (!availability?.isAvailable) return;
                    
                    if (!resourceMap.has(resourceId)) {
                        resourceMap.set(resourceId, {
                            assignment: assignment,
                            items: [],
                            totalQuantity: 0
                        });
                    }
                    
                    const data = resourceMap.get(resourceId);
                    if (assignment.items && assignment.items.length > 0) {
                        assignment.items.forEach(item => {
                            data.totalQuantity += (item.quantity || 0);
                            data.items.push(item);
                        });
                    }
                });
                
                return Array.from(resourceMap.values()).map(data => ({
                    ...data.assignment,
                    items: data.items,
                    totalQuantity: data.totalQuantity
                }));
            }) : []
        ]);

        // Filter out any assignments where the resource doesn't exist
        const validSchoolResources = schoolResources.filter(assignment => assignment.resource);
        const validDeptResources = deptResources.filter(assignment => assignment.resource);

        console.log('Department resources found:', {
            total: deptResources.length,
            valid: validDeptResources.length,
            resources: validDeptResources.map(r => ({
                id: r.resource._id,
                name: r.resource.name,
                status: r.status
            }))
        });
        console.log('School resources found:', {
            total: schoolResources.length,
            valid: validSchoolResources.length,
            resources: validSchoolResources.map(r => ({
                id: r.resource._id,
                name: r.resource.name,
                status: r.status
            }))
        });

        // Add source information
        const resources = [
            ...schoolResources.map(assignment => ({
                ...assignment,
                source: {
                    type: 'school',
                    name: staff.school,
                    assignedTo: schoolDean?.fullName || 'School Dean'
                }
            })),
            ...deptResources.map(assignment => ({
                ...assignment,
                source: {
                    type: 'department',
                    name: staff.department,
                    assignedTo: departmentHead?.fullName || 'Department Head'
                }
            }))
        ];

        res.json({
            status: 'success',
            data: resources
        });
    } catch (error) {
        console.error('Error fetching staff available resources:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch available resources'
        });
    }
});

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
                // Resources where this department is the current holder
                { "receivedBy.name": user.fullName },
                // Resources requested by this department

                { "requestedBy.role": "department_head" },
                { "requestedBy.department": user.fullName },
                // Resources assigned to this department
                // { requisitionDivision: user.department }
            ],


            // { "requestedBy.name": user.fullName},
            // {"receivedBy.name": user.fullName},


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

        // const assignments = await AssetAssignment.find({
        //     $and: [
        //         { $or: [
        //             { "receivedBy.userId": user._id },
        //             { "requestedBy.userId": user._id }
        //         ]},
        //         { "requestedBy.role": "staff" }
        //     ],
        
        //     status: 'assigned'
        // })
        const assignments = await AssetAssignment.find({
            $or: [
                // Resources directly received by the staff
                { "receivedBy.userId": user._id },
                // Resources where staff is the current holder
                { "receivedBy.name": user.fullName }
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

// Get resources available to staff (from school dean and department head)
router.get('/staff-available-resources', auth, async (req, res) => {
    try {
        console.log('Processing staff available resources request...');
        console.log('User from token:', req.user);

        // Get the staff member's details
        const staff = await User.findById(req.user.id)
            .select('school department role status')
            .lean();

        console.log('Found staff details:', staff);

        if (!staff) {
            console.log('Staff not found for ID:', req.user.id);
            return res.status(404).json({
                status: 'error',
                message: 'Staff member not found'
            });
        }

        if (staff.role !== 'staff') {
            console.log('Invalid role:', staff.role);
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Staff access only.'
            });
        }

        // Find school dean and department head
        const [schoolDean, departmentHead] = await Promise.all([
            User.findOne({
                role: 'school_dean',
                school: staff.school,
                status: 'approved'
            }).select('_id fullName').lean(),
            User.findOne({
                role: 'department_head',
                department: staff.department,
                status: 'approved'
            }).select('_id fullName').lean()
        ]);

        console.log('Found superiors:', {
            schoolDean: schoolDean ? schoolDean._id : 'Not found',
            departmentHead: departmentHead ? departmentHead._id : 'Not found'
        });

        // Get assigned resources
        const [schoolResources, deptResources] = await Promise.all([
            schoolDean ? AssetAssignment.find({
                receivedBy: schoolDean._id,
                status: 'assigned'
            })
            .populate({
                path: 'resource',
                select: 'name serialNumber type assetClass model location status expirationDate price quantity unitPrice description'
            })
            .populate('assignedBy', 'fullName')
            .lean() : [],
            departmentHead ? AssetAssignment.find({
                receivedBy: departmentHead._id,
                status: 'assigned'
            })
            .populate({
                path: 'resource',
                select: 'name serialNumber type assetClass model location status expirationDate price quantity unitPrice description'
            })
            .populate('assignedBy', 'fullName')
            .lean() : []
        ]);

        console.log(`Staff (${staff.school}, ${staff.department}) available resources:`, {
            schoolResources: schoolResources.length,
            deptResources: deptResources.length
        });

        // Add source information
        const resources = [
            ...validSchoolResources.map(assignment => ({
                ...assignment,
                source: {
                    type: 'school',
                    name: staff.school,
                    assignedTo: schoolDean?.fullName || 'School Dean'
                }
            })),
            ...validDeptResources.map(assignment => ({
                ...assignment,
                source: {
                    type: 'department',
                    name: staff.department,
                    assignedTo: departmentHead?.fullName || 'Department Head'
                }
            }))
        ];

        console.log('Found', resources.length, 'valid resources for staff');

        res.json({
            status: 'success',
            data: resources,
            debug: {
                schoolResources: {
                    total: schoolResources.length,
                    valid: validSchoolResources.length
                },
                deptResources: {
                    total: deptResources.length,
                    valid: validDeptResources.length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching staff available resources:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch available resources'
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
            .populate({
                path: 'resource',
                select: 'name serialNumber type assetClass model location status expirationDate price quantity unitPrice description'
            })
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

// Toggle assignment status between 'assigned' and 'available'
router.put('/:id/toggle-status', auth, async (req, res) => {
    try {
        const assignment = await AssetAssignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                message: 'Assignment not found'
            });
        }

        // Check if user is authorized (must be school dean or department head)
        if (req.user.role !== 'school_dean' && req.user.role !== 'department_head') {
            return res.status(403).json({
                status: 'error',
                message: 'Only school dean or department head can toggle resource status'
            });
        }

        // Verify the user has permission to toggle this resource
        const canToggle = await User.findOne({
            _id: req.user._id,
            $or: [
                // School dean can toggle if it's their school
                { role: 'school_dean', school: req.user.school },
                // Department head can toggle if it's their department
                { role: 'department_head', department: req.user.department }
            ]
        });

        if (!canToggle) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to toggle this resource status'
            });
        }

        // Instead of changing status, we'll add an isAvailable field
        assignment.isAvailable = !assignment.isAvailable;
        await assignment.save();

        res.json({
            status: 'success',
            message: `Resource is now ${assignment.isAvailable ? 'available' : 'unavailable'} for staff`,
            data: assignment
        });
    } catch (error) {
        console.error('Error toggling assignment status:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to toggle assignment status'
        });
    }
});

module.exports = router;