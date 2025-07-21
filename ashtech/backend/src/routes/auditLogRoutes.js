const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

// List all audit logs (admin only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
  try {
    const logs = await AuditLog.findAll({ order: [['createdAt', 'DESC']] });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error: err.message });
  }
});

module.exports = router; 