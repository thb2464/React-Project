import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@fastfoodordering/utils';
import { useAppState } from '@fastfoodordering/store';
import { Order } from '@fastfoodordering/types';

export function useOrderHistory() {
  const { token, user } = useAppState();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await apiClient('/orders/history', 'GET', null, token);
      setOrders(data);
    } catch (err) {
      console.error('History Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Poll for updates every 10 seconds (Auto-sync status changes)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [token, fetchHistory]);

  return { orders, isLoading, refresh: fetchHistory };
}