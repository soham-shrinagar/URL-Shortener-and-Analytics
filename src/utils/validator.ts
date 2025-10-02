export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidCustomAlias = (alias: string): boolean => {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(alias);
};