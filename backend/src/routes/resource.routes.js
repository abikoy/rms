const express = require('express');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/resource.model');
const { auth, authorize, departmentAccess } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all resources with filtering
router.get('/', auth, async (req, res) => {
  try {
    const {
      type,
      status,
      department,
      category
    } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Department filtering based on user role
    if (req.user.role !== 'system_admin') {
      if (req.user.role === 'school_dean') {
        // Logic to filter by school's departments
        // This would need to be expanded based on school-department mapping
      } else if (req.user.department) {
        filter.department = req.user.department;
      }
    } else if (department) {
      filter.department = department;
    }

    const resources = await Resource.find(filter)
      .populate('currentAssignment.user', 'username firstName lastName');
    
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new resource
router.post('/', [
  auth,
  authorize('system_admin', 'ddu_asset_manager', 'iot_asset_manager'),
  body('name').trim().notEmpty(),
  body('type').isIn(['classroom', 'equipment', 'furniture', 'iot_device', 'it_infrastructure']),
  body('category').isIn(['general', 'engineering', 'it', 'classroom']),
  body('location').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate based on user role
    if (req.user.role === 'iot_asset_manager' && req.body.type !== 'iot_device') {
      return res.status(403).json({
        message: 'IoT Asset Manager can only manage IoT devices'
      });
    }

    const resource = new Resource(req.body);
    await resource.save();

    // Notify relevant users through Socket.IO
    const io = req.app.get('io');
    io.emit('resource:created', resource);

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update resource
router.put('/:id', [
  auth,
  authorize('system_admin', 'ddu_asset_manager', 'iot_asset_manager'),
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['available', 'in_use', 'maintenance', 'reserved'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check role-based permissions
    if (req.user.role === 'iot_asset_manager' && resource.type !== 'iot_device') {
      return res.status(403).json({
        message: 'IoT Asset Manager can only manage IoT devices'
      });
    }

    Object.assign(resource, req.body);
    await resource.save();

    // Notify through Socket.IO
    const io = req.app.get('io');
    io.emit('resource:updated', resource);

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete resource
router.delete('/:id', auth, authorize('system_admin'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Soft delete
    resource.isActive = false;
    await resource.save();

    // Notify through Socket.IO
    const io = req.app.get('io');
    io.emit('resource:deleted', { id: resource._id });

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add maintenance record
router.post('/:id/maintenance', [
  auth,
  authorize('technical_team', 'system_admin'),
  body('description').trim().notEmpty()
], async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.maintenanceHistory.push({
      date: new Date(),
      description: req.body.description,
      technician: req.user._id
    });

    resource.status = req.body.status || 'available';
    await resource.save();

    // Notify through Socket.IO
    const io = req.app.get('io');
    io.emit('resource:maintenance', {
      resourceId: resource._id,
      status: resource.status,
      maintenance: resource.maintenanceHistory[resource.maintenanceHistory.length - 1]
    });

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
