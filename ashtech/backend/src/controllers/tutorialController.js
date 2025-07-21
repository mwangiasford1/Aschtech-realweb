const Tutorial = require('../models/Tutorial');
const AuditLog = require('../models/AuditLog');
const { Op } = require('sequelize');
const User = require('../models/User');

// List all tutorials with pagination, search, and tag filter
exports.listTutorials = async (req, res) => {
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
        { content: { [Op.like]: `%${search}%` } }
      ];
    }
    if (tags.length > 0) {
      where.tags = { [Op.or]: tags.map(tag => ({ [Op.like]: `%${tag}%` })) };
    }
    const { rows: tutorials, count: total } = await Tutorial.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'authorUser', attributes: ['username', 'email'] }
      ]
    });
    res.json({ tutorials, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tutorials', error: err.message });
  }
};

// Get a single tutorial by ID
exports.getTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findByPk(req.params.id, {
      include: [
        { model: User, as: 'authorUser', attributes: ['username', 'email'] }
      ]
    });
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    res.json(tutorial);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tutorial', error: err.message });
  }
};

// Create a new tutorial
exports.createTutorial = async (req, res) => {
  try {
    const { title, content, tags, link, caption } = req.body;
    let thumbnail = req.body.thumbnail;
    if (req.file) {
      thumbnail = req.file.path;
    }
    const tutorial = await Tutorial.create({
      title,
      content,
      tags: Array.isArray(tags) ? tags.join(',') : tags,
      author: req.user.id,
      link,
      thumbnail,
      caption
    });
    res.status(201).json(tutorial);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create tutorial', error: err.message });
  }
};

// Update a tutorial
exports.updateTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findByPk(req.params.id);
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    if (tutorial.author !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, content, tags, link, caption } = req.body;
    let thumbnail = req.body.thumbnail;
    if (req.file) {
      thumbnail = req.file.path;
    }
    if (title) tutorial.title = title;
    if (content) tutorial.content = content;
    if (tags) tutorial.tags = Array.isArray(tags) ? tags.join(',') : tags;
    if (link) tutorial.link = link;
    if (thumbnail) tutorial.thumbnail = thumbnail;
    if (caption) tutorial.caption = caption;
    await tutorial.save();
    await AuditLog.create({ action: 'update_tutorial', user: String(req.user.id), target: String(tutorial.id), details: `Updated tutorial ${tutorial.title}` });
    res.json(tutorial);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update tutorial', error: err.message });
  }
};

// Delete a tutorial
exports.deleteTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findByPk(req.params.id);
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    if (tutorial.author !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await tutorial.destroy();
    await AuditLog.create({ action: 'delete_tutorial', user: String(req.user.id), target: String(tutorial.id), details: `Deleted tutorial ${tutorial.title}` });
    res.json({ message: 'Tutorial deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete tutorial', error: err.message });
  }
}; 