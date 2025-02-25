import { IOauthProvider } from '@/core/ports/outbound/IOauthProvider';
import axios from 'axios';
import { OauthUserInfo } from '@/core/types';
import { DI_TOKENS } from '@/config/di-tokens';
import { AppConfig } from '@/core/types';
import { inject, injectable } from 'tsyringe';
import { OauthProviderError } from '@/core/errors/errors';

@injectable()
export class GoogleAuthAdapter implements IOauthProvider {
  private tokenUrl: string;
  private userInfoUrl: string;
  private authUri: string;
  private clientId: string;
  private redirectUri: string;

  constructor(@inject(DI_TOKENS.APP_CONFIG) private readonly config: AppConfig) {
    this.tokenUrl = this.config.oauth.google.tokenUrl;
    this.userInfoUrl = this.config.oauth.google.userInfoUrl;
    this.authUri = this.config.oauth.google.authUri;
    this.clientId = this.config.oauth.google.clientId;
    this.redirectUri = this.config.oauth.google.redirectUri;
  }

  getAuthUrl(provider: string, codeChallenge: string): string {
    const redirectUriWithProvider = this.redirectUri.replace(':provider', provider);
    return (
      `${this.authUri}?client_id=${this.clientId}` +
      `&redirect_uri=${redirectUriWithProvider}` +
      `&response_type=code` +
      `&scope=profile email` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`
    );
  }

  async exchangeCodeForAccessToken(code: string, codeVerifier: string): Promise<string> {
    try {
      const response = await axios.post(this.tokenUrl, {
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
      });
      return response.data.access_token;
    } catch (error: any) {
      throw new OauthProviderError(`Failed to exchange code for access token: ${error.message}`);
    }
  }
  async getUserInfo(accessToken: string): Promise<OauthUserInfo> {
    try {
      const response = await axios.get(this.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.data.email) throw new OauthProviderError('Unable to fetch user information');

      return {
        email: response.data.email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        picture: response.data.picture,
        emailVerified: response.data.email_verified,
      };
    } catch (error: any) {
      throw new OauthProviderError(`Failed to get user info:: ${error.message}`);
    }
  }
}
