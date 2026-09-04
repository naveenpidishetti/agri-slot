import React, { createContext, useContext, useState } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  loginWithGoogle: () => void;
  logout: () => void;
}

const DEFAULT_FARMER: User = {
  id: 'usr-farmer-01',
  name: 'Ramesh Reddy',
  mobile: '9876543210',
  role: 'FARMER',
  language: 'en',
  village: 'Shamshabad',
  district: 'Ranga Reddy',
  state: 'Telangana',
  farmer_id: 'TS-RR-2024-8841',
  land_area_acres: 6.5
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('agrislot_user');
    return saved ? JSON.parse(saved) : DEFAULT_FARMER;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('agrislot_token') || 'demo_jwt_token_sample';
  });

  const login = (authToken: string, userData: User) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('agrislot_token', authToken);
    localStorage.setItem('agrislot_user', JSON.stringify(userData));
  };

  const loginWithGoogle = () => {
    const googleUser: User = {
      id: `usr-google-${Date.now()}`,
      name: 'Farmer (Google Account)',
      mobile: '9876543210',
      role: 'FARMER',
      language: 'en',
      village: 'Shamshabad',
      district: 'Ranga Reddy',
      state: 'Telangana',
      farmer_id: 'TS-GOOG-8841',
      land_area_acres: 5.0
    };
    const googleToken = `jwt-google-${Date.now()}`;
    login(googleToken, googleUser);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agrislot_token');
    localStorage.removeItem('agrislot_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
