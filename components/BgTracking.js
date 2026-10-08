import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

const BgTracking = (isTracking) => {
  useEffect(() => {
    const configureBackgroundGeolocation = async () => {
      // Configure background geolocation service
      BackgroundGeolocation.configure({
        desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
        stationaryRadius: 50,
        distanceFilter: 50,
        notificationTitle: 'Background tracking',
        notificationText: 'enabled',
        debug: true,
        startOnBoot: false,
        stopOnTerminate: true,
        locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
        interval: 1200000,
        fastestInterval: 5000,
        activitiesInterval: 10000,
        stopOnStillActivity: false,
        url: 'http://192.168.81.15:3000/location',
        httpHeaders: {
          'X-FOO': 'bar'
        },
        // customize post properties
        postTemplate: {
          lat: '@latitude',
          lon: '@longitude',
          foo: 'bar' // you can also add your own properties
        }
      });

      BackgroundGeolocation.on('location', async (location) => {
        // Extract latitude, longitude, and timestamp
        const { latitude, longitude, time } = location;
        
        // Format timestamp to YYYY-MM-DD HH:mm:ss
        const timestamp = new Date(time).toISOString().replace('T', ' ').substring(0, 19);

        // Create location object with required properties
        const locationData = {
          latitude,
          longitude,
          timestamp
        };

         // Store location data in internal storage
         try {
            const storedLocations = await AsyncStorage.getItem('storedLocations');
            const parsedLocations = storedLocations ? JSON.parse(storedLocations) : [];
            parsedLocations.push(locationData);
            await AsyncStorage.setItem('storedLocations', JSON.stringify(parsedLocations));
          } catch (error) {
            console.error('Error storing location data:', error);
          }
      });
      BackgroundGeolocation.start(); //triggers start on start event

      BackgroundGeolocation.checkStatus(status => {
        console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
        console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
        console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

        // you don't need to check status before start (this is just the example)
        if (!status.isRunning) {
          BackgroundGeolocation.start(); //triggers start on start event
        }
      });

      // you can also just start without checking for status
      // BackgroundGeolocation.start();
    };

    configureBackgroundGeolocation();

    return () => {
      // unregister all event listeners
      BackgroundGeolocation.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (isTracking) {
      BackgroundGeolocation.start();
      console.log('Tracking Started');
    } else {
      BackgroundGeolocation.stop();
      console.log('Tracking Stopped');
    }
  }, [isTracking]);

  return null; // This component doesn't render anything visible
};

export default BgTracking;
