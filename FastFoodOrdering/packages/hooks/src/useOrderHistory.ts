import { useState, useEffect } from 'react';
import { mockOrders } from '@fastfoodordering/data';
import { Order } from '@fastfoodordering/types';

export function useOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // In a real app, you'd fetch this. Here we just load the mock data.
    const pastOrders = mockOrders.filter(
      (order) => order.status === 'Delivered'
    );
    setOrders(pastOrders);
  }, []);

  return {
    orders,
  };
}