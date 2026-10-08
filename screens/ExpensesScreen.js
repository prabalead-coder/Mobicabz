import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import NewHeader from '../components/NewHeader';
import NewFooter from '../components/NewFooter';
import SubmitImageUpload from '../components/SubmitImageUpload';
import MySubmitButton from '../components/MySubmitButton';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faMoneyCheckAlt} from '@fortawesome/free-solid-svg-icons';
import translations from '../translations';
import translationManager from '../translationManager';
import {useNavigation} from '@react-navigation/native';
import {log, readLog} from '../components/Logger';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {Colors} from '../config';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
} from 'react-native-alert-notification';
import {stat} from 'react-native-fs';
import {orderByDistance} from 'geolib';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExpensesScreen = route => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dropdownItems, setDropdownItems] = useState([
    {label: translationManager.getTranslation('fastagLabel'), value: 'fastag'},
    {label: translationManager.getTranslation('permitLabel'), value: 'permit'},
    {label: translationManager.getTranslation('parkingLabel'), value: 'parking'},
  ]);
  const [amount, setAmount] = useState('');
  const [entries, setEntries] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null); // {uri, amount, category}
  const [submitParams, setSubmitParams] = useState({});
  const navigation = useNavigation();

  // These will now hold the *total* values for display and submission
  const [parkingTotal, setParkingTotal] = useState('0.00');
  const [permitTotal, setPermitTotal] = useState('0.00');
  const [fastagTotal, setFastagTotal] = useState('0.00');

  // Image URIs are still arrays, as before
  const [parkingImageUri, setParkingImageUri] = useState([]);
  const [permitImageUri, setPermitImageUri] = useState([]);
  const [fastagImageUri, setFastagImageUri] = useState([]);
  const [isFastagChecked, setIsFastagChecked] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const storedParams = await AsyncStorage.getItem('submitParams');
        console.log('Received submitParams:', storedParams);
        log('Received submitParams:', storedParams);
        if (storedParams !== null) {
          setSubmitParams(JSON.parse(storedParams));
          setAmount('');
          setEntries([]);
          setParkingTotal('0.00');
          setPermitTotal('0.00');
          setFastagTotal('0.00');
          setParkingImageUri([]);
          setPermitImageUri([]);
          setFastagImageUri([]);
        } else {
          setSubmitParams(route.params);
          setAmount('');
          setEntries([]);
          setParkingTotal('0.00');
          setPermitTotal('0.00');
          setFastagTotal('0.00');
          setParkingImageUri([]);
          setPermitImageUri([]);
          setFastagImageUri([]);
        }
      } catch (error) {
        console.error('Error retrieving params from AsyncStorage:', error);
        log('Error retrieving submitParams from AsyncStorage:', error);
      }
    };

    fetchParams();
  }, [route.params]);

  // Effect to update totals whenever 'entries' changes
  useEffect(() => {
    setFastagTotal(calculateTotal('fastag'));
    setPermitTotal(calculateTotal('permit'));
    setParkingTotal(calculateTotal('parking'));
  }, [entries]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const date = now.toDateString();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentDateTime(`${date} - ${hours}:${minutes}`);
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleCheckbox = () => {
    setIsFastagChecked(!isFastagChecked);
  };

  useEffect(() => {
    if (isFastagChecked) {
      setStatus('FASTAGPENDING');
      log(
        `${submitParams.tripNo}: SUBMIT - Trip status changed: FASTAGPENDING`,
      );
    } else {
      setStatus('COMPLETED');
      log(`${submitParams.tripNo}: SUBMIT - Trip status changed: COMPLETED`);
    }
  }, [isFastagChecked]);

  // to hide the footer when keyboard opens....
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

  const handleImageUpload = image => {
    if (!amount) {
      Alert.alert('Validation Error', 'Please enter an amount.');
      return;
    }

    let normalizedImage = null;

    if (Array.isArray(image)) {
      if (typeof image[0] === 'string') {
        normalizedImage = {uri: image[0]};
      } else if (image[0]?.uri) {
        normalizedImage = image[0];
      } else {
        Alert.alert('Upload Error', 'Invalid image format.');
        return;
      }
    } else if (image?.uri) {
      normalizedImage = image;
    } else {
      Alert.alert('Upload Error', 'Invalid image data.');
      return;
    }

    const newEntry = {
      category: selectedCategory,
      amount: parseFloat(amount),
      image: normalizedImage,
    };

    setEntries(prev => [...prev, newEntry]);

    // Append the image URI to the respective arrays
    switch (selectedCategory) {
      case 'parking':
        setParkingImageUri(prev => [...prev, normalizedImage.uri]);
        break;
      case 'permit':
        setPermitImageUri(prev => [...prev, normalizedImage.uri]);
        break;
      case 'fastag':
        setFastagImageUri(prev => [...prev, normalizedImage.uri]);
        break;
      default:
        break;
    }

    setAmount('');
  };

  function validateInput(inputValue) {
    // This validation is for single numerical inputs.
    // If parkingTotal, permitTotal, fastagTotal are derived strings like "0.00",
    // this function might not be suitable for validating them directly without parsing.
    var pattern = /^[0-9]*$/;
    if (!pattern.test(inputValue)) {
      Alert.alert(
        translationManager.getTranslation('alertInvalidInput'),
        translationManager.getTranslation('alertEnterNumbers'),
      );
      return false;
    }
    return true;
  }

  const handleSubmit = () => {
    log(
      `${submitParams.tripNo}: SUBMIT - handleSubmit - Method being called...`,
    );
    // Log the actual totals that will be sent
    log(
      `${submitParams.tripNo}: SUBMIT - handlesubmit - Calculated Parking Total: ${parkingTotal}`,
    );
    log(
      `${submitParams.tripNo}: SUBMIT - handlesubmit - Calculated Fastag Total: ${fastagTotal}`,
    );
    log(
      `${submitParams.tripNo}: SUBMIT - handlesubmit - Calculated Permit Total: ${permitTotal}`,
    );

    // Removed individual input validation for readings, as they are now derived totals

    if (isFastagChecked) {
      setStatus('FASTAGPENDING');
      console.log('Status updated after checking fastag: ', status);
    } else {
      setStatus('COMPLETED');
    }

    AsyncStorage.setItem('currentScreen', 'Summary');
    const summaryParams = {
      signatureData: submitParams.signatureData,
      driverId: submitParams.driverId,
      driverPhone: submitParams.driverPhone,
      startKmReadings: submitParams.startKmReadings,
      pickupKmReadings: submitParams.pickupKmReadings,
      endKmReadings: submitParams.endKmReadings,
      fastagReadings: fastagTotal, // Now passing the calculated total
      parkingReadings: parkingTotal, // Now passing the calculated total
      permitReadings: permitTotal, // Now passing the calculated total
      tripNo: submitParams.tripNo,
      custName: submitParams.custName,
      custMobile: submitParams.custMobile,
      pickUpLoc: submitParams.pickUpLoc,
      dropLoc: submitParams.dropLoc,
      pickupKmImageUri: submitParams.pickupKmImageUri,
      endKmImageUri: submitParams.endKmImageUri,
      parkingImageUri, // Array of parking image URIs
      fastagImageUri, // Array of fastag image URIs
      fastagToDisplay: fastagTotal, // Assuming this also displays the total
      permitImageUri, // Array of permit image URIs
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
      routeGeometry: submitParams.routeGeometry,
    };
    AsyncStorage.setItem('summaryParams', JSON.stringify(summaryParams));
    navigation.navigate('Summary', summaryParams);
    log(`${submitParams.tripNo}: SUBMIT - handleSubmit - Method completed`);
    // Updated log to reflect sending total values and image URI arrays
    log(`${
      submitParams.tripNo
    }: SUBMIT - handleSubmit - Data navigated to Summary Screen: 
      signatureData: ${submitParams.signatureData},
      driverId: ${submitParams.driverId},
      driverPhone: ${submitParams.driverPhone},
      startKmReadings: ${submitParams.startKmReadings},
      pickupKmReadings: ${submitParams.pickupKmReadings},
      endKmReadings: ${submitParams.endKmReadings},
      fastagReadings: ${fastagTotal},
      parkingReadings: ${parkingTotal},
      permitReadings: ${permitTotal},
      tripNo: ${submitParams.tripNo},
      custName: ${submitParams.custName},
      custMobile: ${submitParams.custMobile},
      pickUpLoc: ${submitParams.pickUpLoc},
      dropLoc: ${submitParams.dropLoc},
      pickupKmImageUri: ${submitParams.pickupKmImageUri},
      parkingImageUri: ${JSON.stringify(parkingImageUri)},
      fastagImageUri: ${JSON.stringify(fastagImageUri)},
      fastagToDisplay: ${fastagTotal},
      permitImageUri: ${JSON.stringify(permitImageUri)},
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

  const calculateTotal = category => {
    return entries
      .filter(entry => entry.category === category)
      .reduce((sum, item) => sum + item.amount, 0)
      .toFixed(2);
  };

  return (
    <View style={styles.container}>
      <NewHeader />

      <View style={styles.contentWrapper}>
        <View style={styles.datetime}>
          <Text allowFontScaling={false} style={styles.datetimeText}>
            {currentDateTime}
          </Text>
        </View>
        <View style={styles.pageheading}>
          <View style={styles.headingView}>
            <FontAwesomeIcon icon={faMoneyCheckAlt} size={25} color="#0c4160" />
            <Text allowFontScaling={false} style={styles.heading}>
              {translationManager.getTranslation('expensesUpdate')}
            </Text>
          </View>
        </View>
        <View style={styles.formRow}>
          <DropDownPicker
            open={dropdownOpen}
            value={selectedCategory}
            items={dropdownItems}
            setOpen={setDropdownOpen}
            setValue={setSelectedCategory}
            setItems={setDropdownItems}
            placeholder={translationManager.getTranslation('selectCategory')}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={1000}
          />
        </View>

        {selectedCategory && (
          <View style={styles.inputsWrapper}>
            <TextInput
              style={styles.amountInput}
              placeholder={translationManager.getTranslation('enterAmtPlaceholder')}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="#888"
              maxLength={7}
              color="black"
            />

            <SubmitImageUpload
              title={translationManager.getTranslation('uploadImageButton')}
              onImageUpload={handleImageUpload}
            />
          </View>
        )}

        <ScrollView style={styles.entriesList}>
          <View style={styles.gridSection}>
            {['fastag', 'permit', 'parking'].map(category => {
              const filteredEntries = entries.filter(
                entry => entry.category === category,
              );
              if (filteredEntries.length === 0) return null;

              return (
                <View key={category} style={styles.categoryBlock}>
                  <Text style={styles.categoryHeading}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>

                  <View style={styles.gridContainer}>
                    {filteredEntries.map((entry, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.gridItem}
                        onLongPress={() => {
                          setPreviewData(entry);
                          setPreviewVisible(true);
                        }}>
                        <Image
                          source={{uri: entry.image.uri}}
                          style={styles.gridImage}
                        />
                        <Text style={styles.gridText}>₹{entry.amount}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.totalsContainer}>
          {/* Displaying the new total state variables */}
          <View
            key="fastagTotal"
            style={[styles.totalItem, styles.totalItemSeparator]}>
            <Text style={styles.totalText}>{translationManager.getTranslation('fastagTotal')}</Text>
            <Text style={styles.totalAmount}>₹{fastagTotal}</Text>
          </View>
          <View
            key="permitTotal"
            style={[styles.totalItem, styles.totalItemSeparator]}>
            <Text style={styles.totalText}>{translationManager.getTranslation('permitTotal')}</Text>
            <Text style={styles.totalAmount}>₹{permitTotal}</Text>
          </View>
          <View key="parkingTotal" style={styles.totalItem}>
            <Text style={styles.totalText}>{translationManager.getTranslation('parkingTotal')}</Text>
            <Text style={styles.totalAmount}>₹{parkingTotal}</Text>
          </View>
        </View>

        <View style={styles.submitButtonView}>
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
          <MySubmitButton title={translationManager.getTranslation('nextButton')} onPress={handleSubmit} />
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={previewVisible}
        onRequestClose={() => setPreviewVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {previewData?.image?.uri ? (
              <Image
                source={{uri: previewData.image.uri}}
                style={styles.modalImage}
              />
            ) : (
              <Text>No Image</Text>
            )}
            <Text style={styles.modalTitle}>
              {previewData?.category?.toUpperCase()}
            </Text>
            <Text style={styles.modalAmount}>₹{previewData?.amount}</Text>
            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!isKeyboardVisible && <NewFooter />}
    </View>
  );
};

export default ExpensesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
  },
  datetime: {
    height: '4%',
    minHeight: 28,
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
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#012169',
    textAlign: 'center',
  },
  formRow: {
    marginBottom: 15,
    zIndex: 1000,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  dropdown: {
    borderColor: '#ccc',
    borderRadius: 5,
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  inputsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
    paddingHorizontal: 15,
  },
  amountInput: {
    flex: 1,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 7,
  },
  entriesList: {
    flex: 1,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  entryText: {
    fontSize: 14,
    color: '#333',
  },
  uploadedImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginLeft: 10,
  },
  totalsContainer: {
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: Colors.heading,
    paddingHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },

  totalItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  totalItemSeparator: {
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },

  totalText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#012169',
    textAlign: 'center',
    marginBottom: 2,
  },

  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  submitButtonView: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  gridSection: {
    marginVertical: 10,
  },

  categoryBlock: {
    marginBottom: 15,
  },

  categoryHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#012169',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  gridItem: {
    width: '20%',
    margin: '2%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 5,
    alignItems: 'center',
  },

  gridImage: {
    width: '100%',
    height: 60,
    borderRadius: 6,
    resizeMode: 'cover',
  },

  gridText: {
    fontSize: 12,
    color: '#012169',
    marginTop: 5,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 500,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#012169',
  },
  modalAmount: {
    fontSize: 14,
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: '#012169',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pageheading: {
    height: '8%',
    minHeight: 60,
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
});


// With Image Delete Option...

// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   StyleSheet,
//   Image,
//   Alert, // Import Alert for confirmation dialogs
//   TouchableOpacity,
//   Modal,
// } from 'react-native';
// import DropDownPicker from 'react-native-dropdown-picker';
// import NewHeader from '../components/NewHeader';
// import NewFooter from '../components/NewFooter';
// import SubmitImageUpload from '../components/SubmitImageUpload';
// import MySubmitButton from '../components/MySubmitButton';
// import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
// import {
//   faRectangleList,
//   faMoneyCheck,
//   faMoneyBill,
//   faMoneyCheckAlt,
//   faMoneyCheckDollar,
//   faTrash, // <-- Import trash icon for delete
// } from '@fortawesome/free-solid-svg-icons';
// import translations from '../translations';
// import translationManager from '../translationManager';
// import {useNavigation} from '@react-navigation/native';
// import {log, readLog} from '../components/Logger';
// import BouncyCheckbox from 'react-native-bouncy-checkbox';
// import {Colors} from '../config';
// import {
//   ALERT_TYPE,
//   Dialog,
//   AlertNotificationRoot,
//   Toast,
// } from 'react-native-alert-notification';
// import {stat} from 'react-native-fs';
// import {orderByDistance} from 'geolib';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const TestScreen = (route) => {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [dropdownItems, setDropdownItems] = useState([
//     {label: 'Fastag', value: 'fastag'},
//     {label: 'Permit', value: 'permit'},
//     {label: 'Parking', value: 'parking'},
//   ]);
//   const [amount, setAmount] = useState('');
//   const [entries, setEntries] = useState([]); // This array holds all expense entries (with or without images)
//   const [previewVisible, setPreviewVisible] = useState(false);
//   const [previewData, setPreviewData] = useState(null); // {entry, index} - storing the full entry AND its index for deletion
//   const [submitParams, setSubmitParams] = useState({});
//   const navigation = useNavigation();

//   const [parkingTotal, setParkingTotal] = useState('0.00');
//   const [permitTotal, setPermitTotal] = useState('0.00');
//   const [fastagTotal, setFastagTotal] = useState('0.00');

//   const [parkingImageUri, setParkingImageUri] = useState([]);
//   const [permitImageUri, setPermitImageUri] = useState([]);
//   const [fastagImageUri, setFastagImageUri] = useState([]);

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
//         const storedParams = await AsyncStorage.getItem('submitParams');
//         console.log('Received submitParams:', storedParams);
//         if (storedParams !== null) {
//           setSubmitParams(JSON.parse(storedParams));
//         } else {
//           setSubmitParams(route.params);
//         }
//       } catch (error) {
//         console.error('Error retrieving params from AsyncStorage:', error);
//       }
//     };

//     fetchParams();
//   }, [route.params]);

//   // Effect to update totals whenever 'entries' changes
//   useEffect(() => {
//     setFastagTotal(calculateTotal('fastag'));
//     setPermitTotal(calculateTotal('permit'));
//     setParkingTotal(calculateTotal('parking'));
//   }, [entries]);

//   useEffect(() => {
//     const updateDateTime = () => {
//       const now = new Date();
//       const date = now.toDateString();
//       const hours = String(now.getHours()).padStart(2, '0');
//       const minutes = String(now.getMinutes()).padStart(2, '0');
//       setCurrentDateTime(`${date} - ${hours}:${minutes}`);
//     };

//     updateDateTime();
//     const intervalId = setInterval(updateDateTime, 1000);
//     return () => clearInterval(intervalId);
//   }, []);

//   const handleImageUpload = (image = null) => { // Default image to null
//     if (!amount) {
//       Alert.alert('Validation Error', 'Please enter an amount.');
//       return;
//     }
//     if (!selectedCategory) {
//       Alert.alert('Validation Error', 'Please select a category.');
//       return;
//     }
//     if (!validateInput(amount)) { // Validate the amount
//       return;
//     }

//     let normalizedImage = null;

//     // Only attempt to normalize/process image if one was actually provided
//     if (image) {
//       if (Array.isArray(image)) {
//         if (typeof image[0] === 'string') {
//           normalizedImage = {uri: image[0]};
//         } else if (image[0]?.uri) {
//           normalizedImage = image[0];
//         } else {
//           // Alert user about invalid image format but still allow adding amount
//           Toast.show({
//             type: ALERT_TYPE.WARNING,
//             title: 'Image Error',
//             text: 'Invalid image format. Adding amount without image.',
//           });
//         }
//       } else if (image?.uri) {
//         normalizedImage = image;
//       } else {
//         // Alert user about invalid image data but still allow adding amount
//         Toast.show({
//           type: ALERT_TYPE.WARNING,
//           title: 'Image Error',
//           text: 'Invalid image data. Adding amount without image.',
//         });
//       }
//     }

//     const newEntry = {
//       category: selectedCategory,
//       amount: parseFloat(amount),
//       image: normalizedImage, // Will be null if no valid image was provided
//     };

//     setEntries(prev => [...prev, newEntry]);

//     // Add image URI to specific arrays ONLY if a valid image URI exists
//     if (normalizedImage && normalizedImage.uri) {
//       switch (selectedCategory) {
//         case 'parking':
//           setParkingImageUri(prev => [...prev, normalizedImage.uri]);
//           break;
//         case 'permit':
//           setPermitImageUri(prev => [...prev, normalizedImage.uri]);
//           break;
//         case 'fastag':
//           setFastagImageUri(prev => [...prev, normalizedImage.uri]);
//           break;
//         default:
//           break;
//       }
//       Toast.show({
//         type: ALERT_TYPE.SUCCESS,
//         title: 'Success',
//         text: 'Expense with image added successfully!',
//       });
//     } else {
//       Toast.show({
//         type: ALERT_TYPE.SUCCESS,
//         title: 'Success',
//         text: 'Amount added successfully!',
//       });
//     }

//     setAmount(''); // Clear amount input after adding
//   };

//   // NEW: Function to delete an expense entry
//   const handleDeleteEntry = (entryToDelete, entryIndex) => {
//     Alert.alert(
//       'Confirm Deletion',
//       `Are you sure you want to delete this expense (${entryToDelete.category}: ₹${entryToDelete.amount})?`,
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Delete',
//           onPress: () => {
//             // Filter out the entry at the given index
//             const updatedEntries = entries.filter((_, index) => index !== entryIndex);
//             setEntries(updatedEntries);

//             // Also remove the image URI from the specific category's image array if it exists
//             if (entryToDelete.image?.uri) {
//               switch (entryToDelete.category) {
//                 case 'parking':
//                   setParkingImageUri(prev => prev.filter(uri => uri !== entryToDelete.image.uri));
//                   break;
//                 case 'permit':
//                   setPermitImageUri(prev => prev.filter(uri => uri !== entryToDelete.image.uri));
//                   break;
//                 case 'fastag':
//                   setFastagImageUri(prev => prev.filter(uri => uri !== entryToDelete.image.uri));
//                   break;
//                 default:
//                   break;
//               }
//             }
//             setPreviewVisible(false); // Close the modal after deletion
//             Toast.show({
//                 type: ALERT_TYPE.SUCCESS,
//                 title: 'Deleted',
//                 text: 'Expense entry deleted successfully.',
//             });
//           },
//         },
//       ],
//       {cancelable: true},
//     );
//   };

//   function validateInput(inputValue) {
//     var pattern = /^[0-9]*(\.[0-9]{1,2})?$/; // Allows for decimal values with up to 2 places
//     if (!pattern.test(inputValue)) {
//       Alert.alert(
//         translationManager.getTranslation('alertInvalidInput'),
//         translationManager.getTranslation('alertEnterNumbers'),
//       );
//       return false;
//     }
//     return true;
//   }

//   const handleSubmit = () => {
//     log(
//       `${submitParams.tripNo}: SUBMIT - handleSubmit - Method being called...`,
//     );
//     log(
//       `${submitParams.tripNo}: SUBMIT - handlesubmit - Calculated Parking Total: ${parkingTotal}`,
//     );
//     log(
//       `${submitParams.tripNo}: SUBMIT - handlesubmit - Calculated Fastag Total: ${fastagTotal}`,
//     );
//     log(
//       `${submitParams.tripNo}: SUBMIT - handlesubmit - Calculated Permit Total: ${permitTotal}`,
//     );

//     if (isFastagChecked) {
//       setStatus('FASTAGPENDING');
//       console.log('Status updated after checking fastag: ', status);
//     } else {
//       setStatus('COMPLETED');
//     }

//     AsyncStorage.setItem('currentScreen', 'Summary');
//     const summaryParams = {
//       signatureData: submitParams.signatureData,
//       driverId: submitParams.driverId,
//       driverPhone: submitParams.driverPhone,
//       startKmReadings: submitParams.startKmReadings,
//       pickupKmReadings: submitParams.pickupKmReadings,
//       endKmReadings: submitParams.endKmReadings,
//       fastagReadings: fastagTotal, // Now passing the calculated total
//       parkingReadings: parkingTotal, // Now passing the calculated total
//       permitReadings: permitTotal, // Now passing the calculated total
//       tripNo: submitParams.tripNo,
//       custName: submitParams.custName,
//       custMobile: submitParams.custMobile,
//       pickUpLoc: submitParams.pickUpLoc,
//       dropLoc: submitParams.dropLoc,
//       pickupKmImageUri: submitParams.pickupKmImageUri,
//       endKmImageUri: submitParams.endKmImageUri,
//       parkingImageUri, // Array of parking image URIs
//       fastagImageUri, // Array of fastag image URIs
//       fastagToDisplay: fastagTotal, // Assuming this also displays the total
//       permitImageUri, // Array of permit image URIs
//       status,
//       tripCompletedTime: submitParams.tripCompletedTime,
//       tripCompleteLoc: submitParams.tripCompleteLoc,
//       vendorAddress: submitParams.vendorAddress,
//       startLatLong: submitParams.startLatLong,
//       signTime: submitParams.signTime,
//       completeLat: submitParams.completeLat,
//       completeLong: submitParams.completeLong,
//       isNoSignChecked: submitParams.isNoSignChecked,
//       approxTravelDistance: submitParams.approxTravelDistance,
//     };
//     AsyncStorage.setItem('summaryParams', JSON.stringify(summaryParams));
//     navigation.navigate('Summary', summaryParams);
//     log(`${submitParams.tripNo}: SUBMIT - handleSubmit - Method completed`);
//     log(`${submitParams.tripNo}: SUBMIT - handleSubmit - Data navigated to Summary Screen: 
//       signatureData: ${submitParams.signatureData},
//       driverId: ${submitParams.driverId},
//       driverPhone: ${submitParams.driverPhone},
//       startKmReadings: ${submitParams.startKmReadings},
//       pickupKmReadings: ${submitParams.pickupKmReadings},
//       endKmReadings: ${submitParams.endKmReadings},
//       fastagReadings: ${fastagTotal},
//       parkingReadings: ${parkingTotal},
//       permitReadings: ${permitTotal},
//       tripNo: ${submitParams.tripNo},
//       custName: ${submitParams.custName},
//       custMobile: ${submitParams.custMobile},
//       pickUpLoc: ${submitParams.pickUpLoc},
//       dropLoc: ${submitParams.dropLoc},
//       pickupKmImageUri: ${submitParams.pickupKmImageUri},
//       parkingImageUri: ${JSON.stringify(parkingImageUri)},
//       fastagImageUri: ${JSON.stringify(fastagImageUri)},
//       fastagToDisplay: ${fastagTotal},
//       permitImageUri: ${JSON.stringify(permitImageUri)},
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

//   const calculateTotal = category => {
//     return entries
//       .filter(entry => entry.category === category)
//       .reduce((sum, item) => sum + item.amount, 0)
//       .toFixed(2);
//   };

//   return (
//     <View style={styles.container}>
//       <NewHeader />

//       <View style={styles.contentWrapper}>
//         <View style={styles.datetime}>
//           <Text allowFontScaling={false} style={styles.datetimeText}>
//             {currentDateTime}
//           </Text>
//         </View>
//         <View style={styles.pageheading}>
//           <View style={styles.headingView}>
//             <FontAwesomeIcon icon={faMoneyCheckAlt} size={25} color="#0c4160" />
//             <Text allowFontScaling={false} style={styles.heading}>
//               {translationManager.getTranslation('expensesUpdate')}
//             </Text>
//           </View>
//         </View>
//         <View style={styles.formRow}>
//           <DropDownPicker
//             open={dropdownOpen}
//             value={selectedCategory}
//             items={dropdownItems}
//             setOpen={setDropdownOpen}
//             setValue={setSelectedCategory}
//             setItems={setDropdownItems}
//             placeholder="Select Category"
//             style={styles.dropdown}
//             dropDownContainerStyle={styles.dropdownContainer}
//             zIndex={1000}
//           />
//         </View>

//         {selectedCategory && (
//           <View style={styles.inputsWrapper}>
//             <TextInput
//               style={styles.amountInput}
//               placeholder="Enter Amount"
//               keyboardType="numeric"
//               value={amount}
//               onChangeText={setAmount}
//               placeholderTextColor="#888"
//               maxLength={7}
//               color="black"
//             />

//             <SubmitImageUpload
//               title="Add Expense" // Changed title for clarity
//               onImageUpload={handleImageUpload} // This button will trigger image selection and then add expense
//             />
//           </View>
//         )}

//         <ScrollView style={styles.entriesList}>
//           <View style={styles.gridSection}>
//             {['fastag', 'permit', 'parking'].map(category => {
//               // Filter entries, including those with image: null
//               const filteredEntries = entries.filter(
//                 entry => entry.category === category,
//               );
//               if (filteredEntries.length === 0) return null;

//               return (
//                 <View key={category} style={styles.categoryBlock}>
//                   <Text style={styles.categoryHeading}>
//                     {category.charAt(0).toUpperCase() + category.slice(1)}
//                   </Text>

//                   <View style={styles.gridContainer}>
//                     {filteredEntries.map((entry, index) => (
//                       <TouchableOpacity
//                         key={index}
//                         style={styles.gridItem}
//                         // Pass both entry and index to previewData for deletion
//                         onLongPress={() => {
//                           setPreviewData({ entry, index });
//                           setPreviewVisible(true);
//                         }}>
//                         {entry.image?.uri ? (
//                           <Image
//                             source={{uri: entry.image.uri}}
//                             style={styles.gridImage}
//                           />
//                         ) : (
//                           // Placeholder for entries without images
//                           <View style={styles.noImageIconContainer}>
//                             <FontAwesomeIcon icon={faMoneyBill} size={30} color="#888" />
//                             <Text style={styles.noImageIconText}>No Image</Text>
//                           </View>
//                         )}
//                         <Text style={styles.gridText}>₹{entry.amount}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </View>
//               );
//             })}
//           </View>
//         </ScrollView>

//         <View style={styles.totalsContainer}>
//           <View key="fastagTotal" style={[styles.totalItem, styles.totalItemSeparator]}>
//             <Text style={styles.totalText}>Fastag Total:</Text>
//             <Text style={styles.totalAmount}>₹{fastagTotal}</Text>
//           </View>
//           <View key="permitTotal" style={[styles.totalItem, styles.totalItemSeparator]}>
//             <Text style={styles.totalText}>Permit Total:</Text>
//             <Text style={styles.totalAmount}>₹{permitTotal}</Text>
//           </View>
//           <View key="parkingTotal" style={styles.totalItem}>
//             <Text style={styles.totalText}>Parking Total:</Text>
//             <Text style={styles.totalAmount}>₹{parkingTotal}</Text>
//           </View>
//         </View>

//         <View style={styles.submitButtonView}>
//           <MySubmitButton title="Next" onPress={handleSubmit} />
//         </View>
//       </View>
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={previewVisible}
//         onRequestClose={() => setPreviewVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             {previewData?.entry?.image?.uri ? ( // Access entry from previewData
//               <Image
//                 source={{uri: previewData.entry.image.uri}}
//                 style={styles.modalImage}
//               />
//             ) : (
//               // Display a message if no image for the entry
//               <View style={styles.modalNoImageContainer}>
//                 <FontAwesomeIcon icon={faMoneyBill} size={50} color="#888" />
//                 <Text style={styles.modalNoImageText}>No Image Available</Text>
//               </View>
//             )}
//             <Text style={styles.modalTitle}>
//               {previewData?.entry?.category?.toUpperCase()} {/* Access entry from previewData */}
//             </Text>
//             <Text style={styles.modalAmount}>₹{previewData?.entry?.amount}</Text> {/* Access entry from previewData */}

//             {/* Delete button in the modal */}
//             <TouchableOpacity
//               onPress={() => handleDeleteEntry(previewData.entry, previewData.index)}
//               style={styles.deleteButton}>
//               <FontAwesomeIcon icon={faTrash} size={20} color="#fff" />
//               <Text style={styles.deleteButtonText}>Delete Expense</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => setPreviewVisible(false)}
//               style={styles.closeButton}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       <NewFooter />
//     </View>
//   );
// };

// export default TestScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   contentWrapper: {
//     flex: 1,
//   },
//   datetime: {
//     height: '4%',
//     minHeight: 28,
//     backgroundColor: Colors.dateTimeBackground,
//     padding: 5,
//     alignItems: 'center',
//   },
//   datetimeText: {
//     fontSize: 14,
//     color: Colors.dateTimeText,
//     fontFamily: 'sans-serif-condensed',
//     fontWeight: '700',
//   },
//   heading: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: '#012169',
//     textAlign: 'center',
//   },
//   formRow: {
//     marginBottom: 15,
//     zIndex: 1000,
//     paddingHorizontal: 15,
//     paddingTop: 15,
//   },
//   dropdown: {
//     borderColor: '#ccc',
//     borderRadius: 5,
//   },
//   dropdownContainer: {
//     borderColor: '#ccc',
//   },
//   inputsWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//     gap: 10,
//     paddingHorizontal: 15,
//     flexWrap: 'wrap', // Allow buttons to wrap if space is limited
//   },
//   amountInput: {
//     flex: 1,
//     height: 50,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginBottom: 7,
//     minWidth: 100, // Ensure it doesn't get too small if buttons are wide
//   },
//   entriesList: {
//     flex: 1,
//     marginBottom: 10,
//     paddingHorizontal: 15,
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
//   },
//   uploadedImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 5,
//     marginLeft: 10,
//   },
//   totalsContainer: {
//     paddingVertical: 5,
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//     backgroundColor: Colors.heading,
//     paddingHorizontal: 5,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },

//   totalItem: {
//     flex: 1,
//     alignItems: 'center',
//     paddingHorizontal: 5,
//     paddingVertical: 3,
//   },

//   totalItemSeparator: {
//     borderRightWidth: 1,
//     borderRightColor: '#ccc',
//   },

//   totalText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#012169',
//     textAlign: 'center',
//     marginBottom: 2,
//   },

//   totalAmount: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//   },

//   submitButtonView: {
//     padding: 15,
//     alignItems: 'center',
//   },
//   gridSection: {
//     marginVertical: 10,
//   },

//   categoryBlock: {
//     marginBottom: 15,
//   },

//   categoryHeading: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#012169',
//     marginBottom: 5,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     paddingBottom: 4,
//   },

//   gridContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'flex-start',
//   },

//   gridItem: {
//     width: '20%', // Adjusted width for potentially more items per row
//     margin: '1.5%', // Reduced margin to fit more items if needed
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//     padding: 5,
//     alignItems: 'center',
//   },

//   gridImage: {
//     width: '100%',
//     height: 60,
//     borderRadius: 6,
//     resizeMode: 'cover',
//   },

//   gridText: {
//     fontSize: 12,
//     color: '#012169',
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//     alignItems: 'center',
//   },
//   modalImage: {
//     width: '100%',
//     height: 500,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#012169',
//   },
//   modalAmount: {
//     fontSize: 14,
//     marginVertical: 10,
//   },
//   closeButton: {
//     backgroundColor: '#012169',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   pageheading: {
//     height: '8%',
//     minHeight: 60,
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: Colors.heading,
//     borderBottomWidth: 1,
//     borderBottomColor: '#DDD',
//   },
//   headingView: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   heading: {
//     marginLeft: 10,
//     fontSize: 18,
//     fontWeight: '800',
//     color: Colors.headingText,
//     fontFamily: 'sans-serif-condensed',
//   },
//   // New styles for "No Image" placeholder
//   noImageIconContainer: {
//     width: '100%',
//     height: 60,
//     borderRadius: 6,
//     backgroundColor: '#e0e0e0', // Light grey background
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 5,
//   },
//   noImageIconText: {
//     fontSize: 10,
//     color: '#888',
//     marginTop: 3,
//   },
//   // New styles for the delete button
//   deleteButton: {
//     flexDirection: 'row',
//     backgroundColor: '#dc3545', // Red color for delete
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     marginTop: 10,
//     alignItems: 'center',
//     gap: 5,
//   },
//   deleteButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   modalNoImageContainer: {
//     padding: 20,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//     height: 150, // Fixed height for consistency
//     marginBottom: 15,
//   },
//   modalNoImageText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#888',
//   }
// });


// With Add Amount Button....
// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   StyleSheet,
//   Image,
//   Alert,
//   TouchableOpacity,
//   Modal,
// } from 'react-native';
// import DropDownPicker from 'react-native-dropdown-picker';
// import NewHeader from '../components/NewHeader';
// import NewFooter from '../components/NewFooter';
// import SubmitImageUpload from '../components/SubmitImageUpload'; // This component handles image picking
// import MySubmitButton from '../components/MySubmitButton'; // This is your general submit button
// import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
// import {
//   faRectangleList,
//   faMoneyCheck,
//   faMoneyBill,
//   faMoneyCheckAlt,
//   faMoneyCheckDollar,
// } from '@fortawesome/free-solid-svg-icons';
// import translations from '../translations';
// import translationManager from '../translationManager';
// import {useNavigation} from '@react-navigation/native';
// import {log, readLog} from '../components/Logger';
// import BouncyCheckbox from 'react-native-bouncy-checkbox';
// import {Colors} from '../config';
// import {
//   ALERT_TYPE,
//   Dialog,
//   AlertNotificationRoot,
//   Toast,
// } from 'react-native-alert-notification';
// import {stat} from 'react-native-fs';
// import {orderByDistance} from 'geolib';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import SubmitUploadButton from '../components/SubmitUploadButton';

// const TestScreen = (route) => {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [dropdownItems, setDropdownItems] = useState([
//     {label: 'Fastag', value: 'fastag'},
//     {label: 'Permit', value: 'permit'},
//     {label: 'Parking', value: 'parking'},
//   ]);
//   const [amount, setAmount] = useState('');
//   const [entries, setEntries] = useState([]); // This array holds all expense entries (with or without images)
//   const [previewVisible, setPreviewVisible] = useState(false);
//   const [previewData, setPreviewData] = useState(null); // {uri, amount, category}
//   const [submitParams, setSubmitParams] = useState({});
//   const navigation = useNavigation();

//   const [parkingTotal, setParkingTotal] = useState('0.00');
//   const [permitTotal, setPermitTotal] = useState('0.00');
//   const [fastagTotal, setFastagTotal] = useState('0.00');

//   // These will store arrays of image URIs, only if an image was provided
//   const [parkingImageUri, setParkingImageUri] = useState([]);
//   const [permitImageUri, setPermitImageUri] = useState([]);
//   const [fastagImageUri, setFastagImageUri] = useState([]);

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
//         const storedParams = await AsyncStorage.getItem('submitParams');
//         console.log('Received submitParams:', storedParams);
//         if (storedParams !== null) {
//           setSubmitParams(JSON.parse(storedParams));
//         } else {
//           setSubmitParams(route.params);
//         }
//       } catch (error) {
//         console.error('Error retrieving params from AsyncStorage:', error);
//       }
//     };

//     fetchParams();
//   }, [route.params]);

//   // Effect to update totals whenever 'entries' changes
//   useEffect(() => {
//     setFastagTotal(calculateTotal('fastag'));
//     setPermitTotal(calculateTotal('permit'));
//     setParkingTotal(calculateTotal('parking'));
//   }, [entries]);

//   useEffect(() => {
//     const updateDateTime = () => {
//       const now = new Date();
//       const date = now.toDateString();
//       const hours = String(now.getHours()).padStart(2, '0');
//       const minutes = String(now.getMinutes()).padStart(2, '0');
//       setCurrentDateTime(`${date} - ${hours}:${minutes}`);
//     };

//     updateDateTime();
//     const intervalId = setInterval(updateDateTime, 1000);
//     return () => clearInterval(intervalId);
//   }, []);

//   // New function to handle adding an expense amount without an image
//   const handleAddAmountOnly = () => {
//     if (!amount) {
//       Alert.alert('Validation Error', 'Please enter an amount.');
//       return;
//     }
//     if (!selectedCategory) {
//       Alert.alert('Validation Error', 'Please select a category.');
//       return;
//     }
//     if (!validateInput(amount)) { // Validate the amount
//       return;
//     }

//     const newEntry = {
//       category: selectedCategory,
//       amount: parseFloat(amount),
//       image: null, // Explicitly set image to null for no-image entries
//     };

//     setEntries(prev => [...prev, newEntry]);
//     setAmount(''); // Clear amount input after adding
//     //Alert.alert('Success', 'Amount added successfully!');
//   };

//   // Modified handleImageUpload to also add the expense entry and image URI
//   const handleImageUpload = image => {
//     if (!amount) {
//       Alert.alert('Validation Error', 'Please enter an amount.');
//       return;
//     }
//     if (!selectedCategory) {
//         Alert.alert('Validation Error', 'Please select a category.');
//         return;
//     }
//     if (!validateInput(amount)) { // Validate the amount
//       return;
//     }

//     let normalizedImage = null;

//     // Validate that an actual image object/URI was provided
//     if (Array.isArray(image)) {
//       if (typeof image[0] === 'string') {
//         normalizedImage = {uri: image[0]};
//       } else if (image[0]?.uri) {
//         normalizedImage = image[0];
//       } else {
//         Alert.alert('Upload Error', 'Invalid image format.');
//         return; // Exit if image format is bad
//       }
//     } else if (image?.uri) {
//       normalizedImage = image;
//     } else {
//       Alert.alert('Upload Error', 'Invalid image data.');
//       return; // Exit if image data is bad
//     }

//     const newEntry = {
//       category: selectedCategory,
//       amount: parseFloat(amount),
//       image: normalizedImage,
//     };

//     setEntries(prev => [...prev, newEntry]);

//     // Append the image URI to the respective arrays only if an image was provided
//     if (normalizedImage && normalizedImage.uri) {
//       switch (selectedCategory) {
//         case 'parking':
//           setParkingImageUri(prev => [...prev, normalizedImage.uri]);
//           break;
//         case 'permit':
//           setPermitImageUri(prev => [...prev, normalizedImage.uri]);
//           break;
//         case 'fastag':
//           setFastagImageUri(prev => [...prev, normalizedImage.uri]);
//           break;
//         default:
//           break;
//       }
//     }

//     setAmount(''); // Clear amount input after adding
//     //Alert.alert('Success', 'Expense with image added successfully!');
//   };

//   function validateInput(inputValue) {
//     var pattern = /^[0-9]*(\.[0-9]{1,2})?$/; // Allows for decimal values with up to 2 places
//     if (!pattern.test(inputValue)) {
//       Alert.alert(
//         translationManager.getTranslation('alertInvalidInput'),
//         translationManager.getTranslation('alertEnterNumbers'),
//       );
//       return false;
//     }
//     return true;
//   }

//   const handleSubmit = () => {
//     log(
//       `${submitParams.tripNo}: SUBMIT - handleSubmit - Method being called...`,
//     );
//     log(
//       `${submitParams.tripNo}: SUBMIT - handlesubmit - Calculated Parking Total: ${parkingTotal}`,
//     );
//     log(
//       `${submitParams.tripNo}: SUBMIT - handlesubmit - Calculated Fastag Total: ${fastagTotal}`,
//     );
//     log(
//       `${submitParams.tripNo}: SUBMIT - handlesubmit - Calculated Permit Total: ${permitTotal}`,
//     );

//     if (isFastagChecked) {
//       setStatus('FASTAGPENDING');
//       console.log('Status updated after checking fastag: ', status);
//     } else {
//       setStatus('COMPLETED');
//     }

//     AsyncStorage.setItem('currentScreen', 'Summary');
//     const summaryParams = {
//       signatureData: submitParams.signatureData,
//       driverId: submitParams.driverId,
//       driverPhone: submitParams.driverPhone,
//       startKmReadings: submitParams.startKmReadings,
//       pickupKmReadings: submitParams.pickupKmReadings,
//       endKmReadings: submitParams.endKmReadings,
//       fastagReadings: fastagTotal, // Now passing the calculated total
//       parkingReadings: parkingTotal, // Now passing the calculated total
//       permitReadings: permitTotal, // Now passing the calculated total
//       tripNo: submitParams.tripNo,
//       custName: submitParams.custName,
//       custMobile: submitParams.custMobile,
//       pickUpLoc: submitParams.pickUpLoc,
//       dropLoc: submitParams.dropLoc,
//       pickupKmImageUri: submitParams.pickupKmImageUri,
//       endKmImageUri: submitParams.endKmImageUri,
//       parkingImageUri, // Array of parking image URIs
//       fastagImageUri, // Array of fastag image URIs
//       fastagToDisplay: fastagTotal, // Assuming this also displays the total
//       permitImageUri, // Array of permit image URIs
//       status,
//       tripCompletedTime: submitParams.tripCompletedTime,
//       tripCompleteLoc: submitParams.tripCompleteLoc,
//       vendorAddress: submitParams.vendorAddress,
//       startLatLong: submitParams.startLatLong,
//       signTime: submitParams.signTime,
//       completeLat: submitParams.completeLat,
//       completeLong: submitParams.completeLong,
//       isNoSignChecked: submitParams.isNoSignChecked,
//       approxTravelDistance: submitParams.approxTravelDistance,
//     };
//     AsyncStorage.setItem('summaryParams', JSON.stringify(summaryParams));
//     navigation.navigate('Summary', summaryParams);
//     log(`${submitParams.tripNo}: SUBMIT - handleSubmit - Method completed`);
//     log(`${submitParams.tripNo}: SUBMIT - handleSubmit - Data navigated to Summary Screen: 
//       signatureData: ${submitParams.signatureData},
//       driverId: ${submitParams.driverId},
//       driverPhone: ${submitParams.driverPhone},
//       startKmReadings: ${submitParams.startKmReadings},
//       pickupKmReadings: ${submitParams.pickupKmReadings},
//       endKmReadings: ${submitParams.endKmReadings},
//       fastagReadings: ${fastagTotal},
//       parkingReadings: ${parkingTotal},
//       permitReadings: ${permitTotal},
//       tripNo: ${submitParams.tripNo},
//       custName: ${submitParams.custName},
//       custMobile: ${submitParams.custMobile},
//       pickUpLoc: ${submitParams.pickUpLoc},
//       dropLoc: ${submitParams.dropLoc},
//       pickupKmImageUri: ${submitParams.pickupKmImageUri},
//       parkingImageUri: ${JSON.stringify(parkingImageUri)},
//       fastagImageUri: ${JSON.stringify(fastagImageUri)},
//       fastagToDisplay: ${fastagTotal},
//       permitImageUri: ${JSON.stringify(permitImageUri)},
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

//   const calculateTotal = category => {
//     return entries
//       .filter(entry => entry.category === category)
//       .reduce((sum, item) => sum + item.amount, 0)
//       .toFixed(2);
//   };

//   return (
//     <View style={styles.container}>
//       <NewHeader />

//       <View style={styles.contentWrapper}>
//         <View style={styles.datetime}>
//           <Text allowFontScaling={false} style={styles.datetimeText}>
//             {currentDateTime}
//           </Text>
//         </View>
//         <View style={styles.pageheading}>
//           <View style={styles.headingView}>
//             <FontAwesomeIcon icon={faMoneyCheckAlt} size={25} color="#0c4160" />
//             <Text allowFontScaling={false} style={styles.heading}>
//               {translationManager.getTranslation('expensesUpdate')}
//             </Text>
//           </View>
//         </View>
//         <View style={styles.formRow}>
//           <DropDownPicker
//             open={dropdownOpen}
//             value={selectedCategory}
//             items={dropdownItems}
//             setOpen={setDropdownOpen}
//             setValue={setSelectedCategory}
//             setItems={setDropdownItems}
//             placeholder="Select Category"
//             style={styles.dropdown}
//             dropDownContainerStyle={styles.dropdownContainer}
//             zIndex={1000}
//           />
//         </View>

//         {selectedCategory && (
//           <View style={styles.inputsWrapper}>
//             <TextInput
//               style={styles.amountInput}
//               placeholder="Enter Amount"
//               keyboardType="numeric"
//               value={amount}
//               onChangeText={setAmount}
//               placeholderTextColor="#888"
//               maxLength={7}
//               color="black"
//             />

//             <SubmitImageUpload
//               title="Upload Image"
//               onImageUpload={handleImageUpload} // This button will trigger image selection and then add expense
//             />

//             {/* NEW BUTTON for adding amount without image */}
//             <SubmitUploadButton
//               title="Add Amount"
//               onPress={handleAddAmountOnly}
//             />
//           </View>
//         )}

//         <ScrollView style={styles.entriesList}>
//           <View style={styles.gridSection}>
//             {['fastag', 'permit', 'parking'].map(category => {
//               // Filter entries, including those with image: null
//               const filteredEntries = entries.filter(
//                 entry => entry.category === category,
//               );
//               if (filteredEntries.length === 0) return null;

//               return (
//                 <View key={category} style={styles.categoryBlock}>
//                   <Text style={styles.categoryHeading}>
//                     {category.charAt(0).toUpperCase() + category.slice(1)}
//                   </Text>

//                   <View style={styles.gridContainer}>
//                     {filteredEntries.map((entry, index) => (
//                       <TouchableOpacity
//                         key={index}
//                         style={styles.gridItem}
//                         onLongPress={() => {
//                           // Only show preview if there's an image
//                           if (entry.image?.uri) {
//                               setPreviewData(entry);
//                               setPreviewVisible(true);
//                           } else {
//                               Toast.show({
//                                   type: ALERT_TYPE.INFO,
//                                   title: 'No Image',
//                                   text: 'This entry does not have an associated image.',
//                               });
//                           }
//                         }}>
//                         {entry.image?.uri ? (
//                           <Image
//                             source={{uri: entry.image.uri}}
//                             style={styles.gridImage}
//                           />
//                         ) : (
//                           // Placeholder for entries without images
//                           <View style={styles.noImageIconContainer}>
//                             <FontAwesomeIcon icon={faMoneyBill} size={30} color="#888" />
//                             <Text style={styles.noImageIconText}>No Image</Text>
//                           </View>
//                         )}
//                         <Text style={styles.gridText}>₹{entry.amount}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </View>
//               );
//             })}
//           </View>
//         </ScrollView>

//         <View style={styles.totalsContainer}>
//           <View key="fastagTotal" style={[styles.totalItem, styles.totalItemSeparator]}>
//             <Text style={styles.totalText}>Fastag Total:</Text>
//             <Text style={styles.totalAmount}>₹{fastagTotal}</Text>
//           </View>
//           <View key="permitTotal" style={[styles.totalItem, styles.totalItemSeparator]}>
//             <Text style={styles.totalText}>Permit Total:</Text>
//             <Text style={styles.totalAmount}>₹{permitTotal}</Text>
//           </View>
//           <View key="parkingTotal" style={styles.totalItem}>
//             <Text style={styles.totalText}>Parking Total:</Text>
//             <Text style={styles.totalAmount}>₹{parkingTotal}</Text>
//           </View>
//         </View>

//         <View style={styles.submitButtonView}>
//           <MySubmitButton title="Next" onPress={handleSubmit} />
//         </View>
//       </View>
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={previewVisible}
//         onRequestClose={() => setPreviewVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             {previewData?.image?.uri ? (
//               <Image
//                 source={{uri: previewData.image.uri}}
//                 style={styles.modalImage}
//               />
//             ) : (
//               <Text>No Image</Text>
//             )}
//             <Text style={styles.modalTitle}>
//               {previewData?.category?.toUpperCase()}
//             </Text>
//             <Text style={styles.modalAmount}>₹{previewData?.amount}</Text>
//             <TouchableOpacity
//               onPress={() => setPreviewVisible(false)}
//               style={styles.closeButton}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       <NewFooter />
//     </View>
//   );
// };

// export default TestScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   contentWrapper: {
//     flex: 1,
//   },
//   datetime: {
//     height: '4%',
//     minHeight: 28,
//     backgroundColor: Colors.dateTimeBackground,
//     padding: 5,
//     alignItems: 'center',
//   },
//   datetimeText: {
//     fontSize: 14,
//     color: Colors.dateTimeText,
//     fontFamily: 'sans-serif-condensed',
//     fontWeight: '700',
//   },
//   heading: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: '#012169',
//     textAlign: 'center',
//   },
//   formRow: {
//     marginBottom: 15,
//     zIndex: 1000,
//     paddingHorizontal: 15,
//     paddingTop: 15,
//   },
//   dropdown: {
//     borderColor: '#ccc',
//     borderRadius: 5,
//   },
//   dropdownContainer: {
//     borderColor: '#ccc',
//   },
//   inputsWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//     gap: 10,
//     paddingHorizontal: 15,
//     flexWrap: 'wrap', // Allow buttons to wrap if space is limited
//   },
//   amountInput: {
//     flex: 1,
//     height: 50,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginBottom: 7,
//     minWidth: 100, // Ensure it doesn't get too small if buttons are wide
//   },
//   entriesList: {
//     flex: 1,
//     marginBottom: 10,
//     paddingHorizontal: 15,
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
//   },
//   uploadedImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 5,
//     marginLeft: 10,
//   },
//   totalsContainer: {
//     paddingVertical: 5,
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//     backgroundColor: Colors.heading,
//     paddingHorizontal: 5,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },

//   totalItem: {
//     flex: 1,
//     alignItems: 'center',
//     paddingHorizontal: 5,
//     paddingVertical: 3,
//   },

//   totalItemSeparator: {
//     borderRightWidth: 1,
//     borderRightColor: '#ccc',
//   },

//   totalText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#012169',
//     textAlign: 'center',
//     marginBottom: 2,
//   },

//   totalAmount: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//   },

//   submitButtonView: {
//     padding: 15,
//     alignItems: 'center',
//   },
//   gridSection: {
//     marginVertical: 10,
//   },

//   categoryBlock: {
//     marginBottom: 15,
//   },

//   categoryHeading: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#012169',
//     marginBottom: 5,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     paddingBottom: 4,
//   },

//   gridContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'flex-start',
//   },

//   gridItem: {
//     width: '20%', // Adjusted width for potentially more items per row
//     margin: '1.5%', // Reduced margin to fit more items if needed
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//     padding: 5,
//     alignItems: 'center',
//   },

//   gridImage: {
//     width: '100%',
//     height: 60,
//     borderRadius: 6,
//     resizeMode: 'cover',
//   },

//   gridText: {
//     fontSize: 12,
//     color: '#012169',
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//     alignItems: 'center',
//   },
//   modalImage: {
//     width: '100%',
//     height: 500,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#012169',
//   },
//   modalAmount: {
//     fontSize: 14,
//     marginVertical: 10,
//   },
//   closeButton: {
//     backgroundColor: '#012169',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   pageheading: {
//     height: '8%',
//     minHeight: 60,
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: Colors.heading,
//     borderBottomWidth: 1,
//     borderBottomColor: '#DDD',
//   },
//   headingView: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   heading: {
//     marginLeft: 10,
//     fontSize: 18,
//     fontWeight: '800',
//     color: Colors.headingText,
//     fontFamily: 'sans-serif-condensed',
//   },
//   // New styles for "No Image" placeholder
//   noImageIconContainer: {
//     width: '100%',
//     height: 60,
//     borderRadius: 6,
//     backgroundColor: '#e0e0e0', // Light grey background
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 5,
//   },
//   noImageIconText: {
//     fontSize: 10,
//     color: '#888',
//     marginTop: 3,
//   },
// });