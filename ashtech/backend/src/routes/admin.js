const express = require('express');
const router = express.Router();
const User = require('../models/User');
const isAdmin = require('../middleware/isAdmin');

// Protected admin dashboard
router.get('/dashboard', isAdmin, (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard!' });
});

// Promote user to admin
router.post('/promote/:id', isAdmin, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true });
    res.json({ message: `${updated.username} promoted to admin.` });
  } catch (err) {
    res.status(500).json({ error: 'Promotion failed', detail: err.message });
  }
});

module.exports = router;
