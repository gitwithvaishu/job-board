const Application = require('../models/Application');
const Job = require('../models/Job');
const {
  sendApplicationConfirmation,
  sendNewApplicationAlert,
  sendStatusUpdateEmail,
} = require('../utils/email');

// @route   POST /api/applications/:jobId
// @access  Private (candidate)
const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('employer', 'name email');

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'published') {
      return res.status(400).json({ message: 'This job is not currently accepting applications' });
    }

    const existing = await Application.findOne({ job: job._id, candidate: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Resume: either freshly uploaded with this application, or fallback to profile resume
    let resumeUrl;
    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
    } else if (req.user.candidateProfile?.resumeUrl) {
      resumeUrl = req.user.candidateProfile.resumeUrl;
    } else {
      return res.status(400).json({ message: 'A resume is required to apply' });
    }

    const application = await Application.create({
      job: job._id,
      candidate: req.user._id,
      employer: job.employer._id,
      resumeUrl,
      coverLetter: req.body.coverLetter,
    });

    job.applicationsCount += 1;
    await job.save();

    // Fire-and-forget email notifications
    sendApplicationConfirmation(req.user.email, req.user.name, job.title, job.companyName).catch(() => {});
    sendNewApplicationAlert(job.employer.email, job.title, req.user.name).catch(() => {});

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }
    next(err);
  }
};

// @route   GET /api/applications/mine
// @access  Private (candidate) - for Candidate Dashboard
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .sort({ createdAt: -1 })
      .populate('job', 'title companyName location jobType status');

    res.json({ applications });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/applications/job/:jobId
// @access  Private (employer who owns the job) - for Employer Dashboard
const getApplicationsForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: job._id })
      .sort({ createdAt: -1 })
      .populate('candidate', 'name email candidateProfile');

    res.json({ applications });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/applications/:id/status
// @access  Private (employer who owns the related job)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['submitted', 'under_review', 'shortlisted', 'rejected', 'hired'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    sendStatusUpdateEmail(
      application.candidate.email,
      application.candidate.name,
      application.job.title,
      status
    ).catch(() => {});

    res.json({ message: 'Application status updated', application });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
};
