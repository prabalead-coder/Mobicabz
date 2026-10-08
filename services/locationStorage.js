import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_KEY = 'tracked_locations';

export const saveLocation = async newCoord => {
  try {
    const existing = await AsyncStorage.getItem(LOCATION_KEY);
    const locations = existing ? JSON.parse(existing) : [];
    locations.push(newCoord);
    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(locations));
    console.log('Tracked Location Saved in locationStorage');
  } catch (e) {
    console.error('Error saving location:', e);
  }
};

export const getLocationArray = async () => {
  try {
    const data = await AsyncStorage.getItem(LOCATION_KEY);
    console.log('Tracked Locations retrieved from locationStorage');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error retrieving locations:', e);
    return [];
  }
};

export const getCoordinatesForURL = async () => {
  const coords = await getLocationArray();
  const arrayLength = coords.length;
  console.log('Length of the Locations Array : ', arrayLength);
  return {joinedCoords: coords.join(';'), arrayLength};
};

export const clearLocations = async () => {
  try {
    await AsyncStorage.removeItem(LOCATION_KEY);
    console.log('Tracked Locations cleared from locationStorage');
  } catch (e) {
    console.error('Error clearing locations:', e);
  }
};
