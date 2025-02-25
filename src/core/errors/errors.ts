export const CODES: { [key: string]: { errorCode: string; httpCode: number } } = {
  InvalidCredentialsError: { errorCode: 'ERR_INVALID_CREDENTIALS', httpCode: 401 },
  NotFoundError: { errorCode: 'ERR_NOT_FOUND', httpCode: 404 },
  InvalidTokenError: { errorCode: 'ERR_INVALID_TOKEN', httpCode: 401 },
  UnauthorizedError: { errorCode: 'ERR_UNAUTHORIZED', httpCode: 403 },
  ExternalServiceError: { errorCode: 'ERR_EXTERNAL_SERVICE', httpCode: 500 },
  InvalidOauthProviderError: { errorCode: 'ERR_INVALID_OAUTH_PROVIDER', httpCode: 400 },
  InvalidOAuthTokenError: { errorCode: 'ERR_INVALID_OAUTH_TOKEN', httpCode: 400 },
  ValidationError: { errorCode: 'ERR_VALIDATION', httpCode: 400 },
  CacheError: { errorCode: 'ERR_CACHE', httpCode: 400 },
  MessageQueueError: { errorCode: 'ERR_MESSAGE_QUEUE', httpCode: 400 },
  OauthProviderError: { errorCode: 'ERR_OAUTH_PROVIDER', httpCode: 400 },
  DatabaseError: { errorCode: 'ERR_DATABASE', httpCode: 400 },
  CaptchaVerificationError: { errorCode: 'ERR_CAPTCHA_VERIFICATION_FAILED', httpCode: 403 },
  TooManyRequestsError: { errorCode: 'ERR_TOO_MANY_REQUESTS', httpCode: 429 },
};

// export enum ErrorMessages {
//   EMAIL_EXISTS = 'Email already exists',
//   PHONE_EXISTS = 'Phone number already exists',
//   TOKEN_EXPIRED = 'Token has expired',
//   TOKEN_INVALID = 'Token is invalid',
// }

export class ServiceError extends Error {
  public code: string;
  public httpCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    const errorDetails = CODES[this.constructor.name];
    if (errorDetails) {
      this.code = errorDetails.errorCode;
      this.httpCode = errorDetails.httpCode;
      this.message = message;
    } else {
      this.code = 'ERR_UNKNOWN_ERROR';
      this.httpCode = 500;
      this.message = message;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidCredentialsError extends ServiceError {
  constructor(message: string = 'Invalid credentials') {
    super(message);
  }
}

export class NotFoundError extends ServiceError {
  constructor(message: string = 'Not found') {
    super(message);
  }
}

export class InvalidTokenError extends ServiceError {
  constructor(message: string = 'Token is invalid or expired') {
    super(message);
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(message: string = 'User is not authorized to access this resource') {
    super(message);
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string = 'Validation Error') {
    super(message);
  }
}

export class ExternalServiceError extends ServiceError {
  constructor(message: string = 'External service error') {
    super(message);
  }
}

export class InvalidOauthProviderError extends ServiceError {
  constructor(message: string = 'Invalid oauth provider error') {
    super(message);
  }
}

export class InvalidOAuthTokenError extends ServiceError {
  constructor(message: string = 'Invalid oauth token error') {
    super(message);
  }
}

export class DatabaseError extends ServiceError {
  constructor(message: string = 'Database error') {
    super(message);
  }
}

export class OauthProviderError extends ServiceError {
  constructor(message: string = 'Oauth Provider error') {
    super(message);
  }
}

export class MessageQueueError extends ServiceError {
  constructor(message: string = 'Message queue error') {
    super(message);
  }
}

export class CacheError extends ServiceError {
  constructor(message: string = 'Cache error') {
    super(message);
  }
}

export class CaptchaVerificationError extends ServiceError {
  constructor(message: string = 'CAPTCHA verification failed. Please try again.') {
    super(message);
  }
}

export class TooManyRequestsError extends ServiceError {
  constructor(message: string = 'Too many requests, please try again later.') {
    super(message);
  }
}
