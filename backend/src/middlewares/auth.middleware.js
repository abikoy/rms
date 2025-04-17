const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, isActive: true });

    if (!user) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

const departmentAccess = (req, res, next) => {
  const userDepartment = req.user.department;
  const requestedDepartment = req.params.department || req.body.department;

  if (req.user.role === 'system_admin') {
    return next();
  }

  if (req.user.role === 'school_dean') {
    // School dean can access all departments in their school
    // This would need to be expanded with actual school-department mapping
    return next();
  }

  if (userDepartment !== requestedDepartment) {
    return res.status(403).json({
      message: 'You do not have access to this department\'s resources'
    });
  }

  next();
};

module.exports = {
  auth,
  authorize,
  departmentAccess
};
