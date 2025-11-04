import { useState, useEffect } from 'react';
import { mockOrders } from '@fastfoodordering/data';
import { Order } from '@fastfoodordering/types';
import { LatLng } from 'react-native-maps'; // Import the native map type

// 1. Define the route and initial positions
const routeCoords: LatLng[] = [
  { latitude: 43.6612, longitude: -79.4001 }, // Start: Restaurant
  { latitude: 43.659, longitude: -79.395 }, // Waypoint 1
  { latitude: 43.657, longitude: -79.39 }, // Waypoint 2
  { latitude: 43.655, longitude: -79.385 }, // Waypoint 3
  { latitude: 43.653, longitude: -79.38 }, // End: Customer
];

const RESTAURANT_COORDS = routeCoords[0];
const CUSTOMER_COORDS = routeCoords[routeCoords.length - 1];

export function useCurrentOrder() {
  const [simulationActive, setSimulationActive] = useState(false);
  const [dronePosition, setDronePosition] = useState<LatLng>(RESTAURANT_COORDS);

  // 2. Find the current order (same logic as your web page)
  const currentOrder =
    mockOrders.find((order: Order) => order.status === 'Out for Delivery') ||
    mockOrders[0];

  // 3. The simulation logic
  useEffect(() => {
    if (simulationActive) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < routeCoords.length) {
          setDronePosition(routeCoords[index]);
          index++;
        } else {
          clearInterval(interval);
          setSimulationActive(false);
        }
      }, 2000); // Move every 2 seconds
      return () => clearInterval(interval);
    }
  }, [simulationActive]);

  // 4. Function to start the simulation
  const startSimulation = () => {
    setDronePosition(RESTAURANT_COORDS); // Reset to start
    setSimulationActive(true);
  };

  return {
    currentOrder,
    dronePosition,
    routeCoords,
    RESTAURANT_COORDS,
    CUSTOMER_COORDS,
    startSimulation,
  };
}