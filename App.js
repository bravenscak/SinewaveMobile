import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthService from './src/services/AuthService';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MainScreen from './src/screens/MainScreen';  
import UsersScreen from './src/screens/UsersScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      
      if (isAuth) {
        const user = await AuthService.getUserData();
        setUserData(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Ako ima grešku, odjavi korisnika
      await handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async (user) => {
    try {
      setUserData(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error handling login success:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setUserData(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#fff', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color="#00FFFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main">
              {props => (
                <MainScreen 
                  {...props} 
                  onLogout={handleLogout}
                  userData={userData}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Profile">
              {props => (
                <ProfileScreen 
                  {...props} 
                  onLogout={handleLogout}
                  userData={userData}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Users" component={UsersScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login">
              {props => (
                <LoginScreen
                  {...props}
                  onLoginSuccess={handleLoginSuccess}
                  onNavigateToRegister={() => props.navigation.navigate('Register')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {props => (
                <RegisterScreen
                  {...props}
                  onNavigateToLogin={() => props.navigation.navigate('Login')}
                  onRegisterSuccess={handleLoginSuccess}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}