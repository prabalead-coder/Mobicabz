import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import config from '../config';
import axios from 'axios';

const TOMTOM_API_KEY = config.tomTomApiKey;

const TomTomMap = () => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const start = [52.360306, 4.870318];  // Amsterdam coordinates
        const pickup = [52.370216, 4.895168]; // Example pickup point (Amsterdam)
        const dropOff = [52.520008, 13.404954]; // Berlin coordinates (drop-off)

        const waypoints = [
          { lat: pickup[0], lon: pickup[1] },
          { lat: dropOff[0], lon: dropOff[1] },
          { lat: start[0], lon: start[1] }
        ];

        const routePromises = waypoints.map((point, index) => {
          const origin = index === 0 ? start : waypoints[index - 1];
          const destination = point;
          console.log('Origin :',origin[0], origin[1]);
          return axios.get(`https://api.tomtom.com/routing/1/calculateRoute/${origin[0]},${origin[1]}:${destination.lat},${destination.lon}/json?key=${TOMTOM_API_KEY}`);
        });

        const responses = await Promise.all(routePromises);
        let route = [];
        responses.forEach(response => {
          const segment = response.data.routes[0].legs[0].points.map(point => ({
            latitude: point.latitude,
            longitude: point.longitude,
          }));
          route = route.concat(segment);
        });

        setRouteCoordinates(route);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchRoute();
  }, []);

  if (loading) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 52.360306,
        longitude: 4.870318,
        latitudeDelta: 10,
        longitudeDelta: 10,
      }}
    >
      <Marker coordinate={{ latitude: 52.360306, longitude: 4.870318 }} title="Start" />
      <Marker coordinate={{ latitude: 52.370216, longitude: 4.895168 }} title="Pickup" />
      <Marker coordinate={{ latitude: 52.520008, longitude: 13.404954 }} title="Drop-off" />
      <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="red" />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TomTomMap;
