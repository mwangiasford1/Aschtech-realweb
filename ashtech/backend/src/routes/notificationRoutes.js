const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create/send notification
router.post('/', auth, async (req, res) => {
  try {
    const notification = await Notification.create({
      message: req.body.message,
      sender: req.user.id,
    });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create notification', error: err.message });
  }
});

// List all notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'senderUser', attributes: ['username', 'email'] }]
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
});

module.exports = router; 