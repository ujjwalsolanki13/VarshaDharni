import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

const DonationScreen = ({ navigation }) => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  const handleDonate = () => {
    const amount = selectedAmount || customAmount;
    if (!amount) {
      Alert.alert('Error', 'Please select or enter an amount to donate.');
      return;
    }
    navigation.navigate('upload', { amount });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Donate Now</Text>
      <Text style={styles.subtitle}>Choose your Donation Amount</Text>

      <View style={styles.buttonContainer}>
        {['200rs', '500rs', '1000rs', '2000rs'].map(amount => (
          <TouchableOpacity
            key={amount}
            style={[
              styles.amountButton,
              selectedAmount === amount && styles.selectedButton,
            ]}
            onPress={() => {
              setSelectedAmount(amount);
              setCustomAmount('');
            }}
          >
            <Text style={styles.buttonText}>{amount}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter Amount"
        keyboardType="numeric"
        value={customAmount}
        onChangeText={text => {
          setSelectedAmount(null);
          setCustomAmount(text);
        }}
      />

      <Text style={styles.note}>
        100% of your donation is tax-deductible to the extent otherwise allowed by law
      </Text>

      <TouchableOpacity style={styles.payButton} onPress={handleDonate}>
        <Text style={styles.payButtonText}>Donate Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#8d774c',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  amountButton: {
    width: '30%',
    margin: 10,
    padding: 15,
    backgroundColor: '#C4C4C4',
    alignItems: 'center',
    borderRadius: 10,
  },
  selectedButton: {
    backgroundColor: '#A4A4A4',
  },
  buttonText: {
    fontSize: 16,
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  note: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  payButton: {
    width: '80%',
    padding: 15,
    backgroundColor: '#C4C4C4',
    alignItems: 'center',
    borderRadius: 10,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DonationScreen;
