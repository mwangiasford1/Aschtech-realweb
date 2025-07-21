const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema); 