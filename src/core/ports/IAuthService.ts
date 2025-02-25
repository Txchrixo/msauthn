import { LoginData, RegisterData } from '../types';

export interface IAuthService {
  login(credentials: LoginData): Promise<{ accessToken: string; refreshToken: string }>;

  requestPasswordReset(data: { email: string; redirectUrl: string }): Promise<void>;

  register(data: RegisterData): Promise<{ accessToken: string; refreshToken: string }>;

  refreshToken(token: string): Promise<{ newAccessToken: string; newRefreshToken: string }>;

  verifyToken(token: string): Promise<any>;

  validateRefreshToken(token: string): Promise<any>;

  logout(userId: string, refreshToken: string): Promise<void>;

  requestPasswordReset(data: { email: string; redirectUrl: string }): Promise<void>;

  validatePasswordResetToken(token: string): Promise<string>;

  changePassword(data: { userId: string; oldPassword: string; newPassword: string }): Promise<void>;

  setNewPassword(data: { resetToken: string; newPassword: string }): Promise<void>;

  initiateOauth2(provider: string): Promise<{ authUrl: string; codeVerifier: string }>;

  processOauth2Callback(
    provider: string,
    code: string,
    codeVerifier: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
}
