import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';

// Import your screen components
import BookingListOpen from './BookingListOpen';
import BookingListCompleted from './BookingListCompleted';

// Create a material top tab navigator
const Tab = createMaterialTopTabNavigator();

// Define your component with the tab navigator
const BookingListTabs = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Live Trips" component={BookingListOpen} />
        <Tab.Screen name="Completed Trips" component={BookingListCompleted} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default BookingListTabs;
