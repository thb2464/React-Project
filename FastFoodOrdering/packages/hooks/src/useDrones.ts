import { useState, useEffect } from 'react';
import { apiClient } from '@fastfoodordering/utils';
import { useAppState } from '@fastfoodordering/store';

export interface Drone {
  drone_id: number;
  name: string;
  status: 'idle' | 'charging' | 'in_flight' | 'maintenance' | 'offline';
  battery: number;
  current_lat?: number;
  current_lng?: number;
}

export function useDrones() {
  const { token } = useAppState();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrones = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        // Assuming your server has this endpoint (from your Batch 2 routes)
        const data = await apiClient('/drones/', 'GET', null, token);
        setDrones(data);
      } catch (err) {
        console.error('Fetch Drones Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrones();
    // Poll every 10 seconds to track battery/location changes
    const interval = setInterval(fetchDrones, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Client-side Filtering
  const filteredDrones = drones.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate Stats
  const statusCounts = {
    total: drones.length,
    idle: drones.filter(d => d.status === 'idle').length,
    in_flight: drones.filter(d => d.status === 'in_flight').length,
    charging: drones.filter(d => d.status === 'charging').length,
    offline: drones.filter(d => d.status === 'offline').length,
  };

  return {
    drones,
    filteredDrones,
    statusCounts,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    isLoading
  };
}