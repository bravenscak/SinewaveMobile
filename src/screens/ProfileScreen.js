import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [userSongs, setUserSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadUserSongs();
  }, []);

  const loadUserData = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        setUserData(user);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSongs = () => {
    const placeholderSongs = [
      { id: 1, name: "SongName1", genre: "Genre" },
      { id: 2, name: "SongName2", genre: "Genre" },
      { id: 3, name: "SongName3", genre: "Genre" },
      { id: 4, name: "SongName4", genre: "Genre" },
      { id: 5, name: "SongName5", genre: "Genre" },
    ];
    setUserSongs(placeholderSongs);
  };

  const handleEditProfile = () => {
    console.log("Edit profile pressed");
  };

  const handleUpload = () => {
    console.log("Upload pressed");
  };

  const handleSongLike = (songId) => {
    console.log("Like song:", songId);
  };

  const handleSongAddToPlaylist = (songId) => {
    console.log("Add to playlist:", songId);
  };

  const handleSongDelete = (songId) => {
    console.log("Delete song:", songId);
  };

  const handlePlayerPrevious = () => {
    console.log("Previous track");
  };

  const handlePlayerPlay = () => {
    console.log("Play/Pause");
  };

  const handlePlayerNext = () => {
    console.log("Next track");
  };

  const handlePlayerLike = () => {
    console.log("Like current track");
  };

  const handlePlayerAdd = () => {
    console.log("Add to playlist");
  };

  const renderSongItem = ({ item }) => (
    <View style={styles.songItem}>
      <Text style={styles.songText}>
        {item.name} - {item.genre}
      </Text>
      <View style={styles.songActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSongLike(item.id)}
        >
          <Text style={[styles.actionIcon, { color: "#e74c3c" }]}>❤</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSongAddToPlaylist(item.id)}
        >
          <Text style={[styles.actionIcon, { color: "#2ecc71" }]}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSongDelete(item.id)}
        >
          <Text style={[styles.actionIcon, { color: "#95a5a6" }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: userData?.profilepicture || null }}
              style={styles.avatar}
              defaultSource={{
                uri: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNGMEYwRjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM3LjUiIHI9IjEyLjUiIGZpbGw9IiNEMEQwRDAiLz48cGF0aCBkPSJNMjUgNzVjMC0xMy44IDExLjItMjUgMjUtMjVzMjUgMTEuMiAyNSAyNXYxMEgyNVY3NXoiIGZpbGw9IiNEMEQwRDAiLz48L3N2Zz4=",
              }}
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>
              {userData?.username || "Username"}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editButtonText}>Edit profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Songs Section */}
      <View style={styles.songsSection}>
        <View style={styles.songsSectionHeader}>
          <Text style={styles.sectionTitle}>My songs</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={userSongs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.songsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No songs uploaded yet</Text>
            </View>
          }
        />
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
            onPress={handlePlayerPrevious}
          >
            <Text style={styles.controlIcon}>⏪</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.playButton]}
            onPress={handlePlayerPlay}
          >
            <Text style={[styles.controlIcon, styles.playIcon]}>▶</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayerNext}
          >
            <Text style={styles.controlIcon}>⏩</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
    paddingTop: 40, // Added more space from top
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
});
