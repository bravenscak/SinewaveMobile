import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.77:8080/api';

class AuthService {
  static ACCESS_TOKEN_KEY = 'access_token';
  static REFRESH_TOKEN_KEY = 'refresh_token';
  static USER_DATA_KEY = 'user_data';

  static async getAccessToken() {
    try {
      return await AsyncStorage.getItem(AuthService.ACCESS_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  static async getRefreshToken() {
    try {
      return await AsyncStorage.getItem(AuthService.REFRESH_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  static async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(AuthService.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  static async setTokens(accessToken, refreshToken, userData) {
    try {
      const promises = [
        AsyncStorage.setItem(AuthService.ACCESS_TOKEN_KEY, accessToken),
        AsyncStorage.setItem(AuthService.USER_DATA_KEY, JSON.stringify(userData))
      ];
      
      if (refreshToken) {
        promises.push(AsyncStorage.setItem(AuthService.REFRESH_TOKEN_KEY, refreshToken));
      }
      
      await Promise.all(promises);
    } catch (error) {
      throw error;
    }
  }

  static async isAuthenticated() {
    const accessToken = await AuthService.getAccessToken();
    return !!accessToken;
  }

  static async login(username, password) {
    try {
      console.log('Attempting login to:', `${API_URL}/mobile/auth/login`);
      
      const response = await fetch(`${API_URL}/mobile/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status);

      const responseText = await response.text();
      console.log('Login response text:', responseText.substring(0, 100));
      
      if (!responseText) {
        throw new Error('Server returned empty response');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `Login failed. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      if (data.token && data.user) {
        await AuthService.setTokens(data.token, data.refreshToken, data.user);
        console.log('Login successful, tokens saved');
        return { success: true, user: data.user };
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  static async register(userData) {
    try {
      const response = await fetch(`${API_URL}/mobile/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.token && data.user) {
        await AuthService.setTokens(data.token, data.refreshToken, data.user);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async logout() {
    try {
      const refreshToken = await AuthService.getRefreshToken();
      
      if (refreshToken) {
        try {
          await fetch(`${API_URL}/mobile/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
        } catch (error) {}
      }

      await Promise.all([
        AsyncStorage.removeItem(AuthService.ACCESS_TOKEN_KEY),
        AsyncStorage.removeItem(AuthService.REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(AuthService.USER_DATA_KEY)
      ]);

    } catch (error) {}
  }

  static async authenticatedFetch(url, options = {}) {
    let accessToken = await AuthService.getAccessToken();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      await AuthService.logout();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  }
//TODO fix this, post does not work
  static async authenticatedPost(url, body) {
    return AuthService.authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

}

export default AuthService;