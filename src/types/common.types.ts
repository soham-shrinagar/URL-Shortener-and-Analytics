export interface HealthCheckResponse {
  status: 'OK' | 'ERROR';
  timestamp: Date;
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
  error?: string;
}

export interface CacheData {
  longUrl: string;
  expiresAt?: Date | null;
}

export type DeviceType = 'Mobile' | 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Other' | 'Unknown';