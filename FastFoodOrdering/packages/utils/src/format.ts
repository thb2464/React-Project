// Simple currency formatter
export const formatPrice = (amount: number): string => {
  if (amount === undefined || amount === null) return '$0.00';
  return `$${Number(amount).toFixed(2)}`;
};