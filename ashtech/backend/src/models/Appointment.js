const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  datetime: { type: Date, required: true },
  message: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema); 