import React from 'react';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';

const ETCLoader = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../logo.png')} style={styles.logo} />
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20, // Adjust margin bottom as needed
  },
});

export default ETCLoader;
