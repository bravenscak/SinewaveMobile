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

const API_URL = "https://oicar-sinewave.onrender.com/api";

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
});
