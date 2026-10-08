// import React, {useState, useEffect, useRef} from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   TouchableOpacity,
//   BackHandler,
//   ToastAndroid,
//   Alert,
// } from 'react-native';
// import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
// import {faRefresh} from '@fortawesome/free-solid-svg-icons';
// import SQLite from 'react-native-sqlite-storage';
// import {useNavigation} from '@react-navigation/native';
// import {useIsFocused} from '@react-navigation/native';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import translations from '../translations';
// import config from '../config';
// import ETCLoader from '../components/ETCLoader';
// import RefreshButton from '../components/RefreshButton';
// import {log, readLog} from '../components/Logger';

// const BookingListOpen = ({route, language}) => {
//   const lang = language || 'en';
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [latestBookingIndex, setLatestBookingIndex] = useState(1);
//   const [currentDateTime, setCurrentDateTime] = useState('');
//   const [driverId, setDriverId] = useState('');
//   const [driverPhone, setDriverPhone] = useState('');
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();
//   const backPressedOnce = useRef(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // useEffect(() => {
//   //       checkVersion();
//   // }, []);

//   const checkVersion = async () => {
//     setIsLoading(true);
//     try {
//       const apiUrl = config.apiGetVersion;
//       const timeoutValue = parseInt(config.timeoutValue); //2 minutes..
//       const response = await Promise.race([
//         fetch(apiUrl, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }),
//         new Promise((_, reject) =>
//           setTimeout(
//             () =>
//               reject(new Error('Request timed out, Check Internet Connection')),
//             10000,
//           ),
//         ),
//       ]);

//       if (!response) {
//         console.log('Version API Response Failed');
//       } else {
//         console.log('Version Check Success in Booking Page');
//       }
//     } catch (error) {
//       console.warn('Error:', error);
//       Alert.alert(
//         'Low or No Network Connection',
//         'Check you Internet connection and try again.',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               checkVersion(); // Retry API call when OK is pressed
//             },
//           },
//         ],
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const updateDateTime = () => {
//       const now = new Date();
//       const date = now.toDateString();
//       const hours = now.getHours();
//       const minutes = String(now.getMinutes()).padStart(2, '0'); // Get minutes and pad with leading zero if needed
//       const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine if it's AM or PM
//       const formattedHours = hours % 12 || 12; // Convert hours to 12-hour format
//       setCurrentDateTime(`${date} - ${formattedHours}:${minutes} ${ampm}`); // Set current date and time
//     };

//     updateDateTime();

//     const intervalId = setInterval(updateDateTime, 1000);

//     return () => clearInterval(intervalId);
//   }, []);

//   useEffect(() => {
//     initializeDatabase();
//   }, []);

//   useEffect(() => {
//     if (bookings) {
//       console.log('Bookings Length from Effect:', bookings.length);
//       log('BOOKING_LIST - useEffect - Bookings Length from Effect:', bookings.length);
//     }
//   }, [bookings]);

//   useEffect(() => {
//     if (isFocused) {
//       if (bookings) {
//         console.log('Bookings Length from Focus:', bookings.length);
//         log('BOOKING_LIST - useEffect - Bookings Length from Focus:', bookings.length);
//       }
//     }
//   }, [isFocused]);

//   useEffect(() => {
//     if (isFocused) {
//       if (!driverId) return; // this will stop the function when driverId is falsy
//       setTimeout(() => {
//         if (driverId !== null) {
//           setLoading(true);
//           fetchData();
//         }
//       }, 1000);
//     }
//   }, [isFocused, driverId]);

//   useEffect(() => {
//     const backAction = () => {
//       if (backPressedOnce.current) {
//         BackHandler.exitApp();
//       } else {
//         backPressedOnce.current = true;
//         ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);

//         setTimeout(() => {
//           backPressedOnce.current = false;
//         }, 2000);
//       }
//       return true;
//     };

//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       backAction,
//     );

//     return () => backHandler.remove();
//   }, []);

//   useEffect(() => {
//     const fetchDriverID = async () => {
//       try {
//         const db = await SQLite.openDatabase({
//           name: 'expressDb.db',
//           location: 'default',
//         });
//         const resultSet = await db.executeSql(
//           'SELECT DriverID FROM driverData LIMIT 1;',
//         );
//         console.log('Fetched Driver data from database.');
//         const fetchedDriverID = resultSet[0].rows.item(0).DriverID;
//         console.log('Fetched Driver Id from database: ', fetchedDriverID);
//         log('BOOKING_LIST - fetchDriverID - Fetched Driver Id:', fetchedDriverID);

//         await db.close();
//         setDriverId(fetchedDriverID);
//       } catch (error) {
//         console.error('Error fetching DriverID:', error);
//         log('BOOKING_LIST - fetchDriverID - Error fetching DriverID:', error.message);
//       }
//     };
//     fetchDriverID();
//   }, []);

//   const fetchData = async () => {
//     const url = config.apiPostBookings + driverId;
//     // const url = 'https://etcdriverapp.in/WebApi/App/Bookings?did=581';

//     console.log('Bookings URL :', url);
//     log('BOOKING_LIST - fetchData - Bookings URL:', url);
//     try {
//       timeoutValue = parseInt(config.connectionTimeoutValue);
//       console.log('Timeout value from config:', timeoutValue);
//       const response = await Promise.race([
//         fetch(url, {
//           method: 'POST',
//           headers: {'Content-Type': 'application/json'},
//         }),
//         new Promise((_, reject) =>
//           setTimeout(
//             () =>
//               reject(
//                 new Error(
//                   'Request timed out, check internet connection properly',
//                 ),
//               ),
//             // timeoutValue,
//             20000,
//           ),
//         ),
//       ]);
//       if (!response.ok) {
//         throw new Error('Network response was not ok', response.status);
//       }

//       const responseData = await response.json();
//       console.log('API Response Successful', responseData);
//       log('BOOKING_LIST - fetchData - Booking details received successfully');
//       if (responseData.StatusCode === 404) {
//         setBookings([]);
//         ToastAndroid.showWithGravity(
//           'No Bookings Available',
//           ToastAndroid.SHORT,
//           ToastAndroid.CENTER,
//         );
//       }
//       if (responseData.StatusCode !== 404) {
//         const sortedBookings = responseData.sort(
//           (a, b) => new Date(a.TripTime) - new Date(b.TripTime),
//         );
//         setBookings(sortedBookings);
//         setLatestBookingIndex(0);
//         insertDataIntoDatabase(responseData);
//         setLoading(false);
//         ToastAndroid.showWithGravity(
//           'Trip List Updated',
//           ToastAndroid.SHORT,
//           ToastAndroid.CENTER,
//         );
//       } else {
//         setLoading(false);
//         console.log('Response Data is Null');
//         log('BOOKING_LIST - fetchData - Response Data is Null');
//         setBookings([]);
//       }
//     } catch (error) {
//       ToastAndroid.showWithGravity(
//         'Low or No Network Connection',
//         ToastAndroid.SHORT,
//         ToastAndroid.CENTER,
//       );
//       console.log('Error fetching trip list data:', error);
//       log('BOOKING_LIST - fetchData - Error fetching trip list data:', error.message);
//       setLoading(false);
//     }
//   };

//   const initializeDatabase = () => {
//     SQLite.enablePromise(true);
//     SQLite.openDatabase({
//       name: 'expressDb.db',
//       createFromLocation: '..Database/expressDb.db',
//     })
//       .then(db => {
//         db.transaction(tx => {
//           tx.executeSql(
//             'CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, TripId TEXT, PassengerName TEXT, PassengerPhone TEXT, PickupAddress1 TEXT, PickupAddress2 TEXT, PickupAddress3 TEXT, DropLocation TEXT, Duty TEXT, BookingDate TEXT, BookingTime TEXT, TripDate TEXT, TripTime TEXT, ReportTime TEXT,VendorAddress TEXT, BookerName TEXT, BookerMobile TEXT, DriverName TEXT, DriverPhone TEXT )',
//           );
//         });
//         log(
//           'BOOKING_LIST - initializeDatabase - Database to store trip details initialized successfully',
//         );
//       })
//       .catch(error => {
//         console.error('Error initializing database: ', error);
//         log(
//           'BOOKING_LIST - initializeDatabase - Error initializing database:',
//           error.message,
//         );
//       });
//   };

//   const insertDataIntoDatabase = data => {
//     SQLite.openDatabase({name: 'expressDb.db', createFromLocation: 'default'})
//       .then(db => {
//         data.forEach(item => {
//           db.transaction(tx => {
//             tx.executeSql(
//               'INSERT INTO bookings (TripId, PassengerName, PassengerPhone, PickupAddress1, PickupAddress2, PickupAddress3, DropLocation, Duty, BookingDate, BookingTime, TripDate, TripTime,ReportTime, VendorAddress, BookerName, BookerMobile, DriverName, DriverPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//               [
//                 item.TripId,
//                 item.PassengerName,
//                 item.PassengerPhone,
//                 item.PickupAddress1,
//                 item.PickupAddress2,
//                 item.PickupAddress3,
//                 item.DropLocation,
//                 item.Duty,
//                 item.BookingDate,
//                 item.BookingTime,
//                 item.TripDate,
//                 item.TripTime,
//                 item.ReportTime,
//                 item.VendorAddress,
//                 item.BookerName,
//                 item.BookerMobile,
//                 item.DriverName,
//                 item.DriverPhone,
//               ],
//               () => {},
//               error =>
//                 console.error('Error inserting data into database:', error),
//             );
//           });
//         });
//         log(
//           'BOOKING_LIST - insertDataIntoDatabase - Trip Details inserted into database successfully',
//         );
//       })
//       .catch(error => {
//         console.error('Error opening database:', error);
//         log(
//           'BOOKING_LIST - insertDataIntoDatabase - Error opening database:',
//           error.message,
//         );
//       });
//   };

//   const renderItem = ({item, index}) => {
//     // setDriverPhone(item.DriverPhone);
//     const isLatest = index === latestBookingIndex;
//     const formattedDate = item.TripDate.substring(
//       0,
//       item.TripDate.indexOf('T'),
//     );
//     const formattedStartTime = formatTime(item.TripTime);
//     const formattedReportTime = formatTime(item.ReportTime);
//     return (
//       <TouchableOpacity
//         onPress={() =>
//           isLatest &&
//           navigation.navigate('BookingDetails', {booking: item, driverId})
//         }
//         disabled={!isLatest}>
//         <View
//           style={{
//             padding: 10,
//             borderBottomWidth: 1,
//             borderBottomColor: '#ccc',
//             opacity: isLatest ? 1 : 0.2,
//           }}>
//           <Text
//             // allowFontScaling={false}
//             style={{fontWeight: 'bold', color: 'black', fontSize: 18}}>
//             {translations[lang].tripIdLabel}: {item.TripId}
//           </Text>
//           <Text
//             // allowFontScaling={false}
//             style={{fontWeight: 'bold', color: 'black', fontSize: 18}}>
//             {translations[lang].startTimeLabel}: {formattedStartTime}
//           </Text>
//           <Text
//             // allowFontScaling={false}
//             style={{fontWeight: 'bold', color: 'black', fontSize: 18}}>
//             {translations[lang].reportTimeLabel}: {formattedReportTime}
//           </Text>
//           <Text
//             // allowFontScaling={false}
//             style={styles.font}>
//             {translations[lang].tripDateLabel}: {formattedDate}
//           </Text>
//           <Text
//             // allowFontScaling={false}
//             style={styles.font}>
//             {translations[lang].guestNameLabel}: {item.PassengerName}
//           </Text>
//           <Text
//             // allowFontScaling={false}
//             style={styles.font}>
//             {translations[lang].pickupAddressLabel}: {item.PickupAddress1}
//           </Text>
//           <Text
//             // allowFontScaling={false}
//             style={styles.font}>
//             {translations[lang].dropLocationLabel}: {item.DropLocation}
//           </Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const formatTime = time => {
//     // Check if the time contains only hours
//     if (time.includes(':')) {
//       const [hoursStr, minutesStr] = time.split(':');
//       const hours = parseInt(hoursStr);
//       let minutes = parseInt(minutesStr);

//       // Adding leading zero to minutes if necessary
//       minutes = minutes < 10 ? minutes + '0' : minutes.toString();

//       // Adding leading zero to hours if necessary
//       const formattedHours = hours < 10 ? '0' + hours : hours.toString();

//       return `${formattedHours}:${minutes}`;
//     } else {
//       // If only hours are provided, add ':00' for minutes
//       const hours = parseInt(time);
//       const formattedHours = hours < 10 ? '0' + hours : hours.toString();
//       return `${formattedHours}:00`;
//     }
//   };

//   const handleRefresh = () => {
//     fetchData();
//   };

//   if (loading) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: 'center',
//           alignItems: 'center',
//           backgroundColor: 'white',
//         }}>
//         <ETCLoader />
//       </View>
//     );
//   }

//   return (
//     <>
//       {isLoading ? (
//         <ETCLoader />
//       ) : (
//         <View style={styles.container}>
//           {/* <Header title={translations[lang].headerText} driverId={driverId} driverPhone={item.driverPhone} /> */}
//           <Header title={translations[lang].headerText} />
//           <View style={styles.datetime}>
//             <Text allowFontScaling={false} style={styles.datetimetext}>
//               {currentDateTime}
//             </Text>
//           </View>
//           <View style={styles.pageheading}>
//             <View style={styles.headingView}>
//               <Text allowFontScaling={false} style={styles.heading}>
//                 {translations[lang].tripListHeading}
//               </Text>
//             </View>
//             <View style={styles.refView}>
//               <TouchableOpacity
//                 style={styles.refButton}
//                 onPress={handleRefresh}>
//                 <FontAwesomeIcon
//                   style={styles.callIcon}
//                   icon={faRefresh}
//                   size={18}
//                   color="white"
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//           <View style={styles.maincontent}>
//             {bookings.length === 0 ? (
//               <Text allowFontScaling={false}>No Bookings Available</Text>
//             ) : (
//               <FlatList
//                 data={bookings}
//                 renderItem={renderItem}
//                 keyExtractor={(item, index) => index.toString()}
//               />
//             )}
//           </View>
//           <Footer />
//         </View>
//       )}
//     </>
//   );
//   // return (
//   //   <View style={styles.container}>
//   //     <Header title={translations[lang].headerText} driverId={driverId} driverPhone = {driverPhone} />
//   //     <View style={styles.datetime}>
//   //       <Text style={styles.datetimetext}>{currentDateTime}</Text>
//   //     </View>
//   //     <View style={styles.pageheading}>
//   //       <View style={styles.headingView}>
//   //         <Text style={styles.heading}>
//   //           {translations[lang].tripListHeading}
//   //         </Text>
//   //       </View>
//   //       <View style={styles.refView}>
//   //         {/* <RefreshButton title={'Refresh'} onPress={handleRefresh}>
//   //         </RefreshButton> */}
//   //         <TouchableOpacity style={styles.refButton} onPress={handleRefresh}>
//   //           <FontAwesomeIcon
//   //             style={styles.callIcon}
//   //             icon={faRefresh}
//   //             size={18}
//   //             color="white"
//   //           />
//   //         </TouchableOpacity>
//   //       </View>
//   //     </View>
//   //     <View style={styles.maincontent}>
//   //       {bookings.length === 0 ? (
//   //         <Text>No Bookings Available</Text>
//   //       ) : (
//   //         <FlatList
//   //           data={bookings}
//   //           renderItem={renderItem}
//   //           keyExtractor={(item, index) => index.toString()}
//   //         />
//   //       )}
//   //     </View>
//   //     <Footer />
//   //   </View>
//   // );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: 'white',
//   },
//   font: {
//     color: 'black',
//     fontSize: 14,
//   },
//   datetime: {
//     height: '4%',
//     alignSelf: 'flex-end',
//     paddingTop: '2%',
//     paddingRight: '1%',
//   },
//   datetimetext: {
//     color: 'black',
//     fontWeight: '800',
//     fontSize: 12,
//     fontFamily: 'Roboto-BoldItalic',
//     paddingRight: '1%',
//     marginBottom: '1%',
//   },
//   pageheading: {
//     height: '10%',
//     justifyContent: 'center',
//     flexDirection: 'row',
//   },
//   maincontent: {
//     height: '70%',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: '5%',
//   },
//   heading: {
//     fontSize: 20,
//     color: 'black',
//     fontWeight: '700',
//   },
//   headingView: {
//     width: '70%',
//     alignSelf: 'center',
//     alignItems: 'center',
//     paddingLeft: '30%',
//   },
//   refView: {
//     width: '30%',
//     alignSelf: 'center',
//     alignItems: 'center',
//   },
//   refButton: {
//     backgroundColor: '#0c4160',
//     width: 35,
//     height: 35,
//     borderRadius: 22,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: '1%',
//     maxHeight: 50,
//   },
//   overlay: {
//     ...StyleSheet.absoluteFill,
//     backgroundColor: 'rgba(255, 255, 255, 0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default BookingListOpen;

import React, {useState, useEffect, useRef, useContext} from 'react';
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
import {
  faListOl,
  faRefresh,
  faRoute,
  faRoad,
  faMap,
  faCar,
  faList,
  faListAlt,
  faListCheck,
  faListDots,
} from '@fortawesome/free-solid-svg-icons';
import SQLite from 'react-native-sqlite-storage';
import {useNavigation} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewHeader from '../components/NewHeader';
import NewFooter from '../components/NewFooter';
import translations from '../translations';
import translationManager from '../translationManager';
import {TranslationContext} from '../translationContext';
import config from '../config';
import ETCLoader from '../components/ETCLoader';
import RefreshButton from '../components/RefreshButton';
import {log, readLog} from '../components/Logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../config';

const BookingListOpen = ({route}) => {
  const {language} = useContext(TranslationContext);
  const lang = language || 'en';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestBookingIndex, setLatestBookingIndex] = useState(1);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [driverId, setDriverId] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const backPressedOnce = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const retrivedDid = AsyncStorage.getItem('driverId');
  const retrivedDphone = AsyncStorage.getItem('driverPhone');

  // useEffect(() => {
  //       checkVersion();
  // }, []);

  const checkVersion = async () => {
    setIsLoading(true);
    try {
      const apiUrl = config.apiGetVersion;
      const authToken = await AsyncStorage.getItem('API_AUTH_TOKEN');
      const response = await Promise.race([
        fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(new Error('Request timed out, Check Internet Connection')),
            10000,
          ),
        ),
      ]);

      if (!response) {
        console.log('Version API Response Failed');
      } else {
        console.log('Version Check Success in Booking Page');
      }
    } catch (error) {
      console.warn('Error:', error);
      Alert.alert(
        translationManager.getTranslation('alertLowNetwork'),
        translationManager.getTranslation('alertCheckNetworkStart'),
        [
          {
            text: 'OK',
            onPress: () => {
              checkVersion(); // Retry API call when OK is pressed
            },
          },
        ],
      );
    } finally {
      setIsLoading(false);
    }
  };

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
    initializeDatabase();
  }, []);

  useEffect(() => {
    if (bookings) {
      console.log('Bookings Length from Effect:', bookings.length);
      log(
        'BOOKING_LIST - useEffect - Bookings Length from Effect:',
        bookings.length,
      );
    }
  }, [bookings]);

  useEffect(() => {
    if (isFocused) {
      if (bookings) {
        console.log('Bookings Length from Focus:', bookings.length);
        log(
          'BOOKING_LIST - useEffect - Bookings Length from Focus:',
          bookings.length,
        );
      }
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      if (!driverId) return; // this will stop the function when driverId is falsy
      setTimeout(() => {
        if (driverId !== null) {
          setLoading(true);
          fetchData();
        }
      }, 1000);
    }
  }, [isFocused, driverId]);

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

  useEffect(() => {
    const fetchDriverID = async () => {
      try {
        const db = await SQLite.openDatabase({
          name: 'expressDb.db',
          location: 'default',
        });
        const resultSet = await db.executeSql(
          'SELECT DriverID FROM driverData LIMIT 1;',
        );
        console.log('Fetched Driver data from database.');
        const fetchedDriverID = resultSet[0].rows.item(0).DriverID;
        console.log('Fetched Driver Id from database: ', fetchedDriverID);
        log(
          'BOOKING_LIST - fetchDriverID - Fetched Driver Id:',
          fetchedDriverID,
        );

        await db.close();
        setDriverId(fetchedDriverID);
      } catch (error) {
        console.error('Error fetching DriverID:', error);
        log(
          'ERROR - BOOKING_LIST - fetchDriverID - Error fetching DriverID:',
          error.message,
        );
      }
    };
    fetchDriverID();
  }, []);

  // const fetchData = async () => {
  //   const url = config.apiPostBookings + driverId;

  //   console.log('Bookings URL :', url);
  //   log('BOOKING_LIST - fetchData - Bookings URL:', url);
  //   try {
  //     timeoutValue = parseInt(config.connectionTimeoutValue);
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
  //           // timeoutValue,
  //           20000,
  //         ),
  //       ),
  //     ]);
  //     if (!response.ok) {
  //       throw new Error('network response was not ok', response.status);
  //     }

  //     const responseData = await response.json();
  //     console.log('API Response Successful', responseData);
  //     log('BOOKING_LIST - fetchData - Booking details received successfully');
  //     if (responseData.StatusCode === 404) {
  //       setBookings([]);
  //       ToastAndroid.showWithGravity(
  //         'No Bookings Available',
  //         ToastAndroid.SHORT,
  //         ToastAndroid.CENTER,
  //       );
  //     }
  //     if (responseData.StatusCode !== 404) {
  //       const sortedBookings = responseData.sort(
  //         (a, b) => new Date(a.TripTime) - new Date(b.TripTime),
  //       );
  //       setBookings(sortedBookings);
  //       setLatestBookingIndex(0);
  //       insertDataIntoDatabase(responseData);
  //       setLoading(false);
  //       ToastAndroid.showWithGravity(
  //         'Trip List Updated',
  //         ToastAndroid.SHORT,
  //         ToastAndroid.CENTER,
  //       );
  //     } else {
  //       setLoading(false);
  //       console.log('Response Data is Null');
  //       log('BOOKING_LIST - fetchData - Response Data is Null');
  //       setBookings([]);
  //     }
  //   } catch (error) {
  //     ToastAndroid.showWithGravity(
  //       'Low or No Network Connection',
  //       ToastAndroid.SHORT,
  //       ToastAndroid.CENTER,
  //     );
  //     console.log('Error fetching trip list data:', error);
  //     log('BOOKING_LIST - fetchData - Error fetching trip list data:', error.message);
  //     setLoading(false);
  //   }
  // };

  const fetchData = async () => {
    const url = config.apiPostBookings + driverId;
    const altUrl = config.apiPostBookingsAlt + driverId; // Assuming you have an alternative URL in config
    console.log('TrackInterval: '+ await AsyncStorage.getItem('TrackInterval'));
    console.log('Bookings URL :', url);
    log('BOOKING_LIST - fetchData - Bookings URL:', url);

    const makeApiCall = async currentUrl => {
      const authToken = await AsyncStorage.getItem('API_AUTH_TOKEN');
      const trackInterval = Number(await AsyncStorage.getItem('trackInterval'));
      //console.log('Fetched Track Interval: '+typeof(trackInterval));
      timeoutValue = parseInt(config.connectionTimeoutValue);
      console.log('Timeout value from config:', timeoutValue);
      log(`BOOKING_LIST - makeApiCall - API_AUTH_TOKEN : ${authToken}`);
      const response = await Promise.race([
        fetch(currentUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
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
            20000, // Hardcoded timeout, consider using timeoutValue if it's dynamic
          ),
        ),
      ]);
      return response;
    };

    try {
      let response;
      try {
        response = await makeApiCall(url);
      } catch (initialError) {
        console.warn(
          'Initial booking API call failed, attempting alternative:',
          initialError.message,
        );
        log(
          'WARN - BOOKING_LIST - fetchData - Initial booking API call failed, attempting alternative:',
          initialError.message,
        );
        response = await makeApiCall(altUrl); // Try the alternative URL
      }

      if (!response.ok) {
        throw new Error(
          `Network response was not ok, status: ${response.status}`,
        );
      }

      const responseData = await response.json();
      console.log('API Response Successful', responseData);
      log('BOOKING_LIST - fetchData - Booking details received successfully');

      if (responseData.StatusCode === 404) {
        setBookings([]);
        ToastAndroid.showWithGravity(
          translationManager.getTranslation('noBookingsLabel'),
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        if (responseData && responseData.length > 0) {
          const calcTime = responseData[0].LatLongPositionCalcTime;
          if (calcTime) {
            await AsyncStorage.setItem('TrackInterval', calcTime.toString());
          }
        }
        const sortedBookings = responseData.sort(
          (a, b) => new Date(a.TripTime) - new Date(b.TripTime),
        );
        setBookings(sortedBookings);
        setLatestBookingIndex(0);
        insertDataIntoDatabase(responseData);
        ToastAndroid.showWithGravity(
          'Trip List Updated',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }
      setLoading(false); // Set loading to false regardless of 404 or successful data
    } catch (error) {
      if (error.message === 'Network request failed') {
        ToastAndroid.showWithGravity(
          'No Network Connection',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        ToastAndroid.showWithGravity(
          'Something went wrong',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }
      console.log('Error fetching trip list data:', error);
      log(
        'ERROR - BOOKING_LIST - fetchData - Error fetching trip list data:',
        error.message,
      );
      setLoading(false);
    }
  };

  const initializeDatabase = () => {
    SQLite.enablePromise(true);
    SQLite.openDatabase({
      name: 'expressDb.db',
      createFromLocation: '..Database/expressDb.db',
    })
      .then(db => {
        db.transaction(tx => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, TripId TEXT, PassengerName TEXT, PassengerPhone TEXT, PickupAddress1 TEXT, PickupAddress2 TEXT, PickupAddress3 TEXT, DropLocation TEXT, Duty TEXT, BookingDate TEXT, BookingTime TEXT, TripDate TEXT, TripTime TEXT, ReportTime TEXT,VendorAddress TEXT, BookerName TEXT, BookerMobile TEXT, DriverName TEXT, DriverPhone TEXT )',
          );
        });
        log(
          'BOOKING_LIST - initializeDatabase - Database to store trip details initialized successfully',
        );
      })
      .catch(error => {
        console.error('Error initializing database: ', error);
        log(
          'ERROR - BOOKING_LIST - initializeDatabase - Error initializing database:',
          error.message,
        );
      });
  };

  const insertDataIntoDatabase = data => {
    SQLite.openDatabase({name: 'expressDb.db', createFromLocation: 'default'})
      .then(db => {
        data.forEach(item => {
          db.transaction(tx => {
            tx.executeSql(
              'INSERT INTO bookings (TripId, PassengerName, PassengerPhone, PickupAddress1, PickupAddress2, PickupAddress3, DropLocation, Duty, BookingDate, BookingTime, TripDate, TripTime,ReportTime, VendorAddress, BookerName, BookerMobile, DriverName, DriverPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                item.TripId,
                item.PassengerName,
                item.PassengerPhone,
                item.PickupAddress1,
                item.PickupAddress2,
                item.PickupAddress3,
                item.DropLocation,
                item.Duty,
                item.BookingDate,
                item.BookingTime,
                item.TripDate,
                item.TripTime,
                item.ReportTime,
                item.VendorAddress,
                item.BookerName,
                item.BookerMobile,
                item.DriverName,
                item.DriverPhone,
              ],
              () => {},
              error =>
                console.error('Error inserting data into database:', error),
            );
          });
        });
        log(
          'BOOKING_LIST - insertDataIntoDatabase - Trip Details inserted into database successfully',
        );
      })
      .catch(error => {
        console.error('Error opening database:', error);
        log(
          'ERROR - BOOKING_LIST - insertDataIntoDatabase - Error opening database:',
          error.message,
        );
      });
  };

  const renderItem = ({item, index}) => {
    // setDriverPhone(item.DriverPhone);
    const isLatest = index === latestBookingIndex;
    // **NEW: Determine if the trip is VIP**
    const isVipTrip = item.IsVIP === 1;
    const formattedDate = item.TripDate.substring(
      0,
      item.TripDate.indexOf('T'),
    );
    const formattedStartTime = formatTime(item.TripTime);
    const formattedReportTime = formatTime(item.ReportTime);
    return (
      <TouchableOpacity
        onPress={() => {
          if (isLatest) {
            // Alert.alert(`Navigating to trip: ${item.TripId}`);
            ToastAndroid.showWithGravity(
              `Navigating to Trip: ${item.TripId}`,
              ToastAndroid.SHORT,
              ToastAndroid.CENTER,
            );
            navigation.navigate('BookingDetails', {booking: item, driverId});
            // AsyncStorage.setItem('currentScreen', 'BookingDetails');
          }
        }}
        disabled={!isLatest}
        style={[styles.card, !isLatest && styles.disabledCard]}>
        {/* **NEW: VIP Label Display** */}
      {isVipTrip && (
        <View style={styles.vipLabelContainer}>
          <Text style={styles.vipLabelText}>VIP</Text>
        </View>
      )}
        <Text style={styles.label}>
          {translationManager.getTranslation('tripIdLabel')}:{' '}
          <Text style={styles.value}>{item.TripId}</Text>
        </Text>
        <Text style={styles.label}>
          {translationManager.getTranslation('tripDateLabel')}:{' '}
          <Text style={styles.value}>{formatDate(item.TripDate)}</Text>
        </Text>
        <Text style={styles.label}>
          {translationManager.getTranslation('startTimeLabel')}:{' '}
          <Text style={styles.value}>{formatTime(item.TripTime)}</Text>
        </Text>
        <Text style={styles.label}>
          {translationManager.getTranslation('reportTimeLabel')}:{' '}
          <Text style={styles.value}>{formatTime(item.ReportTime)}</Text>
        </Text>
        <Text style={styles.label}>
          {translationManager.getTranslation('guestNameLabel')}:{' '}
          <Text style={styles.value}>{item.PassengerName}</Text>
        </Text>
        <Text style={styles.label}>
          {translationManager.getTranslation('pickupAddressLabel')}:{' '}
          <Text style={styles.value}>{item.PickupAddress1}</Text>
        </Text>
        <Text style={styles.label}>
          {translationManager.getTranslation('dropLocationLabel')}:{' '}
          <Text style={styles.value}>{item.DropLocation}</Text>
        </Text>
      </TouchableOpacity>
    );
  };

  const formatDate = dateString => {
    const dateObj = new Date(dateString);
    const options = {day: '2-digit', month: 'short', year: 'numeric'};
    return dateObj.toLocaleDateString('en-GB', options);
  };

  // const formatTime = time => {
  //   const [hoursStr, minutesStr] = time.toString().split('.');

  //   const hours = hoursStr.padStart(2, '0');
  //   const minutes = minutesStr
  //     ? minutesStr.padEnd(2, '0').slice(0, 2).padStart(2, '0')
  //     : '00';

  //   return `${hours}:${minutes}`;
  // };
  
  const formatTime = time => {
  // Ensure string
  const parts = time.toString().split(':');

  const hours = parts[0]?.padStart(2, '0') || '00';
  const minutes = parts[1]?.padStart(2, '0') || '00';
  // Ignore seconds (parts[2]) since you want HH:MM

  return `${hours}:${minutes}`;
};


  // // Auto Refresh every 30 seconds (30000 ms)
  // useEffect(() => {
  //   const interval = setInterval(fetchData, 30000);

  //   // Cleanup the interval when component unmounts
  //   return () => clearInterval(interval);
  // }, []);

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
      {isLoading ? (
        <ETCLoader />
      ) : (
        <View style={styles.container}>
          {/* Header */}
          <NewHeader showDrawer={true}/>
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
                {translationManager.getTranslation('tripListHeading')}
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
                {translationManager.getTranslation('noBookingsLabel')}
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
          <NewFooter
            driverId={retrivedDid}
            driverPhone={retrivedDphone}
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
    // flex:0.03,
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
    // flex:0.05,
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
    // height:'76%',
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
    backgroundColor: '#ffffff',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.label,
    marginBottom: 5,
    fontFamily: 'sans-serif-condensed',
  },
  value: {
    fontSize: 18,
    color: Colors.value,
    fontWeight: '800',
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
  // **NEW VIP Styles**
  vipLabelContainer: {
    position: 'absolute', // Position over the card
    top: 5,              // Adjust as needed
    right: 5,            // Adjust as needed
    backgroundColor: 'green', // Distinctive background color
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 12,
    zIndex: 10, // Ensure it's on top of other elements
  },
  vipLabelText: {
    color: 'white', 
    fontWeight: '900',
    fontSize: 17,
    fontFamily: 'sans-serif-condensed',
  },
});

export default BookingListOpen;
