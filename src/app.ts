import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { env } from './config/env';
import { logger } from './config/logger';


export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));
  app.use('/api/v1', routes);
  app.use(errorHandler);
  return app;
};