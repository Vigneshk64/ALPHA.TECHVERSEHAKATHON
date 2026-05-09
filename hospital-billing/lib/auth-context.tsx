'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth!, async (authUser) => {
      try {
        if (authUser) {
          const userDocRef = doc(db!, 'users', authUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              uid: authUser.uid,
              email: authUser.email || '',
              name: userData.name || authUser.displayName || '',
              role: userData.role,
              createdAt: userData.createdAt || Date.now(),
            });
            setNeedsProfileSetup(false);
          } else {
            setUser({
              uid: authUser.uid,
              email: authUser.email || '',
              name: authUser.displayName || '',
              createdAt: Date.now(),
            });
            setNeedsProfileSetup(true);
          }
        } else {
          setUser(null);
          setNeedsProfileSetup(false);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth error');
        setUser(null);
        setNeedsProfileSetup(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth!);
      setUser(null);
      setNeedsProfileSetup(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, needsProfileSetup, loading, error, logout }}>
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
