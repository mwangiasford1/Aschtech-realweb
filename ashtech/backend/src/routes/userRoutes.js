const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/me', auth, userController.getProfile);
router.put('/me', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]), auth, userController.updateProfile);
router.post('/me/2fa/enable', auth, userController.enable2FA);
router.post('/me/2fa/verify', auth, userController.verify2FA);
router.post('/me/2fa/disable', auth, userController.disable2FA);

// Admin routes
router.get('/', auth, userController.listUsers);
router.put('/:id/promote', auth, userController.promoteUser);
router.put('/:id/demote', auth, userController.demoteUser);
router.put('/:id', auth, userController.updateUser);
router.delete('/:id', auth, userController.deleteUser);

module.exports = router; 