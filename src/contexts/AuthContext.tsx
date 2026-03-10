import React, { createContext, useContext, useState, useEffect } from 'react';
import { playSuccess, playError } from '../utils/audio';

export type UserRole = 'admin' | 'user';

export interface User {
  username: string;
  role: UserRole;
  email?: string;
  googleId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
  getAllUsers: () => any[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Initialize admin and load users
  useEffect(() => {
    // Handle Google OAuth Callback (in popup)
    if (window.location.hash.includes('access_token=')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        .then(res => res.json())
        .then(data => {
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user: data }, '*');
            window.close();
          }
        })
        .catch(err => {
          console.error('Error fetching user info:', err);
          if (window.opener) window.close();
        });
      }
      return; // Stop execution in popup
    }

    // Handle message from popup (in main window)
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const googleUser = event.data.user;
        const users = JSON.parse(localStorage.getItem('app_users') || '[]');
        let foundUser = users.find((u: any) => u.email === googleUser.email);
        
        if (!foundUser) {
          foundUser = { 
            username: googleUser.name, 
            email: googleUser.email, 
            password: 'google-oauth-user', // dummy password
            role: 'user',
            googleId: googleUser.sub
          };
          users.push(foundUser);
          localStorage.setItem('app_users', JSON.stringify(users));
        }
        
        const activeUser = { username: foundUser.username, role: foundUser.role, email: foundUser.email };
        setUser(activeUser);
        localStorage.setItem('active_user', JSON.stringify(activeUser));
        playSuccess();
      }
    };

    window.addEventListener('message', handleMessage);

    const storedUsers = localStorage.getItem('app_users');
    let users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Ensure admin exists with strong password
    const adminIndex = users.findIndex((u: any) => u.username === 'admin');
    const strongAdminPassword = 'K9#m$Vp2@zL!8xQ';
    
    if (adminIndex === -1) {
      users.push({ username: 'admin', password: strongAdminPassword, role: 'admin' });
      localStorage.setItem('app_users', JSON.stringify(users));
    } else if (users[adminIndex].password !== strongAdminPassword) {
      // Update existing admin password to the strong one
      users[adminIndex].password = strongAdminPassword;
      localStorage.setItem('app_users', JSON.stringify(users));
    }

    const activeUser = localStorage.getItem('active_user');
    if (activeUser) {
      setUser(JSON.parse(activeUser));
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const login = (username: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const foundUser = users.find((u: any) => u.username === username && u.password === password);
    
    if (foundUser) {
      const activeUser = { username: foundUser.username, role: foundUser.role, email: foundUser.email };
      setUser(activeUser);
      localStorage.setItem('active_user', JSON.stringify(activeUser));
      playSuccess();
      return true;
    }
    playError();
    return false;
  };

  const register = (username: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    if (users.find((u: any) => u.username === username)) {
      playError();
      return false; // User already exists
    }
    
    const newUser = { username, password, role: 'user' };
    users.push(newUser);
    localStorage.setItem('app_users', JSON.stringify(users));
    
    const activeUser = { username: newUser.username, role: newUser.role as UserRole };
    setUser(activeUser);
    localStorage.setItem('active_user', JSON.stringify(activeUser));
    playSuccess();
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('active_user');
    playSuccess();
  };

  const getAllUsers = () => {
    return JSON.parse(localStorage.getItem('app_users') || '[]');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
