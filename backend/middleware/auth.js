const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Try to get token from different header locations
    let token = req.header('x-auth-token');
    
    // If not in x-auth-token, check Authorization header
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'No auth token, access denied' });
    }

    console.log('Token received:', token ? 'Yes' : 'No');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token verified, user:', decoded.id);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (e) {
    console.error('Auth error:', e.message);
    if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth;
