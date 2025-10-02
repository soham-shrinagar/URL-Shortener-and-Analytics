import type { DeviceType } from '../types/common.types.js';

export const parseUserAgent = (userAgent: string | undefined | null): DeviceType => {
  if (!userAgent) return 'Unknown';

  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';

  return 'Other';
};