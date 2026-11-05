// Stores the logged-in user so every page can use it
import { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check the saved token

  // When the app opens, check if a token is saved and get the user
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('refound_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await authService.getMe();
        setUser(me);
      } catch (error) {
        localStorage.removeItem('refound_token'); // token is invalid or expired
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  const login = async (email, password) => {
    const data = await authService.loginUser({ email, password });
    localStorage.setItem('refound_token', data.token);
    setUser(data.user);
  };

  const register = async (formData) => {
    const data = await authService.registerUser(formData);
    localStorage.setItem('refound_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('refound_token');
    setUser(null);
  };

  // Used after the profile is edited
  const updateUser = (newUser) => setUser(newUser);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
