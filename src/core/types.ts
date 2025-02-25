export type LoginData = {
  username?: string;
  email?: string;
  phoneNumber?: string;
  password: string;
};

export type RegisterData = {
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  picture?: string;
  emailVerified?: boolean;
};

export type PayloadData = {
  sub: string;
  email: string;
  role: string;
};

export type OauthUserInfo = {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  emailVerified?: boolean;
};

export type AppConfig = {
  serviceName: string;
  port: number;
  mongodb: {
    uri: string;
    name: string;
    collections: {
      users: string;
    };
  };
  paseto: {
    privateKey: string;
    publicKey: string;
    accessTokenExpiration: string;
    refreshTokenExpiration: string;
    refreshTokenNotBefore: string;
    resetPasswordTokenExpiration: string;
    issuer: string;
  };
  logs: {
    path: string;
    level: string;
  };
  services: {
    accountService: {
      baseUrl: string;
      endpoints: {
        createUser: string;
        updatePassword: string;
      };
    };
    notificationService: {
      exchangeName: string;
      messageTTL: number;
      routingKeys: {
        welcomeMessage: string;
        passwordReset: string;
        passwordChanged: string;
        newDeviceConnection: string;
      };
    };
  };
  rabbitMQUrl: string;
  oauth: {
    facebook: {
      tokenUrl: string;
      userInfoUrl: string;
      authUri: string;
      clientId: string;
      redirectUri: string;
    };
    google: {
      tokenUrl: string;
      userInfoUrl: string;
      authUri: string;
      clientId: string;
      redirectUri: string;
    };
  };
  redis: {
    url: string;
    refreshTokenExpiration: number;
    passwordResetTokenExpiration: number;
    userCacheExpiration: number;
  };
  session: {
    secret: string;
  };
  recaptcha: {
    siteKey: string;
    secretKey: string;
  };
  rateLimit: {
    login: {
      time: number;
      limit: number;
    };
    resetPassword: {
      time: number;
      limit: number;
    };
  };
  mocksEnabled?: boolean;
};
