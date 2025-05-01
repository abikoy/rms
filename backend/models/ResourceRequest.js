const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    required: true,
    unique: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  school: {
    type: String,
    required: true
  },
  requestedItems: [{
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    itemNo: Number,
    description: String,
    unitOfMeasure: String,
    quantityRequested: {
      type: Number,
      required: true,
      min: 1
    },
    quantityIssued: {
      type: Number,
      default: 0
    },
    unitPrice: {
      birr: {
        type: Number,
        required: true,
        default: 0
      },
      cents: {
        type: Number,
        required: true,
        default: 0
      }
    },
    totalAmount: {
      birr: {
        type: Number,
        required: true,
        default: 0
      },
      cents: {
        type: Number,
        required: true,
        default: 0
      }
    },
    remark: String
  }],
  departmentHeadStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  schoolDeanStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  assetManagerStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedDivisionHead: {
    name: {
      type: String,
      required: true
    },
    signature: String,
    date: {
      type: Date,
      required: true
    }
  },
  requestedAndReceivedBy: {
    name: {
      type: String,
      required: true
    },
    signature: String,
    date: {
      type: Date,
      required: true
    }
  },
  certifiedBy: {
    name: {
      type: String,
      required: true
    },
    signature: String,
    date: {
      type: Date,
      required: true
    }
  },
  assignedTo: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  approvedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    role: String,
    date: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate request number and update timestamps before saving
resourceRequestSchema.pre('save', async function(next) {
  // Update timestamps
  const now = Date.now();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  // Generate request number if not set
  if (!this.requestNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const timestamp = Date.now().toString().slice(-6);
      this.requestNumber = `REQ-${timestamp}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating request number:', error);
      next(error);
      return;
    }
  }

  next();
});

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);
