import React, { useState, useEffect, useRef } from "react";
import { Audio } from 'expo-av';
import AuthService from "../services/AuthService";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.77:8080/api";

export default function MainScreen({ onLogout, navigation }) {
  const [activeTab, setActiveTab] = useState("songs");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  
  // New state for audio playback
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);

  // Initialize audio session
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log("Audio mode configured");
      } catch (error) {
        console.error("Failed to configure audio mode:", error);
      }
    };
    
    setupAudio();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await AuthService.authenticatedFetch(
          `${API_URL}/users/me`
        );
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchSongs = async () => {
      try {
        const response = await AuthService.authenticatedFetch(
          `${API_URL}/songs`
        );
        if (!response.ok) throw new Error("Failed to fetch songs");
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSongs();
    fetchUserData();
    
    // Cleanup audio resources when component unmounts
    return () => {
      if (sound) {
        console.log("Unloading Sound");
        sound.unloadAsync();
      }
    };
  }, []);
  
  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const response = await AuthService.authenticatedFetch(
        `${API_URL}/playlists`
      );
      if (!response.ok) throw new Error("Failed to fetch playlists");
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      Alert.alert("Error", "Failed to fetch playlists");
    } finally {
      setLoadingPlaylists(false);
    }
  };
  const navigateToPlaylists = () => {
    setActiveTab("myplaylists");
    navigation.navigate("MyPlaylists");
  };

  const navigateToSongs = () => {
    setActiveTab("songs");
    navigation.navigate("Main");
  };

  const navigateToUsers = () => {
    setActiveTab("users");
    navigation.navigate("Users");
  };
  const handleSearch = () => {
    if (!searchValue.trim()) fetchSongs();
    return;
  };
  const handleClearSearch = () => {
    setSearchValue("");
  };
  const navigateToProfile = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        navigation.navigate("UserProfile");
      }
    } catch (error) {
      console.error("Error getting user data:", error);
    }
  };  // Function to load and play a song
  const playSong = async (song) => {
    try {
      // Stop current song if one is playing
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Mark song as playing
      await AuthService.authenticatedFetch(
        `${API_URL}/songs/${song.id}/play`,
        {
          method: "POST",
        }
      );
      
      // Update UI before starting to stream
      setCurrentSong(song);
      setIsPlaying(true);
      
      // Create and configure the sound object
      console.log(`Streaming from ${API_URL}/songs/stream/${song.id}`);
      
      // Load and play the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `${API_URL}/songs/stream/${song.id}` },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
    } catch (error) {
      console.error("Error playing song:", error);
      Alert.alert("Error", "Failed to play the song");
      setIsPlaying(false);
    }
  };
  
  // Monitor playback status
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setSliderValue(status.positionMillis / status.durationMillis);

      // Handle when audio finishes playing
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  // Handle play button click
  const handlePlaySong = (song) => {
    playSong(song);
  };
  
  // Toggle between play and pause
  const togglePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };
  
  // Seek to position
  const seekToPosition = async (value) => {
    if (sound && duration) {
      const newPosition = value * duration;
      await sound.setPositionAsync(newPosition);
    }
  };
  
  const addSongToPlaylist = async (playlistId, songId) => {
    try {
      const playlistSongDto = {
        playlistId: playlistId,
        songId: songId
      };
      
      const response = await AuthService.authenticatedFetch(
        `${API_URL}/playlists/songs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(playlistSongDto)
        }
      );
      
      if (!response.ok) throw new Error("Failed to add song to playlist" + response.status);
      Alert.alert("Success", "Song successfully added to playlist");
      setPlaylistModalVisible(false);
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      Alert.alert("Error", "Failed to add song to playlist");
    }
  };
  
  const openPlaylistModal = (song) => {
    setSelectedSong(song);
    fetchPlaylists();
    setPlaylistModalVisible(true);
  };
  
  const handleAddSongToPlaylist = (playlistId) => {
    if (selectedSong) {
      addSongToPlaylist(playlistId, selectedSong.id);
    } else {
      Alert.alert("Error", "No song selected to add to playlist");
    }
  };


  useEffect(() => {
    // Cleanup function to stop and unload the sound when the component unmounts or when the song changes
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar} />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.username}>{user?.username}</Text>
                  </View>
                </View>
        <Text style={styles.headerTitle}>SineWave</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Search songs..."
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {searchValue ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSearch}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading songs...</Text>
          </View>
        ) : (
          <FlatList
            data={songs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.songItem, currentSong?.id === item.id && styles.currentlyPlayingSong]}>
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{item.title}</Text>
                  <Text style={styles.artistName}>{item.artistName}</Text>
                </View>                <TouchableOpacity
                  style={styles.playSongButton}
                  onPress={() => openPlaylistModal(item)}
                >
                  <Text style={styles.playSongButtonText}>➕</Text>
                </TouchableOpacity>                <TouchableOpacity
                  style={styles.playSongButton}
                  onPress={() => currentSong?.id === item.id && isPlaying 
                    ? togglePlayPause() 
                    : handlePlaySong(item)}
                >
                  <Text style={styles.playSongButtonText}>
                    {currentSong?.id === item.id && isPlaying ? "⏸" : "▶"}
                  </Text>
                </TouchableOpacity>
                {currentSong?.id === item.id && (
                  <Text style={styles.nowPlayingIndicator}>Now Playing</Text>
                )}
              </View>
            )}
            contentContainerStyle={styles.songsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text>No songs available</Text>
              </View>
            }
          />
        )}      </View>

      {/* Playlist Selection Modal */}
      <Modal
        visible={playlistModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPlaylistModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Playlist</Text>
              <TouchableOpacity
                onPress={() => setPlaylistModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingPlaylists ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00FFFF" />
                <Text>Loading playlists...</Text>
              </View>
            ) : playlists.length > 0 ? (
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.playlistItem}
                    onPress={() => handleAddSongToPlaylist(item.id)}
                  >
                    <Text style={styles.playlistName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyPlaylistsContainer}>
                <Text style={styles.emptyPlaylistsText}>
                  You don't have any playlists yet
                </Text>
                <TouchableOpacity
                  style={styles.createPlaylistButton}
                  onPress={() => {
                    setPlaylistModalVisible(false);
                    navigation.navigate("PlaylistCreate");
                  }}
                >
                  <Text style={styles.createPlaylistButtonText}>
                    Create a Playlist
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>      {/* Player Footer - Only show if a song has been selected */}
      {currentSong && (
        <View style={styles.playerFooter}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerIcon}>♪</Text>
            <View style={styles.playerText}>
              <Text style={styles.songName}>{currentSong.title}</Text>
              <Text style={styles.artistName}>{currentSong.artistName}</Text>
            </View>
          </View>

          <View style={styles.playerMainControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => console.log("Previous")}
            >
              <Text style={styles.controlIcon}>⏪</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={togglePlayPause}
            >
              <Text style={[styles.controlIcon, styles.playIcon]}>
                {isPlaying ? "⏸" : "▶"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => console.log("Next")}
            >
              <Text style={styles.controlIcon}>⏩</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerTab}
          onPress={navigateToPlaylists}
        >
          <Text style={styles.footerTabText}>Playlists</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerTab, styles.activeTab]}
          onPress={navigateToSongs}
        >
          <Text style={[styles.footerTabText, styles.activeTabText]}>
            Songs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerTab} onPress={navigateToUsers}>
          <Text style={styles.footerTabText}>Users</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  avatarButton: {
    padding: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 5,
  },
  profileDetailsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 5,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  songsList: {
    padding: 16,
  },
  songItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  currentlyPlayingSong: {
    backgroundColor: "#f0ffff",
    borderWidth: 1,
    borderColor: "#00FFFF",
  },
  nowPlayingIndicator: {
    color: "#00FFFF",
    fontWeight: "bold",
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  playSongButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00FFFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  playSongButtonText: {
    fontSize: 18,
    color: "#000",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  playerFooter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00FFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  playerIcon: {
    fontSize: 24,
    marginRight: 10,
    color: "#000",
  },
  playerText: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  artistName: {
    fontSize: 14,
    color: "#333",
  },
  playerControls: {
    flexDirection: "row",
    gap: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },  playButton: {
    backgroundColor: "#fff",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pauseButton: {
    backgroundColor: "#f1f1f1",
  },
  controlIcon: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
  },
  playIcon: {
    color: "#000",
    fontSize: 20,
  },
  playerMainControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footer: {
    flexDirection: "row",
    backgroundColor: "#333",
  },
  footerTab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  footerTabText: {
    color: "#fff",
    fontWeight: "500",
  },
  activeTab: {
    backgroundColor: "#00FFFF",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  clearButton: {
    position: "absolute",
    right: 70,
    padding: 5,
    zIndex: 1,
  },
  clearButtonText: {
    fontSize: 22,
    color: "#999",
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },  searchIcon: {
    fontSize: 20,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
  },
  playlistItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  playlistName: {
    fontSize: 16,
    color: "#333",
  },
  emptyPlaylistsContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyPlaylistsText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  createPlaylistButton: {
    backgroundColor: "#00FFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  createPlaylistButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
