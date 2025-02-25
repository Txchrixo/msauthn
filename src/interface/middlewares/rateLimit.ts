import { Request, Response, NextFunction } from 'express';
import { container } from '@/config/di-container';
import { DI_TOKENS } from '@/config/di-tokens';
import { AppConfig } from '@/core/types';
import { rateLimit } from 'express-rate-limit';
import { TooManyRequestsError } from '@/core/errors/errors';
import { logger } from '@/config';

declare module 'express' {
  export interface Request {
    rateLimit?: {
      current: number;
      limit: number;
      remaining: number;
      resetTime: Date | undefined;
    };
  }
}

const config = container.resolve<AppConfig>(DI_TOKENS.APP_CONFIG);

export const loginRateLimiter = rateLimit({
  windowMs: config.rateLimit.login.time!,
  limit: config.rateLimit.login.limit!,
  standardHeaders: 'draft-7',
  handler: (req: Request, res: Response, next: NextFunction) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.originalUrl}`);
    next(new TooManyRequestsError(`Rate limit exceeded for IP: ${req.ip}`));
  },
});

export const resetPasswordRateLimiter = rateLimit({
  windowMs: config.rateLimit.resetPassword.time!,
  limit: config.rateLimit.resetPassword.limit!,
  standardHeaders: 'draft-7',
  handler: (req: Request, res: Response, next: NextFunction) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.originalUrl}`);
    next(new TooManyRequestsError());
  },
});
