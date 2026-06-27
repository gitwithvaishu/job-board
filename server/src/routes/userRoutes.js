const express = require('express');
const { updateProfile, uploadProfileResume, getUserPublicProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const uploadResume = require('../middleware/uploadResume');

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/resume', protect, uploadResume.single('resume'), uploadProfileResume);
router.get('/:id', getUserPublicProfile);

module.exports = router;
