import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Button,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import AuthService from "../services/AuthService";

const API_URL = "http://192.168.1.77:8080/api";

export default function MyPlaylistsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("myplaylists");
  const [refreshing, setRefreshing] = useState(false);

  const refreshPlaylists = async () => {
    setRefreshing(true);
    try {
      const response = await AuthService.authenticatedFetch(
        `${API_URL}/playlists`
      );
      if (!response.ok) throw new Error("Failed to fetch playlists");
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to refresh playlists");
    } finally {
      setRefreshing(false);
    }
  };

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
    const fetchPlaylists = async () => {
      try {
        const response = await AuthService.authenticatedFetch(
          `${API_URL}/playlists`
        );
        if (!response.ok) throw new Error("Failed to fetch playlists");
        const data = await response.json();
        setPlaylists(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
    fetchPlaylists();
  }, []);
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
  const deletePlaylist = async (playlistId) => {
    try {
      const response = await AuthService.authenticatedFetch(
        `${API_URL}/playlists/${playlistId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete playlist: ${response.status} ${response.statusText}`
        );
      }

      await refreshPlaylists();

      Alert.alert("Success", "Playlist deleted successfully");
      console.log("Playlist deleted successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
      console.error("Error deleting playlist:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
      <View style={styles.songsSection}>
        <View style={styles.songsSectionHeader}>
          <Text style={styles.sectionTitle}>My Playlists</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate("PlaylistCreate")}
          >
            <Text style={styles.uploadButtonText}>Create Playlist</Text>
          </TouchableOpacity>
        </View>{" "}
        {playlists.length > 0 ? (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id.toString()}
            refreshing={refreshing}
            onRefresh={refreshPlaylists}
            renderItem={({ item }) => (
              <View style={styles.songItem}>
                <Text style={styles.songText}>{item.name}</Text>
                <View style={styles.songActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => {
                      Alert.alert(
                        "Delete Playlist",
                        `Are you sure you want to delete "${item.name}"?`,
                        [
                          {
                            text: "Cancel",
                            style: "cancel",
                          },
                          {
                            text: "Delete",
                            onPress: () => deletePlaylist(item.id),
                            style: "destructive",
                          },
                        ]
                      );
                    }}
                  >
                    <Icon
                      name="trash"
                      style={[styles.actionIcon, styles.deleteIcon]}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      navigation.navigate("PlaylistDetails", {
                        playlistId: item.id,
                      })
                    }
                  >
                    <Icon name="eye" style={styles.actionIcon} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.songsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No playlists available.</Text>
          </View>
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
  deleteButton: {
    backgroundColor: "#ffeeee",
  },
  deleteIcon: {
    color: "#d9534f",
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
