const express = require('express');
const router = express.Router();
const tutorialController = require('../controllers/tutorialController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Public routes
router.get('/', tutorialController.listTutorials);
router.get('/:id', tutorialController.getTutorial);

// Protected routes
// Use upload.single('thumbnail') for thumbnail upload
router.post('/', auth, upload.single('thumbnail'), tutorialController.createTutorial);
router.put('/:id', auth, upload.single('thumbnail'), tutorialController.updateTutorial);
router.delete('/:id', auth, tutorialController.deleteTutorial);

module.exports = router; 