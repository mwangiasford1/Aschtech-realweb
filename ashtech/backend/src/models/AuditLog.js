const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: String, required: true },
  target: { type: String },
  details: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema); 