const express = require('express');
const {
  createJob,
  getJobs,
  getFeaturedJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/featured', getFeaturedJobs);
router.get('/', getJobs);

// Employer-only (must come before "/:id" to avoid route collision)
router.get('/employer/mine', protect, authorize('employer'), getMyJobs);

router.get('/:id', getJobById);

router.post('/', protect, authorize('employer'), createJob);
router.put('/:id', protect, authorize('employer'), updateJob);
router.delete('/:id', protect, authorize('employer'), deleteJob);

module.exports = router;
