const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 150,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: 5000,
    },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    skills: [{ type: String, trim: true }],

    location: {
      type: String,
      required: true,
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
      default: 'full-time',
    },
    workMode: {
      type: String,
      enum: ['onsite', 'remote', 'hybrid'],
      default: 'onsite',
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, default: 'USD' },

    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      default: 'entry',
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'published',
    },
    applicationDeadline: { type: Date },

    viewsCount: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search (title, description, skills, location)
jobSchema.index({
  title: 'text',
  description: 'text',
  skills: 'text',
  location: 'text',
  companyName: 'text',
});

// Helpful compound indexes for filtering
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ location: 1 });

module.exports = mongoose.model('Job', jobSchema);
