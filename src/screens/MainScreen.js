import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MainScreen({ onLogout, navigation }) {
    const [activeTab, setActiveTab] = useState("songs");

    const navigateToPlaylists = () => {
        setActiveTab("playlists");
    };

    const navigateToSongs = () => {
        setActiveTab("songs");
    };

    const navigateToUsers = () => {
        setActiveTab("users");
        navigation.navigate("Users");
    };

    const navigateToProfile = async () => {
        try {
            const userString = await AsyncStorage.getItem("user");
            if (userString) {
                navigation.navigate("Profile");
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
                    style={styles.avatarButton}
                    onPress={navigateToProfile}
                >
                    <Image
                        source={{ uri: null }}
                        style={styles.avatar}
                        defaultSource={{
                            uri: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNGMEYwRjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM3LjUiIHI9IjEyLjUiIGZpbGw9IiNEMEQwRDAiLz48cGF0aCBkPSJNMjUgNzVjMC0xMy44IDExLjItMjUgMjUtMjVzMjUgMTEuMiAyNSAyNXYxMEgyNVY3NXoiIGZpbGw9IiNEMEQwRDAiLz48L3N2Zz4=",
                        }}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Main Page</Text>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
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
                        onPress={() => console.log("Like song")}
                    >
                        <Text
                            style={[styles.controlIcon, { color: "#e74c3c" }]}
                        >
                            ❤
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => console.log("Add to playlist")}
                    >
                        <Text style={[styles.controlIcon, { color: "#000" }]}>
                            +
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

                <TouchableOpacity
                    style={styles.footerTab}
                    onPress={navigateToUsers}
                >
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
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 4,
        marginTop: 20,
    },
    logoutButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
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
