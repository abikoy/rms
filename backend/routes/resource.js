const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');
const { isAdmin, isAssetManager } = require('../middleware/roleCheck');

// Get resources based on user role
router.get('/', auth, async (req, res) => {
  try {
    let resources;
    const userRole = req.user.role;
    const userId = req.user._id;

    if (userRole === 'admin') {
      // System Administrator can see all resources
      resources = await Resource.find();
    } else if (userRole === 'ddu_asset_manager' || userRole === 'iot_asset_manager') {
      // Asset managers can only see their own resources
      resources = await Resource.find({
        managerType: userRole
      });
    } else {
      return res.status(403).json({
        status: 'fail',
        message: 'Unauthorized access'
      });
    }

    res.json({
      status: 'success',
      data: resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get a single resource by ID
router.get('/:id', auth, async (req, res, next) => {
  try {
    // Validate MongoDB ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        status: 'fail',
        message: 'Invalid resource ID format'
      });
    }

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ 
        status: 'fail',
        message: 'Resource not found'
      });
    }

    // Check if user has permission to view this resource
    const userRole = req.user.role;
    if (userRole !== 'admin' && resource.managerType !== userRole) {
      return res.status(403).json({ 
        status: 'fail',
        message: 'You do not have permission to view this resource'
      });
    }

    res.json({
      status: 'success',
      data: resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Get resources based on user role
router.get('/', auth, async (req, res) => {
  try {
    let resources;
    const userRole = req.user.role;
    const userId = req.user._id;

    console.log('User Role:', userRole);
    console.log('User ID:', userId);

    if (userRole === 'admin') {
      // System Administrator can see all resources
      resources = await Resource.find();
    } else if (userRole === 'ddu_asset_manager' || userRole === 'iot_asset_manager') {
      // Asset managers can only see their own resources
      resources = await Resource.find({
        managerType: userRole
      });
    } else {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    console.log(`Found ${resources.length} resources for ${userRole}`);
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a resource
router.put('/:id', auth, isAssetManager, async (req, res) => {
  try {
    // Validate MongoDB ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        status: 'fail',
        message: 'Invalid resource ID format'
      });
    }

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ 
        status: 'fail',
        message: 'Resource not found'
      });
    }

    // Check if user has permission to update this resource
    const userRole = req.user.role;
    if (userRole !== 'admin' && resource.managerType !== userRole) {
      return res.status(403).json({ 
        status: 'fail',
        message: 'You do not have permission to update this resource'
      });
    }

    // Update the resource
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      data: updatedResource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Create a new resource
router.post('/', auth, isAssetManager, async (req, res) => {
  try {
    // Ensure the managerType matches the user's role
    if (req.body.managerType !== req.user.role && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'You can only create resources for your own department' 
      });
    }

    const resource = new Resource({
      name: req.body.name,
      serialNumber: req.body.serialNumber,
      type: req.body.type,
      assetClass: req.body.assetClass,
      model: req.body.model,
      location: req.body.location,
      status: req.body.status || 'available',
      quantity: req.body.quantity || 0,
      unitPrice: req.body.unitPrice || { birr: 0, cents: 0 },
      totalPrice: req.body.totalPrice || { birr: 0, cents: 0 },
      // Registry Information
      expenditureNo: req.body.expenditureNo,
      incomingGoodsNo: req.body.incomingGoodsNo,
      stockClassification: req.body.stockClassification,
      storeNo: req.body.storeNo,
      shelfNo: req.body.shelfNo,
      outgoingGoodsNo: req.body.outgoingGoodsNo,
      orderNo: req.body.orderNo,
      // Manager Information
      managerType: req.body.managerType,
      date: req.body.date || new Date(),
      // Signatures
      storeKeeper: req.body.storeKeeper || { name: '', date: new Date() },
      recipient: req.body.recipient || { name: '', date: new Date() }
    });

    const newResource = await resource.save();
    console.log('Resource created successfully:', newResource);
    res.status(201).json(newResource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a resource
router.delete('/:id', auth, isAssetManager, async (req, res) => {
  try {
    // Validate MongoDB ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        status: 'fail',
        message: 'Invalid resource ID format'
      });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resource not found'
      });
    }

    // Check if user has permission to delete this resource
    const userRole = req.user.role;
    if (userRole !== 'admin' && resource.managerType !== userRole) {
      return res.status(403).json({ 
        status: 'fail',
        message: 'You do not have permission to delete this resource'
      });
    }

    await resource.deleteOne();
    res.json({
      status: 'success',
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
