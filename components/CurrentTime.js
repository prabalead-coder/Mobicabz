import React from 'react';
import { Text, View } from 'react-native';

class CurrentTime extends React.Component {
  render() {
    // Get the current date and time
    const currentDate = new Date();

    // Format the date and time to yyyy-mm-dd HH:mm:ss
    const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

    return (
      <View>
        <Text>{formattedDate}</Text>
      </View>
    );
  }
}

export default CurrentTime;
