import { Router } from 'express';
import * as authController from '@/interface/controllers/authController';
import {
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
} from '@/interface/middlewares';

const router = Router();

router.post('/api/v1/auth/login', loginRateLimiter, captchaRequired, loginValidator, authController.login);
router.post('/api/v1/auth/register', registerValidator, authController.register);
router.post('/api/v1/auth/logout', authMiddleware, authController.logout);
router.post('/api/v1/auth/refresh-token', authController.refreshToken);
router.post('/api/v1/auth/validate-token', tokenValidator, authController.validateRefreshToken);
router.post(
  '/api/v1/auth/reset-password',
  resetPasswordRateLimiter,
  requestPasswordResetValidator,
  authController.requestPasswordReset
);
router.post(
  '/api/v1/auth/reset-password/validate-reset-token',
  tokenValidator,
  authController.validatePasswordResetToken
);
router.post('/api/v1/auth/reset-password/set-new-password', setNewPasswordValidator, authController.setNewPassword);
router.put('/api/v1/auth/change-password', authMiddleware, changePasswordValidator, authController.changePassword);
router.post('/api/v1/oauth2/:provider', authController.oauth2SignInUp);
router.post('/api/v1/oauth2/:provider/callback', authController.oauth2Callback);

export default router;
