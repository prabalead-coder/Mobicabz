import {StyleSheet, Text, TouchableOpacity,ActivityIndicator, View} from 'react-native';
import React from 'react';

const FlowButton = ({title, onPress, disabled, disabledStyle, isLoading}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
      disabledStyle={disabledStyle}>
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

export default FlowButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#012169',
    width: '65%',
    height: '20%',
    maxHeight: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '5%',
    padding: '2%',
  },
  title: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
    opacity: 0.6,
  },
});
