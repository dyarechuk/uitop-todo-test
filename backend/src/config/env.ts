const nodeEnv = process.env.NODE_ENV || 'development';
const isDev = nodeEnv === 'development';

function getCorsOrigin(): string | RegExp | string[] {
  const corsOriginEnv = process.env.CORS_ORIGINS;

  if (corsOriginEnv) {
    return corsOriginEnv.split(',').map(origin => origin.trim());
  }

  if (isDev) {
    return /^http:\/\/localhost:(517[3-9]|518\d|519\d)$/;
  }

  return 'http://localhost:5173';
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: nodeEnv,
  dbPath: process.env.DB_PATH || './data/todos.db',
  corsOrigin: getCorsOrigin(),
  maxTasksPerCategory: parseInt(process.env.MAX_TASKS_PER_CATEGORY || '5', 10),
} as const;

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
