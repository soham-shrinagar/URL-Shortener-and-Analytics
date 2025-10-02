import type { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service.js";

export class AnalyticsController {
  async getAnalytics(req: Request, res: Response): Promise<void> {
    const { short_code } = req.params;

    if (!short_code) {
      res.status(400).json({ error: 'Short code is required' });
      return;
    }

    try {
      const analytics = await analyticsService.getAnalytics(short_code);

      if (!analytics) {
        res.status(404).json({ error: 'Short URL not found' });
        return;
      }

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const analyticsController = new AnalyticsController();