import React, {useState} from 'react';
import {View, Image,StyleSheet,PermissionsAndroid,ToastAndroid, Text} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {SafeAreaView} from 'react-native-safe-area-context';
import MyUploadButton from './MyUploadButton';
import translations from '../translations';
import { log } from './Logger';

const ImageCapture = ({onImageCapture,title, disabled}) => {

  // const handleLaunchCamera = async (imageURI) => {
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.CAMERA,
  //       {
  //         title: "Camera Permission",
  //         message: "App needs access to your camera.",
  //         buttonNeutral: "Ask Me Later",
  //         buttonNegative: "Cancel",
  //         buttonPositive: "OK"
  //       }
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       let options = {
  //         storageOptions: {
  //           path: 'image',
  //         },
  //       };
  //       launchCamera(options, response => {
  //         console.log("Camera response:", response); // Log the entire response object
  //         if (!response.didCancel && response.assets && response.assets.length > 0) {
  //           console.log('image File: '+response.assets[0].uri);
  //           const imageURI = response.assets[0].uri;
  //           onImageCapture(imageURI);
  //           ToastAndroid.showWithGravity(
  //             'Image Uploaded Successfully',
  //             ToastAndroid.SHORT,
  //             ToastAndroid.CENTER,
  //           );
  //         }
  //       });
  //     } else {
  //       console.log("Camera permission denied");
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // };
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
          // mediaType: 'photo',
          // saveToPhotos: true,
        };

        launchCamera(options, async response => {
          console.log("Camera response:", response);
          log("IMG_CAPTURE - Camera response:", response)
          if (!response.didCancel && response.assets && response.assets.length > 0) {
            const originalURI = response.assets[0].uri;

            try {
              // Resize/Compress the image
              const compressedImage = await ImageResizer.createResizedImage(
                originalURI,
                800, // width
                800, // height
                'JPEG',
                20 // quality (0 to 100)
              );

              console.log('Compressed Image URI:', compressedImage.uri);
              onImageCapture(compressedImage.uri);

              ToastAndroid.showWithGravity(
                'Image Uploaded Successfully',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
              );
            } catch (resizeErr) {
              console.error('Image compression failed:', resizeErr);
              log('IMG_CAPTURE - Image compression failed:', resizeErr);
            }
          }
        });
      } else {
        console.log("Camera permission denied");
        log('IMG_CAPTURE - Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  
  return (
    
      <MyUploadButton
        onPress={handleLaunchCamera}
        title={title}
        disabled={disabled}></MyUploadButton>
   
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

export default ImageCapture;
