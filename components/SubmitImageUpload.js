import React, {useState} from 'react';
import {
  View,
  Image,
  Alert,
  StyleSheet,
  ToastAndroid,
  Text,
  PermissionsAndroid,
} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {SafeAreaView} from 'react-native-safe-area-context';
import SubmitUploadButton from './SubmitUploadButton';
import translations from '../translations';
import { log } from './Logger';

// const SubmitImageUpload = ({onImageUpload, title, disabled}) => {

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
//       <SubmitUploadButton
//         onPress={handleLaunchImageLibrary}
//         title={title}
//         disabled={disabled}>
//       </SubmitUploadButton>
//   );
// };

const SubmitImageUpload = ({onImageUpload, title, disabled}) => {
  const showPickerOptions = () => {
    if (disabled) return;

    Alert.alert(
      'Upload File',
      'Choose an Option',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Camera', onPress: handleLaunchCamera},
        {text: 'Gallery', onPress: handleLaunchImageLibrary},
        // { text: "Select PDFs", onPress: handleSelectPDFs },
      ],
      {cancelable: true},
    );
  };

  const handleLaunchCamera = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        try {
          const options = {
            mediaType: 'photo',
            // saveToPhotos: true, // temporarily disable this
          };
          launchCamera(options, response => {
            console.log('Camera Response:', JSON.stringify(response, null, 2));
            handleImageResponse(response);
          });
        } catch (cameraErr) {
          console.error('Error launching camera:', cameraErr);
        }
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleLaunchImageLibrary = () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 1, // 0 means unlimited
    };
    launchImageLibrary(options, handleImageResponse);
  };

  // const handleSelectPDFs = async () => {
  //   try {
  //     const results = await DocumentPicker.pickMultiple({
  //       type: [DocumentPicker.types.pdf],
  //     });
  //     console.log('Selected PDFs:', results);

  //     const uris = results.map(file => file.uri);
  //     onImageUpload(uris); // You can rename `onImageUpload` to `onFileUpload` if more appropriate

  //     ToastAndroid.showWithGravity(
  //       `${uris.length} PDF(s) uploaded`,
  //       ToastAndroid.SHORT,
  //       ToastAndroid.CENTER,
  //     );
  //   } catch (err) {
  //     if (DocumentPicker.isCancel(err)) {
  //       console.log('PDF selection cancelled');
  //     } else {
  //       console.warn('PDF selection error:', err);
  //     }
  //   }
  // };

  // const handleImageResponse = (response) => {
  //   console.log("Image response:", response);
  //   if (!response.didCancel && response.assets && response.assets.length > 0) {
  //     const imageURIs = response.assets.map(asset => asset.uri);
  //     onImageUpload(imageURIs);

  //     ToastAndroid.showWithGravity(
  //       `${imageURIs.length} image(s) uploaded`,
  //       ToastAndroid.SHORT,
  //       ToastAndroid.CENTER,
  //     );
  //   }
  // };

  const handleImageResponse = async response => {
    console.log('Image response:', response);

    if (!response.didCancel && response.assets && response.assets.length > 0) {
      try {
        const compressedURIs = [];

        for (const asset of response.assets) {
          const compressed = await ImageResizer.createResizedImage(
            asset.uri,
            800, // Width
            800, // Height
            'JPEG',
            20, // Quality (0 - 100)
            0, // Rotation
          );

          compressedURIs.push(compressed.uri);
        }

        onImageUpload(compressedURIs);

        ToastAndroid.showWithGravity(
          `Image(s) uploaded Successfully`,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } catch (err) {
        console.warn('Image compression failed:', err);
      }
    }
  };

  return (
    <SubmitUploadButton
      onPress={showPickerOptions}
      title={title}
      disabled={disabled}
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

export default SubmitImageUpload;
