const Appointment = require('../models/Appointment');

// User: Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { name, email, datetime, message } = req.body;
    if (!name || !email || !datetime) {
      return res.status(400).json({ message: 'Name, email, and datetime are required.' });
    }
    const appointment = new Appointment({ name, email, datetime, message });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create appointment', error: err.message });
  }
};

// Admin: List all appointments
exports.listAppointments = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
}; 