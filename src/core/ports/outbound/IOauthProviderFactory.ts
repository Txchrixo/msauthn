import { IOauthProvider } from './IOauthProvider';
import { OauthProvider } from '../../enums';

export interface IOauthProviderFactory {
  getProvider(provider: OauthProvider): IOauthProvider;
}
