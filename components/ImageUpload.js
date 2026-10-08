import React, {useState} from 'react';
import {PermissionsAndroid,Alert,View, Image, StyleSheet, ToastAndroid, Text} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import MyUploadButton from './MyUploadButton';
import translations from '../translations';
import { log } from './Logger';

// const ImageUpload = ({onImageUpload, title}) => {

//   const handleLaunchImageLibrary = () => {
//     try{
//     let options = {
//       storageOptions: {
//         path: 'image',
//       },
//     };

//     launchImageLibrary(options, response => {
//       console.log("Gallery response:", response); // Log the entire response object
//       if (!response.didCancel && response.assets && response.assets.length > 0) {
//         console.log('image File: '+response.assets[0].uri);
//         const imageURI = response.assets[0].uri;
//         onImageUpload(imageURI);
//         ToastAndroid.showWithGravity(
//           'Image Uploaded Successfully',
//           ToastAndroid.SHORT,
//           ToastAndroid.CENTER,
//         );
//       }
//     });
//   }catch (err) {
//     console.warn(err);
//   }
//   };

//   return (
//       <MyUploadButton
//         onPress={handleLaunchImageLibrary}
//         title={title}>
//       </MyUploadButton>
//   );
// };

const ImageUpload = ({ onImageUpload, title }) => {

  const showImagePickerOptions = () => {
    Alert.alert(
      "Upload Image",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: handleLaunchCamera,
        },
        {
          text: "Gallery",
          onPress: handleLaunchImageLibrary,
        },
        {
          text: "Cancel",
          style: "cancel",
        }
      ],
      { cancelable: true }
    );
  };

  const handleLaunchCamera = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs access to your camera.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const options = {
          mediaType: 'photo',
          // saveToPhotos: true,
        };
        launchCamera(options, handleImageResponse);
      } else {
        console.log("Camera permission denied");
        log('IMG_UPLOAD - Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
      log('IMG_UPLOAD - Launch Camera Error '+ err);
    }
  };

  const handleLaunchImageLibrary = () => {
    try {
      const options = {
        mediaType: 'photo',
      };
      launchImageLibrary(options, handleImageResponse);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleImageResponse = (response) => {
    console.log("Image response:", response);
    log("IMG_UPLOAD - Image response:", response);
    if (!response.didCancel && response.assets && response.assets.length > 0) {
      const imageURI = response.assets[0].uri;
      onImageUpload(imageURI);
      ToastAndroid.showWithGravity(
        'Image Uploaded Successfully',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    }
  };

  return (
    <MyUploadButton
      onPress={showImagePickerOptions}
      title={title}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 0,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    justifyContent: 'center',
    textAlign: 'center',
  },
});

export default ImageUpload;
