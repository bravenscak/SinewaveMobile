import { render, screen } from '@testing-library/react';
import LoginScreen from '../LoginScreen';

test('renders login form', () => {
	render(<LoginScreen />);
	const linkElement = screen.getByText(/login/i);
	expect(linkElement).toBeInTheDocument();
});

test('submits form with correct data', () => {
	render(<LoginScreen />);
	const usernameInput = screen.getByPlaceholderText(/username/i);
	const passwordInput = screen.getByPlaceholderText(/password/i);
	const submitButton = screen.getByRole('button', { name: /submit/i });

	fireEvent.change(usernameInput, { target: { value: 'testuser' } });
	fireEvent.change(passwordInput, { target: { value: 'password' } });
	fireEvent.click(submitButton);

	expect(usernameInput.value).toBe('testuser');
	expect(passwordInput.value).toBe('password');
});