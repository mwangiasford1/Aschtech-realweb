const Tutorial = require('../models/Tutorial');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// List all tutorials with pagination, search, and tag filter
exports.listTutorials = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    if (tags.length > 0) {
      filter.tags = { $in: tags };
    }
    const total = await Tutorial.countDocuments(filter);
    const tutorials = await Tutorial.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username email');
    res.json({ tutorials, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tutorials', error: err.message });
  }
};

// Get a single tutorial by ID
exports.getTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id)
      .populate('author', 'username email');
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
    const tutorial = new Tutorial({
      title,
      content,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
      author: req.user._id,
      link,
      thumbnail,
      caption
    });
    await tutorial.save();
    res.status(201).json(tutorial);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create tutorial', error: err.message });
  }
};

// Update a tutorial
exports.updateTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    if (String(tutorial.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, content, tags, link, caption } = req.body;
    let thumbnail = req.body.thumbnail;
    if (req.file) {
      thumbnail = req.file.path;
    }
    if (title) tutorial.title = title;
    if (content) tutorial.content = content;
    if (tags) tutorial.tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []);
    if (link) tutorial.link = link;
    if (thumbnail) tutorial.thumbnail = thumbnail;
    if (caption) tutorial.caption = caption;
    await tutorial.save();
    await AuditLog.create({ action: 'update_tutorial', user: String(req.user._id), target: String(tutorial._id), details: `Updated tutorial ${tutorial.title}` });
    res.json(tutorial);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update tutorial', error: err.message });
  }
};

// Delete a tutorial
exports.deleteTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    if (String(tutorial.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await tutorial.deleteOne();
    await AuditLog.create({ action: 'delete_tutorial', user: String(req.user._id), target: String(tutorial._id), details: `Deleted tutorial ${tutorial.title}` });
    res.json({ message: 'Tutorial deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete tutorial', error: err.message });
  }
}; 