const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user._id);

    try {
      // Join user's personal room
      const userId = socket.user._id.toString();
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);

      // Join role-based room
      const roleRoom = `role_${socket.user.role}`;
      socket.join(roleRoom);
      console.log(`User ${userId} joined role room ${roleRoom}`);

      // Join department room if user has a department
      if (socket.user.department) {
        const departmentRoom = `department_${socket.user.department}`;
        socket.join(departmentRoom);
        console.log(`User ${userId} joined department room ${departmentRoom}`);
      }

      // Join school room if user has a school
      if (socket.user.school) {
        const schoolRoom = `school_${socket.user.school}`;
        socket.join(schoolRoom);
        console.log(`User ${userId} joined school room ${schoolRoom}`);
      }

      // Send acknowledgment
      socket.emit('joined_rooms', {
        personal: userId,
        role: roleRoom,
        department: socket.user.department ? `department_${socket.user.department}` : null,
        school: socket.user.school ? `school_${socket.user.school}` : null
      });

      console.log('User rooms:', socket.rooms);
    } catch (error) {
      console.error('Error joining rooms:', error);
    }

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Function to send notification to specific users
const sendNotification = async (notification) => {
  try {
    console.log('Sending notification:', notification);
    const io = getIO();
    
    // Convert MongoDB ObjectId to string if needed
    const recipientId = notification.recipient?.toString();
    const requestId = notification.relatedRequest?.toString();
    
    // Create a sanitized notification object
    const sanitizedNotification = {
      ...notification.toObject(),
      _id: notification._id.toString(),
      recipient: recipientId,
      relatedRequest: requestId,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    };

    console.log('Sanitized notification:', sanitizedNotification);

    // If notification is for a specific user
    if (recipientId) {
      console.log('Sending to user:', recipientId);
      io.to(recipientId).emit('notification', sanitizedNotification);
    }
    
    // If notification is for a department
    if (notification.department) {
      const departmentRoom = `department_${notification.department}`;
      console.log('Sending to department:', departmentRoom);
      io.to(departmentRoom).emit('notification', sanitizedNotification);
    }

    // If notification is for a school
    if (notification.school) {
      const schoolRoom = `school_${notification.school}`;
      console.log('Sending to school:', schoolRoom);
      io.to(schoolRoom).emit('notification', sanitizedNotification);
    }

    // If notification is for a role
    if (notification.role) {
      const roleRoom = `role_${notification.role}`;
      console.log('Sending to role:', roleRoom);
      io.to(roleRoom).emit('notification', sanitizedNotification);
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

module.exports = {
  initializeSocket,
  getIO,
  sendNotification
};
