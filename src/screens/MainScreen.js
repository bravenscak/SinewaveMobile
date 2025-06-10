import React, { useState, useEffect } from "react";
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.77:8080/api";

export default function MainScreen({ onLogout, navigation }) {
  const [activeTab, setActiveTab] = useState("songs");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
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
  }, []);
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SineWave</Text>
        <TouchableOpacity
          style={styles.profileDetailsButton}
          onPress={navigateToProfile}
        >
          <Image
            source={{ uri: null }}
            style={styles.avatar}
            defaultSource={{
              uri: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNGMEYwRjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM3LjUiIHI9IjEyLjUiIGZpbGw9IiNEMEQwRDAiLz48cGF0aCBkPSJNMjUgNzVjMC0xMy44IDExLjItMjUgMjUtMjVzMjUgMTEuMiAyNSAyNXYxMEgyNVY3NXoiIGZpbGw9IiNEMEQwRDAiLz48L3N2Zz4=",
            }}
          />
          <Text style={styles.logoutButtonText}>Profile</Text>
        </TouchableOpacity>

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

        <View style={styles.playerControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => console.log("Add to playlist")}
          >
            <Text style={[styles.controlIcon, { color: "#000" }]}>➕</Text>
          </TouchableOpacity>
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
  },
  searchIcon: {
    fontSize: 20,
    color: "#333",
  },
});
