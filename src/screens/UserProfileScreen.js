import React, { useState, useEffect } from "react";
import AuthService from '../services/AuthService';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    FlatList,
    ActivityIndicator,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.77:8080/api";

export default function UserProfileScreen({ route, navigation }) {
    const { userId } = route.params;
    const [userData, setUserData] = useState(null);
    const [userSongs, setUserSongs] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
        fetchUserSongs();
        checkFollowStatus();
    }, [userId]);

    const fetchUserData = async () => {
    try {
        const response = await AuthService.authenticatedFetch(`${API_URL}/users/${userId}`);

        if (response.ok) {
            const data = await response.json();
            setUserData(data);
        } else {
            console.error("Error fetching user data:", response.status);
            Alert.alert("Error", "Failed to load user profile");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Network error while loading profile");
    }
};

    const fetchUserSongs = async () => {
        const placeholderSongs = Array(15)
            .fill(0)
            .map((_, index) => ({
                id: index + 1,
                name: "SongName",
                genre: "Genre",
            }));
        setUserSongs(placeholderSongs);
        setLoading(false);
    };

    const checkFollowStatus = async () => {
    try {
        const response = await AuthService.authenticatedFetch(
            `${API_URL}/users/friends/is-following/${userId}`
        );

        if (response.ok) {
            const data = await response.json();
            setIsFollowing(data.following);
        }
    } catch (error) {
        console.error("Error checking follow status:", error);
    }
};

    const toggleFollow = async () => {
    try {
        const endpoint = isFollowing
            ? `${API_URL}/users/friends/unfollow/${userId}`
            : `${API_URL}/users/friends/follow/${userId}`;

        const method = isFollowing ? "DELETE" : "POST";

        const response = await AuthService.authenticatedFetch(endpoint, {
            method,
        });

        if (response.ok) {
            setIsFollowing(!isFollowing);
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

    const handleSongLike = (songId) => {
        console.log("Like song:", songId);
    };

    const handleSongAddToPlaylist = (songId) => {
        console.log("Add to playlist:", songId);
    };

    const navigateToSongs = () => {
        navigation.navigate("Main");
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
                    <Text style={styles.actionIcon}>❤</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSongAddToPlaylist(item.id)}
                >
                    <Text style={styles.actionIcon}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00FFFF" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* User Profile Header */}
            <View style={styles.profileHeader}>
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
                        style={[
                            styles.followButton,
                            isFollowing ? styles.followingButton : {},
                        ]}
                        onPress={toggleFollow}
                    >
                        <Text
                            style={[
                                styles.followButtonText,
                                isFollowing ? styles.followingButtonText : {},
                            ]}
                        >
                            {isFollowing ? "Unfollow" : "Follow"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* User's Songs Section */}
            <View style={styles.songsSection}>
                <Text style={styles.sectionTitle}>Users songs</Text>

                <FlatList
                    data={userSongs}
                    renderItem={renderSongItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.songsList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No songs uploaded yet
                            </Text>
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

                <View style={styles.playerControls}>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => console.log("Add to playlist")}
                    >
                        <Text style={[styles.controlIcon, { color: "#000" }]}>
                            ➕
                        </Text>
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
                        <Text style={[styles.controlIcon, styles.playIcon]}>
                            ▶
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

            {/* Bottom Navigation */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.footerTab}
                    onPress={() => navigation.navigate("Playlists")}
                >
                    <Text style={styles.footerTabText}>Playlists</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.footerTab}
                    onPress={navigateToSongs}
                >
                    <Text style={styles.footerTabText}>Songs</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.footerTab, styles.activeTab]}
                    onPress={() => navigation.navigate("Users")}
                >
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
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        paddingTop: 40,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    avatarContainer: {
        marginRight: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#f0f0f0",
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    followButton: {
        backgroundColor: "#333",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: "flex-start",
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
    songsSection: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
        textAlign: "center",
    },
    songsList: {
        flex: 1,
    },
    songItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#e0e0e0",
        padding: 15,
        marginVertical: 4,
        borderRadius: 4,
    },
    songText: {
        fontSize: 16,
        color: "#333",
        flex: 1,
    },
    songActions: {
        flexDirection: "row",
        gap: 10,
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
