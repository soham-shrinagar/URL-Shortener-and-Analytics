import type { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { redisClient } from '../config/redis.js';

export class HealthController {
  async check(req: Request, res: Response): Promise<void> {
    try {
      // Check database
      await prisma.$queryRaw`SELECT 1`;

      // Check Redis
      let redisStatus: 'connected' | 'disconnected' = 'disconnected';
      try {
        const ping = await redisClient.ping();
        redisStatus = ping === 'PONG' ? 'connected' : 'disconnected';
      } catch {
        redisStatus = 'disconnected';
      }

      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'connected',
        redis: redisStatus,
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const healthController = new HealthController();