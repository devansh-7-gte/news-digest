/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with score and message
 */
export function validatePassword(password) {
  let score = 0;
  let feedback = [];

  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Numbers');

  if (/[!@#$%^&*]/.test(password)) score += 1;
  else feedback.push('Special characters');

  const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  const message = feedback.length > 0 
    ? `Add: ${feedback.join(', ')}`
    : 'Strong password!';

  return { score, strength, message };
}

/**
 * Sanitize HTML content
 * @param {string} html - HTML to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (typeof window === 'undefined') {
    // Basic server-side sanitization regex fallback
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate subscription domain
 * @param {string} domain - Domain to validate
 * @returns {boolean} True if valid domain
 */
export function validateDomain(domain) {
  const validDomains = ['finance', 'technology', 'health', 'politics', 'sports'];
  return validDomains.includes(domain);
}

/**
 * Validate time format (HH:MM:SS)
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid time
 */
export function validateTime(time) {
  const re = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
  return re.test(time);
}
