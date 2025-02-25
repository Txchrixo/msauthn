import { authMiddleware } from '../middlewares/auth';
import { loginRateLimiter, resetPasswordRateLimiter } from '@/interface/middlewares/rateLimit';
import { captchaRequired } from '@/interface/middlewares/recaptcha';
import {
  loginValidator,
  registerValidator,
  tokenValidator,
  requestPasswordResetValidator,
  setNewPasswordValidator,
  changePasswordValidator,
} from '../middlewares/validator';

export {
  authMiddleware,
  loginRateLimiter,
  resetPasswordRateLimiter,
  captchaRequired,
  loginValidator,
  registerValidator,
  tokenValidator,
  requestPasswordResetValidator,
  setNewPasswordValidator,
  changePasswordValidator,
};
