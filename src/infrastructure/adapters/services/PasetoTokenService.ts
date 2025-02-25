import { ITokenService } from '@/core/ports/outbound/ITokenService';
import { V4 } from 'paseto';
import { AppConfig, PayloadData } from '@/core/types';
import { TokenType } from '@/core/enums';
import { inject, injectable } from 'tsyringe';
import { DI_TOKENS } from '@/config/di-tokens';

@injectable()
export class PasetoTokenService implements ITokenService {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;
  private readonly refreshTokenNotBefore: string;
  private readonly issuer: string;

  /**
   * Initializes the PasetoTokenService by loading private and public keys
   * and token expiration times from the application configuration.
   */
  constructor(
    @inject(DI_TOKENS.APP_CONFIG)
    private readonly config: AppConfig
  ) {
    this.privateKey = this.config.paseto.privateKey;
    this.publicKey = this.config.paseto.publicKey;
    this.accessTokenExpiration = this.config.paseto.accessTokenExpiration;
    this.refreshTokenExpiration = this.config.paseto.refreshTokenExpiration;
    this.refreshTokenNotBefore = this.config.paseto.refreshTokenNotBefore;
    this.issuer = this.config.paseto.issuer;
  }

  /**
   * Generates a PASETO v4 token with a specified payload and expiration time.
   * @param {Object} payload - Data to include in the token payload.
   * @param {string} expiresIn - Expiration time of the token in a string format (e.g., '1h', '7d').
   * @returns {Promise<string>} The generated PASETO token as a string.
   */
  async generateToken(payload: object, expiresIn: string, notBefore?: string): Promise<string> {
    const tokenPayload = {
      ...payload,
    };

    return await V4.sign(tokenPayload, this.privateKey, {
      issuer: this.issuer,
      expiresIn: expiresIn,
      notBefore: notBefore,
      iat: true,
    });
  }

  /**
   * Generates an access token using PASETO v4. If no expiration time is provided,
   * the default expiration time from the configuration is used.
   * @param {Object} payload - Data to include in the token payload.
   * @param {string} [expiresIn] - Optional expiration time for the access token.
   * @returns {Promise<string>} The generated access token.
   */
  async generateAccessToken(payload: PayloadData, expiresIn?: string): Promise<string> {
    return await this.generateToken({ user: payload, type: TokenType.ACCESS }, expiresIn || this.accessTokenExpiration);
  }

  /**
   * Generates a refresh token using PASETO v4. If no expiration time is provided,
   * the default refresh token expiration time from the configuration is used.
   * @param {Object} payload - Data to include in the token payload.
   * @param {string} [expiresIn] - Optional expiration time for the refresh token.
   * @returns {Promise<string>} The generated refresh token.
   */
  async generateRefreshToken(payload: PayloadData, expiresIn?: string, notBefore?: string): Promise<string> {
    return await this.generateToken(
      { user: payload, type: TokenType.REFRESH },
      expiresIn || this.refreshTokenExpiration,
      notBefore || this.refreshTokenNotBefore
    );
  }

  /**
   * Verifies and decodes a PASETO v4 token.
   * @param {string} token - The PASETO v4 token to verify.
   * @returns {Promise<Object>} A promise that resolves with the decoded token payload if valid.
   * @throws {Error} If the token is invalid, expired, or cannot be verified.
   */
  async verifyToken(token: string): Promise<any> {
    const payload = await V4.verify(token, this.publicKey);
    return payload;
  }
}
