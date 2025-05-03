const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['resource_request', 'request_approved', 'request_rejected', 'resource_assigned', 'success', 'error'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedResource: {
    type: Schema.Types.ObjectId,
    ref: 'Resource'
  },
  relatedRequest: {
    type: Schema.Types.ObjectId,
    ref: 'ResourceRequest'
  },
  // Fields for room targeting
  department: {
    type: String
  },
  school: {
    type: String
  },
  role: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
