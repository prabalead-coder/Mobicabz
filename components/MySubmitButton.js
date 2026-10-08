import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import { Colors } from '../config';

const MySubmitButton = ({title, onPress, disabled, isLoading}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabledButton]}
      title={isLoading ? '' : title}
      onPress={onPress}
      disabled={disabled || isLoading}>
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color="#ffffff" />
        </>
      ) : (
        <Text allowFontScaling={false} style={styles.title}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default MySubmitButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.buttons,
    width: 100,
    height: 50,
    minHeight:50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2%',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
    opacity: 0.6,
  },
});
