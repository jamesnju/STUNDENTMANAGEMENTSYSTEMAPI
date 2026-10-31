import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();
app.listen(env.PORT, () => logger.info(`API listening on :${env.PORT}`));