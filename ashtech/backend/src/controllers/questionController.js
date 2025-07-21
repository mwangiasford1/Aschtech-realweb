const Question = require('../models/Question');
const Answer = require('../models/Answer');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// List all questions with pagination, search, and tag filter
exports.listQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }
    if (tags.length > 0) {
      filter.tags = { $in: tags };
    }
    if (req.user && req.user.role !== 'admin') {
      filter.author = req.user._id;
    }
    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username email')
      .populate({ path: 'answers', populate: { path: 'author', select: 'username email' } });
    res.json({ questions, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch questions', error: err.message });
  }
};

// Get a single question by ID
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username email')
      .populate({ path: 'answers', populate: { path: 'author', select: 'username email' } });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch question', error: err.message });
  }
};

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    let imagePath = null;
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      imagePath = `uploads/${filename}`;
    }
    const question = new Question({
      title,
      body,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
      author: req.user._id,
      image: imagePath,
      answers: []
    });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    console.error('Create question error:', err);
    res.status(500).json({ message: 'Failed to create question', error: err.message });
  }
};

// Add an answer to a question
exports.addAnswer = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admins can answer questions.' });
    const { body } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    // Only allow one answer per question
    let answer = await Answer.findOne({ questionId: question._id });
    if (answer) {
      answer.body = body;
      answer.author = req.user._id;
      await answer.save();
    } else {
      answer = new Answer({
        body,
        author: req.user._id,
        questionId: question._id
      });
      await answer.save();
      question.answers.push(answer._id);
      await question.save();
    }
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add answer', error: err.message });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    if (String(question.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Delete image file if exists
    if (question.image) {
      const imagePath = path.join(__dirname, '../../', question.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    // Delete all answers for this question
    await Answer.deleteMany({ questionId: question._id });
    await question.deleteOne();
    await AuditLog.create({ action: 'delete_question', user: String(req.user._id), target: String(question._id), details: `Deleted question ${question.title}` });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete question', error: err.message });
  }
};

// Delete an answer
exports.deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    if (String(answer.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Remove answer reference from question
    await Question.updateOne(
      { _id: answer.questionId },
      { $pull: { answers: answer._id } }
    );
    await answer.deleteOne();
    await AuditLog.create({ action: 'delete_answer', user: String(req.user._id), target: String(answer._id), details: `Deleted answer from question ${answer.questionId}` });
    res.json({ message: 'Answer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete answer', error: err.message });
  }
};

// Get all unique tags
exports.getTags = async (req, res) => {
  try {
    const questions = await Question.find({}, 'tags');
    const tagsSet = new Set();
    questions.forEach(q => {
      (q.tags || []).forEach(t => tagsSet.add(t));
    });
    res.json(Array.from(tagsSet));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tags', error: err.message });
  }
}; 