// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, logoutUser, onAuthChange, registerUser } from '../services/firebaseService';
import { ADMIN_EMAIL } from '../utils/constants'; // Assuming constants.js holds ADMIN_EMAIL

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // To check initial auth state

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setLoadingUser(true); // Indicate login in progress
      const userCredential = await loginUser(email, password);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("AuthContext Login Error:", error);
      throw error; // Re-throw to be caught by UI components
    } finally {
      setLoadingUser(false);
    }
  };

  const register = async (email, password, userData) => {
    try {
      setLoadingUser(true);
      const userCredential = await registerUser(email, password, userData);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("AuthContext Register Error:", error);
      throw error;
    } finally {
      setLoadingUser(false);
    }
  };


  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error("AuthContext Logout Error:", error);
    }
  };

  const isAdmin = user && user.email === ADMIN_EMAIL; // Helper to check admin status

  return (
    <AuthContext.Provider value={{ user, loadingUser, login, logout, register, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);