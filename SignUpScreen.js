import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert } from 'react-native';
import { SERVER_URL } from './config';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    fetch(`${SERVER_URL}/api/auth/signup`, { // Ensure this endpoint matches your server's signup endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, contact, password }),
    })
      .then(async response => {
        const responseText = await response.text();
        console.log('Server response:', responseText);

        try {
          const data = JSON.parse(responseText);
          if (response.ok) { // Check for successful response
            if (data.message === 'Sign-up successful') {
              Alert.alert('Success', 'Sign-up successful');
              navigation.replace('signin');
            } else {
              Alert.alert('Error', data.error || 'Sign-up failed');
            }
          } else {
            Alert.alert('Error', data.error || 'Sign-up failed');
          }
        } catch (error) {
          Alert.alert('Error', 'Unexpected response from server');
          console.error('Error during sign-up:', error, responseText);
        }
      })
      .catch(error => {
        console.error('Error during sign-up:', error);
        Alert.alert('Error', 'Error during sign-up. Please try again.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact"
        value={contact}
        onChangeText={setContact}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Already have an account? Sign In" onPress={() => navigation.replace('signin')} />
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

export default SignUpScreen;
