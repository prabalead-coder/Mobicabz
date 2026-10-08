// // NewFooter.js
// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
// import translations from '../translations';

// const NewFooter = () => {
//     const sendErrReport = () => {
//     Alert.alert(
//       'Send Error Report', // Title
//       'Would you like to send the Error Report?', // Message
//       [
//         // Button array
//         {
//           text: 'No',
//           style: 'cancel',
//         },
//         {
//           text: 'Yes',
//           onPress: async () => {

//               const db = await SQLite.openDatabase({
//                 name: 'expressDb.db',
//                 location: 'default',
//               });
//               const resultSet = await db.executeSql(
//                 'SELECT DriverID,DriverName,DriverPhone FROM driverData LIMIT 1;',
//               );
//               console.log('Fetched Driver data from database.');
//               const fetchedDriverID = resultSet[0].rows.item(0).DriverID;
//               const fetchedDriverName = resultSet[0].rows.item(0).DriverName;
//               const fetchedDriverPhone = resultSet[0].rows.item(0).DriverPhone;
//               console.log('Header: Fetched Driver Id from database: ', fetchedDriverID);
//               console.log('Header: Fetched Driver Phone from database: ', fetchedDriverPhone);
//               log('FOOTER: fetchDriverID - Fetched Driver Id:', fetchedDriverID);
//               console.log('D-Id: '+fetchedDriverID+' D-Name: '+fetchedDriverName);
//               await db.close();
//               setDriverId(fetchedDriverID);
//               setDriverPhone(fetchedDriverPhone);
//             console.log('Sending Error Report...');
//             console.log('Fetched Driver Id from State Variable: ', driverId);
//             console.log('Fetched Phone from State Variable: ', driverPhone);
//             log('FOOTER: fetchDriverData - Fetched Driver Id:', fetchedDriverID);
//             log('FOOTER: fetchDriverData - Fetched Phone:', fetchedDriverPhone);
//             sendLogFile(fetchedDriverID, fetchedDriverPhone);
//           },
//         },
//       ],
//       {cancelable: false}, // Options
//     );
//   };
//   return (
//     <View style={styles.footer}>
//       {/* Left Corner Button */}
//       <TouchableOpacity style={styles.errorButton} onPress={sendErrReport}>
//         <FontAwesomeIcon
//           style={styles.errIcon}
//           icon={faExclamationTriangle}
//           size={14}
//           color="teal"
//         />
//       </TouchableOpacity>

//       <View style={styles.link}>
//         <Text allowFontScaling={false} style={styles.footerText}>{translations.en.footerTextEtc}</Text>
//         <View style={styles.row}>
//           <View style={styles.right}>
//             <Text allowFontScaling={false} style={styles.footerText}>{translations.en.footerText}</Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   footer: {
//     width: '100%',
//     height: 40,
//     backgroundColor: '#2f3542', // Dark background color for footer
//     justifyContent: 'center',
//     alignItems: 'flex-start', // Align to left side
//     flexDirection: 'row',
//     borderTopWidth: 2,
//     borderTopColor: '#1e272e',
//     borderTopLeftRadius:20,
//     borderTopRightRadius:20,
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 6,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
//   errorButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 5,
//     marginRight: 'auto', // Align to the left side
//   },
//   errIcon: {
//     marginRight: 5,
//   },
//   link: {
//     width: '100%',
//     alignItems: 'flex-end',
//   },
//   footerText: {
//     fontSize: 12,
//     color: '#dfe6e9',
//     fontWeight: 'bold',
//     fontFamily: 'Roboto',
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//   },
//   right: {
//     paddingRight: '2%',
//   },
// });

// export default NewFooter;

import React, {useState,useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import translations from '../translations';
import {log, sendLogFile} from './Logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NewFooter = ({driverId, driverPhone, showReport}) => {
  const [driverid, setDriverid] = useState(null);
  const [drivermobile, setDrivermobile] = useState(null);

  useEffect(() => {
    async function fetchDriverData() {
      try {
        const id = await AsyncStorage.getItem('driverId');
        const mobile = await AsyncStorage.getItem('driverPhone');
        setDriverid(id);
        setDrivermobile(mobile);
      } catch (error) {
        console.error('Failed to fetch driver data from AsyncStorage', error);
      }
    }
    fetchDriverData();
  }, []);

  const sendErrReport = () => {
    Alert.alert(
      'Send Error Report !',
      'Would you like to send the Error Report?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            console.log('Sending Error Report...');
            console.log('Fetched Driver Id from async: ', driverid);
            console.log('Fetched Phone from async: ', drivermobile);
            log('FOOTER: fetchDriverData - Fetched Driver Id:', driverid);
            log('FOOTER: fetchDriverData - Fetched Driver Phone:', drivermobile);
            sendLogFile(driverid, drivermobile);
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <LinearGradient
      colors={['#0c4160', '#065758']} // Gradient colors
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.footer}>
      {/* Left: Error Button */}
      <TouchableOpacity style={styles.errorButton} onPress={sendErrReport}>
        <FontAwesomeIcon icon={faExclamationTriangle} size={10} color="red" />
        <Text style={styles.errorText}>Report</Text>
      </TouchableOpacity>

      {/* Right: Footer Text */}
      <View style={styles.footerTextContainer}>
        <Text allowFontScaling={false} style={styles.footerText}>
          {translations.en.footerTextEtc}
        </Text>
        <Text allowFontScaling={false} style={styles.footerText}>
          {translations.en.footerText}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    height: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', //change when using error report..
    //justifyContent:'flex-end',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    paddingHorizontal: 20,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: '#a9d4d6',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginRight: 5,
  },
  errorText: {
    color: '#065758',
    fontSize: 8,
    fontWeight: '800',
    marginLeft: 6,
  },
  footerTextContainer: {
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'right',
  },
});

export default NewFooter;
