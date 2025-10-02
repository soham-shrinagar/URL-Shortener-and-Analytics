import { z } from 'zod';

// Request Validation Schema

export const createUrlSchema = z.object({
  long_url: z.string().url({ message: 'Invalid URL format' }),
  custom_alias: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{3,20}$/, {
      message: 'Custom alias must be 3-20 characters (letters, numbers, _, -)',
    })
    .optional(),
  expires_in_days: z.number().int().positive().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

// Type Definition

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

export interface UrlResponse {
  success: boolean;
  short_code: string;
  short_url: string;
  long_url: string;
  expires_at: Date | null;
  created_at: Date;
}

export interface UrlListResponse {
  success: boolean;
  data: UrlData[];
  pagination: PaginationData;
}

export interface UrlData {
  id: number;
  shortCode: string;
  longUrl: string;
  customAlias: string | null;
  createdAt: Date;
  expiresAt: Date | null;
  clickCount: number;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}