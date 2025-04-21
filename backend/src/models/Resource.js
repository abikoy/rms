const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  assetClass: {
    type: String,
    required: true,
    enum: ['hardware', 'software', 'network', 'other']
  },
  type: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'in_use', 'maintenance'],
    default: 'available'
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
