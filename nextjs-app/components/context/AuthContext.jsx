import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import localforage from 'localforage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  const loadAuth = async () => {
    try {
      const savedToken = await localforage.getItem('token');
      const savedUser = await localforage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } else {
        // Auto-login with mock user
        const mockToken = 'mock-token-' + Date.now();
        const mockUser = {
          id: 1,
          username: 'Guest User',
          email: 'guest@example.com'
        };

        setToken(mockToken);
        setUser(mockUser);
        await localforage.setItem('token', mockToken);
        await localforage.setItem('user', mockUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data;

    setToken(newToken);
    setUser(newUser);

    await localforage.setItem('token', newToken);
    await localforage.setItem('user', newUser);

    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    return newUser;
  };

  const register = async (username, email, password) => {
    await api.post('/api/auth/register', { username, email, password });
    return login(email, password);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);

    await localforage.removeItem('token');
    await localforage.removeItem('user');

    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
