import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Button, Image, Text } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import axios from 'axios';
import ViewShot from 'react-native-view-shot';

const MapScreen = () => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState(null);
  const viewShotRef = useRef(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await axios.post(
          'https://api.openrouteservice.org/v2/directions/driving-car',
          {
            coordinates: [
              [8.34234, 48.23424],  // Start point
              [8.34423, 48.26424]   // End point
            ],
            format: 'geojson'
          },
          {
            headers: {
              'Authorization': '5b3ce3597851110001cf62480051aecd5298498998ec5ff80c597f1a',
              'Content-Type': 'application/json'
            }
          }
        );
        console.log("API Response: ", response.data);
        
        const coordinates = response.data.features[0].geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));

        setRouteCoordinates(coordinates);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching route: ", error);
        setLoading(false);
      }
    };

    fetchRoute();
  }, []);

  const captureMap = () => {
    viewShotRef.current.capture().then(uri => {
      setImageUri(uri);
      console.log("Image saved to", uri);
    });
  };

  if (loading) {
    return <View style={styles.loading}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} style={styles.mapContainer}>
        <MapView style={styles.map} initialRegion={{
          latitude: 48.23424,
          longitude: 8.34234,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
          <Marker coordinate={{ latitude: 48.23424, longitude: 8.34234 }} />
          <Marker coordinate={{ latitude: 48.26424, longitude: 8.34423 }} />
          <Polyline coordinates={routeCoordinates} strokeColor="#000" strokeWidth={3} />
        </MapView>
      </ViewShot>
      <Button title="Capture Map" onPress={captureMap} />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.capturedImage} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    width: '100%',
    height: '80%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedImage: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
});

export default MapScreen;
