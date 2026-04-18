import React, { createContext, useContext, useEffect, useState } from 'react';
import { localAuth, type LocalUser } from '../services/localAuth';

interface AuthContextType {
  currentUser: LocalUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = localAuth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    await localAuth.createUserWithEmailAndPassword(email, password);
  };

  const signIn = async (email: string, password: string) => {
    await localAuth.signInWithEmailAndPassword(email, password);
  };

  const signInWithGoogle = async () => {
    await localAuth.signInWithGoogle();
  };

  const logout = async () => {
    await localAuth.signOut();
  };

  const resetPassword = async (email: string) => {
    await localAuth.sendPasswordResetEmail(email);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, signUp, signIn, signInWithGoogle, logout, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
