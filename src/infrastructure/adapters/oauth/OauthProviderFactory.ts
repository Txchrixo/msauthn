import { IOauthProviderFactory } from '@/core/ports/outbound/IOauthProviderFactory';
import { OauthProvider } from '@/core/enums';
import { IOauthProvider } from '@/core/ports/outbound/IOauthProvider';
import { inject, injectable } from 'tsyringe';
import { DI_TOKENS } from '@/config/di-tokens';
import { OauthProviderError } from '@/core/errors/errors';

@injectable()
export class OauthProviderFactory implements IOauthProviderFactory {
  constructor(
    @inject(DI_TOKENS.OAUTH_GOOGLE)
    private readonly googleOauthProvider: IOauthProvider,
    @inject(DI_TOKENS.OAUTH_FACEBOOK)
    private readonly facebookOauthProvider: IOauthProvider
  ) {}

  getProvider(provider: OauthProvider): IOauthProvider {
    switch (provider) {
      case OauthProvider.GOOGLE:
        return this.googleOauthProvider;
      case OauthProvider.FACEBOOK:
        return this.facebookOauthProvider;
      default:
        throw new OauthProviderError(`Provider ${provider} not supported`);
    }
  }
}
