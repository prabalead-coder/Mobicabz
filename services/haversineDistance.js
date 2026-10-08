import { useState, useRef, useCallback } from 'react';
import { log } from '../components/Logger';

// Haversine formula
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
};

// Custom hook
export const useTravelledDistance = () => {
  const [totalDistance, setTotalDistance] = useState(0);
  const lastCoord = useRef(null);

  const addCoordinate = useCallback((coord) => {
    console.log(`New coordinate received: ${coord}`);
    log(`ARRIVED - addCoordinate - Received new coord: ${coord}`);

    const [lat, lon] = coord.split(',').map(Number);

    if (lastCoord.current) {
      const [lastLat, lastLon] = lastCoord.current;
      const dist = haversineDistance(lastLat, lastLon, lat, lon);

      console.log(`Calculated distance between points: ${dist.toFixed(4)} km`);
      log(`ARRIVED - addCoordinate - Distance calculated: ${dist.toFixed(4)} km`);

      setTotalDistance(prev => {
        const newTotal = prev + dist;

        console.log(`Updated total distance: ${newTotal.toFixed(4)} km`);
        log(`ARRIVED - addCoordinate - Total updated: ${newTotal.toFixed(4)} km`);

        return newTotal;
      });
    } else {
      console.log("First coordinate stored, no distance calculated.");
      log("ARRIVED - addCoordinate - First coordinate, starting trip");
    }

    lastCoord.current = [lat, lon];
  }, []);

  return { totalDistance, addCoordinate };
};
