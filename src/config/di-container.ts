import { container } from 'tsyringe';
import { config } from '@/config';
import { AppConfig } from '@/core/types';
import { Channel } from 'amqplib';
import { MongoClient } from 'mongodb';
import { RedisClientType } from 'redis';

import { IAuthService } from '@/core/ports/IAuthService';
import { IAccountService } from '@/core/ports/outbound/IAccountService';
import { ICacheService } from '@/core/repositories/ICacheService';
import { ITokenService } from '@/core/ports/outbound/ITokenService';
import { IPasswordResetCacheService } from '@/core/repositories/IPasswordResetCacheService';
import { IRefreshTokenCacheService } from '@/core/repositories/IRefreshTokenCacheService';
import { IUserCacheService } from '@/core/repositories/IUserCacheService';
import { IUserRepository } from '@/core/repositories/IUserRepository';
import { INotificationService } from '@/core/ports/outbound/INotificationService';
import { IMQService } from '@/core/ports/outbound/IMQService';
import { IOauthProvider } from '@/core/ports/outbound/IOauthProvider';
import { ICacheClient } from '@/core/ports/outbound/ICacheClient';
import { IMQClient } from '@/core/ports/outbound/IMQClient';
import { IDbClient } from '@/core/ports/outbound/IDbClient';
import { IOauthProviderFactory } from '@/core/ports/outbound/IOauthProviderFactory';

import { AuthService } from '@/infrastructure/AuthService';
import { NotificationServiceAdapter } from '@/infrastructure/adapters/services/NotificationServiceAdapter';
import { PasetoTokenService } from '@/infrastructure/adapters/services/PasetoTokenService';
import { AccountServiceAdapter } from '@/infrastructure/adapters/services/AccountServiceAdapter';
import { UserCacheService } from '@/infrastructure/adapters/services/UserCacheService';
import { PasswordResetCacheService } from '@/infrastructure/adapters/services/PasswordResetCacheService';
import { RefreshTokenCacheService } from '@/infrastructure/adapters/services/RefreshTokenCacheService';
import { RedisCacheServiceAdapter } from '@/infrastructure/adapters/redis/RedisCacheServiceAdapter';
import { MongodbUserRepository } from '@/infrastructure/adapters/mongodb/MongodbUserRepository';
import { RabbitMQServiceAdapter } from '@/infrastructure/adapters/rabbitMQ/RabbitMQServiceAdapter';
import { GoogleAuthAdapter } from '@/infrastructure/adapters/oauth/GoogleAuthAdapter';
import { FacebookAuthAdapter } from '@/infrastructure/adapters/oauth/FacebookAuthAdapter';
import { RedisClient } from '@/infrastructure/adapters/redis/RedisClient';
import { MongodbClient } from '@/infrastructure/adapters/mongodb/MongodbClient';
import { RabbitMQClient } from '@/infrastructure/adapters/rabbitMQ/RabbitMQClient';
import { OauthProviderFactory } from '@/infrastructure/adapters/oauth/OauthProviderFactory';
import { DI_TOKENS } from './di-tokens';

/**
 * Registers core configuration and clients.
 */
function registerCoreDependencies() {
  container.register<AppConfig>(DI_TOKENS.APP_CONFIG, { useValue: config });
  container.registerSingleton<IDbClient>(DI_TOKENS.DB_CLIENT, MongodbClient);
  container.registerSingleton<IMQClient>(DI_TOKENS.MQ_CLIENT, RabbitMQClient);
  container.registerSingleton<ICacheClient>(DI_TOKENS.CACHE_CLIENT, RedisClient);
}

/**
 * Registers domain-specific services and adapters.
 */
function registerServiceDependencies() {
  container.registerSingleton<IUserRepository>(DI_TOKENS.USER_REPOSITORY, MongodbUserRepository);
  container.registerSingleton<ITokenService>(DI_TOKENS.TOKEN_SERVICE, PasetoTokenService);
  container.registerSingleton<IAccountService>(DI_TOKENS.ACCOUNT_SERVICE, AccountServiceAdapter);
  container.registerSingleton<IMQService>(DI_TOKENS.MQ_SERVICE, RabbitMQServiceAdapter);
  container.registerSingleton<INotificationService>(DI_TOKENS.NOTIFICATION_SERVICE, NotificationServiceAdapter);
}

/**
 * Registers caching-related services.
 */
function registerCacheServices() {
  container.registerSingleton<ICacheService>(DI_TOKENS.CACHE_SERVICE, RedisCacheServiceAdapter);
  container.registerSingleton<IUserCacheService>(DI_TOKENS.USER_CACHE_SERVICE, UserCacheService);
  container.registerSingleton<IPasswordResetCacheService>(
    DI_TOKENS.PASSWORD_RESET_CACHE_SERVICE,
    PasswordResetCacheService
  );
  container.registerSingleton<IRefreshTokenCacheService>(
    DI_TOKENS.REFRESH_TOKEN_CACHE_SERVICE,
    RefreshTokenCacheService
  );
}

/**
 * Registers authentication and OAuth services.
 */
function registerAuthServices() {
  container.registerSingleton<IAuthService>(DI_TOKENS.AUTH_SERVICE, AuthService);
  container.registerSingleton<IOauthProvider>(DI_TOKENS.OAUTH_GOOGLE, GoogleAuthAdapter);
  container.registerSingleton<IOauthProvider>(DI_TOKENS.OAUTH_FACEBOOK, FacebookAuthAdapter);
  container.registerSingleton<IOauthProviderFactory>(DI_TOKENS.OAUTH_PROVIDER_FACTORY, OauthProviderFactory);
}

/**
 * Configures the dependency injection container by registering all dependencies.
 */
async function configureContainer() {
  try {
    registerCoreDependencies();
    registerServiceDependencies();
    registerCacheServices();
    registerAuthServices();
    console.log('> Dependency injection container configured');
  } catch (error: any) {
    console.error('Failed to configure the container:', error.message);
    throw new Error(`Container configuration failed: ${error.message}`);
  }
}

export { container, configureContainer };
