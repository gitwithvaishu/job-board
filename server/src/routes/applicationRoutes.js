const express = require('express');
const {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const uploadResume = require('../middleware/uploadResume');

const router = express.Router();

// Candidate applies to a job (resume upload optional if profile already has one)
router.post('/:jobId', protect, authorize('candidate'), uploadResume.single('resume'), applyToJob);

// Candidate Dashboard - my applications
router.get('/mine', protect, authorize('candidate'), getMyApplications);

// Employer Dashboard - applications for a specific job
router.get('/job/:jobId', protect, authorize('employer'), getApplicationsForJob);

// Employer updates application status
router.put('/:id/status', protect, authorize('employer'), updateApplicationStatus);

module.exports = router;
