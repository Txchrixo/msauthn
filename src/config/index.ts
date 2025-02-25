import { createConfig } from './config';
import { logger, morganMiddleware } from './logger';

const config = createConfig();

export { logger, morganMiddleware, config };
