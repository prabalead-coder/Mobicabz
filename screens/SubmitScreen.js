//OG Layout....
// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   BackHandler,
//   Keyboard,
// } from 'react-native';
// import SubmitImageUpload from '../components/SubmitImageUpload';
// import SubmitImageCapture from '../components/SubmitImageCapture';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import translations from '../translations';
// import MySubmitButton from '../components/MySubmitButton';
// import {useNavigation} from '@react-navigation/native';
// import {log, readLog} from '../components/Logger';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import BouncyCheckbox from 'react-native-bouncy-checkbox';
// import {
//   ALERT_TYPE,
//   Dialog,
//   AlertNotificationRoot,
//   Toast,
// } from 'react-native-alert-notification';
// import {stat} from 'react-native-fs';

// const SubmitScreen = ({route, language}) => {
//   const lang = language || 'en';
//   const [submitParams, setSubmitParams] = useState({});
//   const navigation = useNavigation();
//   const [endKmReadings, setEndKmReadings] = useState('');
//   const [parkingReadings, setParkingReadings] = useState('');
//   const [permitReadings, setPermitReadings] = useState('');
//   const [fastagReadings, setFastagReadings] = useState('');
//   const [fastagToDisplay, setFastagToDisplay] = useState('');
//   // const [endKmImageUri, setEndKmImageUri] = useState('');
//   const [parkingImageUri, setParkingImageUri] = useState('');
//   const [permitImageUri, setPermitImageUri] = useState('');
//   const [fastagImageUri, setFastagImageUri] = useState('');
//   const [isFastagChecked, setIsFastagChecked] = useState(false);
//   const [currentDateTime, setCurrentDateTime] = useState('');
//   const [nextEnable, setNextEnable] = useState(false);
//   const [status, setStatus] = useState('COMPLETED');
//   const [isKeyboardVisible, setKeyboardVisible] = useState(false);
//   const [isDropUploaded, setIsDropUploaded] = useState(false);
//   const [isParkingUploaded, setIsParkingUploaded] = useState(false);
//   const [isPermitUploaded, setIsPermitUploaded] = useState(false);
//   const [isFastagUploaded, setIsFastagUploaded] = useState(false);

//   useEffect(() => {
//     const fetchParams = async () => {
//       try {
//         // Check if there are stored parameters in AsyncStorage
//         const storedParams = await AsyncStorage.getItem('submitParams');
//         console.log('Received submitParams:', storedParams);
//         if (storedParams !== null) {
//           // If stored parameters exist, use them
//           setSubmitParams(JSON.parse(storedParams));
//         } else {
//           // If no stored parameters, use the parameters passed through navigation
//           setSubmitParams(route.params);
//         }
//       } catch (error) {
//         console.error('Error retrieving params from AsyncStorage:', error);
//       }
//     };

//     fetchParams();
//   }, [route.params]);

//   // Retrieve state values from AsyncStorage
//   const retrieveState = async () => {
//     try {
//       const storedEndKmReadings = await AsyncStorage.getItem('endKmReadings');
//       const storedParkingReadings = await AsyncStorage.getItem(
//         'parkingReadings',
//       );
//       const storedPermitReadings = await AsyncStorage.getItem('permitReadings');
//       const storedFastagReadings = await AsyncStorage.getItem('fastagReadings');
//       // const storedEndKmImageUri = await AsyncStorage.getItem('endKmImageUri');
//       // const storedParkingImageUri = await AsyncStorage.getItem('parkingImageUri');
//       // const storedPermitImageUri = await AsyncStorage.getItem('permitImageUri');
//       // const storedFastagImageUri = await AsyncStorage.getItem('fastagImageUri');
//       setEndKmReadings(storedEndKmReadings !== null ? storedEndKmReadings : '');
//       setParkingReadings(
//         storedParkingReadings !== null ? storedParkingReadings : '',
//       );
//       setPermitReadings(
//         storedPermitReadings !== null ? storedPermitReadings : '',
//       );
//       setFastagReadings(
//         storedFastagReadings !== null ? storedFastagReadings : '',
//       );
//       // setEndKmImageUri(storedEndKmImageUri);
//       // setParkingImageUri(storedParkingImageUri);
//       // setPermitImageUri(storedPermitImageUri);
//       // setFastagImageUri(storedFastagImageUri);
//       console.log('fastag reading:', storedFastagReadings);
//     } catch (error) {
//       console.error('Error retrieving state:', error);
//     }
//   };

//   // Call retrieveState when the screen mounts
//   useEffect(() => {
//     retrieveState();
//   }, []);

//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       () => {
//         setKeyboardVisible(true);
//       },
//     );
//     const keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       () => {
//         setKeyboardVisible(false);
//       },
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

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
//     if (isFastagChecked) {
//       setFastagReadings('0');
//       setFastagToDisplay('To be added');
//       setStatus('FASTAGPENDING');
//       log(`${submitParams.tripNo}: SUBMIT - Trip status changed: FASTAGPENDING`);
//     } else {
//       setFastagToDisplay(fastagReadings);
//       setStatus('COMPLETED');
//       log('SBS : Trip status changed: COMPLETED');
//     }
//   }, [isFastagChecked, fastagReadings, fastagToDisplay]);

//   // useEffect(() => {
//   //   console.log(parkingReadings,permitReadings,fastagReadings,fastagToDisplay,parkingImageUri,permitImageUri,fastagImageUri,isFastagChecked,status,signTime,tripCompleteLoc.latitude,tripCompleteLoc.longitude,isNoSignChecked,tripCompletedTime);
//   // }, [parkingReadings,permitReadings,fastagReadings,fastagToDisplay,parkingImageUri,permitImageUri,fastagImageUri,isFastagChecked,status,signTime,tripCompleteLoc,tripCompletedTime]);

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

//   // const handleBack = () => {
//   //   navigation.goBack();
//   // };

//   // useEffect(() => {
//   //   if (endKmReadings == '' || endKmImageUri == '') {
//   //     setNextEnable(false);
//   //   } else {
//   //     setNextEnable(true);
//   //   }
//   // }, [endKmReadings, endKmImageUri]);

//   const handleEndKmReadings = async text => {
//     setEndKmReadings(text);
//     await AsyncStorage.setItem('endKmReadings', text);
//   };

//   const handleParkingReadings = async text => {
//     setParkingReadings(text);
//     await AsyncStorage.setItem('parkingReadings', text);
//   };

//   const handlePermitReadings = async text => {
//     setPermitReadings(text);
//     await AsyncStorage.setItem('permitReadings', text);
//   };

//   const handleFastagReadings = async text => {
//     setFastagReadings(text);
//     await AsyncStorage.setItem('fastagReadings', text);
//   };

//   const handleEndKmImageCapture = async uri => {
//     // setEndKmImageUri(uri);
//     log(
//       `${submitParams.tripNo}: SUBMIT - handleEndKmImageCapture - End Km image uploaded successfully.`,
//     );
//     // await AsyncStorage.setItem('endKmImageUri', uri);
//     if (endKmImageUri != null) {
//       setIsDropUploaded(true);
//     }
//   };

//   // const handleParkingImageCapture = async uri => {
//   //   setParkingImageUri(uri);
//   //   log(`${submitParams.tripNo}: SUBMIT - handleParkingImageCapture - Parking image uploaded successfully.`);
//   //   // await AsyncStorage.setItem('parkingImageUri', uri);
//   //   if (parkingImageUri != null) {
//   //     setIsParkingUploaded(true);
//   //   }
//   // };

//   const handleParkingImageCapture = async uri => {
//     try {
//       console.log('handleParkingImageCapture called with URI:', uri);
//       setParkingImageUri(uri);
//       log(
//         `${submitParams.tripNo}: SUBMIT - handleParkingImageCapture - Parking image uploaded successfully.`,
//       );
//       // await AsyncStorage.setItem('parkingImageUri', uri);
//       if (parkingImageUri != null) {
//         setIsParkingUploaded(true);
//       }
//       console.log('Image captured and state updated successfully');
//     } catch (error) {
//       console.error('Error in handleParkingImageCapture:', error);
//       log(
//         `${submitParams.tripNo}: SUBMIT - handleParkingImageCapture - Error uploading parking image: ${error.message}`,
//       );
//     }
//   };

//   const handlePermitImageSelect = async uri => {
//     setPermitImageUri(uri);
//     log(
//       `${submitParams.tripNo}: SUBMIT - handlePermitImageSelect - Permit image uploaded successfully.`,
//     );
//     // await AsyncStorage.setItem('permitImageUri', uri);
//     if (permitImageUri != null) {
//       setIsPermitUploaded(true);
//     }
//   };

//   const handleFastagImageSelect = async uri => {
//     setFastagImageUri(uri);
//     log(
//       `${submitParams.tripNo}: SUBMIT - handleFastagIamgeSelect - Fastag image uploaded successfully.`,
//     );
//     // await AsyncStorage.setItem('fastagImageUri', uri);
//     if (fastagImageUri != null) {
//       setIsFastagUploaded(true);
//     }
//   };

//   function validateInput(inputValue) {
//     // Define a regular expression pattern to match only numbers
//     var pattern = /^[0-9]*$/;
//     // Test the input value against the pattern
//     if (!pattern.test(inputValue)) {
//       Alert.alert('Invalid Input', ' Please enter only numbers.');
//       return false; // Return false to indicate validation failure
//     }
//     return true; // Return true if validation succeeds
//   }

//   const handleSubmit = () => {
//     log(`${submitParams.tripNo}: SUBMIT - handleSubmit - Method being called...`);
//     log(
//       `${submitParams.tripNo}: SUBMIT - handlesubmit - Entered Drop Km reading: ${endKmReadings}`,
//     );
//     log(
//       `${submitParams.tripNo}: SUBMIT - handlesubmit - Entered Parking reading: ${parkingReadings}`,
//     );
//     log(
//       `${submitParams.tripNo}: SUBMIT - handlesubmit - Entered Fastag reading: ${fastagReadings}`,
//     );
//     log(
//       `${submitParams.tripNo}: SUBMIT - handlesubmit - Entered Permit reading: ${permitReadings}`,
//     );
//     // Validation of endKmReadings, parkingReadings, permitReadings, and fastagReadings
//     if (
//       !validateInput(endKmReadings) ||
//       !validateInput(parkingReadings) ||
//       !validateInput(permitReadings) ||
//       !validateInput(fastagReadings)
//     ) {
//       return; // Exit early if any of the inputs are invalid
//     }

//     // Handling fastag status
//     if (isFastagChecked) {
//       setStatus('FASTAGPENDING');
//       setFastagReadings('0');
//       console.log('Status updated after checking fastag: ', status);
//     } else {
//       setStatus('COMPLETED');
//     }

//     // Checking endKmReadings and related conditions
//     if (endKmReadings === '') {
//       Alert.alert(
//         'Alert',
//         'Enter the drop kilometer reading before continuing.',
//       );
//       return;
//     }
//     if (parseInt(endKmReadings) < parseInt(submitParams.pickupKmReadings)) {
//       Alert.alert(
//         'Alert',
//         'Drop kilometer should not be less than Pickup kilometer.',
//       );
//       setEndKmReadings('0');
//       return;
//     }
//     // if (endKmImageUri === '') {
//     //   Alert.alert(
//     //     'Alert',
//     //     'Upload the drop kilometer image before continuing.',
//     //   );
//     //   return;
//     // }
//     AsyncStorage.setItem('currentScreen', 'Summary');
//     const summaryParams = {
//       signatureData: submitParams.signatureData,
//       driverId: submitParams.driverId,
//       driverPhone: submitParams.driverPhone,
//       startKmReadings: submitParams.startKmReadings,
//       pickupKmReadings: submitParams.pickupKmReadings,
//       endKmReadings,
//       fastagReadings,
//       parkingReadings,
//       permitReadings,
//       tripNo: submitParams.tripNo,
//       custName: submitParams.custName,
//       custMobile: submitParams.custMobile,
//       pickUpLoc: submitParams.pickUpLoc,
//       dropLoc: submitParams.dropLoc,
//       pickupKmImageUri: submitParams.pickupKmImageUri,
//       // endKmImageUri,
//       parkingImageUri,
//       fastagImageUri,
//       fastagToDisplay,
//       permitImageUri,
//       status,
//       tripCompletedTime: submitParams.tripCompletedTime,
//       tripCompleteLoc: submitParams.tripCompleteLoc,
//       vendorAddress: submitParams.vendorAddress,
//       startLatLong: submitParams.startLatLong,
//       signTime: submitParams.signTime,
//       completeLat: submitParams.completeLat,
//       completeLong: submitParams.completeLong,
//       isNoSignChecked: submitParams.isNoSignChecked,
//     };
//     AsyncStorage.setItem('summaryParams', JSON.stringify(summaryParams));
//     navigation.navigate('Summary', summaryParams);
//     // setEndKmReadings('');
//     // setFastagReadings('');
//     // setPermitReadings('');
//     // setParkingReadings('');
//     log(`${submitParams.tripNo}: SUBMIT - handleSubmit - Method completed`);
//     log(`${submitParams.tripNo}: SUBMIT - handleSubmit - Data navigated to Summary Screen:
//       signatureData: ${submitParams.signatureData},
//       driverId: ${submitParams.driverId},
//       driverPhone: ${submitParams.driverPhone},
//       startKmReadings: ${submitParams.startKmReadings},
//       pickupKmReadings: ${submitParams.pickupKmReadings},
//       endKmReadings: ${endKmReadings},
//       fastagReadings: ${fastagReadings},
//       parkingReadings: ${parkingReadings},
//       permitReadings: ${permitReadings},
//       tripNo: ${submitParams.tripNo},
//       custName: ${submitParams.custName},
//       custMobile: ${submitParams.custMobile},
//       pickUpLoc: ${submitParams.pickUpLoc},
//       dropLoc: ${submitParams.dropLoc},
//       pickupKmImageUri: ${submitParams.pickupKmImageUri},
//       parkingImageUri: ${parkingImageUri},
//       fastagImageUri: ${fastagImageUri},
//       fastagToDisplay: ${fastagToDisplay},
//       permitImageUri: ${permitImageUri},
//       status: ${status},
//       tripCompletedTime: ${submitParams.tripCompletedTime},
//       tripCompleteLoc: ${submitParams.tripCompleteLoc},
//       vendorAddress: ${submitParams.vendorAddress},
//       startLatLong: ${submitParams.startLatLong},
//       signTime: ${submitParams.signTime},
//       completeLat: ${submitParams.completeLat},
//       completeLong: ${submitParams.completeLong},
//       isNoSignChecked: ${submitParams.isNoSignChecked},`);
//   };

//   const toggleCheckbox = () => {
//     setIsFastagChecked(!isFastagChecked);
//   };

//   return (
//     <View style={styles.container}>
//       <Header />
//       <View style={styles.datetime}>
//         <Text allowFontScaling={false} style={styles.datetimetext}>
//           {currentDateTime}
//         </Text>
//       </View>
//       <View style={styles.pageheading}>
//         <Text allowFontScaling={false} style={styles.heading}>
//           {translations[lang].tripSubmitHeading}
//         </Text>
//       </View>
//       <ScrollView>
//         <View>
//           {/* <Text>Latitude: {tripCompleteLoc.latitude}</Text>
//         <Text>Longitude: {tripCompleteLoc.longitude}</Text> */}
//           <Text allowFontScaling={false} style={styles.label}>
//             {translations[lang].pickupKmLabel}: {submitParams.pickupKmReadings}{' '}
//           </Text>
//           <Text allowFontScaling={false} style={styles.label}>
//             {translations[lang].endKmLabel}:{' '}
//             <Text allowFontScaling={false} style={styles.mandatory}>
//               *{' '}
//             </Text>
//           </Text>
//           <View style={styles.uploads}>
//             <TextInput
//               allowFontScaling={false}
//               style={styles.textinput}
//               placeholder={translations[lang].enterKmPlaceholder}
//               placeholderTextColor={'#808080'}
//               keyboardType="numeric"
//               value={endKmReadings}
//               // onChangeText={setEndKmReadings}
//               onChangeText={handleEndKmReadings}
//               maxLength={7}
//             />
//             <SubmitImageCapture
//               title={translations[lang].uploadImageButton}
//               onImageCapture={handleEndKmImageCapture}
//               disabled={
//                 isDropUploaded == true || isDropUploaded == false
//               }></SubmitImageCapture>
//           </View>
//           <Text allowFontScaling={false} style={styles.label}>
//             {translations[lang].totalParkingLabel}:{' '}
//           </Text>
//           <View style={styles.uploads}>
//             <TextInput
//               allowFontScaling={false}
//               style={styles.textinput}
//               placeholder={translations[lang].parkingPlaceholder}
//               keyboardType="numeric"
//               placeholderTextColor={'#808080'}
//               value={parkingReadings}
//               // onChangeText={setParkingReadings}
//               onChangeText={handleParkingReadings}
//               maxLength={7}
//             />
//             <SubmitImageCapture
//               title={translations[lang].uploadImageButton}
//               onImageCapture={handleParkingImageCapture}></SubmitImageCapture>
//           </View>
//           <Text allowFontScaling={false} style={styles.label}>
//             {translations[lang].totalPermitLabel}:{' '}
//           </Text>
//           <View style={styles.uploads}>
//             <TextInput
//               allowFontScaling={false}
//               style={styles.textinput}
//               placeholder={translations[lang].permitPlaceholder}
//               placeholderTextColor={'#808080'}
//               keyboardType="numeric"
//               value={permitReadings}
//               // onChangeText={setPermitReadings}
//               onChangeText={handlePermitReadings}
//               maxLength={7}
//             />
//             <SubmitImageUpload
//               title={translations[lang].uploadImageButton}
//               onImageUpload={handlePermitImageSelect}
//               // disabled={isPermitUploaded == true}
//             ></SubmitImageUpload>
//           </View>
//           <Text allowFontScaling={false} style={styles.label}>
//             {translations[lang].totalFastagLabel}:{' '}
//           </Text>
//           <View style={styles.uploads}>
//             <TextInput
//               allowFontScaling={false}
//               style={styles.textinput}
//               placeholder={translations[lang].fastagPlaceholder}
//               placeholderTextColor={'#808080'}
//               keyboardType="numeric"
//               value={fastagReadings}
//               // onChangeText={setFastagReadings}
//               onChangeText={handleFastagReadings}
//               maxLength={7}
//               editable={!isFastagChecked}
//             />
//             <SubmitImageUpload
//               title={translations[lang].uploadImageButton}
//               onImageUpload={handleFastagImageSelect}
//               // disabled={isFastagUploaded == true}
//             ></SubmitImageUpload>
//           </View>
//           <View style={styles.checkboxview}>
//             <BouncyCheckbox
//               size={18}
//               value={isFastagChecked}
//               onPress={toggleCheckbox}
//               style={styles.checkbox}
//               fillColor="green"
//               unfillColor="#FFFFFF"
//               text="Fastag Charged"
//               textStyle={{
//                 // allowFontScaling: false,
//                 textDecorationLine: 'none',
//                 fontSize: 13,
//                 alignSelf: 'flex-start',
//                 color: 'black',
//               }}
//               iconStyle={{borderColor: '#012169'}}
//             />
//           </View>
//         </View>
//         {/* <Image
//     source={{ signatureUri }}
//     style={{ width: 200, height: 200 }} // Adjust width and height as needed
//   /> */}
//       </ScrollView>
//       <View style={styles.submitButtonView}>
//         <MySubmitButton
//           title={translations[lang].nextButton}
//           onPress={handleSubmit}></MySubmitButton>
//       </View>
//       {!isKeyboardVisible && <Footer />}
//     </View>
//   );
// };

// export default SubmitScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: 'white',
//   },
//   pageheading: {
//     height: '10%',
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     // flexDirection:'row',
//   },
//   backButton: {
//     width: '10%',
//     alignContent: 'flex-start',
//     justifyContent: 'center',
//   },
//   pageheadingText: {
//     justifyContent: 'center',
//     // paddingLeft:'25%'
//   },
//   datetime: {
//     height: '5%',
//     alignSelf: 'flex-end',
//     paddingTop: '2%',
//     paddingRight: '1%',
//     paddingBottom: '1%',
//   },
//   datetimetext: {
//     color: 'black',
//     fontWeight: '800',
//     fontSize: 12,
//     fontFamily: 'Roboto-BoldItalic',
//     paddingRight: '1%',
//   },
//   maincontent: {
//     height: '70%',
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     paddingHorizontal: '5%',
//   },
//   inputs: {
//     height: '75%',
//   },
//   heading: {
//     fontSize: 20,
//     color: 'black',
//     fontWeight: '700',
//     alignSelf: 'center',
//   },
//   label: {
//     alignSelf: 'flex-start',
//     marginTop: 10,
//     color: 'black',
//     fontSize: 16,
//     fontFamily: 'Roboto-BoldItalic',
//   },
//   textinput: {
//     marginBottom: '3%',
//     borderColor: '#012169',
//     borderWidth: 1.5,
//     marginRight: '5%',
//     height: 45,
//     width: '50%',
//     color: 'black',
//   },
//   uploads: {
//     flexDirection: 'row',
//     padding: 0,
//     marginBottom: 0,
//     alignContent: 'center',
//     justifyContent: 'center',
//   },
//   mandatory: {
//     color: 'red',
//   },
//   submitButtonView: {
//     paddingTop: 10,
//     paddingBottom: 10,
//   },
//   signatureImage: {
//     width: 200,
//     height: 100,
//     resizeMode: 'contain',
//   },
//   checkboxview: {
//     paddingLeft: '7%',
//   },
// });

//Latest Layout.....
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import SubmitImageUpload from '../components/SubmitImageUpload';
import SubmitImageCapture from '../components/SubmitImageCapture';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faRectangleList, faMoneyCheck, faMoneyBill, faMoneyCheckAlt, faMoneyCheckDollar} from '@fortawesome/free-solid-svg-icons';
import translations from '../translations';
import translationManager from '../translationManager';
import MySubmitButton from '../components/MySubmitButton';
import {useNavigation} from '@react-navigation/native';
import {log, readLog} from '../components/Logger';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewHeader from '../components/NewHeader';
import NewFooter from '../components/NewFooter';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { Colors } from '../config';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
} from 'react-native-alert-notification';
import {stat} from 'react-native-fs';
import { orderByDistance } from 'geolib';

const SubmitScreen = ({route, language}) => {
  const lang = language || 'en';
  const [submitParams, setSubmitParams] = useState({});
  const navigation = useNavigation();
  const [endKmReadings, setEndKmReadings] = useState('');
  const [parkingReadings, setParkingReadings] = useState('');
  const [permitReadings, setPermitReadings] = useState('');
  const [fastagReadings, setFastagReadings] = useState('');
  const [fastagToDisplay, setFastagToDisplay] = useState('');
  // const [endKmImageUri, setEndKmImageUri] = useState('');
  const [parkingImageUri, setParkingImageUri] = useState('');
  const [permitImageUri, setPermitImageUri] = useState('');
  const [fastagImageUri, setFastagImageUri] = useState('');
  const [isFastagChecked, setIsFastagChecked] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [nextEnable, setNextEnable] = useState(false);
  const [status, setStatus] = useState('COMPLETED');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isDropUploaded, setIsDropUploaded] = useState(false);
  const [isParkingUploaded, setIsParkingUploaded] = useState(false);
  const [isPermitUploaded, setIsPermitUploaded] = useState(false);
  const [isFastagUploaded, setIsFastagUploaded] = useState(false);

  useEffect(() => {
    const fetchParams = async () => {
      try {
        // Check if there are stored parameters in AsyncStorage
        const storedParams = await AsyncStorage.getItem('submitParams');
        console.log('Received submitParams:', storedParams);
        if (storedParams !== null) {
          // If stored parameters exist, use them
          setSubmitParams(JSON.parse(storedParams));
        } else {
          // If no stored parameters, use the parameters passed through navigation
          setSubmitParams(route.params);
        }
      } catch (error) {
        console.error('Error retrieving params from AsyncStorage:', error);
      }
    };

    fetchParams();
  }, [route.params]);

  // Retrieve state values from AsyncStorage
  const retrieveState = async () => {
    try {
      const storedEndKmReadings = await AsyncStorage.getItem('endKmReadings');
      const storedParkingReadings = await AsyncStorage.getItem(
        'parkingReadings',
      );
      const storedPermitReadings = await AsyncStorage.getItem('permitReadings');
      const storedFastagReadings = await AsyncStorage.getItem('fastagReadings');
      // const storedEndKmImageUri = await AsyncStorage.getItem('endKmImageUri');
      // const storedParkingImageUri = await AsyncStorage.getItem('parkingImageUri');
      // const storedPermitImageUri = await AsyncStorage.getItem('permitImageUri');
      // const storedFastagImageUri = await AsyncStorage.getItem('fastagImageUri');
      setEndKmReadings(storedEndKmReadings !== null ? storedEndKmReadings : '');
      setParkingReadings(
        storedParkingReadings !== null ? storedParkingReadings : '',
      );
      setPermitReadings(
        storedPermitReadings !== null ? storedPermitReadings : '',
      );
      setFastagReadings(
        storedFastagReadings !== null ? storedFastagReadings : '',
      );
      // setEndKmImageUri(storedEndKmImageUri);
      // setParkingImageUri(storedParkingImageUri);
      // setPermitImageUri(storedPermitImageUri);
      // setFastagImageUri(storedFastagImageUri);
      console.log('fastag reading:', storedFastagReadings);
    } catch (error) {
      console.error('Error retrieving state:', error);
    }
  };

  // Call retrieveState when the screen mounts
  useEffect(() => {
    retrieveState();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
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

  useEffect(() => {
    if (isFastagChecked) {
      // setFastagReadings('0');
      setFastagToDisplay(fastagReadings);
      setStatus('FASTAGPENDING');
      log(`${submitParams.tripNo}: SUBMIT - Trip status changed: FASTAGPENDING`);
    } else {
      setFastagToDisplay(fastagReadings);
      setStatus('COMPLETED');
      log(`${submitParams.tripNo}: SUBMIT - Trip status changed: COMPLETED`);
    }
  }, [isFastagChecked, fastagReadings, fastagToDisplay]);

  // useEffect(() => {
  //   console.log(parkingReadings,permitReadings,fastagReadings,fastagToDisplay,parkingImageUri,permitImageUri,fastagImageUri,isFastagChecked,status,signTime,tripCompleteLoc.latitude,tripCompleteLoc.longitude,isNoSignChecked,tripCompletedTime);
  // }, [parkingReadings,permitReadings,fastagReadings,fastagToDisplay,parkingImageUri,permitImageUri,fastagImageUri,isFastagChecked,status,signTime,tripCompleteLoc,tripCompletedTime]);

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

  // const handleBack = () => {
  //   navigation.goBack();
  // };

  // useEffect(() => {
  //   if (endKmReadings == '' || endKmImageUri == '') {
  //     setNextEnable(false);
  //   } else {
  //     setNextEnable(true);
  //   }
  // }, [endKmReadings, endKmImageUri]);

  const handleEndKmReadings = async text => {
    setEndKmReadings(text);
    await AsyncStorage.setItem('endKmReadings', text);
  };

  const handleParkingReadings = async text => {
    setParkingReadings(text);
    await AsyncStorage.setItem('parkingReadings', text);
  };

  const handlePermitReadings = async text => {
    setPermitReadings(text);
    await AsyncStorage.setItem('permitReadings', text);
  };

  const handleFastagReadings = async text => {
    setFastagReadings(text);
    await AsyncStorage.setItem('fastagReadings', text);
  };

  const handleEndKmImageCapture = async uri => {
    // setEndKmImageUri(uri);
    log(
      `${submitParams.tripNo}: SUBMIT - handleEndKmImageCapture - End Km image uploaded successfully.`,
    );
    // await AsyncStorage.setItem('endKmImageUri', uri);
    if (endKmImageUri != null) {
      setIsDropUploaded(true);
    }
  };

  // const handleParkingImageCapture = async uri => {
  //   setParkingImageUri(uri);
  //   log(`${submitParams.tripNo}: SUBMIT - handleParkingImageCapture - Parking image uploaded successfully.`);
  //   // await AsyncStorage.setItem('parkingImageUri', uri);
  //   if (parkingImageUri != null) {
  //     setIsParkingUploaded(true);
  //   }
  // };

  const handleParkingImageCapture = async uri => {
    try {
      console.log('handleParkingImageCapture called with URI:', uri);
      setParkingImageUri(uri);
      log(
        `${submitParams.tripNo}: SUBMIT - handleParkingImageCapture - Parking image uploaded successfully.`,
      );
      // await AsyncStorage.setItem('parkingImageUri', uri);
      if (parkingImageUri != null) {
        setIsParkingUploaded(true);
      }
      console.log('Image captured and state updated successfully');
    } catch (error) {
      console.error('Error in handleParkingImageCapture:', error);
      log(
        `${submitParams.tripNo}: ERROR - SUBMIT - handleParkingImageCapture - Error uploading parking image: ${error.message}`,
      );
    }
  };

  const handlePermitImageSelect = async uri => {
    setPermitImageUri(uri);
    log(
      `${submitParams.tripNo}: SUBMIT - handlePermitImageSelect - Permit image uploaded successfully.`,
    );
    // await AsyncStorage.setItem('permitImageUri', uri);
    if (permitImageUri != null) {
      setIsPermitUploaded(true);
    }
  };

  const handleFastagImageSelect = async uri => {
    setFastagImageUri(uri);
    log(
      `${submitParams.tripNo}: SUBMIT - handleFastagIamgeSelect - Fastag image uploaded successfully.`,
    );
    // await AsyncStorage.setItem('fastagImageUri', uri);
    if (fastagImageUri != null) {
      setIsFastagUploaded(true);
    }
  };

  function validateInput(inputValue) {
    // Define a regular expression pattern to match only numbers
    var pattern = /^[0-9]*$/;
    // Test the input value against the pattern
    if (!pattern.test(inputValue)) {
      Alert.alert(translationManager.getTranslation('alertInvalidInput'), translationManager.getTranslation('alertEnterNumbers'));
      return false; // Return false to indicate validation failure
    }
    return true; // Return true if validation succeeds
  }

  const handleSubmit = () => {
    log(`${submitParams.tripNo}: SUBMIT - handleSubmit - Method being called...`);
    log(
      `${submitParams.tripNo}: SUBMIT - handlesubmit - Entered Drop Km reading: ${endKmReadings}`,
    );
    log(
      `${submitParams.tripNo}: SUBMIT - handlesubmit - Entered Parking reading: ${parkingReadings}`,
    );
    log(
      `${submitParams.tripNo}: SUBMIT - handlesubmit - Entered Fastag reading: ${fastagReadings}`,
    );
    log(
      `${submitParams.tripNo}: SUBMIT - handlesubmit - Entered Permit reading: ${permitReadings}`,
    );
    // Validation of endKmReadings, parkingReadings, permitReadings, and fastagReadings
    if (
      !validateInput(endKmReadings) ||
      !validateInput(parkingReadings) ||
      !validateInput(permitReadings) ||
      !validateInput(fastagReadings)
    ) {
      return; // Exit early if any of the inputs are invalid
    }

    // Handling fastag status
    if (isFastagChecked) {
      setStatus('FASTAGPENDING');
      // setFastagReadings('0');
      console.log('Status updated after checking fastag: ', status);
    } else {
      setStatus('COMPLETED');
    }

    // Checking endKmReadings and related conditions
    // if (endKmReadings === '') {
    //   Alert.alert(
    //     'Alert',
    //     'Enter the drop kilometer reading before continuing.',
    //   );
    //   return;
    // }
    // if (parseInt(endKmReadings) < parseInt(submitParams.pickupKmReadings)) {
    //   Alert.alert(
    //     'Alert',
    //     'Drop kilometer should not be less than Pickup kilometer.',
    //   );
    //   setEndKmReadings('0');
    //   return;
    // }
    // if (endKmImageUri === '') {
    //   Alert.alert(
    //     'Alert',
    //     'Upload the drop kilometer image before continuing.',
    //   );
    //   return;
    // }
    AsyncStorage.setItem('currentScreen', 'Summary');
    const summaryParams = {
      signatureData: submitParams.signatureData,
      driverId: submitParams.driverId,
      driverPhone: submitParams.driverPhone,
      startKmReadings: submitParams.startKmReadings,
      pickupKmReadings: submitParams.pickupKmReadings,
      endKmReadings: submitParams.endKmReadings,
      fastagReadings,
      parkingReadings,
      permitReadings,
      tripNo: submitParams.tripNo,
      custName: submitParams.custName,
      custMobile: submitParams.custMobile,
      pickUpLoc: submitParams.pickUpLoc,
      dropLoc: submitParams.dropLoc,
      pickupKmImageUri: submitParams.pickupKmImageUri,
      endKmImageUri: submitParams.endKmImageUri,
      parkingImageUri,
      fastagImageUri,
      fastagToDisplay,
      permitImageUri,
      status,
      tripCompletedTime: submitParams.tripCompletedTime,
      tripCompleteLoc: submitParams.tripCompleteLoc,
      vendorAddress: submitParams.vendorAddress,
      startLatLong: submitParams.startLatLong,
      signTime: submitParams.signTime,
      completeLat: submitParams.completeLat,
      completeLong: submitParams.completeLong,
      isNoSignChecked: submitParams.isNoSignChecked,
      approxTravelDistance: submitParams.approxTravelDistance,
    };
    AsyncStorage.setItem('summaryParams', JSON.stringify(summaryParams));
    navigation.navigate('Summary', summaryParams);
    // setEndKmReadings('');
    // setFastagReadings('');
    // setPermitReadings('');
    // setParkingReadings('');
    log(`${submitParams.tripNo}: SUBMIT - handleSubmit - Method completed`);
    log(`${submitParams.tripNo}: SUBMIT - handleSubmit - Data navigated to Summary Screen: 
      signatureData: ${submitParams.signatureData},
      driverId: ${submitParams.driverId},
      driverPhone: ${submitParams.driverPhone},
      startKmReadings: ${submitParams.startKmReadings},
      pickupKmReadings: ${submitParams.pickupKmReadings},
      endKmReadings: ${endKmReadings},
      fastagReadings: ${fastagReadings},
      parkingReadings: ${parkingReadings},
      permitReadings: ${permitReadings},
      tripNo: ${submitParams.tripNo},
      custName: ${submitParams.custName},
      custMobile: ${submitParams.custMobile},
      pickUpLoc: ${submitParams.pickUpLoc},
      dropLoc: ${submitParams.dropLoc},
      pickupKmImageUri: ${submitParams.pickupKmImageUri},
      parkingImageUri: ${parkingImageUri},
      fastagImageUri: ${fastagImageUri},
      fastagToDisplay: ${fastagToDisplay},
      permitImageUri: ${permitImageUri},
      status: ${status},
      tripCompletedTime: ${submitParams.tripCompletedTime},
      tripCompleteLoc: ${submitParams.tripCompleteLoc},
      vendorAddress: ${submitParams.vendorAddress},
      startLatLong: ${submitParams.startLatLong},
      signTime: ${submitParams.signTime},
      completeLat: ${submitParams.completeLat},
      completeLong: ${submitParams.completeLong},
      isNoSignChecked: ${submitParams.isNoSignChecked},`);
  };

  const toggleCheckbox = () => {
    setIsFastagChecked(!isFastagChecked);
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <NewHeader showDrawer={false} />
          {/* Main Layout (flex-driven layout) */}
          <View style={styles.contentWrapper}>
            <View style={styles.datetime}>
              <Text allowFontScaling={false} style={styles.datetimeText}>
                {currentDateTime}
              </Text>
            </View>
            <View style={styles.pageheading}>
              <View style={styles.headingView}>
                <FontAwesomeIcon
                  icon={faMoneyCheckAlt}
                  size={25}
                  color="#0c4160"
                />
                <Text allowFontScaling={false} style={styles.heading}>
                  {translationManager.getTranslation('expensesUpdate')}
                </Text>
              </View>
            </View>
            <ScrollView>
              {/* Parking Charges */}
              <View style={styles.card}>
                <Text allowFontScaling={false} style={styles.cardHeading}>
                  {translationManager.getTranslation('totalParkingLabel')}
                </Text>
                <View style={styles.cardContent}>
                  <TextInput
                    style={styles.textinput}
                    placeholder={translationManager.getTranslation(
                      'parkingPlaceholder',
                    )}
                    keyboardType="numeric"
                    placeholderTextColor={'#D0D0D0'}
                    value={parkingReadings}
                    onChangeText={handleParkingReadings}
                    maxLength={7}
                  />
                  {/* <SubmitImageCapture
              title={translationManager.getTranslation('uploadImageButton')}
              onImageCapture={handleParkingImageCapture}
            /> */}
                  <SubmitImageUpload
                    title={translationManager.getTranslation(
                      'uploadImageButton',
                    )}
                    onImageUpload={handleParkingImageCapture}
                  />
                </View>
              </View>

              {/* Permit Charges */}
              <View style={styles.card}>
                <Text allowFontScaling={false} style={styles.cardHeading}>
                  {translationManager.getTranslation('totalPermitLabel')}
                </Text>
                <View style={styles.cardContent}>
                  <TextInput
                    style={styles.textinput}
                    placeholder={translationManager.getTranslation(
                      'permitPlaceholder',
                    )}
                    placeholderTextColor={'#D0D0D0'}
                    keyboardType="numeric"
                    value={permitReadings}
                    onChangeText={handlePermitReadings}
                    maxLength={7}
                  />
                  <SubmitImageUpload
                    title={translationManager.getTranslation(
                      'uploadImageButton',
                    )}
                    onImageUpload={handlePermitImageSelect}
                  />
                </View>
              </View>

              {/* Fastag Charges */}
              <View style={styles.card}>
                <Text allowFontScaling={false} style={styles.cardHeading}>
                  {translationManager.getTranslation('totalFastagLabel')}
                </Text>
                <View style={styles.cardContent}>
                  <TextInput
                    style={styles.textinput}
                    placeholder={translationManager.getTranslation(
                      'fastagPlaceholder',
                    )}
                    placeholderTextColor={'#D0D0D0'}
                    keyboardType="numeric"
                    value={fastagReadings}
                    onChangeText={handleFastagReadings}
                    maxLength={7}
                    // editable={!isFastagChecked}
                  />
                  <SubmitImageUpload
                    title={translationManager.getTranslation(
                      'uploadImageButton',
                    )}
                    onImageUpload={handleFastagImageSelect}
                  />
                </View>
                <BouncyCheckbox
                  size={16}
                  value={isFastagChecked}
                  onPress={toggleCheckbox}
                  fillColor="green"
                  unfillColor="#FFFFFF"
                  text={translationManager.getTranslation('fastagChargedLabel')}
                  textStyle={{
                    textDecorationLine: 'none',
                    fontSize: 12,
                    fontWeight: 'bold',
                    fontFamily: 'sans-serif-condensed',
                  }}
                  iconStyle={{borderColor: '#012169'}}
                />
              </View>
            </ScrollView>

            {/* Submit Button */}
            {!isKeyboardVisible && (
              <View style={styles.submitButtonView}>
                <MySubmitButton
                  title={translationManager.getTranslation('nextButton')}
                  onPress={handleSubmit}
                />
              </View>
            )}
          </View>
          {!isKeyboardVisible && (
            <NewFooter
              driverId={submitParams.driverId}
              driverPhone={submitParams.driverPhone}
              showReport={true}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SubmitScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentWrapper: {
    flex: 1,
  },
  datetime: {
    // flex:0.085,
    height: '4%',
    minHeight:28,
    backgroundColor: Colors.dateTimeBackground,
    padding: 5,
    alignItems: 'center',
  },
  datetimeText: {
    fontSize: 14,
    color: Colors.dateTimeText,
    fontFamily: 'sans-serif-condensed',
    fontWeight: '700',
  },
  pageheading: {
    // flex:0.14,
    height: '8%',
    minHeight:60,
    flexDirection: 'row',
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
  heading: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.headingText,
    fontFamily: 'sans-serif-condensed',
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 10,
    fontFamily: 'sans-serif-condensed',
  },
  cardData: {
    fontSize: 14,
    color: '#003153',
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'sans-serif-condensed',
  },
  textinput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginRight: 10,
    marginBottom: 8,
    color: '#333333',
  },
  submitButtonView: {
    // flex:0.24,
    height: '9%',
    minHeight:60,
    backgroundColor: Colors.heading,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

//Future Implementation Layout.....
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   StyleSheet,
//   Image,
//   Alert,
// } from 'react-native';
// import DropDownPicker from 'react-native-dropdown-picker';
// import NewHeader from '../components/NewHeader';
// import NewFooter from '../components/NewFooter';
// import SubmitImageUpload from '../components/SubmitImageUpload';
// import MySubmitButton from '../components/MySubmitButton';

// const SubmitScreen = () => {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
// const [selectedCategory, setSelectedCategory] = useState('fastag');
// const [dropdownItems, setDropdownItems] = useState([
//   { label: 'Fastag', value: 'fastag' },
//   { label: 'Permit', value: 'permit' },
//   { label: 'Parking', value: 'parking' },
// ]);
//   const [amount, setAmount] = useState('');
//   const [entries, setEntries] = useState([]);

//   const handleImageUpload = (image) => {
//     if (!amount) {
//       Alert.alert('Validation Error', 'Please enter an amount.');
//       return;
//     }

//     const newEntry = {
//       category: selectedCategory,
//       amount: parseFloat(amount),
//       image,
//     };

//     setEntries([...entries, newEntry]);
//     setAmount('');
//   };

//   const handleSubmit = () => {
//     Alert.alert('Submit', 'All entries submitted successfully!');
//     // Your actual submit logic here
//   };

//   const calculateTotal = (category) => {
//     return entries
//       .filter(entry => entry.category === category)
//       .reduce((sum, item) => sum + item.amount, 0)
//       .toFixed(2);
//   };

//   return (
//     <View style={styles.container}>
//       <NewHeader />

//       <View style={styles.contentWrapper}>
//         {/* Heading */}
//         <Text style={styles.heading}>Trip Expense Submission</Text>

//         {/* Form Row */}
//         <View style={styles.formRow}>
// <View style={{ flex: 1, zIndex: 1000, marginRight: 5 }}>
//   <DropDownPicker
//     open={dropdownOpen}
//     value={selectedCategory}
//     items={dropdownItems}
//     setOpen={setDropdownOpen}
//     setValue={setSelectedCategory}
//     setItems={setDropdownItems}
//     style={styles.dropdown}
//     dropDownContainerStyle={styles.dropdownContainer}
//   />
// </View>

//           <TextInput
//             style={styles.amountInput}
//             placeholder="Amount"
//             keyboardType="numeric"
//             value={amount}
//             onChangeText={setAmount}
//             maxLength={7}
//             placeholderTextColor="#D0D0D0"
//           />

//           <SubmitImageUpload
//             title="Add"
//             onImageUpload={handleImageUpload}
//             style={styles.uploadButton}
//           />
//         </View>

//         {/* Entries */}
//         <ScrollView style={styles.entriesList}>
//           {entries.map((entry, index) => (
//             <View key={index} style={styles.entryCard}>
//               <Text style={styles.entryText}>
//                 {entry.category.toUpperCase()} - ₹{entry.amount}
//               </Text>
//               <Image source={{ uri: entry.image.uri }} style={styles.uploadedImage} />
//             </View>
//           ))}
//         </ScrollView>

//         {/* Totals */}
//         <View style={styles.totalsContainer}>
//           <Text style={styles.totalText}>Fastag Total: ₹{calculateTotal('fastag')}</Text>
//           <Text style={styles.totalText}>Permit Total: ₹{calculateTotal('permit')}</Text>
//           <Text style={styles.totalText}>Parking Total: ₹{calculateTotal('parking')}</Text>
//         </View>

//         {/* Submit Button */}
//         <View style={styles.submitButtonView}>
//           <MySubmitButton title="Next" onPress={handleSubmit} />
//         </View>
//       </View>

//       <NewFooter />
//     </View>
//   );
// };

// export default SubmitScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   contentWrapper: {
//     flex: 1,
//     padding: 15,
//   },
//   heading: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: '#012169',
//     textAlign: 'center',
//   },
//   formRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   pickerWrapper: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     marginRight: 5,
//   },
//   picker: {
//     height: 40,
//     color: '#000',
//   },
//   amountInput: {
//     flex: 1,
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginHorizontal: 5,
//   },
//   uploadButton: {
//     flex: 0.7,
//   },
//   entriesList: {
//     flex: 1,
//   },
//   entryCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f2f2f2',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   entryText: {
//     fontSize: 14,
//     color: '#333',
//     flex: 1,
//   },
//   uploadedImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 5,
//     marginLeft: 10,
//   },
//   totalsContainer: {
//     padding: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//     backgroundColor: '#f9f9f9',
//   },
//   totalText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#012169',
//     marginVertical: 2,
//   },
//   submitButtonView: {
//     marginTop: 10,
//   },
// });
