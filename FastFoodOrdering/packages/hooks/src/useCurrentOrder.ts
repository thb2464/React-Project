import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@fastfoodordering/utils';
import { useAppState } from '@fastfoodordering/store';
import { LatLng } from 'react-native-maps';

// Default: Ho Chi Minh City (Central Point)
const DEFAULT_LAT = 10.7769;
const DEFAULT_LNG = 106.7009;

export function useCurrentOrder() {
  const { token } = useAppState();
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  
  // Coordinates
  const [dronePosition, setDronePosition] = useState<LatLng>({ latitude: DEFAULT_LAT, longitude: DEFAULT_LNG });
  const [restaurantCoords, setRestaurantCoords] = useState<LatLng>({ latitude: DEFAULT_LAT, longitude: DEFAULT_LNG });
  const [customerCoords, setCustomerCoords] = useState<LatLng>({ latitude: DEFAULT_LAT, longitude: DEFAULT_LNG });
  
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  // 1. Poll for Order Data
  useEffect(() => {
    if (!token) return;
    const fetchOrder = async () => {
      try {
        const data = await apiClient('/orders/current', 'GET', null, token);
        if (data && data.order_id) {
          // Only update state if ID changed or status changed (to avoid jitter)
          setCurrentOrder((prev: any) => {
             if (!prev || prev.order_id !== data.order_id || prev.status !== data.status) {
                 return data;
             }
             return prev;
          });
          
          // --- FIX: Handle Missing Coordinates from DB ---
          const rLat = Number(data.lat) || DEFAULT_LAT;
          const rLng = Number(data.lng) || DEFAULT_LNG;
          
          // If delivery_lat is null, offset by ~1km (0.01 degrees) so we see a path
          const cLat = Number(data.delivery_lat) || (rLat + 0.01);
          const cLng = Number(data.delivery_lng) || (rLng + 0.01);
          
          const start = { latitude: rLat, longitude: rLng };
          const end = { latitude: cLat, longitude: cLng };
          
          setRestaurantCoords(start);
          setCustomerCoords(end);

          // If not simulating, snap drone to correct spot
          if (!isSimulating && !hasArrived) {
             if (data.status === 'delivered') setDronePosition(end);
             else setDronePosition(start);
          }
        } else {
          setCurrentOrder(null);
        }
      } catch (error) {
        // Silent fail
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [token, isSimulating, hasArrived]);

  // 2. API Call to Finish Order
  const finishOrder = async () => {
      if (!currentOrder) return;
      try {
          console.log("User confirming receipt...");
          await apiClient(`/orders/${currentOrder.order_id}/complete`, 'PATCH', null, token);
          // Optimistically update UI
          setCurrentOrder((prev: any) => prev ? ({ ...prev, status: 'delivered' }) : null);
          setHasArrived(false); // Reset for next time
      } catch (error) {
          console.error("Failed to complete order:", error);
      }
  };

  // 3. Simulation Function
  const startSimulation = () => {
    if (!currentOrder) return;
    if (simulationInterval.current) clearInterval(simulationInterval.current);
    
    setIsSimulating(true);
    setHasArrived(false);

    let progress = 0;
    const steps = 100; // 100 steps
    const duration = 10000; // 10 seconds flight time
    const stepTime = duration / steps;

    simulationInterval.current = setInterval(() => {
      progress += 1 / steps;
      
      if (progress >= 1) {
        progress = 1;
        if (simulationInterval.current) clearInterval(simulationInterval.current);
        setIsSimulating(false);
        setDronePosition(customerCoords); // Snap to end
        setHasArrived(true); // Show the "Confirm Receipt" button
        return;
      }

      // Linear Interpolation (Lerp) to move drone
      const newLat = restaurantCoords.latitude + (customerCoords.latitude - restaurantCoords.latitude) * progress;
      const newLng = restaurantCoords.longitude + (customerCoords.longitude - restaurantCoords.longitude) * progress;

      setDronePosition({ latitude: newLat, longitude: newLng });
    }, stepTime);
  };

  return {
    currentOrder,
    dronePosition,
    restaurantCoords,
    customerCoords,
    startSimulation,
    isSimulating,
    hasArrived,
    finishOrder // Exposed for the UI Button
  };
}