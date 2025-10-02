import type { AnalyticsCreateData, AnalyticsResponse, ClicksByDay, DeviceStats } from '../types/analytics.types.js';
import { parseUserAgent } from '../utils/userAgent.js';
import { formatDate } from '../utils/date.js';
import { prisma }from '../config/database.js';

export class AnalyticsService {
  async createAnalytics(data: AnalyticsCreateData): Promise<void> {
    // Fire and forget - don't await
    prisma.analytics
      .create({
        data: {
          shortCode: data.shortCode,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      })
      //@ts-ignore
      .catch((err) => console.error('Analytics creation error:', err));
  }

  async getAnalytics(shortCode: string): Promise<AnalyticsResponse | null> {
    // Find URL info
    const urlInfo = await prisma.url.findFirst({
      where: {
        OR: [{ shortCode }, { customAlias: shortCode }],
      },
    });

    if (!urlInfo) return null;

    // Get unique visitors
    const uniqueVisitors = await prisma.analytics.groupBy({
      by: ['ipAddress'],
      where: { shortCode },
    });

    // Get total clicks
    const totalClicks = await prisma.analytics.count({
      where: { shortCode },
    });

    // Get clicks by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clicksByDay = await prisma.$queryRaw<ClicksByDay[]>`
      SELECT 
        DATE(click_time) as date, 
        COUNT(*)::int as clicks
      FROM analytics
      WHERE short_code = ${shortCode} 
        AND click_time >= ${sevenDaysAgo}
      GROUP BY DATE(click_time)
      ORDER BY date
    `;

    // Get device stats
    const allAnalytics = await prisma.analytics.findMany({
      where: { shortCode },
      select: { userAgent: true },
    });

    const deviceMap: Record<string, number> = {};
    //@ts-ignore
    allAnalytics.forEach((record) => {
      const device = parseUserAgent(record.userAgent);
      deviceMap[device] = (deviceMap[device] || 0) + 1;
    });

    const devices: DeviceStats[] = Object.entries(deviceMap)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    // Get recent clicks
    const recentClicks = await prisma.analytics.findMany({
      where: { shortCode },
      orderBy: { clickTime: 'desc' },
      take: 10,
      select: {
        clickTime: true,
        ipAddress: true,
        userAgent: true,
      },
    });

    return {
      success: true,
      url_info: {
        short_code: urlInfo.shortCode,
        long_url: urlInfo.longUrl,
        custom_alias: urlInfo.customAlias,
        created_at: urlInfo.createdAt,
        expires_at: urlInfo.expiresAt,
        click_count: Number(urlInfo.clickCount),
      },
      total_clicks: totalClicks,
      unique_visitors: uniqueVisitors.length,
      //@ts-ignore
      clicks_by_day: clicksByDay.map((row) => ({
        date: formatDate(new Date(row.date)),
        clicks: row.clicks,
      })),
      devices,
      recent_clicks: recentClicks,
    };
  }
}

export const analyticsService = new AnalyticsService();