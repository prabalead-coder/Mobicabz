import React from 'react';
import {View, Text, TouchableOpacity, Linking, StyleSheet,Alert} from 'react-native';

const ETCLink = () => {
  const currentYear = new Date().getFullYear();
  const handleLinkPress = () => {
    Alert.alert(
      'Open Link 🔗', 
      'Confirm to open ETC website ↗️',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Link opening cancelled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => Linking.openURL('https://www.expresstravelcorp.com/'),
        },
      ],
      {cancelable: false}, 
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <Text allowFontScaling={false} style={styles.footerText}>
          © {currentYear}.{' '}
        </Text>
      </View>
      <View>
        <TouchableOpacity onPress={handleLinkPress}>
          <View style={styles.linkContainer}>
            <Text allowFontScaling={false} style={styles.link}>
              EXPRESS TRAVEL CORPORATE SERVICES PVT LTD.{' '}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View>
        <Text allowFontScaling={false} style={styles.footerText}>
          All Rights Reserved.
        </Text>
      </View>
      <View></View>
    </View>
  );
};

export default ETCLink;

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
    fontSize: 8,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 8,
  },
});
