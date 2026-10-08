import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import messaging from '@react-native-firebase/messaging';

const PushNotification = () => {
  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
      console.log('A new FCM token refreshed:', newToken);
      // You may need to send this token to your server to send push notifications
    });

    return unsubscribe;
  }, []);

  const requestPermission = async () => {
    try {
      await messaging().requestPermission();
      const token = await messaging().getToken();
      console.log('FCM token:', token);
      // You may need to send this token to your server to send push notifications
    } catch (error) {
      console.log('Permission rejected:', error);
    }
  };

  return (
    <View>
      <Button title="Request Permission" onPress={requestPermission} />
    </View>
  );
};

export default PushNotification;
