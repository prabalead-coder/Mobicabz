import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import { Colors } from '../config';

const MyUploadButton = ({title, onPress,disabled}) => {
  return (
    <TouchableOpacity style={[styles.container, disabled && styles.disabledButton]} 
    onPress={onPress}
    disabled={disabled}>
      
      <Text allowFontScaling={false} style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

export default MyUploadButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.buttons,
    width: 60,
    height: 45,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal:6
  },
  title: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
    opacity: 0.6,
  },
});
