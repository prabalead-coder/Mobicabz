import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  ToastAndroid,
  Alert,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faListCheck, faRefresh} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import NewHeader from '../components/NewHeader';
import NewFooter from '../components/NewFooter';
import translationManager from '../translationManager';
import config from '../config';
import ETCLoader from '../components/ETCLoader';
import {log} from '../components/Logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../config';
import BackButton from '../components/BackButton';

const TripHistoryScreen = ({route, language}) => {
  const lang = language || 'en';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestBookingIndex, setLatestBookingIndex] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [driverId, setDriverId] = useState(null); // Initialize as null
  const [driverPhone, setDriverPhone] = useState(null); // Initialize as null
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const backPressedOnce = useRef(false);
  const [isLoading, setIsLoading] = useState(false); // This state seems redundant with 'loading', consider consolidating if possible
  const [isBackEnabled, setIsBackEnabled] = useState(true);

  // --- NEW useEffect to load driverId and driverPhone from AsyncStorage ---
  useEffect(() => {
    const loadDriverData = async () => {
      try {
        const id = await AsyncStorage.getItem('driverId');
        const phone = await AsyncStorage.getItem('driverPhone');
        if (id) {
          setDriverId(id);
          log(`TRIP_HISTORY - loadDriverData - Driver ID loaded: ${id}`);
        } else {
          log(
            'TRIP_HISTORY - loadDriverData - Driver ID not found in AsyncStorage.',
          );
        }
        if (phone) {
          setDriverPhone(phone);
          log(`TRIP_HISTORY - loadDriverData - Driver Phone loaded: ${phone}`);
        } else {
          log(
            'TRIP_HISTORY - loadDriverData - Driver Phone not found in AsyncStorage.',
          );
        }
      } catch (e) {
        console.error('Failed to load driver data from AsyncStorage', e);
        log(
          `ERROR - TRIP_HISTORY - loadDriverData - Error loading driver data: ${e.message}`,
        );
      }
    };
    loadDriverData();
  }, []); // Run only once on component mount

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

  useEffect(() => {
    if (bookings) {
      console.log('Bookings Length from Effect:', bookings.length);
      log(
        'TRIP_HISTORY - useEffect - Bookings Length from Effect:',
        bookings.length,
      );
    }
  }, [bookings]);

  useEffect(() => {
    if (isFocused) {
      if (bookings) {
        console.log('Bookings Length from Focus:', bookings.length);
        log(
          'TRIP_HISTORY - useEffect - Bookings Length from Focus:',
          bookings.length,
        );
      }
    }
  }, [isFocused]);

  // This useEffect will now correctly trigger fetchData once driverId is loaded and the screen is focused
  useEffect(() => {
    if (isFocused && driverId) {
      // Ensure driverId is not null or empty string
      setLoading(true);
      fetchData();
    }
  }, [isFocused, driverId]); // Dependency on driverId ensures it runs when driverId state updates

  useEffect(() => {
    const backAction = () => {
      if (backPressedOnce.current) {
        BackHandler.exitApp();
      } else {
        backPressedOnce.current = true;
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        setTimeout(() => {
          backPressedOnce.current = false;
        }, 2000);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  const handleBack = () => {
    setIsBackEnabled(false);
    navigation.goBack();
    setTimeout(() => {
      setIsBackEnabled(true);
    }, 2000);
  };

  // const fetchData = async () => {
  //   if (!driverId) {
  //     console.warn('Driver ID is not available, cannot fetch bookings.');
  //     log('TRIP_HISTORY - fetchData - Driver ID is not available.');
  //     setLoading(false); // Ensure loading is false if driverId is not available
  //     return;
  //   }

  //   const url = `${config.apiPostTripHistory}${driverId}&sdate=null&edate=null`;

  //   console.log('Trip History URL :', url);
  //   log('TRIP_HISTORY - fetchData - Bookings URL:', url);
  //   try {
  //     const timeoutValue = parseInt(config.connectionTimeoutValue);
  //     console.log('Timeout value from config:', timeoutValue);
  //     const response = await Promise.race([
  //       fetch(url, {
  //         method: 'POST',
  //         headers: {'Content-Type': 'application/json'},
  //       }),
  //       new Promise((_, reject) =>
  //         setTimeout(
  //           () =>
  //             reject(
  //               new Error(
  //                 'Request timed out, check internet connection properly',
  //               ),
  //             ),
  //           20000,
  //         ),
  //       ),
  //     ]);
  //     if (!response.ok) {
  //       throw new Error('network response was not ok', response.status);
  //     }

  //     const responseData = await response.json();
  //     console.log('API Response Successful', responseData);
  //     log('TRIP_HISTORY - fetchData - Booking details received successfully');

  //     if (
  //       responseData.StatusCode === 404 ||
  //       !responseData ||
  //       responseData.length === 0
  //     ) {
  //       setBookings([]);
  //       ToastAndroid.showWithGravity(
  //         'No Completed Trips Available',
  //         ToastAndroid.SHORT,
  //         ToastAndroid.CENTER,
  //       );
  //     } else {
  //       const sortedBookings = responseData.sort(
  //         (a, b) => new Date(a.TripTime) - new Date(b.TripTime),
  //       );
  //       setBookings(sortedBookings);
  //       setLatestBookingIndex(0);
  //       ToastAndroid.showWithGravity(
  //         'Trip History Updated',
  //         ToastAndroid.SHORT,
  //         ToastAndroid.CENTER,
  //       );
  //     }
  //   } catch (error) {
  //     ToastAndroid.showWithGravity(
  //       'Low or No Network Connection',
  //       ToastAndroid.SHORT,
  //       ToastAndroid.CENTER,
  //     );
  //     console.log('Error fetching trip list data:', error);
  //     log(
  //       'TRIP_HISTORY - fetchData - Error fetching trip list data:',
  //       error.message,
  //     );
  //     setBookings([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Helper function to extract time from ISO date-time string
  const fetchData = async () => {
    if (!driverId) {
      console.warn('Driver ID is not available, cannot fetch bookings.');
      log('TRIP_HISTORY - fetchData - Driver ID is not available.');
      setLoading(false); // Ensure loading is false if driverId is not available
      return;
    }

    // Helper function to fetch data from a given URL
    const fetchTripHistory = async baseUrl => {
      const url = `${baseUrl}${driverId}&sdate=null&edate=null`;

      console.log('Trip History URL :', url);
      log('TRIP_HISTORY - fetchData - Bookings URL:', url);

      const timeoutValue = parseInt(
        config.connectionTimeoutValue || '20000',
        10,
      ); // Use 20000 as default if not defined
      console.log('Timeout value from config:', timeoutValue);
      const authToken = await AsyncStorage.getItem('API_AUTH_TOKEN');
      const response = await Promise.race([
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization':`Bearer ${authToken}`
          },
        }),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  'Request timed out, check internet connection properly',
                ),
              ),
            timeoutValue, // Use the configured timeout value
          ),
        ),
      ]);

      if (!response.ok) {
        throw new Error(
          `Network response was not ok from ${baseUrl}: ${response.status}`,
        );
      }
      return response;
    };

    setLoading(true); // Set loading to true at the beginning of the fetch process

    try {
      let response;
      try {
        response = await fetchTripHistory(config.apiPostTripHistory);
        console.log('Primary Trip History API call successful.');
      } catch (initialError) {
        console.error('Trip History intial API request Failed: ', initialError);
        console.warn(
          'Primary Trip History API call failed, attempting alternative:',
          initialError.message,
        );
        log(
          `WARN - TRIP_HISTORY - fetchData - Primary Trip History API call failed, attempting alternative: ${initialError.message}`,
        );
        response = await fetchTripHistory(config.apiPostTripHistoryAlt); // Try the alternative URL
        console.log('Alternative Trip History API call successful.');
      }

      const responseData = await response.json();
      console.log('API Response Successful', responseData);
      log('TRIP_HISTORY - fetchData - Booking details received successfully');

      if (
        responseData.StatusCode === 404 ||
        !responseData ||
        responseData.length === 0
      ) {
        setBookings([]);
        ToastAndroid.showWithGravity(
          'No Completed Trips Available',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        const sortedBookings = responseData.sort(
          (a, b) => new Date(a.TripTime) - new Date(b.TripTime),
        );
        setBookings(sortedBookings);
        setLatestBookingIndex(0);
        ToastAndroid.showWithGravity(
          'Trip History Updated',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }
    } catch (error) {
      ToastAndroid.showWithGravity(
        'Low or No Network Connection',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
      console.error('Error fetching trip list data:', error); // Use console.error for errors
      log(
        'TRIP_HISTORY - fetchData - Error fetching trip list data:',
        error.message,
      );
      setBookings([]); // Clear bookings on error
    } finally {
      setLoading(false); // Always set loading to false in finally block
    }
  };

  const extractTimeFromISO = dateTimeString => {
    if (!dateTimeString) {
      return 'N/A';
    }
    const dateObj = new Date(dateTimeString);
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderItem = ({item, index}) => {
    return (
      // <TouchableOpacity
      //   onPress={() => {
      //     ToastAndroid.showWithGravity(
      //       `Navigating to Trip: ${item.TripId}`,
      //       ToastAndroid.SHORT,
      //       ToastAndroid.CENTER,
      //     );
      //     navigation.navigate('HistoryDetail', {booking: item, driverId});
      //   }}
      //   style={styles.card}>
      //   <Text style={styles.label}>
      //     {translationManager.getTranslation('tripIdLabel')}:{' '}
      //     <Text style={styles.value}>{item.TripId}</Text>
      //   </Text>
      //   <Text style={styles.label}>
      //     {translationManager.getTranslation('tripDateLabel')}:{' '}
      //     {/* Using TripStartDateTime for date */}
      //     <Text style={styles.value}>{formatDate(item.TripStartDateTime)}</Text>
      //   </Text>
      //   <Text style={styles.label}>
      //     {translationManager.getTranslation('startTimeLabel')}:{' '}
      //     {/* Using TripStartDateTime for time */}
      //     <Text style={styles.value}>
      //       {extractTimeFromISO(item.TripStartDateTime)}
      //     </Text>
      //   </Text>
      //   <Text style={styles.label}>
      //     {translationManager.getTranslation('tripCompleteTime')}:{' '}
      //     {/* Using TripReportingDateTime for time */}
      //     <Text style={styles.value}>
      //       {extractTimeFromISO(item.TripCompleteDateTime)}
      //     </Text>
      //   </Text>
      //   <Text style={styles.label}>
      //     {translationManager.getTranslation('guestNameLabel')}:{' '}
      //     <Text style={styles.value}>{item.PassengerName}</Text>
      //   </Text>
      //   <Text style={styles.label}>
      //     {translationManager.getTranslation('pickupAddressLabel')}:{' '}
      //     <Text style={styles.value}>{item.PickupAddress1}</Text>
      //   </Text>
      //   <Text style={styles.label}>
      //     {translationManager.getTranslation('dropLocationLabel')}:{' '}
      //     <Text style={styles.value}>{item.DropLocation}</Text>
      //   </Text>
      // </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          ToastAndroid.showWithGravity(
            `Navigating to Trip: ${item.TripId}`,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          navigation.navigate('HistoryDetail', {booking: item, driverId});
        }}
        style={styles.card}>
        {/* Trip ID and Trip Date on the same row */}
        <View style={styles.row}>
          <Text style={styles.label}>
            {translationManager.getTranslation('tripIdLabel')}:{' '}
            <Text style={styles.value}>{item.TripId}</Text>
          </Text>
          <Text style={styles.label}>
            {translationManager.getTranslation('tripDateLabel')}:{' '}
            <Text style={styles.value}>
              {formatDate(item.TripStartDateTime)}
            </Text>
          </Text>
        </View>

        {/* Start Time and Completed Time on the next row */}
        <View style={styles.row}>
          <Text style={styles.label}>
            {translationManager.getTranslation('startTimeLabel')}:{' '}
            <Text style={styles.value}>
              {extractTimeFromISO(item.TripStartDateTime)}
            </Text>
          </Text>
          <Text style={styles.label}>
            {translationManager.getTranslation('tripCompleteTime')}:{' '}
            <Text style={styles.value}>
              {extractTimeFromISO(item.TripCompleteDateTime)}
            </Text>
          </Text>
        </View>

        {/* Company Name on the next row */}
        <Text style={styles.label}>
          {translationManager.getTranslation('companyNameLabel')}:{' '}
          <Text style={styles.value}>{item.CustomerName}</Text>
        </Text>

        {/* Total Kms on the next row */}
        <Text style={styles.label}>
          {translationManager.getTranslation('totalKmLabel')}:{' '}
          <Text style={styles.value}>{item.TotalKms} KM</Text>
        </Text>
      </TouchableOpacity>
    );
  };

  const formatDate = dateString => {
    if (!dateString) {
      return 'N/A';
    }
    const dateObj = new Date(dateString);
    const options = {day: '2-digit', month: 'short', year: 'numeric'};
    return dateObj.toLocaleDateString('en-GB', options);
  };

  // Original formatTime function (kept in case you need it for other scenarios)
  const formatTime = time => {
    if (time === undefined || time === null) {
      return 'N/A';
    }
    const [hoursStr, minutesStr] = time.toString().split(':');

    const hours = hoursStr.padStart(2, '0');
    const minutes = minutesStr
      ? minutesStr.padEnd(2, '0').slice(0, 2).padStart(2, '0')
      : '00';

    return `${hours}:${minutes}`;
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
        }}>
        <ETCLoader />
      </View>
    );
  }

  return (
    <>
      {isLoading ? ( // Consider if isLoading is truly needed or if 'loading' suffices
        <ETCLoader />
      ) : (
        <View style={styles.container}>
          {/* Header */}
          <NewHeader showDrawer={false} />
          {/* Date & Time */}
          <View style={styles.datetime}>
            <Text allowFontScaling={false} style={styles.datetimeText}>
              {currentDateTime}
            </Text>
          </View>
          {/* Page Heading */}
          <View style={styles.pageHeading}>
            <View style={styles.headingView}>
              <FontAwesomeIcon icon={faListCheck} size={25} color="#0c4160" />
              <Text allowFontScaling={false} style={styles.headingText}>
                {translationManager.getTranslation('tripHistoryHeading')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}>
              <FontAwesomeIcon
                style={styles.callIcon}
                icon={faRefresh}
                size={18}
                color="white"
              />
            </TouchableOpacity>
          </View>
          {/* Trip List */}
          <View style={styles.mainContent}>
            {bookings.length === 0 ? (
              <Text style={styles.noBookings} allowFontScaling={false}>
                {translationManager.getTranslation('noCompletedTrips')}
              </Text>
            ) : (
              <FlatList
                data={bookings}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
          <View style={styles.buttons}>
            <View style={styles.buttonWrapper}>
              <BackButton
                title={translationManager.getTranslation('backButton')}
                onPress={handleBack}
                disabled={!isBackEnabled} // Pass disabled prop if your BackButton supports it
              />
            </View>
          </View>
          <NewFooter
            driverId={driverId} // Use the state variable
            driverPhone={driverPhone} // Use the state variable
            showReport={true}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  datetime: {
    height: '4%',
    minHeight: 28,
    backgroundColor: Colors.dateTimeBackground,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datetimeText: {
    fontSize: 14,
    color: Colors.dateTimeText,
    fontFamily: 'sans-serif-condensed',
    fontWeight: '700',
  },
  pageHeading: {
    height: '8%',
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.heading,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  headingView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.headingText,
    fontFamily: 'sans-serif-condensed',
  },
  refreshButton: {
    backgroundColor: Colors.buttons,
    padding: 10,
    borderRadius: 20,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  noBookingsText: {
    fontSize: 16,
    color: Colors.buttons,
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    padding: 15,
    backgroundColor: Colors.completeCardBg,
    borderRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: 3,
    fontFamily: 'sans-serif-condensed',
  },
  value: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
    fontFamily: 'sans-serif-condensed',
  },
  listContainer: {
    paddingBottom: 20,
  },
  noBookings: {
    color: Colors.buttons,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 18,
    fontFamily: 'sans-serif-condensed',
  },
  buttons: {
    height: '10%',
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.heading,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  // New styles for layout
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distributes space between items
    marginBottom: 3, // Add some space between rows
  },
  rowLabel: {
    flex: 1, // Ensures each label within the row takes equal space
    fontSize: 12,
    fontWeight: '100',
    color: Colors.label,
    fontFamily: 'sans-serif-condensed',
  },
});

export default TripHistoryScreen;
