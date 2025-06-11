import { render, fireEvent } from '@testing-library/react-native';
import RegisterScreen from '../RegisterScreen';
import AuthService from '../../services/AuthService';
import { Alert } from 'react-native';

// Mock the Alert.alert method
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock the AuthService
jest.mock('../../services/AuthService', () => ({
  register: jest.fn(),
}));

describe('RegisterScreen', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders register form correctly', () => {
    const { getByText, getAllByPlaceholderText } = render(
      <RegisterScreen onNavigateToLogin={() => {}} onRegisterSuccess={() => {}} />
    );
    
    // Check if title is rendered
    expect(getByText('SINEWAVE')).toBeTruthy();
    
    // Check if form labels are rendered
    expect(getByText('First name')).toBeTruthy();
    expect(getByText('Last name')).toBeTruthy();
    expect(getByText('Username')).toBeTruthy();
    expect(getByText('E - mail')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
    
    // Check if all inputs are rendered with placeholder "Value"
    const inputs = getAllByPlaceholderText('Value');
    expect(inputs.length).toBe(5);
    
    // Check if register button is rendered
    expect(getByText('Register')).toBeTruthy();
    
    // Check if login link is rendered
    expect(getByText('Already have an account? Login here')).toBeTruthy();
  });

  it('validates form input and shows error on empty fields', () => {
    const { getByText } = render(
      <RegisterScreen onNavigateToLogin={() => {}} onRegisterSuccess={() => {}} />
    );
    
    // Find and press the register button without filling any fields
    const registerButton = getByText('Register');
    fireEvent.press(registerButton);
    
    // Check if Alert.alert was called with the correct error message
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
  });

  it('validates email format', () => {
    const { getByText, getAllByPlaceholderText } = render(
      <RegisterScreen onNavigateToLogin={() => {}} onRegisterSuccess={() => {}} />
    );
    
    // Get all inputs
    const inputs = getAllByPlaceholderText('Value');
    
    // Fill all fields but with invalid email
    fireEvent.changeText(inputs[0], 'John');
    fireEvent.changeText(inputs[1], 'Doe');
    fireEvent.changeText(inputs[2], 'johndoe');
    fireEvent.changeText(inputs[3], 'invalidemail'); // Invalid email without @
    fireEvent.changeText(inputs[4], 'password123');
    
    // Submit the form
    const registerButton = getByText('Register');
    fireEvent.press(registerButton);
    
    // Check if Alert.alert was called with the correct error message
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email address');
  });

  it('submits form with valid data', async () => {
    // Setup mock return value for successful registration
    AuthService.register.mockResolvedValueOnce({ 
      success: true, 
      user: { id: 1, username: 'johndoe' } 
    });
    
    const onRegisterSuccessMock = jest.fn();
    
    const { getByText, getAllByPlaceholderText } = render(
      <RegisterScreen 
        onNavigateToLogin={() => {}} 
        onRegisterSuccess={onRegisterSuccessMock} 
      />
    );
    
    // Get all inputs
    const inputs = getAllByPlaceholderText('Value');
    
    // Fill all fields with valid data
    fireEvent.changeText(inputs[0], 'John');
    fireEvent.changeText(inputs[1], 'Doe');
    fireEvent.changeText(inputs[2], 'johndoe');
    fireEvent.changeText(inputs[3], 'john@example.com');
    fireEvent.changeText(inputs[4], 'password123');
    
    // Submit the form
    const registerButton = getByText('Register');
    fireEvent.press(registerButton);
    
    // Verify that AuthService.register was called with correct data
    expect(AuthService.register).toHaveBeenCalledWith({
      firstname: 'John',
      lastname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123'
    });
  });

  it('navigates to login screen when link is pressed', () => {
    const onNavigateToLoginMock = jest.fn();
    
    const { getByText } = render(
      <RegisterScreen 
        onNavigateToLogin={onNavigateToLoginMock} 
        onRegisterSuccess={() => {}} 
      />
    );
    
    // Find and press the login link
    const loginLink = getByText('Already have an account? Login here');
    fireEvent.press(loginLink);
    
    // Verify that onNavigateToLogin was called
    expect(onNavigateToLoginMock).toHaveBeenCalled();
  });
});
