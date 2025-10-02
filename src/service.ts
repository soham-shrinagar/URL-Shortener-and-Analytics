import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { redisClient } from './config/redis.js';
import { config, validateEnv } from './config/env.js';

const startServer = async (): Promise<void> => {
  try {
    validateEnv();
    await connectDatabase();
    await redisClient.connect();
    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(
        `URL Shortener API Server Started:    
        Port:        ${config.port}                          
        Environment: ${config.nodeEnv}              
        Base URL:    ${config.baseUrl} `
        );
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        await disconnectDatabase();
        await redisClient.disconnect();
        
        console.log('All connections closed. Exiting...');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();