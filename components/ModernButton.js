import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const ModernButton = ({onPress, disabled, text, loading}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, (disabled || loading) && styles.disabledButton]}>
      <LinearGradient
        colors={
          disabled || loading ? ['#A9A9A9', '#A9A9A9'] : ['#008080', '#009900']
        }
        start={{x: 0, y: 0}}
        end={{x: 0.7, y: 0}}
        style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" /> // Show loader when loading is true
        ) : (
          <Text style={styles.buttonText}>{text}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    overflow: 'hidden', // Ensures gradient stays within the button
    marginVertical: 10,
    width: '100%',
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'sans-serif-medium',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ModernButton;
