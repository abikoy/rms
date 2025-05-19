const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Authentication token required' 
      });
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '').trim();
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Authentication token required' 
      });
    }

    try {
      // Verify token
      console.log('Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', { id: decoded.id, role: decoded.role });

      if (!decoded.id) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token format'
        });
      }
      
      // Get user from database
      const user = await User.findById(decoded.id)
        .select('_id fullName role status school department')
        .lean();

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Log user info
      console.log('User found:', {
        id: user._id,
        role: user.role,
        status: user.status,
        school: user.school
      });

      // Validate user status
      if (user.status !== 'approved' && user.role !== 'system_admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Account not approved'
        });
      }

      // Log role info
      console.log('User role validation:', {
        role: user.role,
        school: user.school || 'Not assigned'
      });

      req.user = user;
      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError.message);
      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          status: 'fail',
          message: 'Invalid token' 
        });
      } else if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          status: 'fail',
          message: 'Token expired' 
        });
      }
      throw tokenError;
    }
  } catch (e) {
    console.error('Auth error:', e.message);
    res.status(401).json({ 
      status: 'fail',
      message: 'Authentication failed' 
    });
  }
};

module.exports = auth;
