const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Decoded JWT:', decoded);
    const user = await User.findById(decoded.userId);
    console.log('User found:', user);
    req.user = user;
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user.role = decoded.role || req.user.role;
    next();
  } catch (err) {
    console.log('JWT error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth; 