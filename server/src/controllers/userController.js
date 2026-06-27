const User = require('../models/User');

// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, candidateProfile, employerProfile } = req.body;

    if (name) user.name = name;

    if (user.role === 'candidate' && candidateProfile) {
      user.candidateProfile = {
        ...user.candidateProfile,
        ...candidateProfile,
      };
    }

    if (user.role === 'employer' && employerProfile) {
      user.employerProfile = {
        ...user.employerProfile,
        ...employerProfile,
      };
    }

    await user.save();

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/users/resume
// @access  Private (candidate only) - uploads/updates resume on profile
const uploadProfileResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    req.user.candidateProfile = req.user.candidateProfile || {};
    req.user.candidateProfile.resumeUrl = resumeUrl;
    await req.user.save();

    res.json({ message: 'Resume uploaded successfully', resumeUrl, user: req.user });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/users/:id
// @access  Public (limited info, e.g. employer company info on job detail page)
const getUserPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name role employerProfile.companyName employerProfile.companyWebsite employerProfile.companyDescription employerProfile.companyLogoUrl'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateProfile, uploadProfileResume, getUserPublicProfile };
