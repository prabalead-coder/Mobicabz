import RNFS from 'react-native-fs';

const logDirectoryPath = RNFS.DocumentDirectoryPath + '/logs';
const logFilePath = logDirectoryPath + '/app.log';

const createLogFile = async () => {
  try {
    // Check if the logs directory exists, if not, create it
    const directoryExists = await RNFS.exists(logDirectoryPath);
    if (!directoryExists) {
      await RNFS.mkdir(logDirectoryPath);
    }
  } catch (error) {
    console.error('Error creating log directory:', error);
    throw error; // Rethrow the error to handle it higher up
  }
};

const AppLog = async (message) => {
  try {
    // Ensure log directory exists
    await createLogFile();
    
    // Write log message to file
    const formattedMessage = `[${new Date().toISOString()}]: ${message}`;
    await RNFS.appendFile(logFilePath, formattedMessage + '\n', 'utf8');
    console.log(`Logged: ${formattedMessage}`); // Optionally log successful writes
  } catch (error) {
    console.error('Error writing to log file:', error);
    // You might want to handle or rethrow this error depending on your needs
  }
};

export default AppLog;
