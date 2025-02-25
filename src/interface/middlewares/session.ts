import expressSession from 'express-session';
import RedisStore from 'connect-redis';
import { container } from '@/config/di-container';
import { DI_TOKENS } from '@/config/di-tokens';
import { isNodeEnv } from '@/utils/env';
import { config } from '@/config';
import { ICacheClient } from '@/core/ports/outbound/ICacheClient';

declare module 'express-session' {
  interface SessionData {
    codeVerifier?: string;
  }
}

export const session = () => {
  const redisClient = container.resolve<ICacheClient>(DI_TOKENS.CACHE_CLIENT).getClient();

  const sessionOptions = {
    name: 'uid',
    secret: config.session.secret,
    store: new RedisStore({
      client: redisClient,
      disableTouch: true,
    }),
    cookie: {
      httpOnly: true,
      sameSite: (isNodeEnv('production') ? 'none' : 'lax') as 'lax' | 'none',
      secure: isNodeEnv('production'),
    },
    resave: false,
    saveUninitialized: true,
  };

  return expressSession(sessionOptions);
};
