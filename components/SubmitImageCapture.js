import React from 'react';
import { View, Alert, StyleSheet, PermissionsAndroid, ToastAndroid } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import SubmitUploadButton from './SubmitUploadButton';
import { log } from './Logger';

const SubmitImageCapture = ({ onImageCapture, title, disabled }) => {
  const handleLaunchCamera = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs access to your camera.",
          // buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const options = {
          storageOptions: {
            path: 'images',
            mediaType: 'photo',
          },
        };

        launchCamera(options, (response) => {
          if (response.didCancel) {
            console.log("User cancelled image picker");
          } else if (response.errorCode) {
            console.error("ImagePicker Error: ", response.errorMessage);
            Alert.alert('Error', 'Failed to launch camera. Please try again.');
          } else if (response.assets && response.assets.length > 0) {
            const imageURI = response.assets[0].uri;
            onImageCapture(imageURI);
            ToastAndroid.showWithGravity(
              'Image Uploaded Successfully',
              ToastAndroid.SHORT,
              ToastAndroid.CENTER
            );
          } else {
            Alert.alert('No Image Selected', 'Please try again.');
          }
        });
      } else {
        Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
      }
    } catch (err) {
      console.warn('Camera permission request error: ', err);
    }
  };

  return (
    // <View style={styles.container}>
    //   <SubmitUploadButton
    //     onPress={handleLaunchCamera}
    //     title={title}
    //     disabled={disabled}
    //   />
    // </View>
          <SubmitUploadButton
        onPress={handleLaunchCamera}
        title={title}
        disabled={disabled}></SubmitUploadButton>
  );
};

const styles = StyleSheet.create({
  // container: {
  //   padding: 10,
  // },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SubmitImageCapture;


// import React, {useState} from 'react';
// import {View, Image,Alert, StyleSheet,PermissionsAndroid,ToastAndroid, Text} from 'react-native';
// import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import SubmitUploadButton from './SubmitUploadButton';
// import translations from '../translations';

// const SubmitImageCapture = ({onImageCapture,title,disabled}) => {

//   const handleLaunchCamera = async (imageURI) => {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.CAMERA,
//         {
//           title: "Camera Permission",
//           message: "App needs access to your camera.",
//           buttonNeutral: "Ask Me Later",
//           buttonNegative: "Cancel",
//           buttonPositive: "OK"
//         }
//       );
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         let options = {
//           storageOptions: {
//             path: 'image',
//           },
//         };
//         launchCamera(options, response => {
//           console.log("Camera response:", response); // Log the entire response object
//           if (!response.didCancel && response.assets && response.assets.length > 0) {
//             console.log('image File: '+response.assets[0].uri);
//             const imageURI = response.assets[0].uri;
//             onImageCapture(imageURI);
//             ToastAndroid.showWithGravity(
//               'Image Uploaded Successfully',
//               ToastAndroid.SHORT,
//               ToastAndroid.CENTER,
//             );
//           }
//         });
//       } else {
//         console.log("Camera permission denied");
//       }
//     } catch (err) {
//       console.warn(err);
//     }
//   };
  
  
//   return (
    
//       <SubmitUploadButton
//         onPress={handleLaunchCamera}
//         title={title}
//         disabled={disabled}></SubmitUploadButton>
   
//   );
// };

// const styles = StyleSheet.create({
//   image: {
//     width: 200,
//     height: 200,
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: 'blue',
//     padding: 0,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     justifyContent: 'center',
//     textAlign: 'center',
//   },
// });

// export default SubmitImageCapture;
