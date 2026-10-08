import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import { Colors } from '../config';

const BackButton = ({title, onPress, disabled}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}>
      <Text allowFontScaling={false} style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.buttons,
    width: 100,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    textAlign:'center'
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
    opacity: 0.6,
  },
});
