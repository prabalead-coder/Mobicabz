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
} from 'react-native';
import SubmitImageUpload from '../components/SubmitImageUpload';
import SubmitImageCapture from '../components/SubmitImageCapture';
import translations from '../translations';
import MySubmitButton from '../components/MySubmitButton';
import {useNavigation} from '@react-navigation/native';
import {log, readLog} from '../components/Logger';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
} from 'react-native-alert-notification';
import {stat} from 'react-native-fs';

const RegisterScreen = ({route, language}) => {
  const lang = language || 'en';
  const navigation = useNavigation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.pageheading}>
        <Text style={styles.heading}>
          {translations[lang].driverRegistrationHeading}
        </Text>
      </View>
      <ScrollView>
        <View>
          <Text style={styles.label}>
            {translations[lang].driverNameLabel}:{' '}
          </Text>
          <View style={styles.uploads}>
            <TextInput
              style={styles.textinput}
              placeholder={translations[lang].driverNamePlaceholder}
              placeholderTextColor={'#808080'}
              keyboardType="numeric"
              value={''}
              maxLength={7}
            />
          </View>
          <Text style={styles.label}>
            {translations[lang].driverPhoneLabel}:{' '}
          </Text>
          <View style={styles.uploads}>
            <TextInput
              style={styles.textinput}
              placeholder={translations[lang].driverPhonePlaceholder}
              keyboardType="numeric"
              placeholderTextColor={'#808080'}
              value={''}
              maxLength={7}
            />
          </View>
          <Text style={styles.label}>
            {translations[lang].drivingLicenseLabel}:{' '}
          </Text>
          <View style={styles.uploads}>
            <TextInput
              style={styles.textinput}
              placeholder={translations[lang].drivingLicensePlaceholder}
              placeholderTextColor={'#808080'}
              keyboardType="numeric"
              value={''}
              maxLength={7}
            />
          </View>
          <Text style={styles.label}>
            {translations[lang].driverAddress1Label}:{' '}
          </Text>
          <View style={styles.uploads}>
            <TextInput
              style={styles.textinput}
              placeholder={translations[lang].driverAddress1Placeholder}
              placeholderTextColor={'#808080'}
              keyboardType="numeric"
              value={''}
              maxLength={7}
            />
          </View>
          <Text style={styles.label}>
            {translations[lang].driverAddress2Label}:{' '}
          </Text>
          <View style={styles.uploads}>
            <TextInput
              style={styles.textinput}
              placeholder={translations[lang].driverAddress2Placeholder}
              placeholderTextColor={'#808080'}
              keyboardType="numeric"
              value={''}
              maxLength={7}
            />
          </View>
          <Text style={styles.label}>
            {translations[lang].driverAddress3Label}:{' '}
          </Text>
          <View style={styles.uploads}>
            <TextInput
              style={styles.textinput}
              placeholder={translations[lang].driverAddress3Placeholder}
              placeholderTextColor={'#808080'}
              keyboardType="numeric"
              value={''}
              maxLength={7}
            />
          </View>
          <View style={styles.checkboxview}></View>
        </View>
      </ScrollView>
      <View style={styles.submitButtonView}>
        <MySubmitButton
          title={translations[lang].driverRegisterButton}></MySubmitButton>
      </View>
      {!isKeyboardVisible && <Footer />}
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  pageheading: {
    height: '10%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // flexDirection:'row',
  },
  backButton: {
    width: '10%',
    alignContent: 'flex-start',
    justifyContent: 'center',
  },
  pageheadingText: {
    justifyContent: 'center',
    // paddingLeft:'25%'
  },
  maincontent: {
    height: '70%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: '5%',
  },
  inputs: {
    height: '75%',
  },
  heading: {
    fontSize: 20,
    color: 'black',
    fontWeight: '700',
    alignSelf: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: 10,
    color: 'black',
    fontSize: 16,
    fontFamily: 'Roboto-BoldItalic',
  },
  textinput: {
    marginBottom: '3%',
    borderColor: '#012169',
    borderWidth: 1.5,
    marginRight: '5%',
    height: 45,
    width: '80%',
    color: 'black',
  },
  uploads: {
    flexDirection: 'row',
    padding: 0,
    marginBottom: 0,
    alignContent: 'center',
    justifyContent: 'center',
  },
  mandatory: {
    color: 'red',
  },
  submitButtonView: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  signatureImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
  checkboxview: {
    paddingLeft: '7%',
  },
});
