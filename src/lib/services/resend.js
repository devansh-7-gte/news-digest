import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send digest email to user
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<Object>} Send result
 */
export async function sendDigestEmail(to, subject, html) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SwiftIQ <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email to new user
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 * @returns {Promise<Object>} Send result
 */
export async function sendWelcomeEmail(to, userName) {
  const html = `
    <h1>Welcome to SwiftIQ, ${userName}!</h1>
    <p>Thank you for signing up. We're excited to help you stay informed.</p>
    <p>Your personalized news digests will be delivered based on your preferences.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/preferences">Manage your preferences</a></p>
  `;

  return sendDigestEmail(to, 'Welcome to SwiftIQ!', html);
}
