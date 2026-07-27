/**
 * Logger utility for consistent logging
 */
const logLevels = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 * @returns {string} Formatted log message
 */
function formatLog(level, message, data) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
}

export const logger = {
  error: (message, data) => {
    const log = formatLog(logLevels.ERROR, message, data);
    console.error(log);

    // Send to error tracking (e.g., Sentry)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof window !== 'undefined') {
      try {
        // Sentry would be initialized elsewhere
        // Sentry.captureException(new Error(message), { extra: data });
      } catch (e) {
        console.error('Failed to log to Sentry:', e);
      }
    }
  },

  warn: (message, data) => {
    const log = formatLog(logLevels.WARN, message, data);
    console.warn(log);
  },

  info: (message, data) => {
    const log = formatLog(logLevels.INFO, message, data);
    console.log(log);
  },

  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      const log = formatLog(logLevels.DEBUG, message, data);
      console.log(log);
    }
  },
};
