const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');
const { isAdmin, isAssetManager } = require('../middleware/roleCheck');

// Get all resources
router.get('/', auth, async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new resource
router.post('/', auth, isAssetManager, async (req, res) => {
  const resource = new Resource({
    name: req.body.name,
    serialNumber: req.body.serialNumber,
    assetClass: req.body.assetClass,
    type: req.body.type,
    location: req.body.location,
    status: req.body.status || 'available',
    description: req.body.description
  });

  try {
    const newResource = await resource.save();
    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a resource
router.put('/:id', auth, isAssetManager, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        resource[key] = req.body[key];
      }
    });

    const updatedResource = await resource.save();
    res.json(updatedResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a resource
router.delete('/:id', auth, isAssetManager, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
