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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "https://oicar-sinewave.onrender.com/api";

export default function UsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [followStatus, setFollowStatus] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      return () => {};
    }, [])
  );

  useEffect(() => {
    getCurrentUserData();
    fetchUserData();
  }, []);

  useEffect(() => {
    getCurrentUserData();
    fetchUserData();
  }, []);

  const getCurrentUserData = async () => {
    try {
      const userData = await AuthService.getUserData();
      if (userData) {
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  const sortUsers = (users, followStatus) => {
    return [...users].sort((a, b) => {
      if (followStatus[a.id] && !followStatus[b.id]) return -1;
      if (!followStatus[a.id] && followStatus[b.id]) return 1;
      return a.username.localeCompare(b.username);
    });
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [usersResponse, currentUserFollowing] = await Promise.all([
        AuthService.authenticatedFetch(`${API_URL}/users`),
        AuthService.authenticatedFetch(`${API_URL}/users/friends/following`),
      ]);

      if (usersResponse.ok && currentUserFollowing.ok) {
        const [usersData, followingData] = await Promise.all([
          usersResponse.json(),
          currentUserFollowing.json(),
        ]);

        const followStatuses = {};
        followingData.forEach((user) => {
          followStatuses[user.id] = true;
        });

        const currentUser = await AuthService.getUserData();
        const currentUserId = currentUser ? currentUser.id : null;
        const filteredUsers = usersData.filter(
          (user) => user.id !== currentUserId
        );

        const sortedUsers = sortUsers(filteredUsers, followStatuses);

        setUsers(sortedUsers);
        setFollowStatus(followStatuses);
      } else {
        console.error("Error fetching users:", usersResponse.status);
        Alert.alert("Error", "Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Network error while loading users");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    fetchUserData();
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      fetchUserData();
      return;
    }

    try {
      setLoading(true);
      const response = await AuthService.authenticatedFetch(
        `${API_URL}/users/search?username=${encodeURIComponent(searchValue)}`
      );

      if (response.ok) {
        const searchResults = await response.json();
        const currentUser = await AuthService.getUserData();
        const currentUserId = currentUser ? currentUser.id : null;
        const filteredResults = searchResults.filter(
          (user) => user.id !== currentUserId
        );

        const sortedResults = sortUsers(filteredResults, followStatus);
        setUsers(sortedResults);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Network error while searching users");
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (userId) => {
    try {
      const isFollowing = followStatus[userId];
      const endpoint = isFollowing
        ? `${API_URL}/users/friends/unfollow/${userId}`
        : `${API_URL}/users/friends/follow/${userId}`;

      const method = isFollowing ? "DELETE" : "POST";

      const response = await AuthService.authenticatedFetch(endpoint, {
        method,
      });

      if (response.ok) {
        setFollowStatus((prev) => ({
          ...prev,
          [userId]: !isFollowing,
        }));

        const sortedUsers = sortUsers(users, {
          ...followStatus,
          [userId]: !isFollowing,
        });
        setUsers(sortedUsers);
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.message || "Failed to update follow status"
        );
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      Alert.alert("Error", "Network error while updating follow status");
    }
  };

  const navigateToSongs = () => {
    navigation.navigate("Main");
  };

  const navigateToMyPlaylists = () => {
    navigation.navigate("MyPlaylists");
  };

  const handleUserPress = (user) => {
    navigation.navigate("UserProfile", { userId: user.id });
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.profilepicture || null }}
            style={styles.avatar}
            defaultSource={{
              uri: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNGMEYwRjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM3LjUiIHI9IjEyLjUiIGZpbGw9IiNEMEQwRDAiLz48cGF0aCBkPSJNMjUgNzVjMC0xMy44IDExLjItMjUgMjUtMjVzMjUgMTEuMiAyNSAyNXYxMEgyNVY3NXoiIGZpbGw9IiNEMEQwRDAiLz48L3N2Zz4=",
            }}
          />
        </View>
        <Text style={styles.username}>{item.username}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.followButton,
          followStatus[item.id] ? styles.followingButton : {},
        ]}
        onPress={() => toggleFollow(item.id)}
      >
        <Text
          style={[
            styles.followButtonText,
            followStatus[item.id] ? styles.followingButtonText : {},
          ]}
        >
          {followStatus[item.id] ? "Unfollow" : "Follow"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All users</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Value"
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FFFF" />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.usersList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      )}

      {/* Player Footer*/}
      {/* <View style={styles.playerFooter}>
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
      </View> */}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerTab}
          onPress={navigateToMyPlaylists}
        >
          <Text style={styles.footerTabText}>Playlists</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerTab} onPress={navigateToSongs}>
          <Text style={styles.footerTabText}>Songs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.footerTab, styles.activeTab]}>
          <Text style={[styles.footerTabText, styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    position: "relative",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  usersList: {
    paddingHorizontal: 20,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E6F7FF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  followButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  followingButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  followingButtonText: {
    color: "#333",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
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
});
