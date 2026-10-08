import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

const RefreshButton = ({title, onPress, disabled}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}>
      <Text allowFontScaling={false} style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

export default RefreshButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#012169',
    width: 35,
    height: 35,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight:'2%',
    maxHeight:50,
  },
  title: {
    color: 'white',
    fontSize: 8,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
    opacity: 0.6,
  },
});
