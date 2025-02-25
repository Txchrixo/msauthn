import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from '@/interface/middlewares/errorHandler';
import { swaggerUi, swaggerDocs } from '@/config/swagger';
import { morganMiddleware } from '@/config/logger';
import { isNodeEnv } from '@/utils/env';
import { session } from '@/interface/middlewares/session';

const app = express();
const routes = (await import('@/interface/routes')).default;
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(isNodeEnv('production') ? morganMiddleware : morgan('dev'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cookieParser());
app.use(session());
app.use(routes);
app.use(errorHandler);

export default app;
