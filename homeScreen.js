
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator, Modal, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_URL = 'http://192.168.1.3:3000';

const HomeScreen = ({ navigation }) => {
  const [chants, setChants] = useState([]);
  const [currentSound, setCurrentSound] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [modalVisible, setModalVisible] = useState(true);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [soundDetails, setSoundDetails] = useState({ title: '', uri: '', image: '' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchChants = (language) => {
    fetch(`${SERVER_URL}/music?language=${language}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setChants(data))
      .catch(error => {
        console.error('Error fetching music:', error);
        Alert.alert('Error', 'Error fetching music. Please try again.');
      });
  };

  useEffect(() => {
    fetchChants(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    let interval = null;
    if (isPlaying && currentSound) {
      interval = setInterval(async () => {
        if (!isSeeking) {
          const status = await currentSound.getStatusAsync();
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
          }
        }
      }, 1000);
    } else if (!isPlaying && interval) {
      clearInterval(interval);
    }
    return () => interval && clearInterval(interval);
  }, [isPlaying, currentSound, isSeeking]);

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleDonation = () => {
    setModalVisible(false);
    navigation.navigate('donation');
  };

  const handlePlayPause = async () => {
    if (!currentSound) return;

    if (isPlaying) {
      await currentSound.pauseAsync();
    } else {
      await currentSound.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const loadSound = async (uri, title, image) => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Authentication required', 'Please sign in to play the sounds.');
      return;
    }

    if (currentSound) {
      await currentSound.unloadAsync();
      setCurrentSound(null);
    }

    const { sound } = await Audio.Sound.createAsync({ uri });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis);
        setDuration(status.durationMillis);
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPosition(sound);
        }
      }
    });

    setCurrentSound(sound);
    setSoundDetails({ title, uri, image });
    setPlayerVisible(true);
    await sound.playAsync();
    setIsPlaying(true);
  };

  const handleSlidingComplete = async (value) => {
    if (currentSound) {
      await currentSound.setPositionAsync(value);
      setIsSeeking(false);
      if (!isPlaying) {
        await currentSound.playAsync();
        setIsPlaying(true);
      }
      // Call the API to update the playback position on the server
      
    }
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2A1F1F" barStyle="light-content" />
      <Header />
      <Image source={require('./assets/varshalogo.png')} style={styles.logocontainer} />
      <LanguageSelector selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />
      <Text style={styles.PopularChants}>Popular Chants</Text>
      <ScrollView style={styles.chantList}>
        {chants.map(chant => (
          <ChantItem
            key={chant.name}
            title={chant.name}
            uri={chant.url}
            image={chant.image}
            loadSound={loadSound}
          />
        ))}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Welcome to the Yoga Nidra app! Would you like to make a donation?</Text>
            <Button style={styles.modalButton} title="Yes" onPress={handleDonation} />
            <Button style={styles.modalButton} title="No" onPress={handleModalClose} />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={playerVisible}
        onRequestClose={() => setPlayerVisible(false)}
      >
        <View style={styles.playerContainer}>
          <View style={styles.playerContent}>
            <Image source={require('./assets/varshalogo.png')} style={styles.albumImage} />
            <Text style={styles.playerTitle}>{soundDetails.title}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onValueChange={(value) => {
                setPosition(value);
                setIsSeeking(true); // Start seeking
              }}
              onSlidingComplete={handleSlidingComplete}
              minimumTrackTintColor="#132637"
              maximumTrackTintColor="#000000"
              thumbTintColor="#D59C29"
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
            <TouchableOpacity onPress={handlePlayPause} style={styles.playPauseButton}>
              <Text style={styles.playPauseButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>YOGA NIDRA</Text>
  </View>
);

const LanguageSelector = ({ selectedLanguage, setSelectedLanguage }) => (
  <View style={styles.languageSelector}>
    <Picker
      selectedValue={selectedLanguage}
      onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
      style={styles.picker}
    >
      <Picker.Item label="Select Language" value="" />
      <Picker.Item label="English" value="en" />
      <Picker.Item label="Hindi" value="hi" />
    </Picker>
  </View>
);

const ChantItem = ({ title, uri, image, loadSound }) => {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    await loadSound(uri, title, image);
    setLoading(false);
  };

  return (
    <View style={styles.chantItem}>
      <View style={styles.chantItemBox} />
      <Text style={styles.chantItemText}>{title}</Text>
      <TouchableOpacity onPress={handlePress} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Image source={require('./assets/playIcon.png')} style={styles.playIcon} />
        )}
      </TouchableOpacity>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8d774c',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    justifyContent: 'center',
    textAlign: 'justify',
    alignSelf: 'center'
  },
  logocontainer: {
    width: 200,
    height: 200,
    alignSelf: 'center'
  },
  languageSelector: {
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
    marginBottom: 30,
  },
  PopularChants: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    textAlign: 'left',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  chantList: {
    flex: 1,
  },
  chantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d3d3d3',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  chantItemBox: {
    width: 30,
    height: 30,
    backgroundColor: 'black',
    marginRight: 10,
  },
  chantItemText: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  playIcon: {
    width: 30,
    height: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    rowGap:10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    marginBottom: 10,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8d774c',
  },
  playerContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  albumImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  playerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  slider: {
    width: 300,
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    marginBottom: 20,
  },
  timeText: {
    color: 'black',
  },
  playPauseButton: {
    padding: 10,
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
  },
  playPauseButtonText: {
    fontSize: 16,
  },
});

export default HomeScreen;
