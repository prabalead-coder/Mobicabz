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
  faUser,
  faHistory,
  faLanguage,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translationManager from '../translationManager';
import {log} from './Logger';
import {TranslationContext} from '../translationContext';

const CustomDrawer = ({onClose}) => {
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
  const {changeAppLanguage} = useContext(TranslationContext);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0, // Move to visible position..
      duration: 200, //Slide Speed..
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const db = await SQLite.openDatabase({
          name: 'expressDb.db',
          location: 'default',
        });

        const [resultSet] = await db.executeSql(
          'SELECT * FROM driverData LIMIT 1;',
        );

        console.log('Fetched Driver Data: '+JSON.stringify(resultSet.rows.item(0)));

        if (resultSet.rows.length > 0) {
          const driver = resultSet.rows.item(0);
          setDriverId(driver.DriverID);
          setDriverName(driver.DriverName);
          setDriverPhone(driver.DriverPhone);
          setDriverCity(driver.City);
          setDriverLicenseNo(driver.LicenseNumber);
          const formattedLicenseDate = driver.LicenseRenewalDate.split('T')[0];
          setDriverLicenseValid(formattedLicenseDate);
          setDriverType(driver.DriverType);
          console.log('Fetched Driver ID:', driver.DriverID);
        } else {
          console.warn('No driver data found.');
        }

        await db.close();
      } catch (error) {
        console.error('Error fetching DriverID:', error);
        log('fetchDriverID - Error:', error.message);
      }
    };
    fetchDriverData();
  }, []);

  const handleLogout = async () => {
    try {
      Alert.alert(
        translationManager.getTranslation('alertLogout'),
        translationManager.getTranslation('alertSureLogout'),
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: async () => {
              await AsyncStorage.setItem('userLoggedIn', 'false');
              await AsyncStorage.setItem('currentScreen', 'Login');
              navigation.replace('Login');
              console.log('LoggedOut status changed successfully.');
              log('CUSTOM_DRAWER: handleLogout - User LoggedOut.');
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      console.error('Error setting login status:', error);
      log(
        'CUSTOM_DRAWER: handleLogout - Error setting login status: ',
        error.message,
      );
    }
  };

  const formatDate = dateString => {
    const dateObj = new Date(dateString);
    const options = {day: '2-digit', month: 'short', year: 'numeric'};
    return dateObj.toLocaleDateString('en-GB', options);
  };

  const navigateToHistory = () => {
    navigation.navigate('History');
    onClose();
  };

  const changeLanguage = () => {
    Alert.alert(
      'Change Language',
      'Select a Language',
      [
        {
          text: 'English',
          onPress: async () => {
            await changeAppLanguage('en'); //context function
            // translationManager.changeLanguage('en');
            // await AsyncStorage.setItem('language', 'en');
            console.log('Language changed to English.');
            log('CUSTOM_DRAWER: changeLanguage - Language changed to English.');
            onClose();
            ToastAndroid.show(
              'Language changed to English',
              ToastAndroid.SHORT,
            );
          },
        },
        {
          text: 'हिंदी',
          onPress: async () => {
            await changeAppLanguage('hi'); //context function
            // translationManager.changeLanguage('hi');
            // await AsyncStorage.setItem('language', 'hi');
            console.log('Language changed to Hindi.');
            log('CUSTOM_DRAWER: changeLanguage - Language changed to Hindi.');
            onClose();
            ToastAndroid.show('भाषा बदलकर हिंदी हो गई', ToastAndroid.SHORT);
          },
        },
      ],
      {cancelable: false},
    );
  };
  return (
    <Animated.View
      style={[styles.drawerContainer, {transform: [{translateX: slideAnim}]}]}>
      <LinearGradient
        colors={['#070F2B', '#1B1A55', '#173B45']}
        style={styles.gradientBackground}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <FontAwesomeIcon icon={faCircleArrowLeft} size={28} color="#fff" />
        </TouchableOpacity>

        <Image
          style={styles.driverIcon}
          source={require('../driver_icon.png')}
        />
        <Text style={styles.driverName}>{driverName}</Text>
        <View style={styles.driverCard}>
          <View style={styles.cardHeader}>
            <FontAwesomeIcon icon={faUser} size={22} color="#fff" />
            <Text style={styles.cardTitle}>
              {translationManager.getTranslation('driverProfileHeading')}
            </Text>
          </View>
          <View style={styles.cardDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.label}>
              {translationManager.getTranslation('Id')}:
            </Text>
            <Text style={styles.value}>{driverId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>
              {translationManager.getTranslation('driverTypeLabel')}:
            </Text>
            <Text style={styles.value}>{driverType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>
              {translationManager.getTranslation('driverCityLabel')}:
            </Text>
            <Text style={styles.value}>{driverCity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>
              {translationManager.getTranslation('drivingLicenseLabel')}:
            </Text>
            <Text style={styles.value}>{driverLicenseNo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>
              {translationManager.getTranslation('drivingLicenseValid')}:
            </Text>
            <Text style={styles.value}>{formatDate(driverLicenseValid)}</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={navigateToHistory}>
            <FontAwesomeIcon icon={faHistory} size={22} color="#fff" />
            <Text style={styles.menuButtonText}>
              {translationManager.getTranslation('tripHistoryLabel')}
            </Text>
          </TouchableOpacity>
          {/* upcoming implementation.. */}
          <TouchableOpacity style={styles.menuButton} onPress={changeLanguage}>
            <FontAwesomeIcon icon={faLanguage} size={22} color="#fff" />
            <Text style={styles.menuButtonText}>
              {translationManager.getTranslation('languageLabel')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} size={22} color="#fff" />
            <Text style={styles.menuButtonText}>
              {translationManager.getTranslation('logoutLabel')}
            </Text>
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
    color: '#87CEEB',
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
    marginTop: 10,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderLeftWidth:8,
    borderLeftColor:'#87CEEB'
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
});

export default CustomDrawer;
