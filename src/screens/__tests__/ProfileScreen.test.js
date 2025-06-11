import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileScreen from '../ProfileScreen';

test('loading profile screen', () => {
    render(<ProfileScreen />);
    const linkElement = screen.getByText(/Loading.../i);
    expect(linkElement).toBeInTheDocument();
});

test('renders user data after loading', async () => {
  const { getByText } = render(<ProfileScreen onLogout={mockOnLogout} />);
  await waitFor(() => {
    expect(getByText('testuser')).toBeTruthy();
    expect(getByText('Edit profile')).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
  });
});

test('calls onLogout when logout button is pressed', async () => {
  const { getByText } = render(<ProfileScreen onLogout={mockOnLogout} />);
  const logoutButton = await waitFor(() => getByText('Logout'));
  fireEvent.press(logoutButton);
  expect(mockOnLogout).toHaveBeenCalled();
});

test('displays songs in list', async () => {
  const { getByText } = render(<ProfileScreen onLogout={mockOnLogout} />);
  await waitFor(() => {
    expect(getByText('SongName1 - Genre')).toBeTruthy();
    expect(getByText('SongName5 - Genre')).toBeTruthy();
  });
});