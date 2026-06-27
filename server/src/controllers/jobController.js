const Job = require('../models/Job');
const Application = require('../models/Application');

// @route   POST /api/jobs
// @access  Private (employer)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      responsibilities,
      requirements,
      skills,
      location,
      jobType,
      workMode,
      salaryMin,
      salaryMax,
      currency,
      experienceLevel,
      status,
      applicationDeadline,
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ message: 'Title, description, and location are required' });
    }

    const job = await Job.create({
      employer: req.user._id,
      companyName: req.user.employerProfile?.companyName || req.user.name,
      title,
      description,
      responsibilities,
      requirements,
      skills,
      location,
      jobType,
      workMode,
      salaryMin,
      salaryMax,
      currency,
      experienceLevel,
      status: status || 'published',
      applicationDeadline,
    });

    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/jobs
// @access  Public
// Supports: ?search=&location=&jobType=&workMode=&experienceLevel=&minSalary=&maxSalary=&page=&limit=
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      workMode,
      experienceLevel,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status: 'published' };

    if (search) {
      query.$text = { $search: search };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (jobType) query.jobType = jobType;
    if (workMode) query.workMode = workMode;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    if (minSalary || maxSalary) {
      query.salaryMax = {};
      if (minSalary) query.salaryMax.$gte = Number(minSalary);
    }
    if (maxSalary) {
      query.salaryMin = { ...(query.salaryMin || {}), $lte: Number(maxSalary) };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('employer', 'name employerProfile.companyLogoUrl'),
      Job.countDocuments(query),
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/jobs/featured
// @access  Public - used on Home Page
const getFeaturedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('employer', 'name employerProfile.companyLogoUrl');
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'employer',
      'name employerProfile.companyName employerProfile.companyWebsite employerProfile.companyDescription employerProfile.companyLogoUrl'
    );

    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.viewsCount += 1;
    await job.save();

    res.json({ job });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/jobs/:id
// @access  Private (employer who owns the job)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this job' });
    }

    const updatableFields = [
      'title',
      'description',
      'responsibilities',
      'requirements',
      'skills',
      'location',
      'jobType',
      'workMode',
      'salaryMin',
      'salaryMax',
      'currency',
      'experienceLevel',
      'status',
      'applicationDeadline',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();
    res.json({ message: 'Job updated successfully', job });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/jobs/:id
// @access  Private (employer who owns the job)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/jobs/employer/mine
// @access  Private (employer) - jobs posted by logged in employer, for dashboard
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createJob,
  getJobs,
  getFeaturedJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
};
