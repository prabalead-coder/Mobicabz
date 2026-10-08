import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

const MyButton = ({title, onPress, disabled}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}>
      <Text allowFontScaling={false} style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

export default MyButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#012169',
    width: '30%',
    height: '50%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight:'2%',
    maxHeight:50,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
    opacity: 0.6,
  },
});
