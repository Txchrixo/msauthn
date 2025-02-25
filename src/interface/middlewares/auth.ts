import { Request, Response, NextFunction } from 'express';
import { container } from '@/config/di-container';
import { IAuthService } from '@/core/ports/IAuthService';
import { AuthService } from '@/infrastructure/AuthService';
import { PayloadData } from '@/core/types';
import { InvalidTokenError, UnauthorizedError } from '@/core/errors/errors';

declare module 'express' {
  export interface Request {
    user?: PayloadData;
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authService = container.resolve<IAuthService>(AuthService);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authorization token is missing or invalid'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedUser = await authService.verifyToken(token);
    req.user = decodedUser;
    next();
  } catch (error) {
    next(new InvalidTokenError(`Invalid or expired token`));
  }
};

// export const checkOAuthScopes = (allowedScopes: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const scopesFromProvider = req.query.scope?.toString().split(' ') || [];

//     const hasValidScopes = allowedScopes.every((scope) =>
//       scopesFromProvider.includes(scope)
//     );

//     if (!hasValidScopes)
//       return res.status(403).json({ message: 'Permissions needed' });

//     next();
//   };
// };
