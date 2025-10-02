import { prisma } from '../config/database.js';
import { generateShortCode } from '../utils/shortCode.js';
import { addDays, isExpired } from '../utils/date.js';
import { cacheService } from './cache.service.js';
import type { CreateUrlInput, UrlData, PaginationInput } from '../types/url.types.js';

export class UrlService {
  // Create a new shortened URL
  async createShortUrl(input: CreateUrlInput): Promise<UrlData | null> {
    const { long_url, custom_alias, expires_in_days } = input;
    let shortCode = custom_alias;

    // Handle custom alias
    if (custom_alias) {
      const existing = await prisma.url.findFirst({
        where: {
          OR: [{ shortCode: custom_alias }, { customAlias: custom_alias }],
        },
      });

      if (existing) {
        //throw new Error('Custom alias already taken');
        return null;
      }
    } else {
      // Generate unique short code
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        shortCode = generateShortCode();
        const existing = await prisma.url.findUnique({ where: { shortCode } });
        if (!existing) break;
        attempts++;
      }

      if (attempts === maxAttempts) {
        throw new Error('Failed to generate unique short code');
      }
    }

    // Calculate expiry date
    const expiresAt = expires_in_days ? addDays(new Date(), expires_in_days) : null;

    // Create URL record
    const newUrl = await prisma.url.create({
      data: {
        shortCode: shortCode!,
        longUrl: long_url,
        customAlias: custom_alias || null,
        expiresAt,
      },
    });

    // Cache in Redis (default TTL 365 days if not provided)
    const ttl = expires_in_days || 365;
    await cacheService.set(shortCode!, long_url, ttl);

    return newUrl;
  }

  // Find URL by short code or custom alias
  async findByShortCode(shortCode: string): Promise<UrlData | null> {
    // Try cache first
    const cached = await cacheService.get(shortCode);
    if (cached) {
      const url = await prisma.url.findFirst({
        where: { OR: [{ shortCode }, { customAlias: shortCode }] },
      });
      if (url) return url;
    }

    // Query database
    const url = await prisma.url.findFirst({
      where: { OR: [{ shortCode }, { customAlias: shortCode }] },
    });

    if (!url) return null;

    // Check expiry
    if (isExpired(url.expiresAt)) return null;

    // Cache for future requests
    await cacheService.set(shortCode, url.longUrl, 1);

    return url;
  }

  // Increment click count
  async incrementClickCount(shortCode: string): Promise<void> {
    prisma.url
      .updateMany({
        where: { OR: [{ shortCode }, { customAlias: shortCode }] },
        data: { clickCount: { increment: 1 } },
      })
      .catch((err) => console.error('Click count error:', err));
  }

  // List URLs with pagination
  async listUrls(pagination: PaginationInput): Promise<{ urls: UrlData[]; total: number }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.url.count(),
    ]);

    return { urls, total };
  }

  // Delete URL and its analytics
  async deleteUrl(shortCode: string): Promise<boolean> {
    // Delete analytics first
    await prisma.analytics.deleteMany({ where: { shortCode } });

    // Delete URL
    const result = await prisma.url.deleteMany({
      where: { OR: [{ shortCode }, { customAlias: shortCode }] },
    });

    // Remove from cache
    await cacheService.delete(shortCode);

    return result.count > 0;
  }
}

export const urlService = new UrlService();
