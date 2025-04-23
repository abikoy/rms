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
  division: {
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

// Update the updatedAt timestamp before saving
resourceRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate request number before saving
resourceRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const count = await this.constructor.countDocuments();
    this.requestNumber = String(9087 + count).padStart(7, '0');
  }
  next();
});

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);
