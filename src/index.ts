import 'reflect-metadata';
import { config } from '@/config';
import { container, configureContainer } from '@/config/di-container';
import { DI_TOKENS } from './config/di-tokens';
import { ICacheClient } from './core/ports/outbound/ICacheClient';
import { IDbClient } from './core/ports/outbound/IDbClient';
import { IMQClient } from './core/ports/outbound/IMQClient';

const PORT = config.port;
(async () => {
  console.time('start-server');
  configureContainer()
    .then(async () => {
      const redisClient = container.resolve<ICacheClient>(DI_TOKENS.CACHE_CLIENT);
      await redisClient.connect();
      const dbClient = container.resolve<IDbClient>(DI_TOKENS.DB_CLIENT);
      await dbClient.connect();
      const mqClient = container.resolve<IMQClient>(DI_TOKENS.MQ_CLIENT);
      await mqClient.connect();

      const app = (await import('@/interface/app')).default;

      // Start the server
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
      console.timeEnd('start-server');
    })
    .catch((error: any) => {
      console.error('Failed to initialize the application:', error.message);
      // eslint-disable-next-line n/no-process-exit
      process.exit(1);
    });
})();
