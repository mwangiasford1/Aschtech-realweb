const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  link: { type: String },
  thumbnail: { type: String },
  caption: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Tutorial', tutorialSchema); 