import type { Request } from 'express';

export const extractIpAddress = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  
  if (typeof forwarded === 'string') {
    //@ts-ignore
    return forwarded.split(',')[0].trim();
  }
  
  if (Array.isArray(forwarded)) {
    //@ts-ignore
    return forwarded[0].split(',')[0].trim();
  }
  
  return req.socket.remoteAddress || 'unknown';
};