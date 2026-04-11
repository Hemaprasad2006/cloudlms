const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user)          return res.status(401).json({ message: 'User not found.' });
    if (!req.user.isActive) return res.status(403).json({ message: 'Account deactivated.' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: `Access denied. Required: ${roles.join(' or ')}` });
  next();
};

module.exports = { protect, authorize };