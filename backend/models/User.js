const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['System Admin', 'Asset Manager', 'Staff', 'Technical Team', 'School Dean', 'Department Head']
  },
  department: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  profilePhoto: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving new document
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update timestamp before updating existing document
userSchema.pre(['findOneAndUpdate', 'updateOne'], function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Don't require all fields during update
userSchema.pre(['findOneAndUpdate', 'updateOne'], function(next) {
  this.setOptions({ runValidators: false });
  next();
});

module.exports = mongoose.model('User', userSchema);
