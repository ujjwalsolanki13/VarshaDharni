import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert } from 'react-native';
import { SERVER_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const storeToken = async (token) => {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  };

  const handleSignIn = () => {
    fetch(`${SERVER_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then(async (response) => {
        const responseText = await response.text();
        console.log('Server response:', responseText);

        try {
          const data = JSON.parse(responseText);
          if (response.ok) {
            if (data.token) {
              await storeToken(data.token);
              Alert.alert('Success', 'Sign-in successful');
              navigation.replace('Home');
            } else {
              Alert.alert('Error', 'Invalid email or password');
            }
          } else {
            Alert.alert('Error', data.message || 'Sign-in failed');
          }
        } catch (error) {
          Alert.alert('Error', 'Unexpected response from server');
          console.error('Error during sign-in:', error, responseText);
        }
      })
      .catch((error) => {
        console.error('Error during sign-in:', error);
        Alert.alert('Error', 'Error during sign-in. Please try again.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <Button title="Don't have an account? Sign Up" onPress={() => navigation.replace('SignUp')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#8d774c',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
});

export default SignInScreen;
