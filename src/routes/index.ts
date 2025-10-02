import type { Request, Response } from 'express';
import { Router } from 'express';
import urlRoutes from './url.routes.js';
import analyticsRoutes from './analytics.routes.js';
import healthRoutes from './health.routes.js';
import { urlController } from '../controllers/url.controller.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// API routes
router.use('/api', urlRoutes);
router.use('/api/analytics', analyticsRoutes);
router.use('/api/health', healthRoutes);

// Redirect route - must be last
router.get('/:short_code', asyncHandler(urlController.redirect.bind(urlController)));

export default router;