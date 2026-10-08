import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

const SubmitUploadButton = ({title, onPress, disabled}) => {
  return (
    <TouchableOpacity style={[styles.container, disabled && styles.disabledButton]} 
    onPress={onPress}
    disabled={disabled}>
      <Text allowFontScaling={false} style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

export default SubmitUploadButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0c4160',
    width: '27%',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal:6,
    marginBottom:7,
  },
  title: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
    opacity: 0.6,
  },
});
