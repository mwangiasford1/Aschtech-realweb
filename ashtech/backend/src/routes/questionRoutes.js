const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Public routes
router.get('/', questionController.listQuestions);
router.get('/tags', questionController.getTags);
router.get('/:id', questionController.getQuestion);

// Protected routes
router.post('/', auth, upload.single('image'), questionController.createQuestion);
router.post('/:id/answers', auth, questionController.addAnswer);
router.delete('/:id', auth, questionController.deleteQuestion);
router.delete('/:id/answers/:answerId', auth, questionController.deleteAnswer);

module.exports = router; 