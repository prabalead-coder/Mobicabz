// services/distanceTracker.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import {log} from '../components/Logger';

let lastCoordinate = null;
const DISTANCES_KEY = 'TRACKED_DISTANCES';

// Calculate distance between two points using Mappls API
export const getDistanceBetweenTwoPoints = async (coord1, coord2) => {
  try {
    const MAPPLS_API_KEY = await AsyncStorage.getItem('MAPPLS_CONFIG.API_KEY');
    const MAPPLS_DISTANCE_URL = await AsyncStorage.getItem(
      'MAPPLS_CONFIG.BASE_URL_DISTANCE',
    );

    console.log(`🛣️ Received Coords: ${coord1} : ${coord2}`);

    const coordsWithParams = `${coord1};${coord2}`;

    const url = MAPPLS_DISTANCE_URL.replace('{0}', MAPPLS_API_KEY).replace(
      '{1}',
      coordsWithParams,
    );

    console.log('🛣️ Distance Matrix Request URL:', url);

    const response = await fetch(url);
    const data = await response.json();

    console.log('🛣️ Distance Matrix Response:', JSON.stringify(data, null, 2));

    const distance = data.routes[0].distance ?? 0;
    return distance;
  } catch (err) {
    console.error('Failed to get travelled distance:', err);
    return null;
  }
};

// Store a new segment distance in AsyncStorage
export const addSegmentDistance = async distance => {
  try {
    const distances = await getStoredDistances();
    distances.push(distance);
    await AsyncStorage.setItem(DISTANCES_KEY, JSON.stringify(distances));
    console.log('🚩 Updated TRACKED_DISTANCES value: ' + distances);
    log(`DISTANCE_TRACKER - 🚩 Updated TRACKED_DISTANCES value: ${distances}`);
  } catch (e) {
    console.error('Error storing segment distance:', e);
  }
};

// Retrieve stored distances
export const getStoredDistances = async () => {
  try {
    const data = await AsyncStorage.getItem(DISTANCES_KEY);
    console.log('🚩 Retrieved TRACKED_DISTANCES value: ' + distances);
    log(
      `DISTANCE_TRACKER - 🚩 Retrieved TRACKED_DISTANCES value: ${distances}`,
    );
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error retrieving distances:', e);
    return [];
  }
};

// Get total distance in km
export const getTotalDistance = async () => {
  const distances = await getStoredDistances();
  const totalMeters = distances.reduce((sum, d) => {
    const num = Number(d);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
  console.log('Map Calculated Distance in Metres : ' + totalMeters);
  log(
    'DISTANCE_TRACKER - 🗺️ Map Calculated Distance in Metres : ' + totalMeters,
  );
  const totalKm = totalMeters / 1000;
  console.log('🗺️ Map Calculated Trip Distance : ' + totalKm);
  log(`DISTANCE_TRACKER - 🗺️ Map Calculated Trip Distance: ${totalKm}Km`);
  return totalKm.toFixed(2); // km
};

// Main function to handle new location
export const handleNewLocation = async newCoord => {
  if (lastCoordinate) {
    if (lastCoordinate !== newCoord) {
      const distance = await getDistanceBetweenTwoPoints(
        lastCoordinate,
        newCoord,
      );
      await addSegmentDistance(distance);
    }
  }
  lastCoordinate = newCoord; // Update last coordinate
};

// Clear stored distance values
export const clearTravelledDistances = async () => {
  try {
    await AsyncStorage.removeItem(DISTANCES_KEY);
    console.log('✅ Cleared travelled distances');
    log('DISTANCE_TRACKER - ✅ Cleared travelled distances');
  } catch (err) {
    console.error('Error clearing distances:', err);
  }
};

//save new coords
export const saveCoordinate = async coordsString => {
  try {
    const coords = await AsyncStorage.getItem('routeCoords');
    let coordArray = coords ? JSON.parse(coords) : [];

    coordArray.push(coordsString);
    await AsyncStorage.setItem('routeCoords', JSON.stringify(coordArray));

    log('DISTANCE_TRACKER - saveCoordinate - Saved:', coordsString);
    console.log('DISTANCE_TRACKER - saveCoordinate - Saved:', coordsString);
    log(
      'DISTANCE_TRACKER - saveCoordinate - Updated Coords Array:',
      await AsyncStorage.getItem('routeCoords'),
    );
    console.log(
      'DISTANCE_TRACKER - saveCoordinate - Updated Coords Array:',
      await AsyncStorage.getItem('routeCoords'),
    );
  } catch (error) {
    log(
      'DISTANCE_TRACKER - saveCoordinate - Error saving coordinate',
      error.message,
    );
  }
};

const buildCoordinateString = async () => {
  try {
    const coords = await AsyncStorage.getItem('routeCoords');
    const coordArray = coords ? JSON.parse(coords) : [];

    if (coordArray.length < 2) {
      log('DISTANCE_TRACKER - buildCoordinateString - Not enough coordinates');
      console.log(
        'DISTANCE_TRACKER - buildCoordinateString - Not enough coordinates',
      );
      return null;
    }

    // join with ;
    const coordString = coordArray.join(';');
    log(
      'DISTANCE_TRACKER - buildCoordinateString - Built string:',
      coordString,
    );
    console.log(
      'DISTANCE_TRACKER - buildCoordinateString - Built string:',
      coordString,
    );
    return coordString;
  } catch (error) {
    log('DISTANCE_TRACKER - buildCoordinateString - Error', error.message);
    console.log(
      'DISTANCE_TRACKER - buildCoordinateString - Error',
      error.message,
    );
    return null;
  }
};

// fetch trip distance using Route API
export const fetchRouteDistance = async () => {
  try {
    const MAPPLS_API_KEY = await AsyncStorage.getItem('MAPPLS_CONFIG.API_KEY');
    const coordString = await buildCoordinateString();
    if (!coordString) return null;
    const MAPPLS_ROUTE_URL = await AsyncStorage.getItem(
      'MAPPLS_CONFIG.BASE_URL_DISTANCE',
    );

    const url = MAPPLS_ROUTE_URL.replace('{0}', MAPPLS_API_KEY).replace(
      '{1}',
      coordString,
    );

    log('DISTANCE_TRACKER - fetchRouteDistance - API URL:', url);
    console.log('DISTANCE_TRACKER - fetchRouteDistance - API URL:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (data?.routes?.length > 0) {
      const distanceMeters = data.routes[0].distance;
      const distanceKm = (distanceMeters / 1000).toFixed(2);

      log(
        'DISTANCE_TRACKER - fetchRouteDistance - Distance received:',
        distanceKm,
      );
      console.log(
        'DISTANCE_TRACKER - fetchRouteDistance - Distance received:',
        distanceKm,
      );
      return distanceKm;
    }

    return null;
  } catch (error) {
    log('DISTANCE_TRACKER - fetchRouteDistance - Error', error.message);
    console.log('DISTANCE_TRACKER - fetchRouteDistance - Error', error.message);
    return null;
  }
};

export const clearCoordinates = async () => {
  try {
    await AsyncStorage.removeItem('routeCoords');
    log('DISTANCE_TRACKER - clearCoordinates - Cleared all coordinates');
    console.log(
      'DISTANCE_TRACKER - clearCoordinates - Cleared all coordinates',
    );
  } catch (error) {
    log(
      'DISTANCE_TRACKER - clearCoordinates - Error clearing coordinates',
      error.message,
    );
    console.log(
      'DISTANCE_TRACKER - clearCoordinates - Error clearing coordinates',
      error.message,
    );
  }
};
