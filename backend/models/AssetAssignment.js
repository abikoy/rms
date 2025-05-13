const mongoose = require('mongoose');

const assetAssignmentSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  requestId: {
    type: String,
    required: true
  },
  requisitionDivision: {
    type: String,
    required: true
  },
  items: [{
    description: String,
    unitOfMeasure: {
      type: String,
      enum: ['piece', 'set', 'unit'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    expirationDate: {
      type: Date,
      required: function() {
        // Required only if the associated resource is a non-fixed asset
        return this.parent().resource?.type === 'non_fixed_assets';
      }
    },
    remark: String
  }],
  requestedBy: {
    name: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  },
  receivedBy: {
    name: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
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
    department: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'assigned'],
    default: 'assigned'
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const AssetAssignment = mongoose.model('AssetAssignment', assetAssignmentSchema);

module.exports = AssetAssignment;
