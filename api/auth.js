import AsyncStorage from '@react-native-async-storage/async-storage';
import {MAPPLS_CONFIG} from '../config';

export const getOAuthToken = async () => {
  const cached = await AsyncStorage.getItem(MAPPLS_CONFIG.TOKEN_STORAGE_KEY);
  const MAPPLS_CLIENT_ID = await AsyncStorage.getItem('MAPPLS_CONFIG.CLIENT_ID');
  const MAPPLS_CLIENT_SECRET = await AsyncStorage.getItem('MAPPLS_CONFIG.CLIENT_SECRET');
  const MAPPLS_OAUTH_URL = await AsyncStorage.getItem('MAPPLS_CONFIG.BASE_URL_OAUTH');

  if (cached) {
    const {token, expiry} = JSON.parse(cached);
    if (Date.now() < expiry) {
      console.log('MAPPLS OAuth Token : ' + token);
      return token;
    }
  }

  const body = new URLSearchParams();
  body.append('grant_type', 'client_credentials');
  body.append('client_id', MAPPLS_CLIENT_ID);
  body.append('client_secret', MAPPLS_CLIENT_SECRET);

  try {
    const response = await fetch(MAPPLS_OAUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ReactNativeApp',
      },
      body: body.toString(),
    });

    const data = await response.json();
    const token = data.access_token;
    const expiry = Date.now() + (data.expires_in - 60) * 1000; // Subtract 1 min as buffer

    await AsyncStorage.setItem(
      MAPPLS_CONFIG.TOKEN_STORAGE_KEY,
      JSON.stringify({token, expiry}),
    );

    return token;
  } catch (error) {
    console.error('OAuth error:', error);
    throw error;
  }
};
