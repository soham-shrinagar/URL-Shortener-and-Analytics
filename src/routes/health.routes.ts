import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const healthRouter = Router();

// GET /api/health - Health check
healthRouter.get(
  '/',
  asyncHandler(healthController.check.bind(healthController))
);

export default healthRouter;