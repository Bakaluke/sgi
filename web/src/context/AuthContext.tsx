import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import api from '../api/axios';
import type { User, AuthContextType, SettingsData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/user')
        .then(response => {
          setUser(response.data);
          setSettings(response.data.settings);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          setUser(null);
          setSettings(null);
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = (userData: User, token: string) => {
    localStorage.setItem('authToken', token);
    setUser(userData);
    setSettings(userData.settings || null);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setSettings(null);
    setToken(null);
  };

  const can = (permissionName: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permissionName) || false;
  };

  return (
    <AuthContext.Provider value={{ user, settings, token, isLoading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};