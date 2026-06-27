const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    resumeUrl: {
      type: String,
      required: [true, 'Resume is required to apply'],
    },
    coverLetter: {
      type: String,
      maxlength: 3000,
    },

    status: {
      type: String,
      enum: ['submitted', 'under_review', 'shortlisted', 'rejected', 'hired'],
      default: 'submitted',
    },

    notes: { type: String, maxlength: 2000 }, // internal employer notes
  },
  { timestamps: true }
);

// Prevent a candidate from applying to the same job twice
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, createdAt: -1 });
applicationSchema.index({ employer: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
