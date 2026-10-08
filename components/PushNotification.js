import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import {
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';

const PushNotification = () => {
  useEffect(() => {
    const messaging = getMessaging();
    const unsubscribe = onTokenRefresh(messaging, async newToken => {
      console.log('A new FCM token refreshed:', newToken);
      // You may need to send this token to your server to send push notifications
    });

    return unsubscribe;
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const messaging = getMessaging();
      await requestPermission(messaging);
      const token = await getToken(messaging);
      console.log('FCM token:', token);
      // You may need to send this token to your server to send push notifications
    } catch (error) {
      console.log('Permission rejected:', error);
    }
  };

  return (
    <View>
      <Button title="Request Permission" onPress={requestNotificationPermission} />
    </View>
  );
};

export default PushNotification;
