'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  useMemo,
  type ReactNode,
} from 'react';
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  onAuthStateChanged,
  type AuthResult,
} from '@/lib/firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import type { User } from 'firebase/auth';

interface FirebaseContextValue {
  /** Current authenticated Firebase user (null if not signed in) */
  user: User | null;
  /** Whether auth state is still loading */
  loading: boolean;
  /** Whether Firebase is properly configured */
  configured: boolean;
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<AuthResult>;
  /** Sign up with email and password */
  signUp: (email: string, password: string) => Promise<AuthResult>;
  /** Sign out the current user */
  handleSignOut: () => Promise<{ error: string | null }>;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const configured = isFirebaseConfigured();
  // If Firebase is not configured, no loading state needed
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) return;

    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [configured]);

  const handleSignIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      return signInWithEmail(email, password);
    },
    []
  );

  const handleSignUp = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      return signUpWithEmail(email, password);
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    return signOut();
  }, []);

  const value = useMemo<FirebaseContextValue>(
    () => ({
      user,
      loading,
      configured,
      signIn: handleSignIn,
      signUp: handleSignUp,
      handleSignOut,
    }),
    [user, loading, configured, handleSignIn, handleSignUp, handleSignOut]
  );

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

/**
 * Hook to access Firebase auth state and methods.
 * Must be used within a FirebaseProvider.
 */
export function useFirebaseAuth(): FirebaseContextValue {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseProvider');
  }
  return context;
}
