// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   ToastAndroid,
// } from 'react-native';
// import translations from '../translations';
// import MySubmitButton from '../components/MySubmitButton';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import BackButton from '../components/BackButton';
// import {useNavigation} from '@react-navigation/native';
// import BouncyCheckbox from 'react-native-bouncy-checkbox';
// import {getDistance} from 'geolib';
// import {useIsFocused} from '@react-navigation/native';
// import moment from 'moment';
// import {log, readLog, sendLogFile} from '../components/Logger';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import config from '../config';
// import {UploadImageInBackground} from '../Threads';

// const SummaryScreen = ({route, language}) => {
//   const timeoutValue = parseInt(config.timeoutValue);
//   const conTimeoutValue = parseInt(config.connectionTimeoutValue);
//   const lang = language || 'en';
//   const [summaryParams, setSummaryParams] = useState({});
//   const [isVerifyChecked, setIsVerifyChecked] = useState(false);
//   const [isBackEnabled, setIsBackEnabled] = useState(true);
//   const [hasPreviousScreen, setHasPreviousScreen] = useState(false);
//   const [currentTime, setCurrentTime] = useState('');
//   const [currentDateTime, setCurrentDateTime] = useState('');
//   const navigation = useNavigation();
//   const [garageLatLong, setGarageLatLong] = useState({
//     latitude: 13.0281769,
//     longitude: 80.2123457,
//   });
//   const [tripLatLong, setTripLatLong] = useState('');
//   const [garageDistance, setGarageDistance] = useState('');
//   const [garageTime, setGarageTime] = useState('');
//   const [finalCompleteTime, setFinalCompleteTime] = useState('');
//   const [completeKmReading, setCompleteKmReading] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const garageSpeed = 15;
//   // const garageTime = parseFloat(garageDistance) / parseFloat(garageSpeed);
//   const [logData, setLogData] = useState('');
//   const isFocused = useIsFocused();

//   // const completeKmReading =
//   //   parseInt(summaryParams.endKmReadings) + parseInt(garageDistance);

//   useEffect(() => {
//     const fetchParams = async () => {
//       try {
//         // Check if there are stored parameters in AsyncStorage
//         const storedParams = await AsyncStorage.getItem('summaryParams');
//         console.log('Received summaryParams:', storedParams);
//         if (storedParams !== null) {
//           // If stored parameters exist, use them
//           setSummaryParams(JSON.parse(storedParams));
//         } else {
//           // If no stored parameters, use the parameters passed through navigation
//           setSummaryParams(route.params);
//         }
//       } catch (error) {
//         console.error('Error retrieving params from AsyncStorage:', error);
//       }
//     };

//     fetchParams();
//   }, [route.params]);

//   useEffect(() => {
//     if (summaryParams.tripCompleteLoc) {
//       setTripLatLong(summaryParams.tripCompleteLoc);
//     }
//   }, [summaryParams.tripCompleteLoc]);

//   useEffect(() => {
//     if (completeKmReading) {
//       console.log('Complete Km Reading :', completeKmReading);
//     }
//   }, [completeKmReading]);

//   useEffect(() => {
//     if (finalCompleteTime) {
//       console.log('Final Complete Time :', finalCompleteTime);
//     }
//   }, [finalCompleteTime]);

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
//     if (
//       summaryParams.status &&
//       summaryParams.fastagReadings &&
//       summaryParams.fastagToDisplay
//     ) {
//       console.log(
//         'Trip status: ' +
//           summaryParams.status +
//           ', Fastag Reading: ' +
//           summaryParams.fastagReadings +
//           ', Fastag to display:' +
//           summaryParams.fastagToDisplay,
//       );
//     }
//   }, [
//     summaryParams.status,
//     summaryParams.fastagReadings,
//     summaryParams.fastagToDisplay,
//   ]);

//   useEffect(() => {
//     // Update current time every second
//     const interval = setInterval(() => {
//       const formattedTime = moment().format('YYYY-MM-DD HH:mm:ss');
//       setCurrentTime(formattedTime);
//     }, 1000);

//     // Clear interval on component unmount
//     return () => clearInterval(interval);
//   }, []);

//   const toggleCheckbox = () => {
//     setIsVerifyChecked(!isVerifyChecked);
//   };

//   const getGarageCoords = async () => {
//     try {
//        const apiKey = config.tomTomApiKey;
//       // const tripCompleteLatLong = {latitude: 12.98728, longitude: 80.13211};
//       const tripCompleteLatLong = summaryParams.tripCompleteLoc;
//       const startLocationLatLong = summaryParams.startLatLong;
//       console.log(
//         'Trip Complete LatLong:',
//         tripCompleteLatLong.latitude,
//         tripCompleteLatLong.longitude,
//       );
//       console.log(
//         'latlong array after passing the if condition: ',
//         startLocationLatLong,
//       );
//       const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${tripCompleteLatLong.latitude},${tripCompleteLatLong.longitude}:${startLocationLatLong.latitude},${startLocationLatLong.longitude}/json?instructionsType=text&computeBestOrder=true&routeRepresentation=polyline&computeTravelTimeFor=all&vehicleHeading=20&report=effectiveSettings&routeType=eco&traffic=true&travelMode=car&vehicleCommercial=true&vehicleEngineType=combustion&key=${apiKey}`;
//       console.log('Route URL: ', routeUrl);
//       const routeResponse = await fetch(routeUrl);
//       const routeData = await routeResponse.json();
//       log(
//         `SUMMARY - getGarageCoords - Route Success with Given Start Lat Long and Complete Lat Long`,
//       );

//       if (routeData.routes && routeData.routes.length > 0) {
//         const lengthInMeters = routeData.routes[0].summary.lengthInMeters;
//         const distance = lengthInMeters / 1000;
//         console.log('Extra Added Garage Km: ' + distance + 'Km.');
//         const completeKm =
//           parseInt(summaryParams.endKmReadings) + parseInt(distance);
//         const travelTimeInSeconds =
//           routeData.routes[0].summary.travelTimeInSeconds;
//         const extraTime = travelTimeInSeconds * 1000;

//         const timeStamp = new Date(summaryParams.tripCompletedTime);
//         const newTimeStamp = new Date(timeStamp.getTime() + extraTime);
//         const tripCompleteTime = `${newTimeStamp.getFullYear()}-${(
//           newTimeStamp.getMonth() + 1
//         )
//           .toString()
//           .padStart(2, '0')}-${newTimeStamp
//           .getDate()
//           .toString()
//           .padStart(2, '0')} ${newTimeStamp
//           .getHours()
//           .toString()
//           .padStart(2, '0')}:${newTimeStamp
//           .getMinutes()
//           .toString()
//           .padStart(2, '0')}:${newTimeStamp
//           .getSeconds()
//           .toString()
//           .padStart(2, '0')}`;

//         return [completeKm, tripCompleteTime];
//       } else {
//         throw new Error('No route results found');
//       }
//     } catch (error) {
//       console.error('Error fetching or processing data:', error);
//       log(
//         `SUMMARY - getGarageCoords - Route Failure :: No additional time or distance added: ${error}`,
//       );
//       return [summaryParams.endKmReadings, summaryParams.tripCompletedTime];
//     }
//   };

//   const sendTripCompleteDetails = async () => {
//     try {
//       console.log(
//         'Driver ID from TripComplete method: ',
//         summaryParams.driverId,
//       );

//       const apiUrlwithQuery = `${config.apiPostFinalSubmit}${summaryParams.tripNo}&did=${summaryParams.driverId}&status=${summaryParams.status}`;
//       console.log('Final Submit URL:', apiUrlwithQuery);
//       console.log('Trip Completed Time: ', summaryParams.tripCompletedTime);
//       console.log('Final Complete Time:', finalCompleteTime);

//       const [completeKm, tripCompleteTime] = await getGarageCoords();
//       const formData = new FormData();
//       // formData.append('start', summaryParams.startKmReadings);
//       formData.append('pickup', summaryParams.pickupKmReadings);
//       formData.append('drop', summaryParams.endKmReadings);
//       formData.append('gkms', completeKm);
//       formData.append('fastag', summaryParams.fastagReadings);
//       formData.append('permit', summaryParams.permitReadings);
//       formData.append('parking', summaryParams.parkingReadings);
//       formData.append('gcdate', tripCompleteTime);
//       formData.append('date', summaryParams.tripCompletedTime);
//       formData.append(
//         'sgtime',
//         summaryParams.isNoSignChecked ? 'Not Signed' : summaryParams.signTime,
//       );

//       console.log('Final Submit Form Data : ', formData);
//       log(`SUMMARY - sendTripCompleteDetails - FormaData sent along with TripComplete API:
//         pickupKm - ${summaryParams.pickupKmReadings},
//         dropKm - ${summaryParams.endKmReadings},
//         completeKm(garage) - ${completeKmReading},
//         fastagAmount - ${summaryParams.fastagReadings},
//         permitAmount - ${summaryParams.permitReadings},
//         parkingAmount - ${summaryParams.parkingReadings},
//         dropTime - ${summaryParams.tripCompletedTime},
//         completeTime(garage) - ${finalCompleteTime}.`);

//       console.log('Final Submit URL: ' + apiUrlwithQuery);

//       const response = await Promise.race([
//         fetch(apiUrlwithQuery, {
//           method: 'POST',
//           body: formData,
//         }),
//         new Promise((_, reject) =>
//           setTimeout(
//             () =>
//               reject(new Error('Request timed out, check internet connection')),
//             // conTimeoutValue,
//             20000,
//           ),
//         ),
//       ]);

//       if (!response.ok) {
//         log(
//           `SUMMARY - sendTripCompleteDetails - Network response not Ok: ${response.statusText}`,
//         );
//         throw new Error('Network response was not ok: ' + response.statusText);
//       }

//       const responseData = await response.json();
//       console.log('Response status:', response.status);
//       console.log('Response data:', responseData);
//       return response.status;
//     } catch (error) {
//       console.error('Final Submit API Error:', error.message);
//       log(
//         `SUMMARY - sendTripCompleteDetails - Final Submit API Error: ${error.message}`,
//       );
//       throw error;
//     }
//   };

//   const uploadSignImage = async (apiUrlwithQuery, formData, logMessage) => {
//     try {
//       const response = await Promise.race([
//         fetch(apiUrlwithQuery, {
//           method: 'POST',
//           body: formData,
//         }),
//         new Promise((_, reject) =>
//           setTimeout(
//             () =>
//               reject(new Error('Request timed out, check internet connection')),
//             20000,
//           ),
//         ),
//       ]);

//       if (response.ok) {
//         console.log(`${logMessage} Uploaded Successfully.`, response);
//         log(`SUMMARY - uploadImage - ${logMessage} Uploaded Successfully.`);
//       } else {
//         console.log(`${logMessage} not uploaded:`, response.statusText);
//         log(
//           `SUMMARY - uploadImage - ${logMessage} not uploaded. ${response.statusText}`,
//         );
//       }
//     } catch (error) {
//       console.error(`${logMessage} not uploaded:`, error.message);
//       log(`SUMMARY - uploadImage - ${logMessage} not uploaded. ${error.message}`);
//       throw error; // Throw error to indicate failure
//     }
//   };

//   const uploadImage = async (apiUrlwithQuery, formData, logMessage) => {
//     try {
//       const response = await Promise.race([
//         fetch(apiUrlwithQuery, {
//           method: 'POST',
//           body: formData,
//         }),
//         new Promise((_, reject) =>
//           setTimeout(
//             () =>
//               reject(new Error('Request timed out, check internet connection')),
//             20000,
//           ),
//         ),
//       ]);

//       if (response.ok) {
//         console.log(`${logMessage} Uploaded Successfully.`, response);
//         log(`SUMMARY - uploadImage - ${logMessage} Uploaded Successfully.`);
//       } else {
//         console.log(`${logMessage} not uploaded:`, response.statusText);
//         log(
//           `SUMMARY - uploadImage - ${logMessage} not uploaded. ${response.statusText}`,
//         );
//       }
//     } catch (error) {
//       console.error(`${logMessage} not uploaded:`, error.message);
//       log(`SUMMARY - uploadImage - ${logMessage} not uploaded. ${error.message}`);
//       throw error; // Throw error to indicate failure
//     }
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     ToastAndroid.showWithGravity(
//       'Uploading Data, Please wait.',
//       ToastAndroid.LONG,
//       ToastAndroid.CENTER,
//     );

//     try {
//       await sendTripCompleteDetails();

//       // Define an array of parameter keys
//       const paramKeys = [
//         'homeParams',
//         'signParams',
//         'submitParams',
//         'summaryParams',
//         'currentScreen',
//         'endKmReadings',
//         'parkingReadings',
//         'permitReadings',
//         'fastagReadings',
//         // 'parkingImageUri',
//         // 'permitImageUri',
//         // 'fastagImageUri'
//       ];

//       // Clear AsyncStorage
//       await Promise.all(
//         paramKeys.map(async key => {
//           await AsyncStorage.removeItem(key);
//           console.log(`Storage for ${key} cleared successfully`);
//         }),
//       );

//       console.log('All storage cleared successfully');
//       // await AsyncStorage.setItem('endKmReadings', '');
//       // await AsyncStorage.setItem('parkingReadings', '');
//       // await AsyncStorage.setItem('permitReadings', '');
//       // await AsyncStorage.setItem('fastagReadings', '');
//       // AsyncStorage.removeItem('endKmReadings');
//       // AsyncStorage.removeItem('parkingReadings');
//       // AsyncStorage.removeItem('permitReadings');
//       // AsyncStorage.removeItem('fastagReadings');
//       const finalEndKmValue = AsyncStorage.getItem('endKmReadings');
//       const finalParkingReadings = AsyncStorage.getItem('parkingReadings');
//       const finalPermitReadings = AsyncStorage.getItem('permitReadings');
//       const finalFastagReadings = AsyncStorage.getItem('fastagReadings');
//       console.log('Reading after Final Submit'+(JSON.stringify(finalEndKmValue))+finalParkingReadings+finalPermitReadings+finalFastagReadings);
//       console.log('All Reading values changed to null');

//       const apiUrlwithQuery = `${config.apiPostUpload}${summaryParams.tripNo}&status=${summaryParams.status}`;

//       // ToastAndroid.showWithGravity(
//       //   'Uploading Images, Please wait.',
//       //   ToastAndroid.SHORT,
//       //   ToastAndroid.CENTER,
//       // );

//       // Collect all upload promises except permit, fastag, and parking images
//       const uploadPromises = [];

//       // Upload Sign Image
//       if (!summaryParams.isNoSignChecked && summaryParams.signatureData) {
//         const formData = new FormData();
//         formData.append(
//           'simg',
//           summaryParams.signatureData.encoded,
//           'signature.png',
//         );
//         uploadPromises.push(
//           uploadSignImage(apiUrlwithQuery, formData, 'Sign Image'),
//         );
//       }

//       // Wait for essential uploads to complete
//       await Promise.all(uploadPromises);

//       console.log('Trip sheet Submitted Successfully');
//       AsyncStorage.setItem('currentScreen', 'BookingList');

//       Alert.alert(
//         translations[lang].alertHeading,
//         'Trip sheet submitted successfully.',
//         [
//           {
//             text: 'Ok',
//             onPress: async () => {
//               navigation.navigate('BookingList');

//               // Upload permit, fastag, and parking images after navigation
//               try {
//                 // Upload Drop Image
//                 // if (summaryParams.endKmImageUri) {
//                 //   const formData = new FormData();
//                 //   formData.append('dimg', {
//                 //     uri: summaryParams.endKmImageUri,
//                 //     type: 'image/jpeg',
//                 //     name: 'dropKmImage.jpg',
//                 //   });
//                 //   uploadPromises.push(
//                 //     uploadImage(apiUrlwithQuery, formData, 'Drop KM Image'),
//                 //   );
//                 // }
//                 // Upload Parking Image
//                 if (summaryParams.parkingImageUri) {
//                   const formData = new FormData();
//                   formData.append('pkimg', {
//                     uri: summaryParams.parkingImageUri,
//                     type: 'image/jpeg',
//                     name: 'parkingImage.jpg',
//                   });
//                   await uploadImage(apiUrlwithQuery, formData, 'Parking Image');
//                   // await UploadImageInBackground(apiUrlwithQuery, formData, 'Parking Image');
//                 }

//                 // Upload Permit Image
//                 if (summaryParams.permitImageUri) {
//                   const formData = new FormData();
//                   formData.append('peimg', {
//                     uri: summaryParams.permitImageUri,
//                     type: 'image/jpeg',
//                     name: 'permitImage.jpg',
//                   });
//                   await uploadImage(apiUrlwithQuery, formData, 'Permit Image');
//                   // await UploadImageInBackground(apiUrlwithQuery, formData, 'Permit Image');
//                 }

//                 // Upload Fastag Image
//                 if (summaryParams.fastagImageUri) {
//                   const formData = new FormData();
//                   formData.append('fimg', {
//                     uri: summaryParams.fastagImageUri,
//                     type: 'image/jpeg',
//                     name: 'fastagImage.jpg',
//                   });
//                   await uploadImage(apiUrlwithQuery, formData, 'Fastag Image');
//                   // await UploadImageInBackground(apiUrlwithQuery, formData, 'Fastag Image');
//                 }
//                 // sendLogFile(summaryParams.driverId, summaryParams.driverPhone);
//               } catch (error) {
//                 console.error(
//                   'Error uploading images after navigation:',
//                   error.message,
//                 );
//                 log('Error uploading images after navigation', error.message);
//               }
//             },
//           },
//         ],
//         {cancelable: false},
//       );
//     } catch (error) {
//       console.error('Error sending trip complete details:', error.message);
//       Alert.alert(
//         'Low or No network connection',
//         'Check your Internet connection and try again.',
//         [{text: 'Ok'}],
//         {cancelable: false},
//       );
//     } finally {
//       setIsLoading(false);
//       // sendLogFile(summaryParams.driverId, summaryParams.driverPhone);
//     }
//   };

//   const handleBack = () => {
//     setIsBackEnabled(false);
//     AsyncStorage.setItem('currentScreen', 'Submit');
//     navigation.goBack();
//     setTimeout(() => {
//       setIsBackEnabled(true);
//     }, 2000);
//   };

//   return (
//     <View style={styles.container}>
//       <Header />
//       <View style={styles.datetime}>
//         <Text allowFontScaling={false} style={styles.datetimetext}>{currentDateTime}</Text>
//       </View>
//       <View style={styles.pageheading}>
//         <Text allowFontScaling={false} style={styles.heading}>Trip Summary</Text>
//       </View>
//       <ScrollView>
//         <View style={styles.maincontent}>
//           <View style={styles.samecolumn}>
//             <Text allowFontScaling={false} style={styles.tripDetailsLabel}>Trip Id: </Text>
//             <Text allowFontScaling={false} style={styles.tripDetailsData}> {summaryParams.tripNo}</Text>
//           </View>
//           <View style={styles.samecolumn}>
//             <Text allowFontScaling={false} style={styles.tripDetailsLabel}>Guest Name: </Text>
//             <Text allowFontScaling={false} style={styles.tripDetailsData}>
//               {' '}
//               {summaryParams.custName}
//             </Text>
//           </View>
//           <View style={styles.samecolumn}>
//             <Text allowFontScaling={false} style={styles.tripDetailsLabel}>Guest Phone: </Text>
//             <Text allowFontScaling={false} style={styles.tripDetailsData}>
//               {' '}
//               {summaryParams.custMobile}
//             </Text>
//           </View>
//           <View style={styles.samecolumn}>
//             <Text allowFontScaling={false} style={styles.tripDetailsLabel}>Pickup Address: </Text>
//             <Text allowFontScaling={false} style={styles.tripDetailsData}>
//               {' '}
//               {summaryParams.pickUpLoc}
//             </Text>
//           </View>
//           <View style={styles.samecolumn}>
//             <Text allowFontScaling={false} style={styles.tripDetailsLabel}>Drop Address: </Text>
//             <Text allowFontScaling={false} style={styles.tripDetailsData}> {summaryParams.dropLoc}</Text>
//           </View>
//           <View style={styles.samerow}>
//             {/* <View style={[styles.samecolumn, styles.lc]}>
//               <Text style={styles.tripDetailsLabel}>Start km: </Text>
//               <Text style={styles.tripDetailsData}>
//                 {' '}
//                 {summaryParams.startKmReadings}
//               </Text>
//             </View> */}
//             <View style={[styles.samecolumn, styles.lc]}>
//               <Text allowFontScaling={false} style={styles.tripDetailsLabel}>Pickup km: </Text>
//               <Text allowFontScaling={false} style={styles.tripDetailsData}>
//                 {' '}
//                 {summaryParams.pickupKmReadings}
//               </Text>
//             </View>
//             <View style={[styles.samecolumn, styles.lc]}>
//               <Text allowFontScaling={false} style={styles.tripDetailsLabel}>Drop km: </Text>
//               <Text allowFontScaling={false} style={styles.tripDetailsData}>
//                 {' '}
//                 {summaryParams.endKmReadings}
//               </Text>
//             </View>
//           </View>
//           <View style={styles.samerow}>
//             <View style={[styles.samecolumn, styles.rc]}>
//               <Text allowFontScaling={false} style={styles.tripDetailsLabel}>Parking: </Text>
//               <Text allowFontScaling={false} style={styles.tripDetailsData}>
//                 {' '}
//                 {summaryParams.parkingReadings}
//               </Text>
//             </View>
//             <View style={[styles.samecolumn, styles.rc]}>
//               <Text allowFontScaling={false} style={styles.tripDetailsLabel}>Permit: </Text>
//               <Text allowFontScaling={false} style={styles.tripDetailsData}>
//                 {' '}
//                 {summaryParams.permitReadings}
//               </Text>
//             </View>
//             <View style={[styles.samecolumn, styles.rc]}>
//               <Text allowFontScaling={false} style={styles.tripDetailsLabel}>Fastag: </Text>
//               <Text allowFontScaling={false} style={styles.tripDetailsData}>
//                 {' '}
//                 {summaryParams.fastagToDisplay}
//               </Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//       <View allowFontScaling={false} style={styles.check}>
//         <BouncyCheckbox
//           size={18}
//           value={isVerifyChecked}
//           onPress={toggleCheckbox}
//           style={styles.checkbox}
//           fillColor="green"
//           unfillColor="#FFFFFF"
//           text="I agree, the entries are correct."
//           textStyle={{
//             textDecorationLine: 'none',
//             fontSize: 12,
//             color: 'black',
//           }}
//           iconStyle={{borderColor: '#012169'}}
//         />
//       </View>
//       <View style={styles.submitButton}>
//         <View style={styles.back}>
//           <BackButton
//             title={'Back'}
//             onPress={handleBack}
//             disabled={!isBackEnabled || isLoading}></BackButton>
//         </View>
//         <View style={styles.submit}>
//           <MySubmitButton
//             title={translations.en.submitButton}
//             onPress={handleSubmit}
//             disabled={!isVerifyChecked}
//             isLoading={isLoading}></MySubmitButton>
//         </View>
//       </View>
//       <Footer />
//     </View>
//   );
// };

// export default SummaryScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-between',
//     backgroundColor: 'white',
//   },
//   pageheading: {
//     height: '10%',
//     justifyContent: 'center',
//     alignItems: 'center',
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
//     height: '60%',
//     justifyContent: 'flex-start',
//     alignItems: 'flex-start',
//     paddingHorizontal: '5%',
//     marginBottom: 40,
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
//   },
//   textinput: {
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginRight: 5,
//     marginBottom: 5,
//     height: 50,
//     width: 200,
//     color: 'black',
//   },
//   mandatory: {
//     color: 'red',
//   },
//   tripDetails: {
//     flexDirection: 'row',
//     alignContent: 'flex-start',
//     marginBottom: 20,
//     paddingLeft: 30,
//   },
//   tripDetailsLabel: {
//     fontSize: 14,
//     color: 'black',
//     fontFamily: 'Roboto-MediumItalic',
//   },
//   tripDetailsData: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: 'black',
//     fontFamily: 'Roboto-BoldItalic',
//   },
//   samecolumn: {
//     flexDirection: 'column',
//     margin: 2,
//     marginBottom: 10,
//   },
//   samerow: {
//     flexDirection: 'row',
//     margin: '0.5%',
//     marginBottom: 8,
//     alignSelf: 'center',
//   },
//   lc: {
//     width: '33%',
//   },
//   rc: {
//     width: '33%',
//   },
//   leftSide: {
//     width: 200,
//     alignItems: 'flex-start',
//     paddingLeft: 30,
//   },
//   rightSide: {
//     width: 200,
//     alignItems: 'flex-start',
//   },
//   checkbox: {
//     marginTop: 20,
//     marginBottom: 10,
//     width: '90%',
//   },
//   check: {
//     paddingHorizontal: '5%',
//     paddingTop: '5%',
//     height: '10%',
//   },
//   submitButton: {
//     flexDirection: 'row',
//     marginTop: 10,
//     paddingHorizontal: '5%',
//     paddingBottom: 10,
//   },
//   back: {
//     width: '50%',
//     alignItems: 'center',
//   },
//   submit: {
//     width: '50%',
//     alignItems: 'center',
//   },
// });
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ToastAndroid,
} from 'react-native';
import translations from '../translations';
import translationManager from '../translationManager';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faClipboardList,
  faChartBar,
  faChartPie,
  faChartSimple,
  faChartColumn,
} from '@fortawesome/free-solid-svg-icons';
import MySubmitButton from '../components/MySubmitButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../components/BackButton';
import {useNavigation} from '@react-navigation/native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {getDistance} from 'geolib';
import {useIsFocused} from '@react-navigation/native';
import moment from 'moment';
import {log, readLog, sendLogFile} from '../components/Logger';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewHeader from '../components/NewHeader';
import NewFooter from '../components/NewFooter';
import config from '../config';
import {UploadImageInBackground} from '../Threads';
import {buildRouteUrl} from '../services/apiHelpers';
import {Colors} from '../config';
import {getLatLngFromAddress} from '../services/mapplsHelper';
import {getAddressFromLatLng, getTravelledDistance} from '../api/mapplsApi';
import { clearLocations } from '../services/locationStorage';
import {clearTravelledDistances,clearCoordinates} from '../services/distanceTracker';

const SummaryScreen = ({route, language}) => {
  const timeoutValue = parseInt(config.timeoutValue);
  const conTimeoutValue = parseInt(config.connectionTimeoutValue);
  const lang = language || 'en';
  const [summaryParams, setSummaryParams] = useState({});
  const [isVerifyChecked, setIsVerifyChecked] = useState(false);
  const [isBackEnabled, setIsBackEnabled] = useState(true);
  const [hasPreviousScreen, setHasPreviousScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const navigation = useNavigation();
  const [garageLatLong, setGarageLatLong] = useState({
    latitude: 13.0281769,
    longitude: 80.2123457,
  });
  const [tripLatLong, setTripLatLong] = useState('');
  const [garageDistance, setGarageDistance] = useState('');
  const [garageTime, setGarageTime] = useState('');
  const [finalCompleteTime, setFinalCompleteTime] = useState('');
  const [completeKmReading, setCompleteKmReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const garageSpeed = 15;
  // const garageTime = parseFloat(garageDistance) / parseFloat(garageSpeed);
  const [logData, setLogData] = useState('');
  const isFocused = useIsFocused();

  // const completeKmReading =
  //   parseInt(summaryParams.endKmReadings) + parseInt(garageDistance);

  useEffect(() => {
    const fetchParams = async () => {
      try {
        // Check if there are stored parameters in AsyncStorage
        const storedParams = await AsyncStorage.getItem('summaryParams');
        console.log('Received summaryParams:', storedParams);
        log('Received summaryParams:', storedParams);
        if (storedParams !== null) {
          // If stored parameters exist, use them
          setSummaryParams(JSON.parse(storedParams));
        } else {
          // If no stored parameters, use the parameters passed through navigation
          setSummaryParams(route.params);
        }
      } catch (error) {
        console.error('Error retrieving params from AsyncStorage:', error);
        log('Error retrieving summaryParams from AsyncStorage:', error);
      }
    };

    fetchParams();
  }, [route.params]);

  useEffect(() => {
    if (summaryParams.tripCompleteLoc) {
      setTripLatLong(summaryParams.tripCompleteLoc);
    }
  }, [summaryParams.tripCompleteLoc]);

  useEffect(() => {
    if (completeKmReading) {
      console.log('Complete Km Reading :', completeKmReading);
    }
  }, [completeKmReading]);

  useEffect(() => {
    if (finalCompleteTime) {
      console.log('Final Complete Time :', finalCompleteTime);
    }
  }, [finalCompleteTime]);

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
    if (
      summaryParams.status &&
      summaryParams.fastagReadings &&
      summaryParams.fastagToDisplay
    ) {
      console.log(
        'Trip status: ' +
          summaryParams.status +
          ', Fastag Reading: ' +
          summaryParams.fastagReadings +
          ', Fastag to display:' +
          summaryParams.fastagToDisplay,
      );
    }
  }, [
    summaryParams.status,
    summaryParams.fastagReadings,
    summaryParams.fastagToDisplay,
  ]);

  useEffect(() => {
    // Update current time every second
    const interval = setInterval(() => {
      const formattedTime = moment().format('YYYY-MM-DD HH:mm:ss');
      setCurrentTime(formattedTime);
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const toggleCheckbox = () => {
    setIsVerifyChecked(!isVerifyChecked);
  };

  const getGarageCoords = async () => {
    try {
      const apiKey = config.tomTomApiKey;
      const tripCompleteLatLong = summaryParams.tripCompleteLoc;
      //const startLocationLatLong = summaryParams.startLatLong;
      // const startLocationLatLong = await getLatLngFromAddress(
      //   summaryParams.vendorAddress,
      // );
      // Add a 15-second timeout for the address-to-coordinates lookup
      const startLocationLatLong = await Promise.race([
        getLatLngFromAddress(summaryParams.vendorAddress),
        new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Geocoding timed out')),
          10000 // 10 seconds
        )
      ),
    ]).catch((error) => {
    console.warn("Failed to get LatLong from Address:", error.message);
    log(`${summaryParams.tripNo}: WARN - getLatLngFromAddress timed out or failed: ${error.message}`);
  
    // Return null or a fallback so the app doesn't crash
    return null; 
    });
      console.log(
        'Trip Complete LatLong:',
        tripCompleteLatLong.latitude,
        tripCompleteLatLong.longitude,
      );
      console.log(
        'latlong array after passing the if condition: ',
        startLocationLatLong,
      );
      // const {distance, duration} = await getTravelledDistance(
      //   tripCompleteLatLong,
      //   startLocationLatLong,
      // );

      // Add a 10-second timeout to the Distance API call
      const { distance, duration } = await Promise.race([
        getTravelledDistance(tripCompleteLatLong, startLocationLatLong),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Distance calculation timed out')),
            10000 // 10 seconds
          )
        ),
      ]).catch((error) => {
        console.warn("Distance API failed:", error.message);
        log(`${summaryParams.tripNo}: WARN - getTravelledDistance timed out: ${error.message}`);
  
        // Return fallback values (0) so the rest of your math doesn't break
        return { distance: 0, duration: 0 };
      });
      const garageDistance = distance / 1000;
      console.log('Extra Added Garage Km: ' + garageDistance + 'Km.');
      const completeKm =
        parseInt(summaryParams.endKmReadings) + parseInt(garageDistance);
      // const travelTimeInSeconds =
      //   routeData.routes[0].summary.travelTimeInSeconds;
      const extraTime = duration * 1000;

      const timeStamp = new Date(summaryParams.tripCompletedTime);
      const newTimeStamp = new Date(timeStamp.getTime() + extraTime);
      const tripCompleteTime = `${newTimeStamp.getFullYear()}-${(
        newTimeStamp.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}-${newTimeStamp
        .getDate()
        .toString()
        .padStart(2, '0')} ${newTimeStamp
        .getHours()
        .toString()
        .padStart(2, '0')}:${newTimeStamp
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${newTimeStamp
        .getSeconds()
        .toString()
        .padStart(2, '0')}`;

      return [completeKm, tripCompleteTime];
      //} else {
      //  throw new Error('No route results found');
      //}
    } catch (error) {
      console.error('Error fetching or processing data:', error);
      log(
        `${summaryParams.tripNo}: ERROR - SUMMARY - getGarageCoords - Route Failure :: No additional time or distance added: ${error}`,
      );
      return [summaryParams.endKmReadings, summaryParams.tripCompletedTime];
    }
  };

  // const sendTripCompleteDetails = async () => {
  //   try {
  //     console.log(
  //       'Driver ID from TripComplete method: ',
  //       summaryParams.driverId,
  //     );

  //     const apiUrlwithQuery = `${config.apiPostFinalSubmit}${summaryParams.tripNo}&did=${summaryParams.driverId}&status=${summaryParams.status}`;
  //     console.log('Final Submit URL:', apiUrlwithQuery);
  //     console.log('Trip Completed Time: ', summaryParams.tripCompletedTime);
  //     console.log('Final Complete Time:', finalCompleteTime);

  //     const [completeKm, tripCompleteTime] = await getGarageCoords();
  //     const diffDistance =
  //       summaryParams.approxTravelDistance -
  //       (summaryParams.endKmReadings - summaryParams.pickupKmReadings);
  //     console.log(
  //       `===========> calculatedDistance - ${summaryParams.approxTravelDistance}, Difference in Distance - ${diffDistance}`,
  //     );
  //     const formData = new FormData();
  //     formData.append('pickup', summaryParams.pickupKmReadings);
  //     formData.append('drop', summaryParams.endKmReadings);
  //     formData.append('gkms', completeKm);
  //     formData.append('ckms', summaryParams.approxTravelDistance);
  //     formData.append('dkms', diffDistance);
  //     formData.append('fastag', summaryParams.fastagReadings);
  //     formData.append('permit', summaryParams.permitReadings);
  //     formData.append('parking', summaryParams.parkingReadings);
  //     formData.append('gcdate', tripCompleteTime);
  //     formData.append('date', summaryParams.tripCompletedTime);
  //     formData.append(
  //       'sgtime',
  //       summaryParams.isNoSignChecked ? 'Not Signed' : summaryParams.signTime,
  //     );

  //     console.log('Final Submit Form Data : ', formData);
  //     log(`SUMMARY - sendTripCompleteDetails - FormaData sent along with TripComplete API:
  //       pickupKm - ${summaryParams.pickupKmReadings},
  //       dropKm - ${summaryParams.endKmReadings},
  //       completeKm(garage) - ${completeKmReading},
  //       fastagAmount - ${summaryParams.fastagReadings},
  //       permitAmount - ${summaryParams.permitReadings},
  //       parkingAmount - ${summaryParams.parkingReadings},
  //       dropTime - ${summaryParams.tripCompletedTime},
  //       completeTime(garage) - ${finalCompleteTime},
  //       calculatedDistance - ${diffDistance}`);

  //     console.log('Final Submit URL: ' + apiUrlwithQuery);

  //     const response = await Promise.race([
  //       fetch(apiUrlwithQuery, {
  //         method: 'POST',
  //         body: formData,
  //       }),
  //       new Promise((_, reject) =>
  //         setTimeout(
  //           () =>
  //             reject(new Error('Request timed out, check internet connection')),
  //           // conTimeoutValue,
  //           20000,
  //         ),
  //       ),
  //     ]);

  //     if (!response.ok) {
  //       log(
  //         `SUMMARY - sendTripCompleteDetails - Network response not Ok: ${response.statusText}`,
  //       );
  //       throw new Error('Network response was not ok: ' + response.statusText);
  //     }

  //     const responseData = await response.json();
  //     console.log('Response status:', response.status);
  //     console.log('Response data:', responseData);
  //     return response.status;
  //   } catch (error) {
  //     console.error('Final Submit API Error:', error.message);
  //     log(
  //       `SUMMARY - sendTripCompleteDetails - Final Submit API Error: ${error.message}`,
  //     );
  //     throw error;
  //   }
  // };
  const sendTripCompleteDetails = async () => {
    try {
      console.log(
        'Driver ID from TripComplete method: ',
        summaryParams.driverId,
      );

      console.log('Trip Completed Time: ', summaryParams.tripCompletedTime);
      console.log('Final Complete Time:', finalCompleteTime);

      // Assuming getGarageCoords() returns [completeKm, tripCompleteTime]
      const [completeKm, tripCompleteTime] = await getGarageCoords();
      const diffDistance =
        summaryParams.approxTravelDistance -
        (summaryParams.endKmReadings - summaryParams.pickupKmReadings);
      console.log(
        `===========> calculatedDistance - ${summaryParams.approxTravelDistance}, Difference in Distance - ${diffDistance}`,
      );

      const formData = new FormData();
      formData.append('pickup', summaryParams.pickupKmReadings);
      formData.append('drop', summaryParams.endKmReadings);
      formData.append('gkms', completeKm);
      formData.append('ckms', summaryParams.approxTravelDistance);
      formData.append('dkms', diffDistance);
      formData.append('fastag', summaryParams.fastagReadings);
      formData.append('permit', summaryParams.permitReadings);
      formData.append('parking', summaryParams.parkingReadings);
      formData.append('gcdate', tripCompleteTime);
      formData.append('date', summaryParams.tripCompletedTime);
      formData.append(
        'sgtime',
        summaryParams.isNoSignChecked ? 'Not Signed' : summaryParams.signTime,
      );
      formData.append('geom', summaryParams.routeGeometry);

      console.log('Final Submit Form Data : ', formData);
      log(summaryParams.tripNo+': SUMMARY - sendTripCompleteDetails - Final Submit Form Data : ', formData);
      log(`${summaryParams.tripNo}: SUMMARY - sendTripCompleteDetails - FormaData sent along with TripComplete API:
        pickupKm - ${summaryParams.pickupKmReadings},
        dropKm - ${summaryParams.endKmReadings},
        completeKm(garage) - ${completeKm},
        fastagAmount - ${summaryParams.fastagReadings},
        permitAmount - ${summaryParams.permitReadings},
        parkingAmount - ${summaryParams.parkingReadings},
        dropTime - ${summaryParams.tripCompletedTime},
        completeTime(garage) - ${finalCompleteTime},
        calculatedDistance - ${summaryParams.approxTravelDistance}`);


  const sendFinalSubmitData = async (baseUrl) => {
  const apiUrlwithQuery = `${baseUrl}${summaryParams.tripNo}&did=${summaryParams.driverId}&status=${summaryParams.status}`;
  const authToken = await AsyncStorage.getItem('API_AUTH_TOKEN');

  const response = await Promise.race([
    fetch(apiUrlwithQuery, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData,
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), 20000)
    ),
  ]);

  if (!response.ok) {
    let errorDetail = '';
    try {
      // Try to get the specific error message from the server body
      const errorData = await response.json();
      errorDetail = JSON.stringify(errorData);
    } catch (e) {
      // If it's not JSON, get the raw text (HTML or string)
      errorDetail = await response.text();
    }

    const fullErrorMessage = `Status: ${response.status} (${response.statusMessage}) - Message: ${errorDetail}`;
    
    // Log this specifically so you can see it in your console/logs
    console.error('SERVER ERROR REASON:', fullErrorMessage);
    log(`${summaryParams.tripNo}: ERROR - ${fullErrorMessage}`);

    throw new Error(fullErrorMessage);
  }
  return response;
};

      let response;
      try {
        response = await sendFinalSubmitData(config.apiPostFinalSubmit);
        console.log('Primary Final Submit API call successful.');
      } catch (initialError) {
        console.warn(
          'Primary Final Submit API call failed, attempting alternative:',
          initialError.message,
        );
        log(
          `${summaryParams.tripNo}: WARN - SUMMARY - sendTripCompleteDetails - Primary Final Submit API call failed, attempting alternative: ${initialError.message}`,
        );
        response = await sendFinalSubmitData(config.apiPostFinalSubmitAlt); // Try the alternative URL
        console.log('Alternative Final Submit API call successful.');
      }

      const responseData = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);
      return response.status;
    } catch (error) {
      console.error('Final Submit API Error:', error.message);
      log(
        `${summaryParams.tripNo}: ERROR - SUMMARY - sendTripCompleteDetails - Final Submit API Error: ${error.message}`,
      );
      throw error; // Re-throw the error so the caller can handle it (e.g., show an alert)
    }
  };

  const uploadSignImage = async (apiUrlwithQuery, formData, logMessage) => {
    try {
      const response = await Promise.race([
        fetch(apiUrlwithQuery, {
          method: 'POST',
          body: formData,
        }),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(new Error('Request timed out, check internet connection')),
            20000,
          ),
        ),
      ]);

      if (response.ok) {
        console.log(`${logMessage} Uploaded Successfully.`, response);
        log(`${summaryParams.tripNo}: SUMMARY - uploadImage - ${logMessage} Uploaded Successfully.`);
      } else {
        console.log(`${logMessage} not uploaded:`, response.statusText);
        log(
          `${summaryParams.tripNo}: SUMMARY - uploadImage - ${logMessage} not uploaded. ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error(`${logMessage} not uploaded:`, error.message);
      log(
        `${summaryParams.tripNo}: ERROR - SUMMARY - uploadImage - ${logMessage} not uploaded. ${error.message}`,
      );
      throw error; // Throw error to indicate failure
    }
  };

  const uploadImage = async (apiUrlwithQuery, formData, logMessage) => {
    try {
      const authToken = await AsyncStorage.getItem('API_AUTH_TOKEN');
      const response = await Promise.race([
        fetch(apiUrlwithQuery, {
          method: 'POST',
          headers:{'Authorization':`Bearer ${authToken}`},
          body: formData,
        }),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(new Error('Request timed out, check internet connection')),
            60000,
          ),
        ),
      ]);

      if (response.ok) {
        console.log(`${logMessage} Uploaded Successfully.`, response);
        log(`${summaryParams.tripNo}: SUMMARY - uploadImage - ${logMessage} Uploaded Successfully.`);
      } else {
        console.log(`${logMessage} not uploaded:`, response.statusText);
        log(
          `${summaryParams.tripNo}: SUMMARY - uploadImage - ${logMessage} not uploaded. ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error(`${logMessage} not uploaded:`, error.message);
      log(
        `${summaryParams.tripNo}: ERROR - SUMMARY - uploadImage - ${logMessage} not uploaded. ${error.message}`,
      );
      throw error; // Throw error to indicate failure
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    ToastAndroid.showWithGravity(
      'Uploading Data, Please wait.',
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );

    try {
      await sendTripCompleteDetails();
      const finalEndKmValue = await AsyncStorage.getItem('endKmReadings');
      const finalParkingReadings = await AsyncStorage.getItem('parkingReadings');
      const finalPermitReadings = await AsyncStorage.getItem('permitReadings');
      const finalFastagReadings = await AsyncStorage.getItem('fastagReadings');
      console.log(
        'Reading after Final Submit' +
          JSON.stringify(finalEndKmValue) +
          finalParkingReadings +
          finalPermitReadings +
          finalFastagReadings,
      );
      console.log('All Reading values changed to null');

      const primaryUploadUrl = `${config.apiPostUpload}${summaryParams.tripNo}&status=${summaryParams.status}`;
      const alternativeUploadUrl = `${config.apiPostUploadAlt}${summaryParams.tripNo}&status=${summaryParams.status}`;

      try {
        const formData = new FormData();

        // Upload Drop Image (single)
        if (summaryParams.endKmImageUri) {
          formData.append('dimg', {
            uri: summaryParams.endKmImageUri,
            type: 'image/jpeg',
            name: 'dropKmImage.jpg',
          });
        }
        else{
          endKmImg = await AsyncStorage.getItem('endKmImageUri');
          formData.append('dimg', {
            uri: endKmImg,
            type: 'image/jpeg',
            name: 'dropKmImage.jpg',
          });
        }

        // Append Parking Images
        if (
          summaryParams.parkingImageUri &&
          summaryParams.parkingImageUri.length > 0
        ) {
          summaryParams.parkingImageUri.forEach((uri, index) => {
            if (uri) {
              formData.append(`pkimg_${index + 1}`, {
                uri,
                type: 'image/jpeg',
                name: `parkingImage_${index + 1}.jpg`,
              });
            }
          });
        }

        // Append Permit Images
        if (
          summaryParams.permitImageUri &&
          summaryParams.permitImageUri.length > 0
        ) {
          summaryParams.permitImageUri.forEach((uri, index) => {
            if (uri) {
              formData.append(`peimg_${index + 1}`, {
                uri,
                type: 'image/jpeg',
                name: `permitImage_${index + 1}.jpg`,
              });
            }
          });
        }

        // Append Fastag Images
        if (
          summaryParams.fastagImageUri &&
          summaryParams.fastagImageUri.length > 0
        ) {
          summaryParams.fastagImageUri.forEach((uri, index) => {
            if (uri) {
              formData.append(`fimg_${index + 1}`, {
                uri,
                type: 'image/jpeg',
                name: `fastagImage_${index + 1}.jpg`,
              });
            }
          });
        }

        console.log('Drop Km Upload Form Data : '+ JSON.stringify(formData));
        // --- Integration with primary/alternative URL logic ---
        try {
          console.log('Attempting primary image upload...');
          log(`${summaryParams.tripNo}: SUMMARY - Attempting primary image upload.`);
          await uploadImage(primaryUploadUrl, formData, 'All Images (Primary)');
          console.log('Primary image upload successful.');
        } catch (initialError) {
          console.warn(
            'Primary image upload failed, attempting alternative:',
            initialError.message,
          );
          log(
            `${summaryParams.tripNo}: WARN - SUMMARY - Primary image upload failed, attempting alternative: ${initialError.message}`,
          );
          await uploadImage(
            alternativeUploadUrl,
            formData,
            'All Images (Alternative)',
          );
          console.log('Alternative image upload successful.');
        }
      } catch (error) {
        // This catch block will now receive errors from both primary and alternative attempts
        console.error(
          'Final error during image upload process:',
          error.message,
        );
        log(`${summaryParams.tripNo}: ERROR - SUMMARY - Final image upload process error: ${error.message}`);
        // You can show an alert here to the user if needed
        // Alert.alert('Upload Failed', 'Failed to upload images. Please check your network connection and try again.');
      }

      Alert.alert(
        translationManager.getTranslation('alertSuccess'),
        translationManager.getTranslation('alertTripSubmit'),
        [
          {
            text: 'Ok',
            onPress: async () => {
              console.log('Trip sheet Submitted Successfully');
              // Define an array of parameter keys
              const paramKeys = [
                'homeParams',
                'signParams',
                'submitParams',
                'summaryParams',
                'currentScreen',
                'endKmReadings',
                'endKmImageUri',
                'parkingReadings',
                'permitReadings',
                'fastagReadings',
                'parkingImageUri',
                'permitImageUri',
                'fastagImageUri',
              ];

              // Clear AsyncStorage
              //await clearLocations();
              //await clearTravelledDistances(); // for Distance API
              await clearCoordinates(); // for Route API
              await Promise.all(
                paramKeys.map(async key => {
                  await AsyncStorage.removeItem(key);
                  console.log(`Storage for ${key} cleared successfully`);
                  log(`${summaryParams.tripNo}: SUMMARY - Storage for ${key} cleared successfully`);
                }),
              );
              console.log('All storage cleared successfully');

              AsyncStorage.setItem('currentScreen', 'BookingList');
              navigation.navigate('BookingList');
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      console.error('Error sending trip complete details:', error.message);
      if (error.message.includes('timed out') || error.message.includes('Network request failed'))
      {
        Alert.alert(
          translationManager.getTranslation('alertLowNetwork'),
          translationManager.getTranslation('alertCheckNetworkandTry'),
          [{text: 'Ok'}],
          {cancelable: false},
        );
      }
      else
      {
        Alert.alert(
          translationManager.getTranslation('something'),
          [{text: 'Ok'}],
          {cancelable: false},
        );
      }
      log(`${summaryParams.tripNo}: ERROR - SUMMARY - Error sending trip complete details: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setIsBackEnabled(false);
    AsyncStorage.setItem('currentScreen', 'Expense');
    navigation.goBack();
    setTimeout(() => {
      setIsBackEnabled(true);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <NewHeader showDrawer={false} />
      <View style={styles.contentWrapper}>
        {/* Date/Time */}
        <View style={styles.datetime}>
          <Text allowFontScaling={false} style={styles.datetimeText}>
            {currentDateTime}
          </Text>
        </View>

        {/* Page Heading */}
        <View style={styles.pageheading}>
          <View style={styles.headingView}>
            <FontAwesomeIcon icon={faChartSimple} size={25} color="#0c4160" />
            <Text allowFontScaling={false} style={styles.heading}>
              {translationManager.getTranslation('tripSummaryHeading')}
            </Text>
          </View>
        </View>

        {/* Trip Summary Details */}
        <ScrollView>
          <View style={styles.card}>
            <Text allowFontScaling={false} style={styles.cardTitle}>
              {translationManager.getTranslation('tripDetailsHeading')}
            </Text>
            {[
              {label: 'tripIdLabel', value: summaryParams.tripNo},
              {label: 'guestNameLabel', value: summaryParams.custName},
              {label: 'guestPhoneLabel', value: summaryParams.custMobile},
              {label: 'pickupAddressLabel', value: summaryParams.pickUpLoc},
              {label: 'dropLocationLabel', value: summaryParams.dropLoc},
            ].map((item, index) => (
              <View key={index} style={styles.row}>
                <Text allowFontScaling={false} style={styles.label}>
                  {translationManager.getTranslation(item.label)}:
                </Text>
                <Text allowFontScaling={false} style={styles.value}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* <View style={styles.card}>
            <Text allowFontScaling={false} style={styles.cardTitle}>
              KM Readings
            </Text>
            {[
              {
                label: 'pickupKmLabel',
                value: summaryParams.pickupKmReadings + ' KM',
              },
              {label: 'endKmLabel', value: summaryParams.endKmReadings + ' KM'},
            ].map((item, index) => (
              <View key={index} style={styles.row}>
                <Text allowFontScaling={false} style={styles.label}>
                  {translationManager.getTranslation(item.label)}:
                </Text>
                <Text allowFontScaling={false} style={styles.value}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View> */}

          <View style={styles.lastCard}>
            <Text allowFontScaling={false} style={styles.cardTitle}>
              {translationManager.getTranslation('expenses')}
            </Text>
            {[
              {
                label: 'parkingLabel',
                value: summaryParams.parkingReadings,
              },
              {
                label: 'permitLabel',
                value: summaryParams.permitReadings,
              },
              {
                label: 'fastagLabel',
                value: summaryParams.fastagToDisplay,
              },
            ].map((item, index) => {
              const amount =
                item.value !== null &&
                item.value !== undefined &&
                item.value !== ''
                  ? item.value
                  : 0;

              return (
                <View key={index} style={styles.row}>
                  <Text allowFontScaling={false} style={styles.label}>
                    {translationManager.getTranslation(item.label)}:
                  </Text>
                  <Text allowFontScaling={false} style={styles.value}>
                    ₹ {amount}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Checkbox */}
        <View style={styles.check}>
          <BouncyCheckbox
            size={18}
            value={isVerifyChecked}
            onPress={toggleCheckbox}
            fillColor="green"
            unfillColor="#FFFFFF"
            text={translationManager.getTranslation(
              'entriesVerifiedCheckboxText',
            )}
            textStyle={{
              textDecorationLine: 'none',
              fontSize: 16,
              color: 'black',
              fontWeight: 'bold',
            }}
            iconStyle={{borderColor: '#012169'}}
          />
        </View>

        {/* Buttons */}
        <View style={styles.submitButton}>
          <View style={styles.back}>
            <BackButton
              title={translationManager.getTranslation('backButton')}
              onPress={handleBack}
              disabled={!isBackEnabled || isLoading}
            />
          </View>
          <View style={styles.submit}>
            <MySubmitButton
              title={translationManager.getTranslation('submitButton')}
              onPress={handleSubmit}
              disabled={!isVerifyChecked}
              isLoading={isLoading}
            />
          </View>
        </View>
      </View>
      <NewFooter
        driverId={summaryParams.driverId}
        driverPhone={summaryParams.driverPhone}
        showReport={true}
      />
    </View>
  );
};

export default SummaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentWrapper: {
    flex: 1,
  },
  datetime: {
    // flex:0.5,
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
    // flex:0.6,
    height: '8%',
    minHeight:60,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.heading,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  heading: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.headingText,
    fontFamily: 'sans-serif-condensed',
  },
  headingView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lastCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 10,
    fontFamily: 'sans-serif-condensed',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: Colors.label,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
    flex:1,
  },
  value: {
    fontSize: 16,
    color: Colors.value,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
    paddingHorizontal:10,
    flex:2,
  },
  check: {
    padding: 15,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#ebe3e0',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    alignContent: 'center',
    paddingLeft: 70,
    minHeight:60,
  },
  back: {
    flex: 1,
    marginRight: 10,
    minHeight:40,
  },
  submit: {
    flex: 1,
    marginLeft: 10,
    minHeight:40,
  },
});
