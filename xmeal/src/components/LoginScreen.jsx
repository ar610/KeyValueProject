// src/components/LoginScreen.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { APP_NAME, ADMIN_EMAIL } from '../utils/constants'; // Assuming you have APP_NAME and ADMIN_EMAIL in constants
import { ScreenWrapper, CardWrapper } from './common/Wrappers';

const LoginScreen = ({ setCurrentView, setError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth(); // Destructure login and register from useAuth

  const handleLoginSubmit = async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.email === ADMIN_EMAIL) { // Use ADMIN_EMAIL constant
        setCurrentView('admin');
      } else {
        setCurrentView('booking');
      }
    } catch (err) {
      console.error("Login Error:", err.message); // Log the actual error message
      setError('Invalid email or password. Please try again.'); // User-friendly error
    } finally {
      setLoading(false);
    }
  };

  // Optional: You can add a registration handler if you fully implement it
  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
        // Example: prompt for more user data if needed
        const username = prompt("Enter your username:");
        if (!username) {
            setError("Username is required for registration.");
            setLoading(false);
            return;
        }
        await register(email, password, { username }); // Pass additional user data
        setCurrentView('booking'); // Redirect to booking after successful registration
    } catch (err) {
        console.error("Registration Error:", err.message);
        setError('Failed to register. Email might already be in use or password too weak.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="flex items-center justify-center p-4">
      <CardWrapper className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">{APP_NAME || 'XMeal'}</h1> {/* Use APP_NAME from constants */}
        <p className="text-center text-gray-600 mb-8">Digital Canteen Solution for St. Xavier's College</p>

        {/* Error display - The parent App.js also has a global error,
            but this can be specific for login form validation. */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="email" // Helps browsers suggest emails
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="current-password" // Helps browsers suggest passwords
          />
        </div>

        <button
          onClick={handleLoginSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="mb-2"><strong>Demo Accounts (for testing purposes):</strong></p>
          <p><strong>Student:</strong> email: <code className="font-mono bg-gray-100 p-1 rounded">student@xmeal.com</code> | password: <code className="font-mono bg-gray-100 p-1 rounded">password</code></p>
          <p><strong>Admin:</strong> email: <code className="font-mono bg-gray-100 p-1 rounded">admin@xmeal.com</code> | password: <code className="font-mono bg-gray-100 p-1 rounded">password</code></p>
          <p className="mt-3 text-xs text-gray-400">
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Forgot Password feature is coming soon!'); }} className="text-blue-500 hover:underline">Forgot Password?</a>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Don't have an account?
            {/* You can uncomment and modify this button/link to handle registration */}
            {/* <button onClick={handleRegister} disabled={loading} className="text-blue-500 hover:underline disabled:opacity-50">Register Here</button> */}
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Registration feature is coming soon! For now, use demo accounts.'); }} className="text-blue-500 hover:underline">Register Here</a>
          </p>
        </div>
      </CardWrapper>
    </ScreenWrapper>
  );
};

export default LoginScreen;