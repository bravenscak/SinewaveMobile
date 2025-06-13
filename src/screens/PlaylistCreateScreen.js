import React, { useState, useEffect } from "react";
import AuthService from "../services/AuthService";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";

const API_URL = 'https://oicar-sinewave.onrender.com/api';

export default function PlaylistCreateScreen({ navigation }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("myplaylists");
  const [user, setUser] = useState(null);
  const [playlistData, setPlaylistData] = useState({
    name: '',
    isPublic: false
  });

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
      const checkResponse = await AuthService.authenticatedFetch(`${API_URL}/playlists/user`);
      
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
      
      playlistData.name = name;
      playlistData.isPublic = false;

      const response = await AuthService.authenticatedFetch(`${API_URL}/playlists`, {
        method: "POST",
        body: JSON.stringify(playlistData),
      });

      if (!response.ok) {
        console.error(playlistData);
        console.error("Failed to create playlist:", response);
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
