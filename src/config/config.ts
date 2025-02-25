import dotenv from 'dotenv';
import { isAppEnv } from '../utils/env';
const envFilePath = isAppEnv('production') ? '.env.production' : '.env.development';
dotenv.config({ path: envFilePath });
import { defineConfig } from './defineConfig';

export function createConfig() {
  return defineConfig({
    serviceName: process.env.SERVICE_NAME || 'msauthn',
    port: parseInt(process.env.PORT || '3100', 10),
    mongodb: {
      uri: process.env.MONGODB_URI! || 'mongodb://localhost:27017/msauthn',
      name: process.env.MONGODB_DBNAME! || 'msauthn',
      collections: {
        users: process.env.MONGODB_COLLECTION_USERS! || 'users',
      },
    },
    paseto: {
      privateKey: process.env.PASETO_SECRET_KEY || '',
      publicKey: process.env.PASETO_PUBLIC_KEY || '',
      accessTokenExpiration: process.env.PASETO_TOKEN_EXPIRES_IN || '1h',
      refreshTokenExpiration: '7d',
      refreshTokenNotBefore: '58m',
      resetPasswordTokenExpiration: '15m',
      issuer: process.env.PASETO_ISSUER || 'msauthn',
    },
    logs: {
      path: process.env.LOG_PATH || '../../logs',
      level: process.env.LOG_LEVEL || 'debug',
    },
    services: {
      accountService: {
        baseUrl: process.env.ACCOUNT_SERVICE_BASE_URL || 'http://localhost:3200',
        endpoints: {
          createUser: process.env.ACCOUNT_SERVICE_CREATE_USER_ENDPOINT || '',
          updatePassword: process.env.ACCOUNT_SERVICE_UPDATE_PASSWORD_ENDPOINT || '',
        },
      },
      notificationService: {
        exchangeName: process.env.NOTIFICATION_SERVICE_RABBITMQ_EXCHANGE_NAME || 'msgdispatcher',
        messageTTL: parseInt(process.env.NOTIFICATION_SERVICE_RABBITMQ_MESSAGE_TTL || '60000', 10),
        routingKeys: {
          welcomeMessage: process.env.NOTIFICATION_SERVICE_RABBITMQ_WELCOME_MESSAGE_ROUTING_KEY || 'email.welcome',
          passwordReset:
            process.env.NOTIFICATION_SERVICE_RABBITMQ_PASSWORD_RESET_MESSAGE_ROUTING_KEY ||
            'email.transactional.reset_password',
          passwordChanged:
            process.env.NOTIFICATION_SERVICE_RABBITMQ_PASSWORD_CHANGED_MESSAGE_ROUTING_KEY || 'email.password_changed',
          newDeviceConnection:
            process.env.NOTIFICATION_SERVICE_RABBITMQ_NEW_DEVICE_CONNECTION_MESSAGE_ROUTING_KEY ||
            'email.new_device_connection',
        },
      },
    },
    rabbitMQUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    oauth: {
      facebook: {
        tokenUrl: process.env.OAUTH_FACEBOOK_TOKEN_URL || 'https://graph.facebook.com/v11.0/oauth/access_token',
        userInfoUrl: process.env.OAUTH_FACEBOOK_INFO_URL || 'https://graph.facebook.com/me',
        authUri: process.env.OAUTH_FACEBOOK_AUTH_URI || 'https://www.facebook.com/v11.0/dialog/oauth',
        clientId: process.env.OAUTH_FACEBOOK_CLIENT_ID || '',
        redirectUri:
          process.env.OAUTH_FACEBOOK_REDIRECT_URI || 'https://localhost:3100/api/v1/oauth2/:provider/callback',
      },
      google: {
        tokenUrl: process.env.OAUTH_GOOGLE_TOKEN_URL || 'https://oauth2.googleapis.com/token',
        userInfoUrl: process.env.OAUTH_GOOGLE_INFO_URL || 'https://www.googleapis.com/oauth2/v3/userinfo',
        authUri: process.env.OAUTH_GOOGLE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        clientId: process.env.OAUTH_GOOGLE_CLIENT_ID || '',
        redirectUri: process.env.OAUTH_GOOGLE_REDIRECT_URI || 'https://localhost:3100/api/v1/oauth2/:provider/callback',
      },
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      refreshTokenExpiration: 60 * 60 * 24 * 7, // 7 jours
      passwordResetTokenExpiration: 60 * 15, // 15 minutes
      userCacheExpiration: 60 * 60 * 1, // 1 heure
    },
    session: {
      secret: process.env.SESSION_SECRET || 'MY-SECRET-SESSION',
    },
    recaptcha: {
      siteKey: process.env.RECAPTCHA_SITE_KEY || '',
      secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
    },
    rateLimit: {
      login: {
        time: parseInt(process.env.RATE_LIMIT_LOGIN_TIME || '900000', 10),
        limit: parseInt(process.env.RATE_LIMIT_LOGIN_LIMIT || '5', 10),
      },
      resetPassword: {
        time: parseInt(process.env.RATE_LIMIT_RESETPASSWORD_TIME || '900000', 10),
        limit: parseInt(process.env.RATE_LIMIT_RESETPASSWORD_LIMIT || '5', 10),
      },
    },
    mocksEnabled: process.env.ENABLE_MOCKS === 'true' || true,
  });
}
