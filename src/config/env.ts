import dotenv from 'dotenv';

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  baseUrl: string;
  defaultCacheTtl: number;
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  defaultCacheTtl: parseInt(process.env.DEFAULT_CACHE_TTL || '86400', 10),
};

export const validateEnv = (): void => {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
};