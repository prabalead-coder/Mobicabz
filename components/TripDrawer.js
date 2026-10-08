import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ToastAndroid,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SQLite from 'react-native-sqlite-storage';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faCar,
  faRoad,
  faHome,
} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translationManager from '../translationManager';
import {log} from './Logger';
import {TranslationContext} from '../translationContext';
import config from '../config';
import { stopBackgroundService, stopIdleCheck } from '../Threads/BackgroundTask';

const TripDrawer = ({onClose, currentTripId, currentDriverId, currentScreen}) => {
  const [driverId, setDriverId] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverCity, setDriverCity] = useState('');
  const [driverType, setDriverType] = useState('');
  const [driverLicenseNo, setDriverLicenseNo] = useState('');
  const [driverLicenseValid, setDriverLicenseValid] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-300)).current; // Start off-screen
  const [currentDateTime, setCurrentDateTime] = useState('');
  const {changeAppLanguage} = useContext(TranslationContext);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0, // Move to visible position..
      duration: 200, //Slide Speed..
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const date = now.toDateString();
      const hours = String(now.getHours()).padStart(2, '0'); // Get hours and pad with leading zero
      const minutes = String(now.getMinutes()).padStart(2, '0'); // Get minutes and pad with leading zero

      // Set current date and time in 24-hour format
      setCurrentDateTime(`${date} - ${hours}:${minutes}`);
    };

    updateDateTime(); // Call initially to set the time immediately

    const intervalId = setInterval(updateDateTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []); // Empty dependency array means this effect runs once on mount

  const sendTripCancelled = async () => {
    try {
      console.log('Received DriverId = ' + currentDriverId);
      console.log('Received Trip Id = ' + currentTripId);
      console.log('Current Screen = ' + currentScreen);
      if (currentScreen == 'ARRIVED'){
        await stopIdleCheck();
      }
      if(currentScreen == 'DROPPED'){
        await stopBackgroundService();
      }
      const sendCancelData = async baseUrl => {
        const apiUrlwithQuery = `${baseUrl}${currentTripId}&did=${currentDriverId}&status=CANCELLED`;
        console.log('Trip Cancel Submit URL:', apiUrlwithQuery); // Log the URL being used
        const formData = new FormData();
        formData.append('date', currentDateTime);
        const authToken = await AsyncStorage.getItem('API_AUTH_TOKEN');
        const response = await Promise.race([
          fetch(apiUrlwithQuery, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${authToken}`},
            body: formData,
          }),
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error('Request timed out, check internet connection'),
                ),
              20000, // 20-second timeout
            ),
          ),
        ]);

        if (!response.ok) {
          log(
            `${currentTripId}: TRIP DRAWER - sendTripCancelled - Network response not Ok from ${baseUrl}: ${response.statusText}`,
          );
          throw new Error(
            `Network response was not ok from : ${apiUrlwithQuery} ` +
              response.statusText,
          );
        }
        return response;
      };

      let response;
      try {
        response = await sendCancelData(config.apiPostFinalSubmit);
        console.log('Primary Trip Cancel Submit API call successful.');
      } catch (initialError) {
        console.warn(
          'Primary Trip Cancel Submit API call failed, attempting alternative:',
          initialError.message,
        );
        log(
          `${currentTripId}: WARN - TRIP DRAWER - sendTripCancelled - Primary Final Submit API call failed, attempting alternative: ${initialError.message}`,
        );
        response = await sendCancelData(config.apiPostFinalSubmitAlt); // Try the alternative URL
        console.log('Alternative Trip Cancel Submit API call successful.');
      }

      const responseData = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);
      return response.status;
    } catch (error) {
      console.error('Trip Cancel Submit API Error:', error.message);
      log(
        `${currentTripId}: ERROR - TRIP DRAWER - sendTripCancelled - Trip Cancel Submit API Error: ${error.message}`,
      );
      throw error; // Re-throw the error so the caller can handle it (e.g., show an alert)
    }
  };

  const navigateToBookingList = () => {
    Alert.alert(
      'Are you sure, Go to the Home Screen ?',
      'Current Trip will be Closed !',
      [
        {
          text: 'Yes',
          onPress: async () => {
            await sendTripCancelled();
            navigation.navigate('BookingList');
            AsyncStorage.setItem('currentScreen', 'BookingList');
          },
        },
        {
          text: 'No',
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
    onClose();
  };

  return (
    <Animated.View
      style={[styles.drawerContainer, {transform: [{translateX: slideAnim}]}]}>
      <LinearGradient
        colors={['#070F2B', '#1B1A55', '#173B45']}
        style={styles.gradientBackground}>
        {/* <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <FontAwesomeIcon icon={faCircleArrowLeft} size={35} color="#fff" />
        </TouchableOpacity> */}

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuButton} onPress={onClose}>
            <FontAwesomeIcon icon={faCar} size={22} color="#fff" />
            <Text style={styles.menuButtonText}>
              {translationManager.getTranslation('goToTrip')}
            </Text>
            <FontAwesomeIcon
              icon={faCircleArrowRight}
              size={22}
              color="#00FF00"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton1}
            onPress={navigateToBookingList}>
            <FontAwesomeIcon
              icon={faCircleArrowLeft}
              size={22}
              color="#87CEEB"
            />
            <Text style={styles.menuButtonText}>
              {translationManager.getTranslation('goToHome')}
            </Text>
            <FontAwesomeIcon icon={faHome} size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '98%',
    height: '100%',
    zIndex: 1000,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  driverIcon: {
    width: 150,
    height: 150,
    borderRadius: 75, // half of width/height
    overflow: 'hidden', // ensures corners are clipped
    alignSelf: 'center',
    marginBottom: 10,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF9BF',
    textAlign: 'center',
    marginBottom: 5,
  },
  driverId: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  driverCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    elevation: 5, // Shadow for Android
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center', // vertically center icon + text
    justifyContent: 'center', // centers the whole row inside card
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8, // spacing between icon and text
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Aligns label and value neatly
    paddingVertical: 5, // Adds spacing between rows
  },
  value: {
    fontSize: 16,
    color: '#E8C5E5',
    fontWeight: 'bold',
    flex: 1.5, // Makes sure labels have equal space
  },
  label: {
    fontSize: 16,
    color: '#fff',
    flex: 1, // Gives slightly more space for longer values
    // textAlign: 'right', // Aligns values to the right
  },
  menuContainer: {
    marginTop: 200,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    height: 100,
    width: '100%',
    justifyContent: 'flex-end',
    borderLeftWidth: 6,
    borderLeftColor: '#00FF00',
  },
  menuButton1: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    height: 100,
    borderRightWidth: 6,
    borderRightColor: '#87CEEB',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '600',
    marginLeft: 15,
    marginRight: 15,
  },
});

export default TripDrawer;
