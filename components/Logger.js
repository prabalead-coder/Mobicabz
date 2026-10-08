import RNFS from 'react-native-fs';
import config from '../config';
import { ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Path to the log file
const logFilePath = `${RNFS.DocumentDirectoryPath}/app.log`;

const log = async (message, variable) => {
  const timestamp = new Date().toLocaleString();
  // const logMessage = `${timestamp}: ${message}, ${variable}\n`;
  let logMessage = `${timestamp}: (v${config.appVersion}) - ${message}`;

  if (variable !== undefined && variable !== null) {
    logMessage += ` ${variable}`;
  }

  logMessage += '\n';

  try {
    // Check if log file exists
    const fileExists = await RNFS.exists(logFilePath);
    if (!fileExists) {
      createLogFile();
    }

    // Append the log message to the log file
    await RNFS.appendFile(logFilePath, logMessage, 'utf8');
    // console.log('Log Entered into ',logFilePath);

    // Read current log file content
    let content = await RNFS.readFile(logFilePath, 'utf8');

    // Truncate log to 5000 lines if it exceeds
    const lines = content.split('\n');
    if (lines.length > 5000) {
      content = lines.slice(lines.length - 5000).join('\n');
      await RNFS.writeFile(logFilePath, content, 'utf8');
    }
  } catch (error) {
    console.error('Error writing to log file:', error.message);
  }
};

// Function to create the log file if it doesn't exist
const createLogFile = async () => {
  try {
    await RNFS.writeFile(logFilePath, '', 'utf8');
    console.log('Log file created:', logFilePath);
  } catch (error) {
    console.error('Error creating log file:', error.message);
  }
};

// Function to send log file to the server
// const sendLogFile = async (did,dphone) => {
//   try {
//       // Read log file content
//       const logContent = await readLog();
//       // console.log('Log content:', logContent);

//       // Create FormData object
//       const formData = new FormData();
//       formData.append('logFile', {
//           uri: `file://${logFilePath}`,
//           type: 'text/plain',
//           name: 'log.txt',
//       });

//       url = `${config.apiPostErrReport}${did}&dphone=${dphone}`;
//       // Send FormData to the server
//       const response = await fetch(url, {
//           method: 'POST',
//           body: formData,
//       });

//       console.log('Send Error Report URL : '+ url);
      
//       if (response.ok) {
//           console.log('Log file sent to server successfully.');
//           ToastAndroid.showWithGravity(
//             'Error report sent successfully.',
//             ToastAndroid.SHORT,
//             ToastAndroid.CENTER,
//           );
//           // Clear log file after sending
//           await clearLogFile();
//           console.log('Log file cleared.');
//       } else {
//           throw new Error('Failed to send log file to server.');
//       }
//   } catch (error) {
//       console.error('Error sending log file to server:', error.message);
//   }
// };

const sendLogFile = async (did, dphone) => {
  // Helper function to send the log file to a given URL
  const uploadLog = async (baseUrl) => {
    const url = `${baseUrl}${did}&dphone=${dphone}`;
    console.log('Send Error Report URL : ' + url);

    // Read log file content
    const logContent = await readLog(); // Ensure readLog() is defined and working
    // console.log('Log content:', logContent); // Uncomment for debugging if needed

    // Create FormData object
    const formData = new FormData();
    formData.append('logFile', {
      uri: `file://${logFilePath}`, // Ensure logFilePath is defined and correct
      type: 'text/plain',
      name: 'log.txt',
    });
    const authToken = await AsyncStorage.getItem('API_AUTH_TOKEN');
    const response = await Promise.race([
      fetch(url, {
        method: 'POST',
        headers:{'Authorization':`Bearer ${authToken}`},
        body: formData,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Request timed out, check internet connection')),
          30000, // 30-second timeout for log file upload
        ),
      ),
    ]);

    if (!response.ok) {
      throw new Error(`Failed to send log file to server from ${baseUrl}: ${response.statusText}`);
    }
    return response;
  };

  try {
    let response;
    try {
      // Attempt to send to the primary URL first
      response = await uploadLog(config.apiPostErrReport);
      console.log('Primary log file upload successful.');
    } catch (initialError) {
      console.warn('Primary log file upload failed, attempting alternative:', initialError.message);
      // Attempt to send to the alternative URL
      response = await uploadLog(config.apiPostErrReportAlt);
      console.log('Alternative log file upload successful.');
    }

    console.log('Log file sent to server successfully.');
    ToastAndroid.showWithGravity(
      'Error report sent successfully.',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
    // Clear log file after successful sending (from either primary or alt)
    await clearLogFile(); // Ensure clearLogFile() is defined and working
    console.log('Log file cleared.');

  } catch (error) {
    // This catch block will handle failures from both primary and alternative attempts,
    // or any other errors during the process (e.g., file reading, timeout).
    console.error('Error sending log file to server:', error.message);
    ToastAndroid.showWithGravity(
      'Failed to send error report. Please check network.',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
  }
};


// Optional: Function to read the log file (e.g., for sending logs via email)
const readLog = async () => {
  try {
    const content = await RNFS.readFile(logFilePath, 'utf8');
    // console.log('Log file content:', content);
    return content;
  } catch (err) {
    console.log('Error reading log file:', err.message);
    throw err;
  }
};

// Function to clear log file
const clearLogFile = async () => {
  try {
      await RNFS.writeFile(logFilePath, '', 'utf8');
  } catch (error) {
      console.error('Error clearing log file:', error.message);
  }
};

// Export the logging functions
export {log, sendLogFile};
