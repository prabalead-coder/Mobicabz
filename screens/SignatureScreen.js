// import React, {useRef, useState, useEffect} from 'react';
// import {
//   View,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   Alert,
//   BackHandler,
// } from 'react-native';
// import SignatureCapture from 'react-native-signature-capture';
// import Geolocation from '@react-native-community/geolocation';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import moment from 'moment';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import translations from '../translations';
// import {useIsFocused} from '@react-navigation/native';
// import BouncyCheckbox from 'react-native-bouncy-checkbox';
// import {log, readLog} from '../components/Logger';
// import RNFetchBlob from 'rn-fetch-blob';
// import {FileSystem} from 'react-native-unimodules';

// const SignatureScreen = ({route, navigation, language}) => {
//   const lang = language || 'en';
//   const [signParams, setSignParams] = useState({});
//   const signatureRef = useRef(null);
//   const [signature, setSignature] = useState('');
//   const [signTime, setSignTime] = useState('');
//   // const{ startKmReadings, pickupKmReadings, tripNo,driverId, custName, custMobile, pickUpLoc, dropLoc, pickupKmImageUri} = route.params;
//   // const{tripCompleteLoc,tripCompletedTime} = route.params;
//   const [tripCompletedTime, setTripCompletedTime] = useState('');
//   const [tripCompleteLoc, setTripCompleteLoc] = useState('');
//   // console.log(startKmReadings, pickupKmReadings, tripNo,driverId, custName, custMobile, pickUpLoc, dropLoc, pickupKmImageUri, tripCompletedTime, tripCompleteLoc);
//   const isFocused = useIsFocused();
//   const [currentDateTime, setCurrentDateTime] = useState('');
//   const [currentTime, setCurrentTime] = useState('');
//   const [completeLat, setCompleteLat] = useState('');
//   const [completeLong, setCompleteLong] = useState('');
//   const [position, setPosition] = useState('');
//   const [isNoSignChecked, setIsNoSignChecked] = useState(false);
//   const [isSaveVisible, setIsSaveVisible] = useState(false);

//   useEffect(() => {
//     const fetchParams = async () => {
//       try {
//         // Check if there are stored parameters in AsyncStorage
//         const storedParams = await AsyncStorage.getItem('signParams');
//         console.log('Received signParams:',storedParams);
//         if (storedParams !== null) {
//           // If stored parameters exist, use them
//           setSignParams(JSON.parse(storedParams));
//         } else {
//           // If no stored parameters, use the parameters passed through navigation
//           setSignParams(route.params);
//         }
//       } catch (error) {
//         console.error('SignatureScreen: Error retrieving params from AsyncStorage:', error);
//       }
//     };

//     fetchParams();
//   }, [route.params]);

//   useEffect(() => {
//     // Function to handle hardware back button press
//     const backAction = () => {
//       // Always prevent default behavior (disable back button)
//       return true;
//     };

//     // Add event listener for hardware back button press
//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       backAction,
//     );

//     // Clean up the event listener on component unmount
//     return () => backHandler.remove();
//   }, []);

//   // useEffect(()=>{
//   //   Geolocation.getCurrentPosition((pos)=>{
//   //     const crd = pos.coords;
//   //     setPosition({
//   //       latitude: crd.latitude,
//   //       longitude: crd.longitude,
//   //       latitudeDelta: 0.0421,
//   //       longitudeDelta: 0.0421,
//   //     });
//   //   })
//   // },[]);

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
//     Geolocation.getCurrentPosition(
//       position => {
//         const {latitude, longitude} = position.coords;
//         setPosition({latitude, longitude});
//       },
//       error => console.log(error),
//       {enableHighAccuracy: false, timeout: 20000},
//     );
//   }, []);

//   useEffect(() => {
//     // Update current time every second
//     const interval = setInterval(() => {
//       const formattedTime = moment().format('YYYY-MM-DD HH:mm:ss');
//       setCurrentTime(formattedTime);
//     }, 1000);

//     // Clear interval on component unmount
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     if (signTime) console.log('Sign Time(Effect):' + signTime);
//   }, [signTime]);

//   useEffect(() => {
//     if (tripCompleteLoc)
//       console.log(
//         'Trip Complete Location(Effect):' +
//           tripCompleteLoc.latitude +
//           ',' +
//           tripCompleteLoc.longitude,
//       );
//   }, [tripCompleteLoc]);

//   useEffect(() => {
//     if (isNoSignChecked) {
//       console.log('No Sign Checked:', isNoSignChecked);
//     }
//   }, [isNoSignChecked]);

//   useEffect(() => {
//     if (position) setTripCompleteLoc(position);
//   }, [position]);

//   useEffect(() => {
//     if (isFocused) {
//       console.log(
//         'Trip complete Time, Sign Time & Trip Complete Location(Focus):' +
//           tripCompletedTime +
//           ',' +
//           signTime +
//           ',' +
//           tripCompleteLoc.latitude +
//           ',' +
//           tripCompleteLoc.longitude,
//       );
//       log(`${signParams.tripNo}: SIGNATURE - App moved to Signature Screen.`);
//     }
//   }, [isFocused]);

//   useEffect(() => {
//     if (isNoSignChecked) setIsSaveVisible(true);
//     if (!isNoSignChecked) setIsSaveVisible(false);
//   }, [isNoSignChecked]);

//   const toggleCheckbox = () => {
//     setIsNoSignChecked(!isNoSignChecked);
//   };

//   const onSaveSignature = result => {
//     if (result !== null) {
//       console.log('Sending Trip Complete Location:', tripCompleteLoc);
//       console.log('Sending Trip Complete Time: ', signParams.tripCompletedTime);
//       log(`${signParams.tripNo}: SIGNATURE - Trip Complete Location : ${tripCompleteLoc}, Trip Complete Time : ${signParams.setTripCompletedTime}`);
//       AsyncStorage.setItem('currentScreen', 'Submit');
//       const submitParams = {
//         signatureData: result,
//         startKmReadings: signParams.startKmReadings,
//         pickupKmReadings: signParams.pickupKmReadings,
//         tripNo: signParams.tripNo,
//         driverId: signParams.driverId,
//         driverPhone: signParams.driverPhone,
//         custName: signParams.custName,
//         custMobile: signParams.custMobile,
//         pickUpLoc: signParams.pickUpLoc,
//         dropLoc: signParams.dropLoc,
//         pickupKmImageUri: signParams.pickupKmImageUri,
//         tripCompletedTime: signParams.tripCompletedTime,
//         tripCompleteLoc: tripCompleteLoc,
//         vendorAddress: signParams.vendorAddress,
//         startLatLong: signParams.startLatLong,
//         completeLat,
//         completeLong,
//         signTime,
//         isNoSignChecked,
//       };
//       AsyncStorage.setItem('submitParams', JSON.stringify(submitParams));
//       navigation.navigate('Submit', submitParams);
//       log(`${signParams.tripNo}: SIGNATURE - onSaveSignature - Data navigated to Submit Screen :
//         signatureData: ${result},
//         startKmReadings: ${signParams.startKmReadings},
//         pickupKmReadings: ${signParams.pickupKmReadings},
//         tripNo: ${signParams.tripNo},
//         driverId: ${signParams.driverId},
//         driverPhone: ${signParams.driverPhone},
//         custName: ${signParams.custName},
//         custMobile: ${signParams.custMobile},
//         pickUpLoc: ${signParams.pickUpLoc},
//         dropLoc: ${signParams.dropLoc},
//         pickupKmImageUri: ${signParams.pickupKmImageUri},
//         tripCompletedTime: ${signParams.tripCompletedTime},
//         tripCompleteLoc: ${tripCompleteLoc},
//         vendorAddress: ${signParams.vendorAddress},
//         startLatLong: ${signParams.startLatLong},
//         signTime: ${signTime},
//         isNoSignChecked: ${isNoSignChecked},`);
//     } else {
//       Alert.alert('Error', 'Enter a valid signature.');
//     }
//   };

//   const handleClear = () => {
//     signatureRef.current.resetImage();
//     setSignature('');
//     setIsSaveVisible(false);
//   };

//   const handleDrag = () => {
//     setIsSaveVisible(true);
//   };

//   const handleSave = () => {
//     log(`${signParams.tripNo}: SIGNATURE - handleSave - Method being called.`);
//     setSignTime(currentTime);
//     try {
//       const signatureData = signatureRef.current.saveImage();
//       setSignature(signatureData);
//       if(!isNoSignChecked){
//       Alert.alert(
//         translations[lang].alertHeading,
//         'Customer Signature saved successfully',
//         [
//           {
//             text: 'Ok',
//             onPress: () => {
//               console.log('Signature Saved');
//               log(`${signParams.tripNo}: SIGNATURE - handleSave - Signature Saved`);
//             },
//           },
//         ],
//         {cancelable: false},
//       );
//       }
//     } catch (error) {
//       console.error('Error saving signature:', error);
//       Alert.alert('Error', 'Failed to save signature data. Please try again.');
//       log(`${signParams.tripNo}: SIGNATURE - handleSave - Error saving signature : ${error}`);
//     }
//   };

//   // const { tripNo, custName, pickUpLoc, dropLoc } = route.params || {};

//   return (
//     <View style={styles.container}>
//       <Header />
//       <View style={styles.datetime}>
//         <Text allowFontScaling={false} style={styles.datetimetext}>{currentDateTime}</Text>
//       </View>
//       <View style={styles.tripDetails}>
//         <View>
//           <View style={styles.samerow}>
//             <View style={styles.leftSide}>
//               <Text allowFontScaling={false} style={styles.tripDetailsLabel}>
//                 {translations[lang].tripIdLabel}:{' '}
//               </Text>
//             </View>
//             <View style={styles.rightSide}>
//               <Text allowFontScaling={false} style={styles.tripDetailsData}>{signParams.tripNo}</Text>
//             </View>
//           </View>
//           <View style={styles.samerow}>
//             <View style={styles.leftSide}>
//               <Text allowFontScaling={false} style={styles.tripDetailsLabel}>
//                 {translations[lang].guestNameLabel}:{' '}
//               </Text>
//             </View>
//             <View style={styles.rightSide}>
//               <Text allowFontScaling={false} style={styles.tripDetailsData}>{signParams.custName}</Text>
//             </View>
//           </View>
//           <View style={styles.samerow}>
//             <View style={styles.leftSide}>
//               <Text allowFontScaling={false} style={styles.tripDetailsLabel}>
//                 {translations[lang].pickupAddressLabel}:{' '}
//               </Text>
//             </View>
//             <View style={styles.rightSide}>
//               <Text allowFontScaling={false} style={styles.tripDetailsData}>{signParams.pickUpLoc}</Text>
//             </View>
//           </View>
//           <View style={styles.samerow}>
//             <View style={styles.leftSide}>
//               <Text allowFontScaling={false} style={styles.tripDetailsLabel}>
//                 {translations[lang].dropLocationLabel}:{' '}
//               </Text>
//             </View>
//             <View style={styles.rightSide}>
//               <Text allowFontScaling={false} style={styles.tripDetailsData}>{signParams.dropLoc}</Text>
//             </View>
//           </View>
//         </View>
//       </View>
//       <View>
//         <Text allowFontScaling={false} style={styles.heading}>Guest Signature</Text>
//       </View>
//       <SignatureCapture
//         style={styles.signature}
//         ref={signatureRef}
//         onSaveEvent={onSaveSignature}
//         onDragEvent={handleDrag}
//         saveImageFileInExtStorage={false}
//         showNativeButtons={false}
//       />
//       <View style={styles.buttonContainer}>
//         <TouchableOpacity style={styles.button} onPress={handleClear}>
//           <Text allowFontScaling={false} style={styles.buttonText}>Clear</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.button,
//             {marginLeft: 10},
//             !isSaveVisible && styles.disabledButton,
//           ]}
//           onPress={handleSave}
//           disabled={!isSaveVisible}>
//           <Text allowFontScaling={false} style={styles.buttonText}>Save</Text>
//         </TouchableOpacity>
//       </View>
//       <View style={styles.noSignView}>
//         <BouncyCheckbox
//           size={18}
//           value={isNoSignChecked}
//           onPress={toggleCheckbox}
//           style={styles.checkbox}
//           fillColor="green"
//           unfillColor="#FFFFFF"
//           text="No Sign"
//           textStyle={{
//             textDecorationLine: 'none',
//             fontSize: 13,
//             alignSelf: 'flex-start',
//             color: 'black',
//           }}
//           iconStyle={{borderColor: '#012169'}}
//         />
//       </View>
//       <Footer />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'white',
//   },
//   datetime: {
//     alignSelf: 'flex-end',
//     paddingTop: '2%',
//     paddingRight:'1%',
//     paddingBottom: '1%',
//   },
//   datetimetext: {
//     color: 'black',
//     fontWeight: '800',
//     fontSize: 12,
//     fontFamily: 'Roboto-BoldItalic',
//     paddingRight: '1%',
//   },
//   tripDetails: {
//     flexDirection: 'row',
//     alignContent: 'center',
//     marginBottom: '5%',
//     paddingTop: '1%',
//   },
//   tripDetailsLabel: {
//     fontSize: 11,
//     color: 'black',
//     fontFamily: 'Roboto-MediumItalic',
//   },
//   tripDetailsData: {
//     fontSize: 11,
//     fontWeight: '800',
//     color: 'black',
//     fontFamily: 'Roboto-BoldItalic',
//   },
//   samerow: {
//     flexDirection: 'row',
//     margin: '0.5%',
//   },
//   leftSide: {
//     width: '30%',
//     alignItems: 'flex-start',
//     paddingLeft: '5%',
//   },
//   rightSide: {
//     width: '70%',
//     alignItems: 'flex-start',
//     paddingRight: '1%',
//   },
//   heading: {
//     fontSize: 18,
//     color: 'black',
//     fontWeight: '700',
//   },
//   signature: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//     borderColor: 'blue',
//     borderWidth: 2,
//     margin: 3,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 10,
//     backgroundColor: '#e6ffff',
//     width: '100%',
//   },
//   button: {
//     backgroundColor: '#012169',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   disabledButton: {
//     backgroundColor: '#d3d3d3',
//     opacity: 0.6,
//   },
//   font: {
//     color: 'black',
//     fontSize: 15,
//     fontFamily: 'Roboto-BoldItalic',
//   },
//   noSignView: {
//     paddingTop: 5,
//     alignSelf: 'flex-end',
//     paddingRight: '2%',
//   },
// });

// export default SignatureScreen;
import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faFileSignature} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewHeader from '../components/NewHeader';
import NewFooter from '../components/NewFooter';
import translations from '../translations';
import translationManager from '../translationManager';
import {useIsFocused} from '@react-navigation/native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {log, readLog} from '../components/Logger';
import {Colors} from '../config';
import config from '../config';
import {
  getTravelledDistance,
  getTravelledDistanceRound,
} from '../api/mapplsApi';
import {getCoordinatesForURL} from '../services/locationStorage';
import {
  getTotalDistance,
  fetchRouteDistance,
} from '../services/distanceTracker';

const SignatureScreen = ({route, navigation, language}) => {
  const lang = language || 'en';
  const [signParams, setSignParams] = useState({});
  const signatureRef = useRef(null);
  const [signature, setSignature] = useState('');
  const [signTime, setSignTime] = useState('');
  // const{ startKmReadings, pickupKmReadings, tripNo,driverId, custName, custMobile, pickUpLoc, dropLoc, pickupKmImageUri} = route.params;
  // const{tripCompleteLoc,tripCompletedTime} = route.params;
  const [tripCompletedTime, setTripCompletedTime] = useState('');
  const [tripCompleteLoc, setTripCompleteLoc] = useState('');
  // console.log(startKmReadings, pickupKmReadings, tripNo,driverId, custName, custMobile, pickUpLoc, dropLoc, pickupKmImageUri, tripCompletedTime, tripCompleteLoc);
  const isFocused = useIsFocused();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [completeLat, setCompleteLat] = useState('');
  const [completeLong, setCompleteLong] = useState('');
  const [position, setPosition] = useState('');
  const [isNoSignChecked, setIsNoSignChecked] = useState(false);
  const [isSaveVisible, setIsSaveVisible] = useState(false);
  const [approxTravelDistance, setApproxTravelDistance] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [routeGeometry, setRouteGeometry] = useState([]);

  useEffect(() => {
    const fetchParams = async () => {
      try {
        // Check if there are stored parameters in AsyncStorage
        const storedParams = await AsyncStorage.getItem('signParams');
        console.log('Received signParams:', storedParams);
        log('Received signParams:', storedParams);
        if (storedParams !== null) {
          // If stored parameters exist, use them
          setSignParams(JSON.parse(storedParams));
        } else {
          // If no stored parameters, use the parameters passed through navigation
          setSignParams(route.params);
        }
      } catch (error) {
        console.error(
          'SignatureScreen: Error retrieving params from AsyncStorage:',
          error,
        );
        log(
          'SignatureScreen: Error retrieving params from AsyncStorage:',
          error,
        );
      }
    };

    fetchParams();
  }, [route.params]);

  useEffect(() => {
    // Function to handle hardware back button press
    const backAction = () => {
      // Always prevent default behavior (disable back button)
      return true;
    };

    // Add event listener for hardware back button press
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    // Clean up the event listener on component unmount
    return () => backHandler.remove();
  }, []);

  // useEffect(()=>{
  //   Geolocation.getCurrentPosition((pos)=>{
  //     const crd = pos.coords;
  //     setPosition({
  //       latitude: crd.latitude,
  //       longitude: crd.longitude,
  //       latitudeDelta: 0.0421,
  //       longitudeDelta: 0.0421,
  //     });
  //   })
  // },[]);

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
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setPosition({latitude, longitude});
      },
      error => console.log(error),
      {enableHighAccuracy: false, timeout: 20000},
    );
  }, []);

  useEffect(() => {
    // Update current time every second
    const interval = setInterval(() => {
      const formattedTime = moment().format('YYYY-MM-DD HH:mm:ss');
      setCurrentTime(formattedTime);
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //     const fetchDistance = async () => {

  //       const {joinedCoords,arrayLength} = await getCoordinatesForURL();
  //       const totalKm = await getTravelledDistanceRound(joinedCoords,arrayLength);

  //       if (totalKm) {
  //         setApproxTravelDistance(totalKm);
  //       }
  //       else{
  //         setApproxTravelDistance('N/A');
  //       }
  //     };

  //     fetchDistance();
  // }, [signParams]);

  // useEffect(() => {
  //   const fetchDistance = async () => {
  //     //const totalKm = await getTotalDistance(); // for Distance API
  //     const {distanceKm, routeGeometry} = await fetchRouteDistance(); // for Route API

  //     console.log('Received Calculated Kms : ' + distanceKm);
  //     console.log('Received Route Geometry : ' + routeGeometry);

  //     if (distanceKm) {
  //       setApproxTravelDistance(distanceKm);
  //     } else {
  //       setApproxTravelDistance('0');
  //     }
  //     setRouteGeometry(routeGeometry);
  //   };

  //   fetchDistance();
  // }, [signParams]);

  useEffect(() => {
  const fetchDistance = async () => {
    const result = await fetchRouteDistance(); 

    if (result) {
      const { distanceKm, routeGeometry } = result;
      
      console.log('Received Calculated Kms:', distanceKm);
      // Use comma here to see the real string!
      console.log('Received Route Geometry:', routeGeometry); 

      setApproxTravelDistance(distanceKm || '0');
      setRouteGeometry(routeGeometry);
    } else {
      setApproxTravelDistance('0');
      setRouteGeometry(null);
    }
  };

  fetchDistance();
}, [signParams]);

  useEffect(() => {
    if (signTime) console.log('Sign Time(Effect):' + signTime);
  }, [signTime]);

  useEffect(() => {
    if (signTime) console.log('Sign Time(Effect):' + signTime);
  }, [signParams, tripCompleteLoc]);

  useEffect(() => {
    if (tripCompleteLoc)
      console.log(
        'Trip Complete Location(Effect):' +
          tripCompleteLoc.latitude +
          ',' +
          tripCompleteLoc.longitude,
      );
  }, [tripCompleteLoc]);

  useEffect(() => {
    if (isNoSignChecked) {
      console.log('No Sign Checked:', isNoSignChecked);
    }
  }, [isNoSignChecked]);

  useEffect(() => {
    if (position) setTripCompleteLoc(position);
  }, [position]);

  useEffect(() => {
    if (isFocused) {
      console.log(
        'Trip complete Time, Sign Time & Trip Complete Location(Focus):' +
          tripCompletedTime +
          ',' +
          signTime +
          ',' +
          tripCompleteLoc.latitude +
          ',' +
          tripCompleteLoc.longitude,
      );
      log(`${signParams.tripNo}: SIGNATURE - App moved to Signature Screen.`);
    }
  }, [isFocused]);

  useEffect(() => {
    if (isNoSignChecked) setIsSaveVisible(true);
    if (!isNoSignChecked) setIsSaveVisible(false);
  }, [isNoSignChecked]);

  const toggleCheckbox = () => {
    setIsNoSignChecked(!isNoSignChecked);
  };

  // const uploadSignDetails = async (apiUrlwithQuery, formData, logMessage) => {
  //   try {
  //     const response = await Promise.race([
  //       fetch(apiUrlwithQuery, {
  //         method: 'POST',
  //         body: formData,
  //       }),
  //       new Promise((_, reject) =>
  //         setTimeout(
  //           () =>
  //             reject(new Error('Request timed out, check internet connection')),
  //           20000,
  //         ),
  //       ),
  //     ]);

  //     if (response.ok) {
  //       console.log(`${logMessage} Uploaded Successfully.`, response);
  //       log(`SIGNATURE: uploadImage - ${logMessage} Uploaded Successfully.`);
  //     } else {
  //       console.log(`${logMessage} not uploaded:`, response.statusText);
  //       log(
  //         `SIGNATURE: uploadImage - ${logMessage} not uploaded. ${response.statusText}`,
  //       );
  //     }
  //   } catch (error) {
  //     console.error(`${logMessage} not uploaded:`, error.message);
  //     log(
  //       `ERROR - SIGNATURE: uploadImage - ${logMessage} not uploaded. ${error.message}`,
  //     );
  //     throw error; // Throw error to indicate failure
  //   }
  // };

  // const onSaveSignature = result => {
  //   if (result !== null) {
  //     console.log('Sending Trip Complete Location:', tripCompleteLoc);
  //     console.log('Sending Trip Complete Time: ', signParams.tripCompletedTime);
  //     log(
  //       `${signParams.tripNo}: SIGNATURE - Trip Complete Location : ${tripCompleteLoc}, Trip Complete Time : ${signParams.setTripCompletedTime}`,
  //     );
  //     AsyncStorage.setItem('currentScreen', 'Submit');
  //     const submitParams = {
  //       signatureData: result,
  //       startKmReadings: signParams.startKmReadings,
  //       pickupKmReadings: signParams.pickupKmReadings,
  //       endKmReadings: signParams.endKmReadings,
  //       tripNo: signParams.tripNo,
  //       driverId: signParams.driverId,
  //       driverPhone: signParams.driverPhone,
  //       custName: signParams.custName,
  //       custMobile: signParams.custMobile,
  //       pickUpLoc: signParams.pickUpLoc,
  //       dropLoc: signParams.dropLoc,
  //       pickupKmImageUri: signParams.pickupKmImageUri,
  //       endKmImageUri: signParams.endKmImageUri,
  //       tripCompletedTime: signParams.tripCompletedTime,
  //       tripCompleteLoc: tripCompleteLoc,
  //       vendorAddress: signParams.vendorAddress,
  //       startLatLong: signParams.startLatLong,
  //       pickupLatLong: signParams.pickupLatLong,
  //       dropLatLong: signParams.dropLatLong,
  //       completeLat,
  //       completeLong,
  //       signTime,
  //       isNoSignChecked,
  //       approxTravelDistance: signParams.approxTravelDistance,
  //     };
  //     AsyncStorage.setItem('submitParams', JSON.stringify(submitParams));
  //     navigation.navigate('Submit', submitParams);
  //     // navigation.navigate('Test', submitParams);

  //     log(`${signParams.tripNo}: SIGNATURE - onSaveSignature - Data navigated to Submit Screen :
  //       signatureData: ${result},
  //       startKmReadings: ${signParams.startKmReadings},
  //       pickupKmReadings: ${signParams.pickupKmReadings},
  //       tripNo: ${signParams.tripNo},
  //       driverId: ${signParams.driverId},
  //       driverPhone: ${signParams.driverPhone},
  //       custName: ${signParams.custName},
  //       custMobile: ${signParams.custMobile},
  //       pickUpLoc: ${signParams.pickUpLoc},
  //       dropLoc: ${signParams.dropLoc},
  //       pickupKmImageUri: ${signParams.pickupKmImageUri},
  //       tripCompletedTime: ${signParams.tripCompletedTime},
  //       tripCompleteLoc: ${tripCompleteLoc},
  //       vendorAddress: ${signParams.vendorAddress},
  //       startLatLong: ${signParams.startLatLong},
  //       signTime: ${signTime},
  //       isNoSignChecked: ${isNoSignChecked},`);
  //   } else {
  //     Alert.alert(
  //       translationManager.getTranslation('alertError'),
  //       translationManager.getTranslation('alertValidSign'),
  //     );
  //   }
  // };

  // const onSaveSignature = async result => {
  //   if (result !== null) {
  //     console.log('Sending Trip Complete Location:', tripCompleteLoc);
  //     console.log('Sending Trip Complete Time: ', signParams.tripCompletedTime);
  //     // Upload Sign Image
  //     try {
  //       const apiUrlwithQuery = `${config.apiPostUpload}${signParams.tripNo}&status=SIGNED`;
  //       const uploadPromises = [];
  //       if (!isNoSignChecked && result) {
  //         const formData = new FormData();
  //         formData.append('simg', result.encoded, 'signature.png');
  //         uploadPromises.push(
  //           uploadSignDetails(apiUrlwithQuery, formData, 'Sign Image'),
  //         );
  //       }
  //     } catch (error) {
  //       console.error('Error sending Sign details:', error.message);
  //       Alert.alert(
  //         'Low or No network connection',
  //         'Check your Internet connection and try again.',
  //         [{text: 'Ok'}],
  //         {cancelable: false},
  //       );
  //       return;
  //     }
  //     //---------------------------------------------
  //     log(
  //       `${signParams.tripNo}: SIGNATURE: Trip Complete Location : ${tripCompleteLoc}, Trip Complete Time : ${signParams.setTripCompletedTime}`,
  //     );
  //     //const startLocation = await obtainStartLatLong(signParams.vendorAddress);
  //     const submitParams = {
  //       signatureData: result,
  //       startKmReadings: signParams.startKmReadings,
  //       pickupKmReadings: signParams.pickupKmReadings,
  //       endKmReadings: signParams.endKmReadings,
  //       tripNo: signParams.tripNo,
  //       driverId: signParams.driverId,
  //       driverPhone: signParams.driverPhone,
  //       custName: signParams.custName,
  //       custMobile: signParams.custMobile,
  //       pickUpLoc: signParams.pickUpLoc,
  //       dropLoc: signParams.dropLoc,
  //       pickupKmImageUri: signParams.pickupKmImageUri,
  //       endKmImageUri: signParams.endKmImageUri,
  //       tripCompletedTime: signParams.tripCompletedTime,
  //       tripCompleteLoc: tripCompleteLoc,
  //       vendorAddress: signParams.vendorAddress,
  //       startLatLong: signParams.startLatLong,
  //       pickupLatLong: signParams.pickupLatLong,
  //       dropLatLong: signParams.dropLatLong,
  //       completeLat,
  //       completeLong,
  //       signTime,
  //       isNoSignChecked,
  //       approxTravelDistance: approxTravelDistance,
  //     };
  //     AsyncStorage.setItem('submitParams', JSON.stringify(submitParams));
  //     AsyncStorage.setItem('currentScreen', 'Submit');
  //     navigation.navigate('Submit', submitParams);
  //     log(`${signParams.tripNo}: SIGNATURE: onSaveSignature - Data navigated to Submit Screen :
  //       signatureData: ${result},
  //       startKmReadings: ${signParams.startKmReadings},
  //       pickupKmReadings: ${signParams.pickupKmReadings},
  //       tripNo: ${signParams.tripNo},
  //       driverId: ${signParams.driverId},
  //       driverPhone: ${signParams.driverPhone},
  //       custName: ${signParams.custName},
  //       custMobile: ${signParams.custMobile},
  //       pickUpLoc: ${signParams.pickUpLoc},
  //       dropLoc: ${signParams.dropLoc},
  //       pickupKmImageUri: ${signParams.pickupKmImageUri},
  //       tripCompletedTime: ${signParams.tripCompletedTime},
  //       tripCompleteLoc: ${tripCompleteLoc},
  //       vendorAddress: ${signParams.vendorAddress},
  //       startLatLong: ${signParams.startLatLong},
  //       signTime: ${signTime},
  //       isNoSignChecked: ${isNoSignChecked},`);
  //   } else {
  //     Alert.alert('Error', 'Enter a valid signature.');
  //   }
  // };  single api url call: causes NPA64 error in some devices...

  const onSaveSignature = async result => {
    try {
      setIsSaving(true);
      if (result !== null) {
        console.log('Sending Trip Complete Location:', tripCompleteLoc);
        console.log(
          'Sending Trip Complete Time: ',
          signParams.tripCompletedTime,
        );

        // Helper function for uploading with primary and alt URLs
        const uploadSignDetailsWithFallback = async (
          primaryUrl,
          altUrl,
          formData,
          type,
        ) => {
          try {
            console.log(
              `Attempting primary upload for ${type} to URL: ${primaryUrl}`,
            );
            const authToken = await AsyncStorage.getItem('API_AUTH_TOKEN');
            const response = await Promise.race([
              fetch(primaryUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'multipart/form-data',
                  'Authorization': `Bearer ${authToken}`,
                },
                body: formData,
              }),
              new Promise((_, reject) =>
                setTimeout(
                  () =>
                    reject(new Error(`Primary request for ${type} timed out`)),
                  20000, // 20-second timeout
                ),
              ),
            ]);

            if (!response.ok) {
              throw new Error(
                `Primary upload for ${type} failed, status: ${response.status}`,
              );
            }
            const responseData = await response.json();
            console.log(`${type} primary upload successful:`, responseData);
            log(
              `${signParams.tripNo}: SIGNATURE: ${type} primary upload successful: ${response.status}`,
            );
            return true; // Indicate success
          } catch (primaryError) {
            console.warn(
              `Primary upload for ${type} failed: ${primaryError.message}. Attempting alternative...`,
            );
            log(
              `${signParams.tripNo}: WARN SIGNATURE: Primary ${type} upload failed, attempting alternative: ${primaryError.message}`,
            );

            try {
              console.log(
                `Attempting alternative upload for ${type} to URL: ${altUrl}`,
              );
              const authToken = await AsyncStorage.getItem('API_AUTH_TOKEN');
              const altResponse = await Promise.race([
                fetch(altUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authToken}`,
                  },
                  body: formData,
                }),
                new Promise((_, reject) =>
                  setTimeout(
                    () =>
                      reject(
                        new Error(`Alternative request for ${type} timed out`),
                      ),
                    20000, // 20-second timeout
                  ),
                ),
              ]);

              if (!altResponse.ok) {
                throw new Error(
                  `Alternative upload for ${type} failed, status: ${altResponse.status}`,
                );
              }
              const altResponseData = await altResponse.json();
              console.log(
                `${type} alternative upload successful:`,
                altResponseData,
              );
              log(
                `${signParams.tripNo}: SIGNATURE: ${type} alternative upload successful: ${altResponse.status}`,
              );
              return true; // Indicate success
            } catch (altError) {
              console.error(
                `Both primary and alternative uploads for ${type} failed:`,
                altError.message,
              );
              log(
                `${signParams.tripNo}: ERROR - SIGNATURE: Both primary and alternative ${type} uploads failed: ${altError.message}`,
              );
              throw altError; // Re-throw the final error to the caller
            }
          }
        };

        // --- Signature Upload Logic ---
        let signatureUploadSuccess = false;
        if (!isNoSignChecked && result) {
          const primarySignUrl = `${config.apiPostUpload}${signParams.tripNo}&status=SIGNED`;
          const altSignUrl = `${config.apiPostUploadAlt}${signParams.tripNo}&status=SIGNED`; // Your alternative URL

          const formData = new FormData();
          formData.append('simg', result.encoded, 'signature.png');

          try {
            signatureUploadSuccess = await uploadSignDetailsWithFallback(
              primarySignUrl,
              altSignUrl,
              formData,
              'Sign Image',
            );
          } catch (error) {
            console.error(
              'Final error during signature upload:',
              error.message,
            );
            Alert.alert(
              'Network Error',
              'Failed to upload signature. Please check your internet connection and try again.',
              [{text: 'Ok'}],
              {cancelable: false},
            );
            log(
              `${signParams.tripNo}: ERROR - SIGNATURE: Signature uploads failed: ${error.message}`,
            );
            return; // **Crucial: Stop execution here if signature upload fails**
          }
        } else {
          // If no signature is required/provided, consider it a "success" for this step
          signatureUploadSuccess = true;
        }

        // --- Continue only if signature upload was successful or skipped ---
        if (signatureUploadSuccess) {
          log(
            `${signParams.tripNo}: SIGNATURE: Trip Complete Location : ${
              tripCompleteLoc
                ? `${tripCompleteLoc.latitude},${tripCompleteLoc.longitude}`
                : 'N/A'
            }, Trip Complete Time : ${signParams.tripCompletedTime}`,
          );

          const submitParams = {
            signatureData: result, // result might be null if isNoSignChecked is true
            startKmReadings: signParams.startKmReadings,
            pickupKmReadings: signParams.pickupKmReadings,
            endKmReadings: signParams.endKmReadings,
            tripNo: signParams.tripNo,
            driverId: signParams.driverId,
            driverPhone: signParams.driverPhone,
            custName: signParams.custName,
            custMobile: signParams.custMobile,
            pickUpLoc: signParams.pickUpLoc,
            dropLoc: signParams.dropLoc,
            pickupKmImageUri: signParams.pickupKmImageUri,
            endKmImageUri: signParams.endKmImageUri,
            tripCompletedTime: signParams.tripCompletedTime,
            tripCompleteLoc: tripCompleteLoc,
            vendorAddress: signParams.vendorAddress,
            startLatLong: signParams.startLatLong,
            pickupLatLong: signParams.pickupLatLong,
            dropLatLong: signParams.dropLatLong,
            completeLat,
            completeLong,
            signTime,
            isNoSignChecked,
            approxTravelDistance: approxTravelDistance,
            routeGeometry : routeGeometry,
          };

          try {
            await AsyncStorage.setItem(
              'submitParams',
              JSON.stringify(submitParams),
            );

            const storedParams = await AsyncStorage.getItem('submitParams');
            console.log('Received submitParams:', storedParams); 
            
            if (!isNoSignChecked) {
              Alert.alert(
                translationManager.getTranslation('alertSuccess'),
                translationManager.getTranslation('alertSignSaved'),
                [
                  {
                    text: 'Ok',
                    onPress: () => {
                      console.log('Signature Saved');
                      log(
                        `${signParams.tripNo}: SIGNATURE - handleSave - Signature Saved`,
                      );
                    },
                  },
                ],
                {cancelable: false},
              );
            }
            await AsyncStorage.setItem('currentScreen', 'Expense');
            navigation.navigate('Expense', submitParams);

                        console.log(`${
              signParams.tripNo
            }: SIGNATURE: onSaveSignature - Data navigated to Submit Screen :
          signatureData: ${result ? 'present' : 'absent'},
          startKmReadings: ${signParams.startKmReadings},
          pickupKmReadings: ${signParams.pickupKmReadings},
          tripNo: ${signParams.tripNo},
          driverId: ${signParams.driverId},
          driverPhone: ${signParams.driverPhone},
          custName: ${signParams.custName},
          custMobile: ${signParams.custMobile},
          pickUpLoc: ${signParams.pickUpLoc},
          dropLoc: ${signParams.dropLoc},
          pickupKmImageUri: ${signParams.pickupKmImageUri},
          tripCompletedTime: ${signParams.tripCompletedTime},
          tripCompleteLoc: ${
            tripCompleteLoc
              ? `${tripCompleteLoc.latitude},${tripCompleteLoc.longitude}`
              : 'N/A'
          },
          vendorAddress: ${signParams.vendorAddress},
          startLatLong: ${
            signParams.startLatLong
              ? `${signParams.startLatLong.latitude},${signParams.startLatLong.longitude}`
              : 'N/A'
          },
          signTime: ${signTime},
          isNoSignChecked: ${isNoSignChecked},`);

            log(`${
              signParams.tripNo
            }: SIGNATURE: onSaveSignature - Data navigated to Submit Screen :
          signatureData: ${result ? 'present' : 'absent'},
          startKmReadings: ${signParams.startKmReadings},
          pickupKmReadings: ${signParams.pickupKmReadings},
          tripNo: ${signParams.tripNo},
          driverId: ${signParams.driverId},
          driverPhone: ${signParams.driverPhone},
          custName: ${signParams.custName},
          custMobile: ${signParams.custMobile},
          pickUpLoc: ${signParams.pickUpLoc},
          dropLoc: ${signParams.dropLoc},
          pickupKmImageUri: ${signParams.pickupKmImageUri},
          tripCompletedTime: ${signParams.tripCompletedTime},
          tripCompleteLoc: ${
            tripCompleteLoc
              ? `${tripCompleteLoc.latitude},${tripCompleteLoc.longitude}`
              : 'N/A'
          },
          vendorAddress: ${signParams.vendorAddress},
          startLatLong: ${
            signParams.startLatLong
              ? `${signParams.startLatLong.latitude},${signParams.startLatLong.longitude}`
              : 'N/A'
          },
          signTime: ${signTime},
          isNoSignChecked: ${isNoSignChecked},`);
          } catch (storageError) {
            console.error(
              'Error saving to AsyncStorage or navigating:',
              storageError,
            );
            log(
              'Error saving to AsyncStorage or navigating:',
              storageError,
            );
            Alert.alert(
              'Error',
              'An error occurred while preparing for the next step. Please try again.',
              [{text: 'Ok'}],
              {cancelable: false},
            );
          }
        }
      } else {
        Alert.alert('Error', 'Enter a valid signature.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setSignature('');
    setIsSaveVisible(false);
  };

  const handleDrag = () => {
    setIsSaveVisible(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    log(`${signParams.tripNo}: SIGNATURE - handleSave - Method being called.`);
    setSignTime(currentTime);
    try {
      if (isNoSignChecked) {
        onSaveSignature({encoded: ''});
        return;
      }
      signatureRef.current?.readSignature();
    } catch (error) {
      console.error('Error saving signature:', error);
      Alert.alert(
        translationManager.getTranslation('alertError'),
        translationManager.getTranslation('alertSignSaveFailed'),
      );
      log(
        `${signParams.tripNo}: ERROR - SIGNATURE - handleSave - Error saving signature : ${error}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  // const { tripNo, custName, pickUpLoc, dropLoc } = route.params || {};

  return (
    <View style={styles.container}>
      <NewHeader showDrawer={false} />
      {/* Date/Time Display */}
      <View style={styles.datetime}>
        <Text allowFontScaling={false} style={styles.datetimeText}>
          {currentDateTime}
        </Text>
      </View>

      {/* Trip Details */}
      <View style={styles.card}>
        <Text allowFontScaling={false} style={styles.cardHeading}>
          {translationManager.getTranslation('tripDetailsHeading')}
        </Text>
        {[
          {
            label: translationManager.getTranslation('tripIdLabel'),
            value: signParams.tripNo,
          },
          {
            label: translationManager.getTranslation('reportTimeLabel'),
            value: signParams.reportTime,
          },
          {
            label: translationManager.getTranslation('guestNameLabel'),
            value: signParams.custName,
          },
          {
            label: translationManager.getTranslation('pickupAddressLabel'),
            value: signParams.pickUpLoc,
          },
          {
            label: translationManager.getTranslation('dropLocationLabel'),
            value: signParams.dropLoc,
          },
          // {
          //   label: translationManager.getTranslation('pickupKmLabel'),
          //   value: signParams.pickupKmReadings,
          // },
          // {
          //   label: translationManager.getTranslation('endKmLabel'),
          //   value: signParams.endKmReadings,
          // },
        ].map((item, index) => (
          <View style={styles.row} key={index}>
            <Text allowFontScaling={false} style={styles.label}>
              {item.label}:
            </Text>
            <Text allowFontScaling={false} style={styles.value}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Approx Distance */}
      <View style={styles.distanceView}>
        <Text allowFontScaling={false} style={styles.distanceText}>
          {translationManager.getTranslation('distanceApprox')}{' '}
          {approxTravelDistance} {translationManager.getTranslation('km')}
        </Text>
        <Text allowFontScaling={false} style={styles.garageKmText}>
          {translationManager.getTranslation('garageDistance')}
        </Text>
      </View>

      {/* Signature Section */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureHeading}>
          <FontAwesomeIcon icon={faFileSignature} size={20} color="#9b59b6" />
          <Text allowFontScaling={false} style={styles.signatureText}>
            {translationManager.getTranslation('guestSignatureHeading')}
          </Text>
        </View>
        <View style={styles.signatureWrapper}>
          <SignatureCanvas
            style={styles.signature}
            ref={signatureRef}
            onOK={dataUrl => {
              const encoded = String(dataUrl).replace(
                /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
                '',
              );
              onSaveSignature({encoded});
            }}
            onEmpty={() => {
              setIsSaving(false);
              Alert.alert('Error', 'Enter a valid signature.');
            }}
            onBegin={handleDrag}
            descriptionText=""
            backgroundColor="#ffffff"
            webStyle=".m-signature-pad--footer {display: none; margin: 0px;} .m-signature-pad {box-shadow: none; border: none;}"
          />
        </View>
      </View>

      {/* Buttons */}
      {/* <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleClear}>
          <Text allowFontScaling={false} style={styles.buttonText}>
            {translationManager.getTranslation('clearButton')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {marginLeft: 10},
            !isSaveVisible && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={!isSaveVisible}>
          <Text allowFontScaling={false} style={styles.buttonText}>
            {translationManager.getTranslation('saveButton')}
          </Text>
        </TouchableOpacity>
      </View> */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleClear}>
          <Text allowFontScaling={false} style={styles.buttonText}>
            {translationManager.getTranslation('clearButton')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {marginLeft: 10},
            !isSaveVisible && styles.disabledButton,
            isSaving && styles.disabledButton, // Visually disable when saving
          ]}
          onPress={handleSave}
          disabled={!isSaveVisible || isSaving}>
          {/* Disable when not visible OR when saving */}
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" /> // Show loader
          ) : (
            <Text allowFontScaling={false} style={styles.buttonText}>
              {translationManager.getTranslation('saveButton')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Checkbox */}
      <View style={styles.noSignView}>
        <BouncyCheckbox
          size={18}
          value={isNoSignChecked}
          onPress={toggleCheckbox}
          fillColor="green"
          unfillColor="#FFFFFF"
          text={translationManager.getTranslation('noSignLabel')}
          textStyle={{
            textDecorationLine: 'none',
            fontSize: 13,
            color: 'black',
            fontWeight: 'bold',
            fontFamily: 'sans-serif-condensed',
          }}
          iconStyle={{borderColor: '#012169'}}
        />
      </View>

      <NewFooter
        driverId={signParams.driverId}
        driverPhone={signParams.driverPhone}
        showReport={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  datetime: {
    // flex: 0.035,
    height: '3.5%',
    minHeight: 28,
    backgroundColor: Colors.dateTimeBackground,
    padding: 5,
    alignItems: 'center',
  },
  datetimeText: {
    color: Colors.dateTimeText,
    fontSize: 14,
    fontFamily: 'sans-serif-condensed',
    fontWeight: '700',
  },
  card: {
    // flex: 0.4,
    backgroundColor: Colors.cardBackground,
    height: '22%',
    minHeight: 150,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    paddingBottom: 10,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.headingText,
    marginBottom: 1,
    fontFamily: 'sans-serif-condensed',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  label: {
    fontSize: 12,
    color: Colors.label,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
  },
  value: {
    flexShrink: 1,
    fontSize: 12,
    color: Colors.value,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
    textAlign: 'right',
  },
  distanceView: {
    // flex: 0.04,
    height: '5%',
    margin: 15,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
  },
  garageKmText: {
    fontSize: 12,
    color: '#DC143C',
    fontFamily: 'sans-serif-condensed',
    fontWeight: 'bold',
  },
  signatureText: {
    fontSize: 15,
    color: '#0c4160',
    fontWeight: 'bold',
    marginLeft: 5,
    fontFamily: 'sans-serif-condensed',
  },
  signatureSection: {
    // flex: 0.8,
    height: '41%',
    minHeight: 260,
    marginHorizontal: 13,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  signatureHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    color: Colors.headingText,
  },
  signatureWrapper: {
    borderRadius: 5,
    padding: 5,
    flex: 1,
  },
  signature: {
    flex: 1,
    // height: 370, // Keep only supported styles for the SignatureCapture component
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    flex: 1,
  },
  buttonContainer: {
    // flex: 0.09,
    height: '5%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: Colors.buttons,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 42,
    minHeight: 36,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#DDDDDD',
  },
  noSignView: {
    // flex: 0.02,
    height: '2%',
    margin: 12,
    paddingRight: 5,
    alignItems: 'flex-end',
  },
});

export default SignatureScreen;
