import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Shortcut: const { user, login, logout } = useAuth();
export default function useAuth() {
  return useContext(AuthContext);
}
