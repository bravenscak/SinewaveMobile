import React, { useState, useEffect } from "react";
import AuthService from "../services/AuthService";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Button,
} from "react-native";

const API_URL = 'https://oicar-sinewave.onrender.com/api';

export default function PlaylistCreateScreen({ navigation }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("myplaylists");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await AuthService.authenticatedFetch(`${API_URL}/users/me`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserData();
  }, []);

  const handleCreatePlaylist = async () => {
    if (!name.trim()) {
      setError("Playlist name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const checkResponse = await AuthService.authenticatedFetch(`${API_URL}/playlists`);
      
      if (!checkResponse.ok) {
        throw new Error("Failed to check existing playlists");
      }
      
      const existingPlaylists = await checkResponse.json();
      const playlistExists = existingPlaylists.some(
        playlist => playlist.name.toLowerCase() === name.toLowerCase()
      );
      
      if (playlistExists) {
        setError("A playlist with this name already exists");
        setLoading(false);
        return;
      }
      
      const response = await AuthService.authenticatedFetch(`${API_URL}/playlists`, {
        method: "POST",
        body: JSON.stringify(name),
      });

      if (!response.ok) {
        throw new Error("Failed to create playlist");
      }

      const data = await response.json();
      navigation.navigate("PlaylistDetails", { playlistId: data.id });
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToPlaylists = () => {
        setActiveTab("myplaylists");
        navigation.navigate("MyPlaylists");
    };

    const navigateToSongs = () => {
        navigation.navigate("Main");
        setActiveTab("Main");
    };

    const navigateToUsers = () => {
        setActiveTab("users");
        navigation.navigate("Users");
    };

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
            </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Playlist name..."
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePlaylist}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Create Playlist</Text>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
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
    justifyContent: "space-between", 
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
    backgroundColor: "#fff",
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
  formContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",  
    alignItems: "center",      
    width: "100%",             
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    backgroundColor: "lightgray",
    color: "gray",
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    width: "80%", 
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  createButton: {
    backgroundColor: "black",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    width: "80%",  
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff4c4c",
    marginTop: 10,
    textAlign: "center",
    width: "80%",  
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
