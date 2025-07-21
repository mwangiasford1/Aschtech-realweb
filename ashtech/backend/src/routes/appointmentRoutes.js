const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

// User: Create appointment
router.post('/', auth, appointmentController.createAppointment);
// Admin: List all appointments
router.get('/', auth, appointmentController.listAppointments);

module.exports = router; 