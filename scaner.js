// screens/UploadPaymentScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, TextInput, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const UploadPaymentScreen = () => {
  const [email, setEmail] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access media library is required!');
      }
    };
    requestPermission();
  }, []);

  const handleChoosePhoto = async () => {
    try {
      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      console.log('Picker Result:', pickerResult);

      if (!pickerResult.canceled) {
        setSelectedImage(pickerResult.assets[0].uri);
      } else {
        Alert.alert('Cancelled', 'Image selection was cancelled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'An error occurred while selecting the image');
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('No image selected', 'Please select an image to upload');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('paymentScreenshot', {
      uri: selectedImage,
      name: 'paymentScreenshot.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await fetch('http://192.168.1.3:3000/music', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      Alert.alert('Upload Successful', result.message);
    } catch (error) {
      console.error('Error uploading payment screenshot:', error);
      Alert.alert('Upload Failed', 'Failed to upload payment screenshot');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upload Payment Screenshot</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Choose Photo" onPress={handleChoosePhoto} />
      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
        </View>
      )}
      <Button title="Upload" onPress={handleUpload} disabled={!selectedImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8d774c',
    gap: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  imageContainer: {
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});

export default UploadPaymentScreen;
