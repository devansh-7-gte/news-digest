/**
 * Custom error classes
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Not authenticated') {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Not authorized') {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
  }
}

export class NotFoundError extends Error {
  constructor(resource = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource already exists') {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

export class InternalError extends Error {
  constructor(message = 'Internal server error') {
    super(message);
    this.name = 'InternalError';
    this.status = 500;
  }
}

/**
 * Handle and format errors for API responses
 * @param {Error} error - Error to handle
 * @returns {Object} Formatted error response
 */
export function handleError(error) {
  console.error('Error:', error);

  if (error.status) {
    return {
      status: error.status,
      message: error.message,
      name: error.name,
    };
  }

  return {
    status: 500,
    message: 'An unexpected error occurred',
    name: 'InternalError',
  };
}
