import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import AuthService from "../services/AuthService";

const API_URL = "http://192.168.1.77:8080/api";

export default function PlaylistDetailsScreen({ route, navigation }) {
  const { playlistId } = route.params;
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [activeTab, setActiveTab] = useState("myplaylists");

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
  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        const playlistResponse = await AuthService.authenticatedFetch(
          `${API_URL}/playlists/${playlistId}`
        );
        if (!playlistResponse.ok)
          throw new Error("Failed to fetch playlist details");
        const playlistData = await playlistResponse.json();
        setPlaylist(playlistData);

        const songsResponse = await AuthService.authenticatedFetch(
          `${API_URL}/playlists/${playlistId}/songs`
        );
        if (!songsResponse.ok)
          throw new Error("Failed to fetch playlist songs");
        const songsData = await songsResponse.json();
        setSongs(songsData || []);
      } catch (error) {
        console.error(error);
        setError("Failed to load playlist");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [playlistId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{error}</Text>
      </View>
    );
  }
  const handlePlaySong = (song) => {
    if (currentSong && currentSong.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
    // TODO: Implement actual audio playback logic here
    console.log(`${isPlaying ? "Pausing" : "Playing"} song:`, song.name);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.playlistTitle}>{playlist?.name}</Text>
        <Text style={styles.songCount}>{songs.length} songs</Text>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.songItem}>
            <View style={styles.songInfo}>
              <Text style={styles.songName}>{item.title}</Text>
              <Text style={styles.artistName}>
                {item.artist || "Unknown Artist"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.playButton,
                currentSong?.id === item.id &&
                  isPlaying &&
                  styles.playingButton,
              ]}
              onPress={() => handlePlaySong(item)}
            >
              <Text style={styles.playButtonText}>
                {currentSong?.id === item.id && isPlaying ? "▶️" : "▶"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.songsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No songs in this playlist.</Text>
          </View>
        }
      />

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
                    <View style={styles.songItem}>
                      <View style={styles.songInfo}>
                        <Text style={styles.songTitle}>{item.title}</Text>
                        <Text style={styles.artistName}>{item.artistName}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.playSongButton}
                        onPress={() => {
                          // Add play functionality here
                        }}
                      >
                        <Text style={styles.playSongButtonText}>▶</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  contentContainerStyle={styles.songsList}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text>No songs available</Text>
                    </View>
                  }
                />
              )}
            </View>

      {/* Player Footer */}
            <View style={styles.playerFooter}>
              <View style={styles.playerInfo}>
                <Text style={styles.playerIcon}>♪</Text>
                <View style={styles.playerText}>
                  <Text style={styles.songName}>Song name</Text>
                  <Text style={styles.artistName}>Artist</Text>
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
                  onPress={() => console.log("Play/Pause")}
                >
                  <Text style={[styles.controlIcon, styles.playIcon]}>▶</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => console.log("Next")}
                >
                  <Text style={styles.controlIcon}>⏩</Text>
                </TouchableOpacity>
              </View>
            </View>

      {/* Bottom Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerTab, styles.activeTab]}
          onPress={navigateToPlaylists}
        >
          <Text style={styles.footerTabText}>Playlists</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerTab} onPress={navigateToSongs}>
          <Text style={styles.footerTabText}>Songs</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  playlistTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  songCount: {
    fontSize: 16,
    color: "#666",
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
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  songName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  artistName: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00FFFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  playingButton: {
    backgroundColor: "#00E0E0",
  },
  playButtonText: {
    fontSize: 18,
  },
  songsList: {
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F0F0",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  songsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  songsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  uploadButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  songsList: {
    flex: 1,
  },
  songItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#C0C0C0",
    padding: 15,
    marginVertical: 2,
    borderRadius: 5,
  },
  songText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  songActions: {
    flexDirection: "row",
    gap: 15,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 20,
    color: "#333",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
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
  playerMainControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
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
  controlIcon: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
  },
  playIcon: {
    color: "#000",
    fontSize: 20,
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
});
