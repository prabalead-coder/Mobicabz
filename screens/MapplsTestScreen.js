import React, {useEffect} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {getLatLngFromAddress} from '../services/mapplsHelper';
import {getAddressFromLatLng, getTravelledDistance} from '../api/mapplsApi';

const MapplsTestScreen = () => {
  const address1 =
    'No 20, Duraisamy St, Tirumurthy Nagar,Nungambakkam,Chennai - 600034.';
  const address2 =
    // 'DE0, Trivecta Digital Solutions Private Limited, Whispering Heights, Saint Marys Road, Demonte Colony, Alwarpet, Chennai.';
    '265A, Jothi Nagar, Vallalagaram, Mayiladuthurai - 609001.'

  useEffect(() => {
    const runTest = async () => {
      console.log('🔍 Getting coordinates from address1...');
      const startCoords = await getLatLngFromAddress(address1);
      console.log('📍 Start Coordinates:', startCoords);

      console.log('🔍 Getting coordinates from address2...');
      const endCoords = await getLatLngFromAddress(address2);
      console.log('📍 End Coordinates:', endCoords);

      if (startCoords && endCoords) {
        const {distance, duration} = await getTravelledDistance(
          startCoords,
          endCoords,
        );
        console.log(`🚗 Distance: ${distance} KM`);
        console.log(`🕒 Estimated Duration: ${duration} Hrs`);
      }

      console.log('🔍 Reverse geocoding from coordinates...');
      const address = await getAddressFromLatLng(endCoords.lat, endCoords.lng);
      console.log('📍 Reverse Geocoded Address:', address);
    };

    runTest();
  }, []);

  return (
    <ScrollView contentContainerStyle={{padding: 20, backgroundColor:'green'}}>
      <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>
        Mappls API Test Screen
      </Text>
      <Text>Testing:</Text>
      <Text>
        • getLatLngFromAddress (for: {address1} & {address2})
      </Text>
      <Text>• getDistance (between the above two)</Text>
      <Text>• reverseGeocode (both start & end)</Text>
      <Text style={{marginTop: 20, fontStyle: 'italic'}}>
        Open debug console to see detailed results.
      </Text>
    </ScrollView>
  );
};

export default MapplsTestScreen;
