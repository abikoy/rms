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
  type: {
    type: String,
    required: true,
    enum: ['fixed_assets', 'non_fixed_assets']
  },
  assetClass: {
    type: String,
    required: true,
    enum: [
      // Fixed Assets
      'OFFICE_FURNITURE',
      'IT_EQUIPMENT',
      'AV_EQUIPMENT',
      'LAB_EQUIPMENT',
      'MACHINERY_TOOLS',
      'VEHICLES',
      'BUILDINGS',
      // Non-Fixed Assets
      'STATIONERY',
      'CLEANING_SUPPLIES',
      'FUEL',
      'FOOD_ITEMS',
      'MAINTENANCE_SUPPLIES',
      'TEACHING_MATERIALS',
      'MEDICAL_SUPPLIES'
    ]
  },
  model: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'assigned', 'maintenance'],
    default: 'available'
  },
  managerType: {
    type: String,
    required: true,
    enum: ['DDU Asset Manager', 'IoT Asset Manager'],
    default: 'DDU Asset Manager'
  },
  price: {
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
  quantity: {
    type: Number,
    required: true,
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
  totalPrice: {
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
  // Registry Information
  expenditureNo: String,
  incomingGoodsNo: String,
  stockClassification: String,
  storeNo: String,
  shelfNo: String,
  outgoingGoodsNo: String,
  orderNo: String,
  // Manager Information
  managerType: {
    type: String,
    required: true,
    enum: ['iot_asset_manager', 'ddu_asset_manager']
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Signatures
  storeKeeper: {
    name: String,
    date: Date
  },
  recipient: {
    name: String,
    date: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
