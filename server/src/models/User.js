const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ['candidate', 'employer', 'admin'],
      default: 'candidate',
    },

    // ----- Candidate-specific fields -----
    candidateProfile: {
      headline: { type: String, trim: true, maxlength: 150 },
      bio: { type: String, maxlength: 2000 },
      skills: [{ type: String, trim: true }],
      experienceYears: { type: Number, min: 0 },
      resumeUrl: { type: String }, // path to latest uploaded resume
      location: { type: String, trim: true },
      phone: { type: String, trim: true },
      linkedinUrl: { type: String, trim: true },
    },

    // ----- Employer-specific fields -----
    employerProfile: {
      companyName: { type: String, trim: true, maxlength: 150 },
      companyWebsite: { type: String, trim: true },
      companyDescription: { type: String, maxlength: 2000 },
      companyLogoUrl: { type: String },
      companySize: { type: String, trim: true },
      industry: { type: String, trim: true },
    },

    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving, only if it changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip password automatically when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
