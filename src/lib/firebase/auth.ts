'use client';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './client';

export interface AuthResult {
  user: User | null;
  error: string | null;
}

/**
 * Sign in with email and password.
 * Returns the authenticated user or an error message.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!isFirebaseConfigured() || !auth) {
    return { user: null, error: 'Firebase is not configured. Please set environment variables.' };
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { user: credential.user, error: null };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Sign in failed. Please try again.';
    return { user: null, error: message };
  }
}

/**
 * Sign up with email and password.
 * Returns the newly created user or an error message.
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!isFirebaseConfigured() || !auth) {
    return { user: null, error: 'Firebase is not configured. Please set environment variables.' };
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: credential.user, error: null };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Sign up failed. Please try again.';
    return { user: null, error: message };
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<{ error: string | null }> {
  if (!isFirebaseConfigured() || !auth) {
    return { error: 'Firebase is not configured.' };
  }

  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Sign out failed.';
    return { error: message };
  }
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void
): Unsubscribe {
  if (!isFirebaseConfigured() || !auth) {
    // Immediately call with null if Firebase is not configured
    callback(null);
    return () => {};
  }

  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Get the current authenticated user (synchronous).
 */
export function getCurrentUser(): User | null {
  if (!isFirebaseConfigured() || !auth) {
    return null;
  }

  return auth.currentUser;
}
