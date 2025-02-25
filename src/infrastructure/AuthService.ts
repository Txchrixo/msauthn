import { ITokenService } from '@/core/ports/outbound/ITokenService';
import { IUserRepository } from '@/core/repositories/IUserRepository';
import { AppConfig, LoginData, OauthUserInfo, PayloadData, RegisterData } from '@/core/types';
import { inject, injectable } from 'tsyringe';
import {
  ExternalServiceError,
  InvalidCredentialsError,
  InvalidOauthProviderError,
  InvalidOAuthTokenError,
  InvalidTokenError,
  NotFoundError,
} from '@/core/errors/errors';
import { mapUserToPayloadData } from '@/utils/mappers';
import { IAccountService } from '@/core/ports/outbound/IAccountService';
import { hashPassword, base64URLEncode, sha256, generateRandomString } from '@/utils/common';
import { OauthProvider, Roles, TokenType } from '@/core/enums';
import { IRefreshTokenCacheService } from '@/core/repositories/IRefreshTokenCacheService';
import { IUserCacheService } from '@/core/repositories/IUserCacheService';
import { INotificationService } from '@/core/ports/outbound/INotificationService';
import { IPasswordResetCacheService } from '@/core/repositories/IPasswordResetCacheService';
import { IAuthService } from '@/core/ports/IAuthService';
import { IOauthProviderFactory } from '@/core/ports/outbound/IOauthProviderFactory';
import { User } from '@/core/entities';
import { DI_TOKENS } from '@/config/di-tokens';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(DI_TOKENS.APP_CONFIG) private readonly config: AppConfig,
    @inject(DI_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @inject(DI_TOKENS.TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
    @inject(DI_TOKENS.REFRESH_TOKEN_CACHE_SERVICE)
    private readonly refreshTokenCacheService: IRefreshTokenCacheService,
    @inject(DI_TOKENS.USER_CACHE_SERVICE)
    private readonly userCacheService: IUserCacheService,
    @inject(DI_TOKENS.ACCOUNT_SERVICE)
    private readonly accountService: IAccountService,
    @inject(DI_TOKENS.NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
    @inject(DI_TOKENS.PASSWORD_RESET_CACHE_SERVICE)
    private readonly passwordResetCacheService: IPasswordResetCacheService,
    @inject(DI_TOKENS.OAUTH_PROVIDER_FACTORY)
    private readonly oauthProviderFactory: IOauthProviderFactory
  ) {}

  async login({ email, phoneNumber, password }: LoginData): Promise<{ accessToken: string; refreshToken: string }> {
    const user =
      (await this.userCacheService.getCachedUser(email, phoneNumber)) ||
      (await this.userRepository.findUserByEmailOrPhoneNumber(email, phoneNumber));

    if (!user || !(await this.userRepository.verifyPassword(user.id, password))) throw new InvalidCredentialsError();

    this.userCacheService.cacheUser(user);

    const payload: PayloadData = mapUserToPayloadData(user);
    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    this.refreshTokenCacheService.cacheRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async register(data: RegisterData): Promise<{ accessToken: string; refreshToken: string }> {
    const existingUser = await this.userRepository.findUserByEmailOrPhoneNumber(data.email, data.phoneNumber);
    if (existingUser) {
      const errorMsg = existingUser.email === data.email ? 'Email already exists' : 'Phone number already exists';
      throw new InvalidCredentialsError(errorMsg);
    }

    const hashedPassword = await hashPassword(data.password, 10);
    const processUserCreation = async () => {
      try {
        return await this.accountService.createUser({
          ...data,
          password: hashedPassword,
          role: Roles.SHOP_OWNER,
        });
      } catch (error) {
        // if (error instanceof ExternalServiceError)
        //   return this.userRepository.createUserLocally({
        //     ...data,
        //     password: hashedPassword,
        //     role: Roles.SHOP_OWNER,
        //   });
        throw new ExternalServiceError();
      }
    };

    const userId = await processUserCreation();
    const user = await this.userRepository.findUserById(userId);
    this.userCacheService.cacheUser(user!);

    const payload: PayloadData = mapUserToPayloadData(user!);
    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    this.refreshTokenCacheService.cacheRefreshToken(userId, refreshToken);

    return { accessToken: accessToken, refreshToken: refreshToken };
  }

  public async refreshToken(token: string): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const cache = await this.refreshTokenCacheService.getCachedRefreshToken(token);
    if (!cache) throw new InvalidTokenError('Refresh Token is expired');

    let payload;
    try {
      payload = await this.tokenService.verifyToken(token);
      if (payload.type !== TokenType.REFRESH) throw new InvalidTokenError('Refresh Token is invalid');
    } catch (error: any) {
      await this.refreshTokenCacheService.invalidateUserToken(cache.userId, token);
      throw error;
    }

    const newAccessToken = await this.tokenService.generateAccessToken(payload.user as PayloadData);
    const newRefreshToken = await this.tokenService.generateRefreshToken(payload.user as PayloadData);

    await this.refreshTokenCacheService.invalidateUserToken(payload.user.sub, token);
    this.refreshTokenCacheService.cacheRefreshToken(payload.user.sub, newRefreshToken);

    return { newAccessToken, newRefreshToken };
  }

  public async verifyToken(token: string): Promise<any> {
    let payload;
    try {
      payload = await this.tokenService.verifyToken(token);
    } catch (error: any) {
      if (error.code === 'ERR_PASETO_CLAIM_INVALID' && error.message === 'token is not active yet')
        throw new InvalidTokenError('Token is not active yet');

      throw new InvalidTokenError();
    }
    return payload;
  }

  public async validateRefreshToken(token: string): Promise<string> {
    const payload = await this.tokenService.verifyToken(token);

    if (payload.type !== TokenType.REFRESH) throw new InvalidTokenError('Refresh Token is invalid');

    const storedToken = await this.refreshTokenCacheService.getCachedRefreshToken(token);

    if (!storedToken || storedToken !== token) throw new InvalidTokenError('Token is expired or mismatch');

    return payload;
  }

  public async logout(userId: string, refreshToken: string): Promise<void> {
    this.refreshTokenCacheService.invalidateUserToken(userId, refreshToken);
  }

  public async requestPasswordReset(data: { email: string; redirectUrl: string }): Promise<void> {
    const user = await this.userRepository.findUserByEmail(data.email);
    if (!user) throw new InvalidCredentialsError('Email does not exist');

    let token = await this.passwordResetCacheService.getCachedPasswordResetToken(user.id);

    if (!token) {
      token = await this.tokenService.generateToken(
        { userId: user.id, type: TokenType.RESETPASSWORD },
        this.config.paseto.resetPasswordTokenExpiration
      );
      this.passwordResetCacheService.cachePasswordResetToken(user.id, token);
    }

    const url = new URL(data.redirectUrl);
    url.searchParams.append('token', token);
    const fullUrl = url.toString();

    this.notificationService.sendPasswordResetNotification(user.email, fullUrl);
  }

  public async validatePasswordResetToken(token: string): Promise<string> {
    const payload = await this.tokenService.verifyToken(token);

    if (payload.type !== TokenType.RESETPASSWORD) throw new InvalidTokenError('ResetPassword Token is invalid');

    const storedToken = await this.passwordResetCacheService.getCachedPasswordResetToken(payload.userId);

    if (!storedToken || storedToken !== token) throw new InvalidTokenError('Token is expired or mismatch');

    return payload.userId;
  }

  public async changePassword(data: { userId: string; oldPassword: string; newPassword: string }): Promise<void> {
    const user = await this.userRepository.findUserById(data.userId);
    if (!user) throw new InvalidCredentialsError('Email does not exist');

    if (!(await this.userRepository.verifyPassword(user.id, data.oldPassword)))
      throw new InvalidCredentialsError('Invalid old password');

    const hashedPassword = await hashPassword(data.newPassword, 10);

    try {
      await this.accountService.updatePassword(user.id, hashedPassword);
    } catch (error) {
      // if (error instanceof ExternalServiceError)
      //   return this.userRepository.updatePasswordLocally(data.userId, hashedPassword));
      throw new ExternalServiceError();
    }

    this.refreshTokenCacheService.invalidateUserTokens(user!.id);
    this.passwordResetCacheService.invalidatePasswordResetToken(user!.id);
    this.notificationService.sendPasswordChangedNotification(user!.email);
  }

  public async setNewPassword(data: { resetToken: string; newPassword: string }): Promise<void> {
    const userId = await this.validatePasswordResetToken(data.resetToken);

    const user = await this.userRepository.findUserById(userId);
    if (!user) throw new NotFoundError('User not found');

    const hashedPassword = await hashPassword(data.newPassword);

    try {
      await this.accountService.updatePassword(userId, hashedPassword);
    } catch (error) {
      // if (error instanceof ExternalServiceError)
      //   return this.userRepository.updatePasswordLocally(userId, hashedPassword));
      throw new ExternalServiceError();
    }

    this.passwordResetCacheService.invalidatePasswordResetToken(userId);
    this.notificationService.sendPasswordChangedNotification(user!.email);
  }

  private isValidProvider(provider: string): OauthProvider | false {
    if ((Object.values(OauthProvider) as string[]).includes(provider)) return provider as OauthProvider;
    return false;
  }

  public async initiateOauth2(provider: string): Promise<{ authUrl: string; codeVerifier: string }> {
    const validProvider = this.isValidProvider(provider);
    if (!validProvider) throw new InvalidOauthProviderError();

    const codeVerifier = generateRandomString();
    const codeChallenge = base64URLEncode(sha256(codeVerifier));

    const oauthUrl = this.oauthProviderFactory.getProvider(validProvider).getAuthUrl(validProvider, codeChallenge);

    return { authUrl: oauthUrl, codeVerifier };
  }

  public async processOauth2Callback(
    provider: string,
    code: string,
    codeVerifier: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const validProvider = this.isValidProvider(provider);
    if (!validProvider) throw new InvalidOauthProviderError();

    const oauthService = this.oauthProviderFactory.getProvider(validProvider);
    const token = await oauthService.exchangeCodeForAccessToken(code, codeVerifier);

    if (!token) throw new InvalidOAuthTokenError();

    const userInfo: OauthUserInfo = await oauthService.getUserInfo(token);

    const existingUser =
      (await this.userCacheService.getCachedUser(userInfo.email)) ||
      (await this.userRepository.findUserByEmailOrPhoneNumber(userInfo.email));

    let tokens: any;
    if (existingUser) tokens = await this.directLoginWithoutPassword(existingUser);
    else tokens = await this.directRegisterWithoutPassword(userInfo);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async directLoginWithoutPassword(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    this.userCacheService.cacheUser(user!);

    const payload: PayloadData = mapUserToPayloadData(user);
    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    this.refreshTokenCacheService.cacheRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  private async directRegisterWithoutPassword(
    data: OauthUserInfo
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const password = generateRandomString();
    const hashedPassword = await hashPassword(password, 10);
    const processUserCreation = async () => {
      try {
        return await this.accountService.createUser({
          ...data,
          password: hashedPassword,
          role: Roles.SHOP_OWNER,
        });
      } catch (error) {
        // if (error instanceof ExternalServiceError)
        //   return this.userRepository.createUserLocally({
        //     ...data,
        //     password: hashedPassword,
        //     role: Roles.SHOP_OWNER,
        //   });
        throw new ExternalServiceError();
      }
    };

    const userId = await processUserCreation();
    const user = await this.userRepository.findUserById(userId);
    this.userCacheService.cacheUser(user!);

    const payload: PayloadData = mapUserToPayloadData(user!);
    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    this.refreshTokenCacheService.cacheRefreshToken(userId, refreshToken);

    return { accessToken: accessToken, refreshToken: accessToken };
  }
}
