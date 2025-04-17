const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['classroom', 'equipment', 'furniture', 'iot_device', 'it_infrastructure'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'engineering', 'it', 'classroom']
  },
  location: {
    building: String,
    room: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance', 'reserved'],
    default: 'available'
  },
  department: {
    type: String,
    required: function() {
      return this.type !== 'classroom';
    }
  },
  specifications: {
    type: Map,
    of: String
  },
  maintenanceHistory: [{
    date: Date,
    description: String,
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  currentAssignment: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startTime: Date,
    endTime: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
resourceSchema.index({ type: 1, status: 1 });
resourceSchema.index({ department: 1, type: 1 });

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
