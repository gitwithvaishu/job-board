require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing existing data...');

  await Promise.all([User.deleteMany({}), Job.deleteMany({}), Application.deleteMany({})]);

  const employer = await User.create({
    name: 'Jordan Lee',
    email: 'employer@example.com',
    password: 'password123',
    role: 'employer',
    employerProfile: {
      companyName: 'Nimbus Tech',
      companyWebsite: 'https://nimbustech.example.com',
      companyDescription: 'We build cloud tools for small businesses.',
      industry: 'Software',
      companySize: '50-200',
    },
  });

  const candidate = await User.create({
    name: 'Sam Rivera',
    email: 'candidate@example.com',
    password: 'password123',
    role: 'candidate',
    candidateProfile: {
      headline: 'Frontend Developer',
      bio: 'React developer with 3 years of experience.',
      skills: ['React', 'JavaScript', 'CSS', 'Tailwind'],
      experienceYears: 3,
      location: 'Remote',
    },
  });

  const jobsData = [
    {
      title: 'Frontend Developer',
      description: 'Build and maintain our customer-facing React application.',
      location: 'Remote',
      jobType: 'full-time',
      workMode: 'remote',
      experienceLevel: 'mid',
      skills: ['React', 'JavaScript', 'Tailwind'],
      salaryMin: 70000,
      salaryMax: 95000,
    },
    {
      title: 'Backend Engineer (Node.js)',
      description: 'Design and scale our Node.js/Express API and MongoDB schema.',
      location: 'New York, NY',
      jobType: 'full-time',
      workMode: 'hybrid',
      experienceLevel: 'senior',
      skills: ['Node.js', 'MongoDB', 'Express'],
      salaryMin: 100000,
      salaryMax: 140000,
    },
    {
      title: 'Product Design Intern',
      description: 'Assist the design team with UI mockups and user research.',
      location: 'San Francisco, CA',
      jobType: 'internship',
      workMode: 'onsite',
      experienceLevel: 'entry',
      skills: ['Figma', 'UI Design'],
      salaryMin: 25,
      salaryMax: 30,
    },
  ];

  for (const data of jobsData) {
    await Job.create({
      ...data,
      employer: employer._id,
      companyName: employer.employerProfile.companyName,
      status: 'published',
    });
  }

  console.log('Seed complete.');
  console.log('Employer login: employer@example.com / password123');
  console.log('Candidate login: candidate@example.com / password123');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
