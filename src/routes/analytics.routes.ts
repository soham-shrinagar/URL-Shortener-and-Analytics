import { analyticsController } from '../controllers/analytics.controller.js';
import { z } from "zod";
import Router from "express";
import { validate } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const analyticsRouter = Router();

const getAnalyticsValidation = z.object({
  params: z.object({
    short_code: z.string().min(1),
  }),
});

// GET /api/analytics/:short_code - Get analytics
analyticsRouter.get(
  '/:short_code',
  validate(getAnalyticsValidation),
  asyncHandler(analyticsController.getAnalytics.bind(analyticsController))
);

export default analyticsRouter;