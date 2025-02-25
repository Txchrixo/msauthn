import { OauthUserInfo } from '../../types';

export interface IOauthProvider {
  getAuthUrl(provider: string, codeChallenge: string): string;

  exchangeCodeForAccessToken(code: string, codeVerifier: string): Promise<string>;

  getUserInfo(accessToken: string): Promise<OauthUserInfo>;
}
