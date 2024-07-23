// App.js

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import HomeScreen from './homeScreen';
import DonationScreen from './donation';
import SignInScreen from './SignInscreen';
import SignUpScreen from './SignUpScreen';
import UploadPaymentScreen from './scaner';

const SERVER_URL = 'http://192.168.1.3:3000';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen name="screen" component={Screen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="donation" component={DonationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="signin" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="signup" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="upload" component={UploadPaymentScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const Screen = ({ navigation }) => {
  const [chants, setChants] = useState([]);
  const [currentSound, setCurrentSound] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isFirstSongPlayed, setIsFirstSongPlayed] = useState(false);
  const [mediaPlayerVisible, setMediaPlayerVisible] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch(`${SERVER_URL}/music?language=${selectedLanguage}`)
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
  }, [selectedLanguage]);

  const handleAudioEnd = () => {
    console.log('Audio completed, showing sign-up modal.');
    navigation.navigate('signin');
  };

  const handleAudioPause = () => {
    console.log('Audio paused, showing sign-up modal.');
    navigation.navigate('signin');
  };

  const handleUserIconPress = () => {
    navigation.navigate('signin');
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await currentSound.pauseAsync();
      setIsPlaying(false);
    } else {
      await currentSound.playAsync();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (currentSound) {
      currentSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setProgress(status.positionMillis / status.durationMillis);
        }
      });
    }
  }, [currentSound]);

  const handleMediaPlayerClose = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      setCurrentSound(null);
      setIsPlaying(false);
    }
    setMediaPlayerVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2A1F1F" barStyle="light-content" />
      <Header onUserIconPress={handleUserIconPress} />
      
      <Image source={require('./assets/varshalogo.png')} style={styles.logocontainer} />
      
      <Text style={styles.YogaNidra}>Yoga Nidra</Text>
      {mediaPlayerVisible && (
        <MediaPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          progress={progress}
          onClose={handleMediaPlayerClose} // Pass the handleMediaPlayerClose function
        />
      )}
      <LanguageSelector selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />
      <Text style={styles.PopularChants}>Popular Chants</Text>
      
      <ScrollView style={styles.chantList}>
        {chants.map(chant => (
          <ChantItem
            key={chant.name}
            title={chant.name}
            uri={chant.url}
            currentSound={currentSound}
            setCurrentSound={setCurrentSound}
            onAudioEnd={handleAudioEnd}
            onAudioPause={handleAudioPause}
            navigation={navigation}
            isFirstSongPlayed={isFirstSongPlayed}
            setIsFirstSongPlayed={setIsFirstSongPlayed}
            setCurrentTrack={setCurrentTrack}
            setMediaPlayerVisible={setMediaPlayerVisible}
            setIsPlaying={setIsPlaying}
          />
        ))}
      </ScrollView>
      
      
    </View>
  );
};

const Header = ({ onUserIconPress }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>VARSHA DHARNI</Text>
    <TouchableOpacity onPress={onUserIconPress}>
      <Image source={require('./assets/userIcon.png')} style={styles.userIcon} />
    </TouchableOpacity>
  </View>
);

const LanguageSelector = ({ selectedLanguage, setSelectedLanguage }) => (
  <View style={styles.languageSelector}>
    <Picker
      selectedValue={selectedLanguage}
      onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
      style={styles.picker}
    >
      <Picker.Item label="English" value="en" />
      <Picker.Item label="Hindi" value="hi" />
    </Picker>
  </View>
);

const ChantItem = ({ title, uri, currentSound, setCurrentSound, onAudioEnd, onAudioPause, navigation, isFirstSongPlayed, setIsFirstSongPlayed, setCurrentTrack, setMediaPlayerVisible, setIsPlaying }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlayingLocal] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const togglePlayPause = async () => {
    if (isFirstSongPlayed) {
      navigation.navigate('signin');
      return;
    }

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlayingLocal(false);
      onAudioPause();
    } else {
      if (currentSound && currentSound !== sound) {
        await currentSound.stopAsync();
        setCurrentSound(null);
      }

      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        setSound(newSound);
        newSound.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish) {
            onAudioEnd();
          }
        });
        setCurrentSound(newSound);
        setCurrentTrack({ title, uri });
        setMediaPlayerVisible(true);
        setIsPlaying(true);
      } else {
        await sound.playAsync();
        setCurrentSound(sound);
        setIsPlayingLocal(true);
      }
      setIsPlayingLocal(true);
      setIsFirstSongPlayed(true);
    }
  };

  return (
    <View style={styles.chantItem}>
      <View style={styles.chantItemBox} />
      <Text style={styles.chantItemText}>{title}</Text>
      <TouchableOpacity onPress={togglePlayPause}>
        <Image source={require('./assets/playIcon.png')} style={styles.playIcon} />
      </TouchableOpacity>
    </View>
  );
};

const MediaPlayer = ({ track, isPlaying, onPlayPause, progress, onClose }) => (
  <View style={styles.mediaPlayer}>
     <TouchableOpacity onPress={onClose} style={styles.closeButton}>
      <Image source={require('./assets/closeIcon.png')} style={styles.closeIcon} />
    </TouchableOpacity>
    <Image source={require('./assets/varshalogo.png')} style={styles.trackImage} />
    <View style={styles.trackInfo}>
      <Text style={styles.trackTitle}>{track.title}</Text>
      <Slider
        style={styles.progressBar}
        value={progress}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
        thumbTintColor="black"
        disabled={true}
      />
      <TouchableOpacity onPress={onPlayPause}>
        <Image
          source={isPlaying ? require('./assets/pauseIcon.png') : require('./assets/playIcon.png')}
          style={styles.playPauseIcon}
        />
      </TouchableOpacity>
     
    </View>
  </View>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8d774c',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  userIcon: {
    width: 70,
    height: 70,
  },
  YogaNidra: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
  },
  languageSelector: {
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
    marginBottom: 20,
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
    marginBottom: 30,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  logocontainer:{
    width: 150,
    height: 150,
    alignSelf:'center'
    
  },
  mediaPlayer: {
    alignSelf:'center',
    marginBottom: 10,
    
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  trackImage: {
    width: 64,
    height: 64,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 16,
    alignItems: 'center',
  },
  trackTitle: {
    color: 'black',
    fontSize: 18,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 'auto',
    color: 'black',
  },
  playPauseButton: {
    marginTop: 8,
  },
  playPauseIcon: {
    width: 32,
    height: 32,
  },
});

export default App;









