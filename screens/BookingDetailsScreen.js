// import React, {useState, useEffect} from 'react';
// import {View, Text, StyleSheet, Alert, BackHandler} from 'react-native';
// import MySubmitButton from '../components/MySubmitButton';
// import BackButton from '../components/BackButton';
// import {useNavigation} from '@react-navigation/native';
// import SQLite from 'react-native-sqlite-storage';
// import translations from '../translations';
// import {log, readLog} from '../components/Logger';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { ScrollView } from 'react-native-gesture-handler';

// const BookingDetailsScreen = ({ route, language }) => {
//   const [currentDateTime, setCurrentDateTime] = useState('');
//   const [isBackEnabled, setIsBackEnabled] = useState(true);

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

//   const lang = language || 'en';
//   const { driverId } = route.params;
//   const { booking } = route.params;
//   const navigation = useNavigation();

//   const formattedDate = booking.TripDate.substring(
//     0,
//     booking.TripDate.indexOf('T'),
//   );

//   const formatTime = (time) => {
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

//   const formattedStartTime = formatTime(booking.TripTime);
//   const formattedReportTime = formatTime(booking.ReportTime);

//   const handleStartTrip = () => {
//     const tripNo = booking.TripId;
//     const custName = booking.PassengerName;
//     const custMobile = booking.PassengerPhone;
//     const reportTime = booking.ReportTime;
//     const pickUpLoc = booking.PickupAddress1;
//     const dropLoc = booking.DropLocation;
//     const vendorAddress = booking.VendorAddress;
//     AsyncStorage.setItem('currentScreen', 'Home');
//     const params = {
//       tripNo,
//       custName,
//       custMobile,
//       reportTime: formattedReportTime,
//       pickUpLoc,
//       dropLoc,
//       driverId,
//       driverPhone: booking.DriverPhone,
//       vendorAddress,
//     };
//     AsyncStorage.setItem('homeParams', JSON.stringify(params));
//     navigation.navigate('Home', params);
//     console.log('handleStartTrip - Trip Initiated for the Trip Id: ', tripNo);
//   };

//   const handleBack = () => {
//     setIsBackEnabled(false);
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
//         <Text allowFontScaling={false} style={styles.heading}>{translations[lang].tripDetailsHeading}</Text>
//       </View>

//       <ScrollView>
//         <View style={styles.maincontent}>
//           <View style={styles.tripDetails}>
//             <View>
//               <View style={styles.samerow}>
//                 <View style={styles.leftSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsLabel}>
//                     {translations[lang].tripIdLabel}:{' '}
//                   </Text>
//                 </View>
//                 <View style={styles.rightSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsData}>{booking.TripId}</Text>
//                 </View>
//               </View>
//               <View style={styles.samerow}>
//                 <View style={styles.leftSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsLabel}>
//                     {translations[lang].tripDateLabel}:{' '}
//                   </Text>
//                 </View>
//                 <View style={styles.rightSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsData}>{formattedDate}</Text>
//                 </View>
//               </View>
//               <View style={styles.samerow}>
//                 <View style={styles.leftSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsLabel}>
//                     {translations[lang].startTimeLabel}:{' '}
//                   </Text>
//                 </View>
//                 <View style={styles.rightSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsData}>{formattedStartTime}</Text>
//                 </View>
//               </View>
//               <View style={styles.samerow}>
//                 <View style={styles.leftSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsLabel}>
//                     {translations[lang].reportTimeLabel}:{' '}
//                   </Text>
//                 </View>
//                 <View style={styles.rightSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsData}>{formattedReportTime}</Text>
//                 </View>
//               </View>
//               <View style={styles.samerow}>
//                 <View style={styles.leftSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsLabel}>
//                     {translations[lang].guestNameLabel}:{' '}
//                   </Text>
//                 </View>
//                 <View style={styles.rightSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsData}>{booking.PassengerName}</Text>
//                 </View>
//               </View>
//               <View style={styles.samerow}>
//                 <View style={styles.leftSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsLabel}>
//                     {translations[lang].guestPhoneLabel}:{' '}
//                   </Text>
//                 </View>
//                 <View style={styles.rightSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsData}>{booking.PassengerPhone}</Text>
//                 </View>
//               </View>
//               <View style={styles.samerow}>
//                 <View style={styles.leftSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsLabel}>
//                     {translations[lang].pickupAddressLabel}:{' '}
//                   </Text>
//                 </View>
//                 <View style={styles.rightSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsData}>{booking.PickupAddress1}</Text>
//                 </View>
//               </View>
//               <View style={styles.samerow}>
//                 <View style={styles.leftSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsLabel}>
//                     {translations[lang].dropLocationLabel}:{' '}
//                   </Text>
//                 </View>
//                 <View style={styles.rightSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsData}>{booking.DropLocation}</Text>
//                 </View>
//               </View>
//               <View style={styles.samerow}>
//                 <View style={styles.leftSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsLabel}>
//                     {translations[lang].dutyLabel}:{' '}
//                   </Text>
//                 </View>
//                 <View style={styles.rightSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsData}>{booking.Duty}</Text>
//                 </View>
//               </View>

//               <View style={styles.samerow}>
//                 <View style={styles.leftSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsLabel}>
//                     {translations[lang].driverNameLabel}:{' '}
//                   </Text>
//                 </View>
//                 <View style={styles.rightSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsData}>{booking.DriverName}</Text>
//                 </View>
//               </View>
//               <View style={styles.samerow}>
//                 <View style={styles.leftSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsLabel}>
//                     {translations[lang].driverPhoneLabel}:{' '}
//                   </Text>
//                 </View>
//                 <View style={styles.rightSide}>
//                   <Text
//                     allowFontScaling={false}
//                     style={styles.tripDetailsData}>{booking.DriverPhone}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//       <View style={styles.buttons}>
//         <View style={styles.backbutton}>
//           <BackButton title="Back" onPress={handleBack} disabled={!isBackEnabled} />
//         </View>
//         <View style={styles.gobutton}>
//           <MySubmitButton
//             title={translations[lang].goButton}
//             onPress={handleStartTrip}
//           />
//         </View>
//       </View>
//       <Footer />
//     </View>
//   );
// };

// export default BookingDetailsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: 'white',
//   },
//   pageheading: {
//     height: '10%',
//     justifyContent: 'center',
//   },
//   datetime: {
//     height: '5%',
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
//   maincontent: {
//     height: '60%',
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     paddingRight: '2%',
//     paddingHorizontal: '2%',
//   },
//   heading: {
//     fontSize: 20,
//     color: 'black',
//     fontWeight: '700',
//   },
//   label: {
//     alignSelf: 'flex-start',
//     marginTop: '1%',
//   },
//   tripDetails: {
//     flexDirection: 'row',
//     alignContent: 'center',
//     marginBottom: '10%',
//     marginLeft: '3%',
//   },
//   tripDetailsLabel: {
//     fontSize: 15,
//     color: 'black',
//     fontFamily: 'Roboto-MediumItalic',
//   },
//   tripDetailsData: {
//     fontSize: 16,
//     color: 'black',
//     // fontFamily: 'Roboto-BoldItalic',
//     fontWeight: '600',
//   },
//   samerow: {
//     flexDirection: 'row',
//     margin: '0.5%',
//     marginBottom: 8,
//   },
//   leftSide: {
//     width: '50%',
//     alignItems: 'flex-start',
//     paddingLeft: '2%',
//   },
//   rightSide: {
//     width: '50%',
//     alignItems: 'flex-start',
//     paddingRight: '1%',
//   },
//   buttons: {
//     flexDirection: 'row',
//     height: '10%',
//     paddingTop:3,
//   },
//   backbutton: {
//     width: '50%',
//   },
// });
import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Alert, BackHandler} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faListOl,
  faRefresh,
  faRoute,
  faRoad,
  faMap,
  faCar,
  faList,
  faMapMarkedAlt,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import MySubmitButton from '../components/MySubmitButton';
import BackButton from '../components/BackButton';
import {useNavigation} from '@react-navigation/native';
import SQLite from 'react-native-sqlite-storage';
import translations from '../translations';
import translationManager from '../translationManager';
import {log, readLog} from '../components/Logger';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewHeader from '../components/NewHeader';
import NewFooter from '../components/NewFooter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ScrollView} from 'react-native-gesture-handler';
import {Colors} from '../config';

const BookingDetailsScreen = ({route, language}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isBackEnabled, setIsBackEnabled] = useState(true);

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

  const lang = language || 'hi';
  const {driverId} = route.params;
  const {booking} = route.params;
  const navigation = useNavigation();

  const formattedDate = booking.TripDate.substring(
    0,
    booking.TripDate.indexOf('T'),
  );

  const formatDate = dateString => {
    const dateObj = new Date(dateString);
    const options = {day: '2-digit', month: 'short', year: 'numeric'};
    return dateObj.toLocaleDateString('en-GB', options);
  };

  // const formatTime = (time) => {
  //   const [hoursStr, minutesStr] = time.toString().split('.');
  //   const hours = hoursStr.padStart(2, '0');
  //   const minutes = minutesStr ? minutesStr.padEnd(2, '0').slice(0, 2).padStart(2, '0') : '00';
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

  const formattedStartTime = formatTime(booking.TripTime);
  const formattedReportTime = formatTime(booking.ReportTime);

  const handleStartTrip = async () => {
    const tripNo = booking.TripId;
    const custName = booking.PassengerName;
    const custMobile = booking.PassengerPhone;
    const reportTime = booking.ReportTime;
    const pickUpLoc = booking.PickupAddress1;
    const dropLoc = booking.DropLocation;
    const vendorAddress = booking.VendorAddress;
    const params = {
      tripNo,
      custName,
      custMobile,
      reportTime: formattedReportTime,
      pickUpLoc,
      dropLoc,
      driverId,
      driverPhone: booking.DriverPhone,
      vendorAddress,
      bookerName: booking.BookerName,
      bookerMobile: booking.BookerMobile,
    };
    await AsyncStorage.removeItem('homeParams');
    const homeParamsBeforeTrip = await AsyncStorage.getItem('homeParams');
    console.log('homeParamsBeforeTripStart: ' + homeParamsBeforeTrip);
    log(`DETAILS - homeParamsBeforeTripStart: ${homeParamsBeforeTrip}`);
    await AsyncStorage.setItem('homeParams', JSON.stringify(params));
    navigation.navigate('Start', params);
    AsyncStorage.setItem('currentScreen', 'Start');
    console.log('handleStartTrip - Trip Initiated for the Trip Id: ', tripNo);
    log('DETAILS - handleStartTrip - Trip Initiated for the Trip Id: ', tripNo);
  };

  const handleBack = () => {
    setIsBackEnabled(false);
    navigation.goBack();
    setTimeout(() => {
      setIsBackEnabled(true);
    }, 2000);
  };
  // return (
  //   <View style={styles.container}>
  //     {/* Header */}
  //     <NewHeader></NewHeader>
  //     <View style={styles.datetime}>
  //       <Text allowFontScaling={false} style={styles.datetimeText}>
  //         {currentDateTime}
  //       </Text>
  //     </View>

  //     {/* Page Heading */}
  //     <View style={styles.pageHeading}>
  //       <FontAwesomeIcon icon={faMapMarkedAlt} size={25} color="#c46960" />
  //       <Text allowFontScaling={false} style={styles.headingText}>
  //         {translationManager.getTranslation('tripDetailsHeading')}
  //       </Text>
  //     </View>

  //     {/* Trip Details */}
  //     <ScrollView>
  //       <View style={styles.mainContent}>
  //         <View style={styles.tripDetails}>
  //           {[
  //             {label: 'tripIdLabel', value: booking.TripId},
  //             {label: 'tripDateLabel', value: formatDate(booking.TripDate)},
  //             {label: 'startTimeLabel', value: formattedStartTime},
  //             {label: 'reportTimeLabel', value: formattedReportTime},
  //             {label: 'guestNameLabel', value: booking.PassengerName},
  //             {label: 'guestPhoneLabel', value: booking.PassengerPhone},
  //             {label: 'pickupAddressLabel', value: booking.PickupAddress1},
  //             {label: 'dropLocationLabel', value: booking.DropLocation},
  //             {label: 'dutyLabel', value: booking.Duty},
  //             {label: 'companyNameLabel', value: booking.CustomerName},
  //             {label: 'bookerNameLabel', value: booking.BookerName},
  //             {label: 'bookerPhoneLabel', value: booking.BookerMobile},
  //           ].map((detail, index) => (
  //             <View style={styles.detailRow} key={index}>
  //               <Text allowFontScaling={false} style={styles.label}>
  //                 {translationManager.getTranslation(detail.label)}:{' '}
  //               </Text>
  //               <Text allowFontScaling={false} style={styles.value}>
  //                 {detail.value || 'N/A'}
  //               </Text>
  //             </View>
  //           ))}
  //         </View>
  //       </View>
  //     </ScrollView>

  //     {/* Buttons */}
  //     <View style={styles.buttons}>
  //       <View style={styles.buttonWrapper}>
  //         <Text
  //           allowFontScaling={false}
  //           style={[styles.button, !isBackEnabled && styles.disabledButton]}
  //           onPress={handleBack}>
  //           {translationManager.getTranslation('backButton')}
  //         </Text>
  //       </View>
  //       <View style={styles.buttonWrapper}>
  //         <Text
  //           allowFontScaling={false}
  //           style={styles.button}
  //           onPress={handleStartTrip}>
  //           {translationManager.getTranslation('goButton')}
  //         </Text>
  //       </View>
  //     </View>

  //     {/* Footer */}
  //     <NewFooter></NewFooter>
  //   </View>
  // );
  return (
    <View style={styles.container}>
      {/* Header */}
      <NewHeader />

      {/* Main Layout (flex-driven layout) */}
      <View style={styles.contentWrapper}>
        {/* Date & Time */}
        <View style={styles.datetime}>
          <Text allowFontScaling={false} style={styles.datetimeText}>
            {currentDateTime}
          </Text>
        </View>

        {/* Page Heading */}
        <View style={styles.pageHeading}>
          <FontAwesomeIcon icon={faMapMarkedAlt} size={25} color="#0c4160" />
          <Text allowFontScaling={false} style={styles.headingText}>
            {translationManager.getTranslation('tripDetailsHeading')}
          </Text>
        </View>

        {/* Scrollable Trip Details */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.tripDetails}>
            {/* **NEW: VIP Label Display** */}
            {booking.IsVIP === 1 && (
              <View style={styles.vipBadge}>
                <Text style={styles.vipBadgeText}>
                  {translationManager.getTranslation('vipLabel') || 'VIP'}
                </Text>
              </View>
            )}
            {[
              {label: 'tripIdLabel', value: booking.TripId},
              {label: 'tripDateLabel', value: formatDate(booking.TripDate)},
              {label: 'startTimeLabel', value: formattedStartTime},
              {label: 'reportTimeLabel', value: formattedReportTime},
              {label: 'guestNameLabel', value: booking.PassengerName},
              {label: 'guestPhoneLabel', value: booking.PassengerPhone},
              {label: 'pickupAddressLabel', value: booking.PickupAddress1},
              {label: 'dropLocationLabel', value: booking.DropLocation},
              {label: 'dutyLabel', value: booking.Duty},
              {label: 'companyNameLabel', value: booking.CustomerName},
              {label: 'bookerNameLabel', value: booking.BookerName},
              {label: 'bookerPhoneLabel', value: booking.BookerMobile},
            ].map((detail, index) => (
              <View style={styles.detailRow} key={index}>
                <Text allowFontScaling={false} style={styles.label}>
                  {translationManager.getTranslation(detail.label)}:{' '}
                </Text>
                <Text allowFontScaling={false} style={styles.value}>
                  {detail.value || 'N/A'}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttons}>
          <View style={styles.buttonWrapper}>
            <Text
              allowFontScaling={false}
              style={[styles.button, !isBackEnabled && styles.disabledButton]}
              onPress={handleBack}>
              {translationManager.getTranslation('backButton')}
            </Text>
          </View>
          <View style={styles.buttonWrapper}>
            <Text
              allowFontScaling={false}
              style={styles.button}
              onPress={handleStartTrip}>
              {translationManager.getTranslation('goButton')}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <NewFooter
        driverId={driverId}
        driverPhone={booking.driverPhone}
        showReport={true}
      />
    </View>
  );
};

export default BookingDetailsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#e2f0ef',
//   },
//   header: {
//     backgroundColor: '#9abda5',
//     padding: 15,
//     alignItems: 'center',
//   },
//   headerText: {
//     color: '#FFFFFF',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   datetime: {
//     height:'4%',
//     backgroundColor: '#aea885',
//     padding: 5,
//     alignItems: 'center',
//   },
//   datetimeText: {
//     fontSize: 14,
//     color: '#fff',
//     fontFamily: 'sans-serif-condensed',
//     fontWeight:'600',
//   },
//   pageHeading: {
//     height:'8%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#ebe3e0',
//     borderBottomWidth: 1,
//     borderBottomColor: '#DDD',
//   },
//   headingText: {
//     marginLeft: 10,
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#0c4160',
//     fontFamily: 'sans-serif-condensed',
//   },
//   mainContent: {
//     height:'67%',
//     padding: 20,
//   },
//   tripDetails: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 10,
//     padding: 15,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 1},
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 5,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EAEAEA',
//     flexWrap: 'wrap',
//   },
//   label: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#c46960',
//     flex: 1,
//     fontFamily: 'sans-serif-condensed',
//   },
//   value: {
//     fontSize: 18,
//     color: '#0c4160',
//     fontWeight: '700',
//     flexShrink: 1,
//     flex: 2,
//     width: '80%',
//     textAlign: 'right',
//     fontFamily: 'sans-serif-condensed',
//   },
//   buttons: {
//     height:'9%',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     padding: 15,
//     backgroundColor: '#ebe3e0',
//     borderTopWidth: 1,
//     borderTopColor: '#DDD',
//   },
//   buttonWrapper: {
//     flex: 1,
//     marginHorizontal: 5,
//   },
//   button: {
//     alignSelf:'center',
//     textAlign: 'center',
//     backgroundColor: '#0c4160',
//     color: '#FFFFFF',
//     padding: 10,
//     borderRadius: 5,
//     fontSize: 16,
//     fontWeight: '800',
//     fontFamily: 'sans-serif-condensed',
//     width:'70%',
//   },
//   disabledButton: {
//     backgroundColor: '#D3D3D3',
//     color: '#A9A9A9',
//   },
//   footer: {
//     backgroundColor: '#012169',
//     padding: 10,
//     alignItems: 'center',
//   },
//   footerText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//   },
// });
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentWrapper: {
    flex: 1,
  },
  datetime: {
    // flex: 0.03,
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
    // flex: 0.05,
    height: '8%',
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.heading,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  headingText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.headingText,
    fontFamily: 'sans-serif-condensed',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  tripDetails: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.label,
    flex: 1,
    fontFamily: 'sans-serif-condensed',
  },
  value: {
    fontSize: 18,
    color: Colors.value,
    fontWeight: '700',
    flexShrink: 1,
    flex: 2,
    width: '80%',
    textAlign: 'right',
    fontFamily: 'sans-serif-condensed',
  },
  buttons: {
    height: '10%',
    minHeight: 60,
    // flex: 0.08,
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
  button: {
    alignSelf: 'center',
    textAlign: 'center',
    backgroundColor: '#0c4160',
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'sans-serif-condensed',
    minHeight: 45, // Example: Set a minimum height for the button itself
    minWidth: 100,
    justifyContent: 'center', // If the button is a View, center content vertically
    alignItems: 'center', // If the button is a View, center content horizontally
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
    color: '#A9A9A9',
  },
  // **NEW VIP Styles**
  vipBadge: {
    alignSelf: 'flex-start',
    top: 5,              // Adjust as needed
    right: 5,            // Adjust as needed
    backgroundColor: 'green', // Distinctive background color
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: 12,
    marginBottom: 5,
    marginLeft:3,
    zIndex: 10, // Ensure it's on top of other elements
  },
  vipBadgeText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
    fontFamily: 'sans-serif-condensed',
    textTransform: 'uppercase', // Make it stand out
  },
});
