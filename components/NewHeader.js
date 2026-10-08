import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faBars} from '@fortawesome/free-solid-svg-icons';
import translations from '../translations';
import config from '../config';
import CustomDrawer from './CustomDrawer';
import TripDrawer from './TripDrawer';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../config';

const NewHeader = ({showDrawer, showTripDrawer, currentTripId, currentDriverId, currentScreen}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false);
  const navigation = useNavigation();

  // // Fetch current screen from AsyncStorage
  // useEffect(() => {
  //   const getScreen = async () => {
  //     const currentScreen = await AsyncStorage.getItem('currentScreen');
  //     setCurrentScreen(currentScreen);
  //   };
  //   getScreen();
  // }, []);

  return (
    <>
      {/* Custom Drawer - always available when open */}
      {showDrawer && isDrawerOpen && (
        <CustomDrawer onClose={() => setIsDrawerOpen(false)} />
      )}

      {/* Custom Drawer - always available when open */}
      {showTripDrawer && isTripDrawerOpen && (
        <TripDrawer onClose={() => setIsTripDrawerOpen(false)} 
        currentTripId = {currentTripId}
        currentDriverId = {currentDriverId}
        currentScreen = {currentScreen}
        />
      )}

      {/* Header Section - always visible */}
      <LinearGradient
        //colors={Colors.footerGradient}
        colors={['#065758', '#0c4160']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        <View style={styles.title}>
          {/* Left: Drawer Menu Button - conditionally visible */}
          {showDrawer && (
            <TouchableOpacity
              onPress={() => setIsDrawerOpen(true)}
              style={styles.menuButton}>
              <FontAwesomeIcon icon={faBars} size={26} color="#ffffff" />
            </TouchableOpacity>
          )}

          {/* Left: Trip Drawer Menu Button - conditionally visible */}
          {showTripDrawer && (
            <TouchableOpacity
              onPress={() => setIsTripDrawerOpen(true)}
              style={styles.menuButton}>
              <FontAwesomeIcon icon={faBars} size={26} color="#ffffff" />
            </TouchableOpacity>
          )}          

          {/* Logo */}
          <Image style={styles.headerLogo} source={require('../logo.png')} />

          {/* Center: Header Text */}
          <Text allowFontScaling={false} style={styles.headerText}>
            {translations.en.headerText}
          </Text>

          {/* Right: App Version */}
          <Text allowFontScaling={false} style={styles.versionText}>
            v{config.appVersion}
          </Text>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: '7%',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    paddingRight: 10,
  },
  headerLogo: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'Roboto',
    letterSpacing: 1,
  },
  versionText: {
    fontSize: 12,
    color: '#dfe6e9',
    fontWeight: '600',
  },
});

export default NewHeader;
