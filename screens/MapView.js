import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import config from '../config';

const TomTomMap = () => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Fetch the API key securely, e.g., from environment variables or a secure backend
    const fetchApiKey = async () => {
      const key = config.tomTomApiKey;
      setApiKey(key);
    };
    fetchApiKey();
  }, []);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>TomTom Map</title>
        <script src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.14.0/maps/maps-web.min.js"></script>
        <style type="text/css">
          #map {
            height: 100%;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          tt.setProductInfo('YourProductName', 'YourProductVersion');
          var map = tt.map({
            key: '${apiKey}',
            container: 'map',
            center: [13.0335,80.2531],
            zoom: 10
          });

          // Add a marker
          var marker = new tt.Marker().setLngLat([12.9811,80.1596]).addTo(map);
        </script>
      </body>
    </html>
  `;

  return apiKey ? (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={{ flex: 1 }}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView error: ', nativeEvent);
      }}
      onHttpError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView HTTP error: ', nativeEvent);
      }}
    />
  ) : null; // or a loading indicator
};

export default TomTomMap;
