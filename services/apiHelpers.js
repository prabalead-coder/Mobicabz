// utils/apiHelpers.js

import { API_CONFIG } from '../config';

// 1. Route URL
export function buildRouteUrl(startLat, startLong, endLat, endLong) {
  const { ROUTING_BASE_URL, DEFAULT_ROUTING_PARAMS, API_KEY } = API_CONFIG.TOMTOM;

  const queryParams = new URLSearchParams({
    ...DEFAULT_ROUTING_PARAMS,
    key: API_KEY,
  }).toString();

  return `${ROUTING_BASE_URL}/${startLat},${startLong}:${endLat},${endLong}/json?${queryParams}`;
}

// 2. Reverse Geocoding URL
export function buildReverseGeocodingUrl(latitude, longitude) {
  const { SEARCH_BASE_URL, API_KEY } = API_CONFIG.TOMTOM;

  return `${SEARCH_BASE_URL}/reverseGeocode/${latitude},${longitude}.json?key=${API_KEY}`;
}

// 3. Geocoding URL
export function buildGeocodingUrl(address) {
  const { SEARCH_BASE_URL, API_KEY } = API_CONFIG.TOMTOM;

  const encodedAddress = encodeURIComponent(address);

  return `${SEARCH_BASE_URL}/geocode/${encodedAddress}.json?key=${API_KEY}`;
}
