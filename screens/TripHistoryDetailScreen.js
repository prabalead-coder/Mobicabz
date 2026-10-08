import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, BackHandler} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faMapMarkedAlt} from '@fortawesome/free-solid-svg-icons';
import BackButton from '../components/BackButton'; // This is a custom button component
import {useNavigation} from '@react-navigation/native';
import translationManager from '../translationManager';
import NewHeader from '../components/NewHeader';
import NewFooter from '../components/NewFooter';
import {ScrollView} from 'react-native-gesture-handler';
import {Colors} from '../config';

const TripHistoryDetailScreen = ({route, language}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isBackEnabled, setIsBackEnabled] = useState(true);

  const {booking, driverId} = route.params;
  const navigation = useNavigation();

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

  const formatDate = dateString => {
    if (!dateString) {
      return 'N/A';
    }
    const dateObj = new Date(dateString);
    const options = {day: '2-digit', month: 'short', year: 'numeric'};
    return dateObj.toLocaleDateString('en-GB', options);
  };

  const formatTime = dateTimeString => {
    if (!dateTimeString) {
      return 'N/A';
    }
    const dateObj = new Date(dateTimeString);
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const displayTripDate = formatDate(booking.TripStartDateTime);
  const displayStartTime = formatTime(booking.TripStartDateTime);
  const displayReportTime = formatTime(booking.TripReportingDateTime);
  const displayCompleteTime = formatTime(booking.TripCompleteDateTime);

  const handleBack = () => {
    setIsBackEnabled(false);
    navigation.goBack();
    setTimeout(() => {
      setIsBackEnabled(true);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <NewHeader showDrawer={false} />

      <View style={styles.contentWrapper}>
        <View style={styles.datetime}>
          <Text allowFontScaling={false} style={styles.datetimeText}>
            {currentDateTime}
          </Text>
        </View>

        <View style={styles.pageHeading}>
          <FontAwesomeIcon
            icon={faMapMarkedAlt}
            size={25}
            color="#0c4160"
          />
          <Text allowFontScaling={false} style={styles.headingText}>
            {translationManager.getTranslation('tripHistoryDetailHeading')}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.tripDetails}>
            {[
              {label: 'tripIdLabel', value: booking.TripId},
              {label: 'tripDateLabel', value: displayTripDate},
              {label: 'dutyLabel', value: booking.Duty},
              {label: 'guestNameLabel', value: booking.PassengerName},
              {label: 'pickupAddressLabel', value: booking.PickupAddress1},
              {label: 'startTimeLabel', value: displayStartTime},
              {label: 'tripCompleteTime', value: displayCompleteTime},
              {label: 'totalTimeLabel', value: `${booking.TotalTime} min`},
              {label: 'startKmLabel', value: `${booking.StartKms} km`},
              {label: 'endKm', value: `${booking.CompleteKms} km`},
              {label: 'totalKmLabel', value: `${booking.TotalKms} km`},
              {label: 'calculatedKms', value: `${booking.CalculatedKms} km`},
              {label: 'parkingLabel', value: `₹ ${booking.Parking}`},
              {label: 'permitLabel', value: `₹ ${booking.Permit}`},
              {label: 'fastagLabel', value: `₹ ${booking.Fastag}`},
              {label: 'tripStatus', value: booking.TripStatus},
              {label: 'companyNameLabel', value: booking.CustomerName},
            ].map((detail, index) => (
              <View style={styles.detailRow} key={index}>
                <Text allowFontScaling={false} style={styles.label}>
                  {translationManager.getTranslation(detail.label)}:{' '}
                </Text>
                <Text allowFontScaling={false} style={styles.value}>
                  {detail.value !== null && detail.value !== undefined ? detail.value : 'N/A'}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* This is the corrected section */}
        <View style={styles.buttons}>
          <View style={styles.buttonWrapper}>
            <BackButton
              title={translationManager.getTranslation('backButton')}
              onPress={handleBack}
              disabled={!isBackEnabled} // Pass disabled prop if your BackButton supports it
            />
          </View>
        </View>
      </View>

      <NewFooter
        driverId={driverId}
        driverPhone={booking.DriverPhone}
        showReport={true}
      />
    </View>
  );
};

export default TripHistoryDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentWrapper: {
    flex: 1,
  },
  datetime: {
    height: '4%',
    minHeight:28,
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
    minHeight:60,
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
    backgroundColor: Colors.completeCardBg,
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
    fontSize: 16,
    color: Colors.label,
    flex: 1,
    fontFamily: 'sans-serif-condensed',
  },
  value: {
    fontSize: 16,
    color: Colors.value,
    flexShrink: 1,
    flex: 2,
    width: '80%',
    textAlign: 'right',
    fontFamily: 'sans-serif-condensed',
  },
  buttons: {
    height: '10%',
    minHeight:60,
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
});
