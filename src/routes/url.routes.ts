import { Router } from 'express';
import { urlController } from '../controllers/url.controller.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validator.js';
import { z } from 'zod';
import { createUrlSchema } from '../types/url.types.js';

const router = Router();

// Validation schemas
const createUrlValidation = z.object({
  body: createUrlSchema,
});

const deleteUrlValidation = z.object({
  params: z.object({
    short_code: z.string().min(1),
  }),
});

// POST /api/shorten - Create short URL
router.post(
  '/shorten',
  validate(createUrlValidation),
  asyncHandler(urlController.createShortUrl.bind(urlController))
);

// GET /api/urls - List all URLs (paginated)
router.get(
  '/urls',
  asyncHandler(urlController.listUrls.bind(urlController))
);

// DELETE /api/url/:short_code - Delete URL
router.delete(
  '/url/:short_code',
  validate(deleteUrlValidation),
  asyncHandler(urlController.deleteUrl.bind(urlController))
);

export default router;