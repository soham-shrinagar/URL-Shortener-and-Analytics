import type { Request, Response } from 'express';
import { urlService } from '../services/url.service.js';
import { analyticsService } from '../services/analytics.service.js';
import { extractIpAddress } from '../utils/ipAddress.js';
import { isExpired } from '../utils/date.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CreateUrlInput, PaginationInput } from '../types/url.types.js';
import { config } from '../config/env.js';
import { success } from 'zod';

export class UrlController {
  async createShortUrl(req: Request, res: Response): Promise<void> {
    const input: CreateUrlInput = req.body;

    const newUrl = await urlService.createShortUrl(input);

    if(!newUrl){
      res.status(400).json({
        success: false,
        error: "ALIAS_EXISTS", 
        message: "Custom Alias already taken. Try another one"
      });
      return;
    }

    res.status(201).json({
      success: true,
      short_code: newUrl.shortCode,
      short_url: `${config.baseUrl}/${newUrl.shortCode}`,
      long_url: newUrl.longUrl,
      expires_at: newUrl.expiresAt,
      created_at: newUrl.createdAt,
    });
  }

  async redirect(req: Request, res: Response): Promise<void> {
    const { short_code } = req.params;

    // Skip static files and API routes
    if (
      short_code?.includes('.') ||
      short_code?.startsWith('api') ||
      short_code === 'health' ||
      short_code === 'favicon.ico'
    ) {
      res.status(404).send('Not found');
      return;
    }

    // Find URL
    const url = await urlService.findByShortCode(short_code!);

    if (!url) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Short URL Not Found</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                text-align: center;
                padding: 100px 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container { max-width: 600px; }
              h1 { font-size: 72px; margin: 0; }
              p { font-size: 20px; margin: 20px 0; }
              a { color: white; text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>404</h1>
              <p>Short URL Not Found</p>
              <p>The short URL you're looking for doesn't exist.</p>
              <a href="/">Go back home</a>
            </div>
          </body>
        </html>
      `);
      return;
    }

    // Check expiry
    if (isExpired(url.expiresAt)) {
      res.status(410).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>410 - Link Expired</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                text-align: center;
                padding: 100px 20px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container { max-width: 600px; }
              h1 { font-size: 72px; margin: 0; }
              p { font-size: 20px; margin: 20px 0; }
              a { color: white; text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>410</h1>
              <p>Link Expired</p>
              <p>This short URL has expired and is no longer available.</p>
              <a href="/">Go back home</a>
            </div>
          </body>
        </html>
      `);
      return;
    }

    // Increment click count (async)
    urlService.incrementClickCount(short_code!);

    // Track analytics (async)
    const ip = extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    analyticsService.createAnalytics({
      //@ts-ignore
      shortCode: short_code,
      ipAddress: ip,
      userAgent,
    });

    // Redirect
    console.log(`Redirect: ${short_code} -> ${url.longUrl}`);
    res.redirect(url.longUrl);
  }

  async listUrls(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const pagination: PaginationInput = { page, limit };
    const { urls, total } = await urlService.listUrls(pagination);

    res.json({
      success: true,
      data: urls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }

  async deleteUrl(req: Request, res: Response): Promise<void> {
    const { short_code } = req.params;

    const deleted = await urlService.deleteUrl(short_code!);

    if (!deleted) {
      throw new AppError(404, 'Short URL not found');
    }

    res.json({
      success: true,
      message: 'URL deleted successfully',
    });
  }
}

export const urlController = new UrlController();