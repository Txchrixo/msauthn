import { Request, Response, NextFunction } from 'express';
import { container } from '@/config/di-container';
import { DI_TOKENS } from '@/config/di-tokens';
import { IAuthService } from '@/core/ports/IAuthService';
import { isNodeEnv } from '@/utils/env';
import { AppConfig } from '@/core/types';

const secure = isNodeEnv('production') ? { secure: true } : { secure: false };

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, phoneNumber, password } = req.body;
  try {
    const authService = container.resolve<IAuthService>(DI_TOKENS.AUTH_SERVICE);
    const { accessToken, refreshToken } = await authService.login({
      email,
      phoneNumber,
      password,
    });

    const config = container.resolve<AppConfig>(DI_TOKENS.APP_CONFIG);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      ...secure,
      sameSite: 'strict',
      maxAge: config.redis.refreshTokenExpiration,
    });
    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, phoneNumber, password, firstName, lastName } = req.body;
  try {
    const authService = container.resolve<IAuthService>(DI_TOKENS.AUTH_SERVICE);
    const { accessToken, refreshToken } = await authService.register({
      email,
      phoneNumber,
      password,
      firstName,
      lastName,
    });

    const config = container.resolve<AppConfig>(DI_TOKENS.APP_CONFIG);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      ...secure,
      sameSite: 'strict',
      maxAge: config.redis.refreshTokenExpiration,
    });
    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(400).json({ message: 'Token in cookies is missing' });

  try {
    const authService = container.resolve<IAuthService>(DI_TOKENS.AUTH_SERVICE);
    const { newAccessToken, newRefreshToken } = await authService.refreshToken(refreshToken);

    const config = container.resolve<AppConfig>(DI_TOKENS.APP_CONFIG);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      ...secure,
      sameSite: 'strict',
      maxAge: config.redis.refreshTokenExpiration,
    });
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

export const validateRefreshToken = async (req: Request, res: Response) => {
  const token = req.body?.token;

  try {
    const authService = container.resolve<IAuthService>(DI_TOKENS.AUTH_SERVICE);
    const decodedToken = await authService.validateRefreshToken(token);

    res.status(200).json({ valid: true, data: decodedToken, message: 'Token is valid' });
  } catch (error: any) {
    res.status(400).json({ valid: false, message: error.message });
  }
};

export const validatePasswordResetToken = async (req: Request, res: Response) => {
  const token = req.body?.token;

  try {
    const authService = container.resolve<IAuthService>(DI_TOKENS.AUTH_SERVICE);
    await authService.validatePasswordResetToken(token);
    res.status(200).json({ valid: true, message: 'Token is valid' });
  } catch (error: any) {
    res.status(400).json({ valid: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  const { userId } = req.body;

  if (!userId || !refreshToken) return res.status(400).json({ message: 'userId or refreshToken is missing' });

  try {
    const authService = container.resolve<IAuthService>(DI_TOKENS.AUTH_SERVICE);
    await authService.logout(userId, refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      ...secure,
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  const { email, redirectUrl } = req.body;
  try {
    const authService = container.resolve<IAuthService>(DI_TOKENS.AUTH_SERVICE);
    await authService.requestPasswordReset({ email, redirectUrl });
    res.status(200).json({ message: `Password reset link sent to email ${email}` });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, oldPassword, newPassword } = req.body;
  try {
    const authService = container.resolve<IAuthService>(DI_TOKENS.AUTH_SERVICE);
    await authService.changePassword({ userId, oldPassword, newPassword });
    res.status(200).json({ message: 'Password successfully changed' });
  } catch (error) {
    next(error);
  }
};

export const setNewPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { resetToken, newPassword } = req.body;
  try {
    const authService = container.resolve<IAuthService>(DI_TOKENS.AUTH_SERVICE);
    await authService.setNewPassword({ resetToken, newPassword });
    res.status(200).json({ message: 'Password successfully changed' });
  } catch (error) {
    next(error);
  }
};

export const oauth2SignInUp = async (req: Request, res: Response, next: NextFunction) => {
  const provider = req.params.provider;
  if (!provider) res.status(400).json({ message: 'Invalid OAuth provider' });

  try {
    const authService = container.resolve<IAuthService>(DI_TOKENS.AUTH_SERVICE);
    const { authUrl, codeVerifier } = await authService.initiateOauth2(provider);

    req.session.codeVerifier = codeVerifier;
    res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
};

export const oauth2Callback = async (req: Request, res: Response, next: NextFunction) => {
  const provider = req.query.provider as string;
  const code = req.query.code as string;
  const codeVerifier = req.session.codeVerifier;

  if (!code || !codeVerifier || !provider) return res.status(401).json({ message: 'Authentication failed' });

  try {
    const authService = container.resolve<IAuthService>(DI_TOKENS.AUTH_SERVICE);
    const { accessToken, refreshToken } = await authService.processOauth2Callback(provider, code, codeVerifier);

    const config = container.resolve<AppConfig>(DI_TOKENS.APP_CONFIG);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: config.redis.refreshTokenExpiration,
      ...secure,
    });
    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  } finally {
    delete req.session.codeVerifier;
    req.session.save();
  }
};
