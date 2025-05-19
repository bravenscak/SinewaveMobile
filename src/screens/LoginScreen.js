import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const API_URL = 'http://192.168.1.237:8080/api'; 

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log('Login button pressed'); 
    
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login...');
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();
      console.log('Response:', response.status, data); 

      if (response.ok) {
        onLoginSuccess(data.token, data.user);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNavigation = () => {
    console.log('Navigate to register pressed'); 
    onNavigateToRegister();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={styles.title}>SINEWAVE</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Value"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Value"
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleRegisterNavigation}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Don't have an account? Register here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  formContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 30,
    elevation: 3, // Android shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 44, // Ensure minimum touch target
  },
  button: {
    backgroundColor: '#333',
    borderRadius: 4,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 50, // Ensure minimum touch target
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 44, // Ensure minimum touch target
  },
  linkText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});