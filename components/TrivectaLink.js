import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Alert,
} from 'react-native';

const TrivectaLink = () => {
  const handleLinkPress = () => {
    Alert.alert(
      'Open Link 🔗',
      'Confirm to open Trivecta website ↗️',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Link opening cancelled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => Linking.openURL('https://www.trivectadigital.com/'),
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <Text allowFontScaling={false} style={styles.footerText}>
          Developed by{' '}
        </Text>
      </View>
      <View>
        <TouchableOpacity onPress={handleLinkPress}>
          <View style={styles.linkContainer}>
            <Text allowFontScaling={false} style={styles.link}>
              Trivecta Digital
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View>
        <Text allowFontScaling={false} style={styles.footerText}>
          .
        </Text>
      </View>
      <View></View>
    </View>
  );
};

export default TrivectaLink;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  linkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    color: '#82c3c5',
    textDecorationLine: 'underline',
    fontSize: 9,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 9,
  },
});
