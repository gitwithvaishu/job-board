// Sends email via Brevo's HTTP API (https://developers.brevo.com/reference/sendtransacemail)
// instead of raw SMTP, because most free-tier hosts (Render, Railway, etc.) block
// outbound SMTP ports (25/465/587) to prevent spam abuse. HTTPS (443) is never blocked.
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const parseFromHeader = (fromHeader) => {
  // Accepts "Name <email@domain.com>" or just "email@domain.com"
  const match = fromHeader?.match(/^(.*)<(.+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ''), email: match[2].trim() };
  }
  return { email: fromHeader, name: 'Hirewell' };
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.warn('BREVO_API_KEY not set — skipping email send');
      return;
    }

    const sender = parseFromHeader(process.env.EMAIL_FROM || process.env.EMAIL_USER);

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
    }
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
