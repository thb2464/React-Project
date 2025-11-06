import { useState, useMemo } from 'react';
import { mockDrones } from '@fastfoodordering/data';
import { Drone } from '@fastfoodordering/types';

export function useDrones() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'available', 'delivering', 'offline'

  // Calculate stats and filtered list
  const { filteredDrones, statusCounts } = useMemo(() => {
    // Calculate stats
    const available = mockDrones.filter(
      (d: Drone) => d.status === 'Available'
    ).length;
    const delivering = mockDrones.filter(
      (d: Drone) => d.status === 'Delivering'
    ).length;
    const offline = mockDrones.filter(
      (d: Drone) => d.status === 'Offline'
    ).length;
    const total = mockDrones.length;

    // Filter the list
    const filtered = mockDrones.filter((drone: Drone) => {
      const matchesSearch = drone.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' || drone.status.toLowerCase() === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return {
      filteredDrones: filtered,
      statusCounts: { available, delivering, offline, total },
    };
  }, [searchTerm, filterStatus]);

  return {
    filteredDrones,
    statusCounts,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
  };
}