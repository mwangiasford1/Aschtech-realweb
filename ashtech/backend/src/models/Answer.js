const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema); 