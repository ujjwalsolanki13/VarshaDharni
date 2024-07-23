// MusicPlayer.js

// MusicPlayer.js

// MusicPlayer.js

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, Image } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

// Import the local audio file
const track = {
  title: 'Sample Track',
  artist: 'Sample Artist',
  album: 'Sample Album',
  artwork: 'https://via.placeholder.com/150', // Placeholder artwork
  uri: require('./assets/sample.mp3'), // Local file
};

const MusicPlayer = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadSound = async () => {
    try {
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          track.uri,
          { shouldPlay: false }
        );
        setSound(newSound);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setDuration(status.durationMillis);
            setPosition(status.positionMillis);
            setIsPlaying(status.isPlaying);
          }
        });
      }
    } catch (error) {
      console.error("Error loading sound: ", error);
    }
  };

  const playPauseSound = async () => {
    try {
      if (!sound) {
        await loadSound();
      }

      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.error("Error playing/pausing sound: ", error);
    }
  };

  const onSeek = async (value) => {
    try {
      if (sound) {
        await sound.setPositionAsync(value);
      }
    } catch (error) {
      console.error("Error seeking sound: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: track.artwork }} style={styles.artwork} />
      <Text style={styles.title}>{track.title}</Text>
      <Text style={styles.artist}>{track.artist}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onSlidingComplete={onSeek}
      />
      <View style={styles.controls}>
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={playPauseSound} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  artwork: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
  },
  artist: {
    fontSize: 18,
    color: '#aaa',
  },
  slider: {
    width: Dimensions.get('window').width - 40,
    height: 40,
    marginVertical: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
});

export default MusicPlayer;
