
export interface AnalyticsResponse {
  success: boolean;
  url_info: UrlInfo;
  total_clicks: number;
  unique_visitors: number;
  clicks_by_day: ClicksByDay[];
  devices: DeviceStats[];
  recent_clicks: RecentClick[];
}

export interface UrlInfo {
  short_code: string;
  long_url: string;
  custom_alias: string | null;
  created_at: Date;
  expires_at: Date | null;
  click_count: number;
}

export interface ClicksByDay {
  date: string;
  clicks: number;
}

export interface DeviceStats {
  device: string;
  count: number;
}

export interface RecentClick {
  clickTime: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AnalyticsCreateData {
  shortCode: string;
  ipAddress: string;
  userAgent: string;
}
