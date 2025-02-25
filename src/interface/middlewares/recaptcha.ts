import { Request, Response, NextFunction } from 'express';
import { RecaptchaV3 } from 'express-recaptcha';
import { container } from '@/config/di-container';
import { DI_TOKENS } from '@/config/di-tokens';
import { AppConfig } from '@/core/types';
import { CaptchaVerificationError } from '@/core/errors/errors';

export const captchaRequired = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = container.resolve<AppConfig>(DI_TOKENS.APP_CONFIG);
    const recaptcha = new RecaptchaV3(config.recaptcha.siteKey!, config.recaptcha.secretKey!);

    if (req.rateLimit?.current && req.rateLimit.current > 7) {
      await new Promise<void>((resolve, reject) => {
        recaptcha.middleware.verify(req, res, (error) => {
          if (error || req.recaptcha?.error) return reject(new CaptchaVerificationError());
          resolve();
        });
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
