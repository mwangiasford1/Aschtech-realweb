const Question = require('../models/Question');
const Answer = require('../models/Answer');
const AuditLog = require('../models/AuditLog');
const { Op } = require('sequelize');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// List all questions with pagination, search, and tag filter
exports.listQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { body: { [Op.like]: `%${search}%` } }
      ];
    }
    if (tags.length > 0) {
      where.tags = { [Op.or]: tags.map(tag => ({ [Op.like]: `%${tag}%` })) };
    }
    // Only show user's own questions unless admin
    if (req.user && req.user.role !== 'admin') {
      where.author = req.user.id;
    }
    const { rows: questions, count: total } = await Question.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Answer, as: 'answers', include: [{ model: User, as: 'authorUser', attributes: ['username', 'email'] }] },
        { model: User, as: 'authorUser', attributes: ['username', 'email'] }
      ]
    });
    res.json({ questions, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch questions', error: err.message });
  }
};

// Get a single question by ID
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id, {
      include: [
        { model: Answer, as: 'answers', include: [{ model: User, as: 'authorUser', attributes: ['username', 'email'] }] },
        { model: User, as: 'authorUser', attributes: ['username', 'email'] }
      ]
    });
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
    const question = await Question.create({
      title,
      body,
      tags: Array.isArray(tags) ? tags.join(',') : tags,
      author: req.user.id,
      image: imagePath,
    });
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
    const question = await Question.findByPk(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    // Only allow one answer per question
    let answer = await Answer.findOne({ where: { questionId: question.id } });
    if (answer) {
      answer.body = body;
      answer.author = req.user.id;
      await answer.save();
    } else {
      answer = await Answer.create({
        body,
        author: req.user.id,
        questionId: question.id
      });
    }
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add answer', error: err.message });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    if (question.author !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Delete image file if exists
    if (question.image) {
      const imagePath = path.join(__dirname, '../../', question.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await question.destroy();
    await AuditLog.create({ action: 'delete_question', user: String(req.user.id), target: String(question.id), details: `Deleted question ${question.title}` });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete question', error: err.message });
  }
};

// Delete an answer
exports.deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findByPk(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    if (answer.author !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await answer.destroy();
    await AuditLog.create({ action: 'delete_answer', user: String(req.user.id), target: String(answer.id), details: `Deleted answer from question ${answer.questionId}` });
    res.json({ message: 'Answer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete answer', error: err.message });
  }
};

// Get all unique tags
exports.getTags = async (req, res) => {
  try {
    const questions = await Question.findAll();
    const tagsSet = new Set();
    questions.forEach(q => {
      (q.tags || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => tagsSet.add(t));
    });
    res.json(Array.from(tagsSet));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tags', error: err.message });
  }
}; 