const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  transferNo: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true
  },
  fromDivision: {
    type: String,
    required: true
  },
  toDivision: {
    type: String,
    required: true
  },
  items: [{
    serialNo: Number,
    assetDescription: String,
    unitOfMeasure: String,
    quantity: Number,
    fainNo: String,
    fainDate: Date,
    price: {
      birr: Number,
      cents: Number
    },
    remark: String
  }],
  assetTransferor: {
    name: String,
    date: Date
  },
  propertyHead: {
    name: String,
    date: Date
  },
  witness: {
    name: String
  },
  recipient: {
    name: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transfer', transferSchema);