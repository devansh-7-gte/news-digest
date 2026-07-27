/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (short, long, relative)
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'short') {
  const d = new Date(date);

  if (format === 'relative') {
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // short format
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format time to display format
 * @param {string} time - Time string (HH:MM:SS)
 * @returns {string} Formatted time (h:MM AM/PM)
 */
export function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, length = 100, suffix = '...') {
  if (text.length <= length) return text;
  return text.slice(0, length - suffix.length) + suffix;
}

/**
 * Format numbers with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Capitalize string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert domain name to display format
 * @param {string} domain - Domain (e.g., 'technology')
 * @returns {string} Display format (e.g., 'Technology')
 */
export function formatDomain(domain) {
  const icons = {
    finance: '💰 Finance',
    technology: '💻 Technology',
    health: '🏥 Health',
    politics: '🏛️ Politics',
    sports: '⚽ Sports',
  };

  return icons[domain] || capitalize(domain);
}
