import React, {useState, useRef, useEffect} from 'react';
import {View, AppState, Alert} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import BookingDetailsScreen from './screens/BookingDetailsScreen';
import HomeScreen from './screens/HomeScreen';
//import SubmitScreen from './screens/SubmitScreen';
import SummaryScreen from './screens/SummaryScreen';
import BookingListOpen from './screens/BookingListOpen';
import ExpensesScreen from './screens/ExpensesScreen';
import SignatureScreen from './screens/SignatureScreen';
import ETCLoader from './components/ETCLoader';
import {log, readLog} from './components/Logger';
import {useNetInfo} from '@react-native-community/netinfo';
import StartScreen from './screens/StartScreen';
import ArrivedScreen from './screens/ArrivedScreen';
import PickedupScreen from './screens/PickedupScreen';
import DropScreen from './screens/DropScreen';
import MapplsTestScreen from './screens/MapplsTestScreen';
import TripHistoryScreen from './screens/TripHistoryScreen';
import TripHistoryDetailScreen from './screens/TripHistoryDetailScreen';

const Stack = createStackNavigator();

const Navigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const netInfo = useNetInfo();

  const checkInternet = () => {
    if (!netInfo.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      );
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has came to the foreground!');
        log('NAVIGATOR: App has came to the foreground!');
        // checkInternet();
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
      log('NAVIGATOR: AppState: ', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
        const currentScreen = await AsyncStorage.getItem('currentScreen');
        console.log('Login Status:', userLoggedIn);
        console.log('Current Screen:', currentScreen);
        log('NAVIGATOR: Login Status:', userLoggedIn);
        log('NAVIGATOR: Current Screen:', currentScreen);
        if (userLoggedIn === 'true') {
          if (currentScreen !== null) {
            setInitialRoute(currentScreen);
          } else {
            setInitialRoute('BookingList');
          }
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Error Checking Login status:', error);
        log('Error Checking Login status:', error);
      } finally {
        setIsLoading(false); // Mark loading as complete
        console.log('Initial Route after rendering:', initialRoute);
        log('NAVIGATOR: Initial Route after rendering:', initialRoute);
      }
    };
    checkLoginStatus();
  }, []);

  if (isLoading || initialRoute === null) {
    // Show loading indicator or splash screen while initial route is being determined
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
    // return null; // Or return a loading component
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        {/* <Stack.Navigator initialRouteName="Test"> */}
        <Stack.Screen
          options={{headerShown: false}}
          name="MapplsTest"
          component={MapplsTestScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Loader"
          component={ETCLoader}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Expense"
          component={ExpensesScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="BookingList"
          component={BookingListOpen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="BookingDetails"
          component={BookingDetailsScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Start"
          component={StartScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Arrived"
          component={ArrivedScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Pickedup"
          component={PickedupScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Drop"
          component={DropScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Signature"
          component={SignatureScreen}
        />
        {/* <Stack.Screen
          options={{headerShown: false}}
          name="Submit"
          component={SubmitScreen}
        /> */}
        <Stack.Screen
          options={{headerShown: false}}
          name="Summary"
          component={SummaryScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="History"
          component={TripHistoryScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="HistoryDetail"
          component={TripHistoryDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
