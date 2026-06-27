const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Don't crash the request flow if email fails — just log it
    console.error('Email send failed:', err.message);
  }
};

// ---- Templates ----

const sendApplicationConfirmation = (candidateEmail, candidateName, jobTitle, companyName) =>
  sendEmail({
    to: candidateEmail,
    subject: `Application received: ${jobTitle}`,
    html: `
      <p>Hi ${candidateName},</p>
      <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted successfully.</p>
      <p>You can track the status of your application from your candidate dashboard.</p>
      <p>Good luck!</p>
    `,
  });

const sendNewApplicationAlert = (employerEmail, jobTitle, candidateName) =>
  sendEmail({
    to: employerEmail,
    subject: `New application for ${jobTitle}`,
    html: `
      <p>Hello,</p>
      <p><strong>${candidateName}</strong> just applied for your job posting <strong>${jobTitle}</strong>.</p>
      <p>Log in to your employer dashboard to review the application.</p>
    `,
  });

const sendStatusUpdateEmail = (candidateEmail, candidateName, jobTitle, status) =>
  sendEmail({
    to: candidateEmail,
    subject: `Update on your application: ${jobTitle}`,
    html: `
      <p>Hi ${candidateName},</p>
      <p>The status of your application for <strong>${jobTitle}</strong> has been updated to: <strong>${status.replace('_', ' ')}</strong>.</p>
      <p>Log in to your dashboard for more details.</p>
    `,
  });

const sendWelcomeEmail = (email, name) =>
  sendEmail({
    to: email,
    subject: 'Welcome to Job Board!',
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for signing up. You can now search for jobs, build your profile, and start applying.</p>
    `,
  });

module.exports = {
  sendEmail,
  sendApplicationConfirmation,
  sendNewApplicationAlert,
  sendStatusUpdateEmail,
  sendWelcomeEmail,
};
