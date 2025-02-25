import { Request, Response, NextFunction } from 'express';
import { ServiceError } from '@/core/errors/errors';
import { isAppEnv, isNodeEnv } from '@/utils/env';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (isNodeEnv('development') || isAppEnv('staging')) console.error(error);

  if (error instanceof ServiceError)
    return res.status(error.httpCode).json({ code: error.code, message: error.message });

  return res.status(500).json({
    code: 'ERR_INTERNAL_SERVER',
    message: isNodeEnv('development') ? error.message : 'An internal server error occurred',
  });
};
