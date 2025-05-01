const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'system_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

const isAssetManager = (req, res, next) => {
  if (req.user && (req.user.role === 'ddu_asset_manager' || req.user.role === 'iot_asset_manager' || req.user.role === 'system_admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Asset manager privileges required.' });
  }
};

module.exports = { isAdmin, isAssetManager };
