// Header.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ToastAndroid,
} from 'react-native';
import translations from '../translations';
import DeviceInfo from 'react-native-device-info';
import config from '../config';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {log, sendLogFile} from './Logger';
import SQLite from 'react-native-sqlite-storage';

const Header = ({ language, driverId, driverPhone }) => {
  const lang = language || 'en';
  const version = DeviceInfo.getVersion();


  const sendErrReport = () => {
    Alert.alert(
      'Send Error Report', // Title
      'Would you like to send the Error Report?', // Message
      [
        // Button array
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            console.log('Sending Error Report...');
            console.log('Fetched Driver Id from database: ', driverId);
            console.log('Fetched Phone from database: ', driverPhone);
            log('HDR: fetchDriverData - Fetched Driver Id:', driverId);
            log('HDR: fetchDriverData - Fetched Phone:', driverPhone);
            sendLogFile(driverId, driverPhone);
          },
        },
      ],
      {cancelable: false}, // Options
    );
  };
  return (
    <View style={styles.header}>
      <View style={styles.title}>
        <View style={styles.headerLogoView}>
          <Image style={styles.headerLogo} source={require('../logo.png')} />
        </View>
        <View style={styles.headerTextView}>
          <Text allowFontScaling={false} style={styles.headerText}>{translations.en.headerText}</Text>
        </View>
        {/* <View style={styles.headerErrView}>
          <TouchableOpacity style={styles.call}
          onPress={sendErrReport}
           >
            <FontAwesomeIcon
              style={styles.callIcon}
              icon={faExclamationTriangle}
              size={16}
              color="#012169"
            />
          </TouchableOpacity>
        </View> */}
      </View>
      <View style={styles.version}>
        <Text allowFontScaling={false} style={styles.versionText}>v{config.appVersion}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: '10%',
    backgroundColor: '#e6ffff',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingTop: '2%',
  },
  title: {
    flexDirection: 'row',
  },
  headerLogoView: {
    width: '30%',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  headerTextView: {
    width: '70%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: '1%',
  },
  headerErrView: {
    width: '20%',
    alignItems: 'flex-end',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    paddingRight: '2%',
    paddingTop: '2%',
  },
  headerLogo: {
    width: '75%',
    height: '90%',
  },
  headerErrIcon: {
    width: '15%',
    height: '15%',
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'ProtestStrike-Regular',
    color: 'black',
  },
  version: {
    alignItems: 'flex-end',
    paddingRight: '2%',
    paddingBottom: '2%',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 10,
    color: 'black',
    fontWeight: 'bold',
  },
});

export default Header;
