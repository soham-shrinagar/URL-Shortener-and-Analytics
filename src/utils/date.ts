export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]!;
};

export const isExpired = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};