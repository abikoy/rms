const mongoose = require('mongoose');
const { isDepartmentInSchool } = require('../constants/departments');
const { SCHOOLS_LIST } = require('../constants/schools');

// Clear any existing indexes
mongoose.connection.on('connected', async () => {
  try {
    await mongoose.connection.collection('users').dropIndexes();
    console.log('Dropped all indexes from users collection');
  } catch (error) {
    console.log('No existing indexes to drop');
  }
});

const userSchema = new mongoose.Schema({
  // Schema fields with validation
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['system_admin', 'ddu_asset_manager', 'iot_asset_manager', 'staff', 'technical_team', 'department_head', 'school_dean'],
      message: '{VALUE} is not a valid role'
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  department: {
    type: String,
    required: function() {
      return ['staff', 'department_head'].includes(this.role);
    },
    validate: {
      validator: function(v) {
        if (['staff', 'department_head'].includes(this.role)) {
          return v && this.school && isDepartmentInSchool(v, this.school);
        }
        return true; // Allow null/empty for other roles
      },
      message: 'Selected department is not valid for the chosen school'
    },
    trim: true,
    default: null
  },
  school: {
    type: String,
    required: function() {
      return ['staff', 'department_head', 'school_dean'].includes(this.role);
    },
    validate: {
      validator: function(v) {
        if (['staff', 'department_head', 'school_dean'].includes(this.role)) {
          return v && SCHOOLS_LIST.includes(v);
        }
        return true; // Allow null/empty for other roles
      },
      message: 'Invalid school selected. Must be one of: ' + SCHOOLS_LIST.join(', ')
    },
    trim: true,
    default: null
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

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
