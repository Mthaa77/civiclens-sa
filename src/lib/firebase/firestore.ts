'use client';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type DocumentData,
  type DocumentReference,
  type CollectionReference,
  type QueryConstraint,
  type Unsubscribe,
  type DocumentSnapshot,
  type QuerySnapshot,
} from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from './client';

// ─── Type helpers ─────────────────────────────────────────────────────────────

export interface FirestoreDocument {
  id?: string;
  [key: string]: unknown;
}

type WithId<T> = T & { id: string };

// ─── Document reference helper ────────────────────────────────────────────────

function getDocRef<T extends DocumentData>(
  collectionName: string,
  documentId: string
): DocumentReference<T> {
  if (!firestore) throw new Error('Firestore is not initialized');
  return doc(firestore, collectionName, documentId) as DocumentReference<T>;
}

function getCollectionRef<T extends DocumentData>(
  collectionName: string
): CollectionReference<T> {
  if (!firestore) throw new Error('Firestore is not initialized');
  return collection(firestore, collectionName) as CollectionReference<T>;
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

/**
 * Get a single document by ID.
 */
export async function getDocument<T extends FirestoreDocument>(
  collectionName: string,
  documentId: string
): Promise<WithId<T> | null> {
  if (!isFirebaseConfigured() || !firestore) {
    console.warn('Firestore is not configured. Returning null.');
    return null;
  }

  try {
    const snapshot: DocumentSnapshot<T> = await getDoc(
      getDocRef<T>(collectionName, documentId)
    );
    if (!snapshot.exists()) return null;
    return { ...snapshot.data(), id: snapshot.id } as WithId<T>;
  } catch (err) {
    console.error(`Failed to get document ${collectionName}/${documentId}:`, err);
    return null;
  }
}

/**
 * Create or overwrite a document.
 */
export async function setDocument<T extends FirestoreDocument>(
  collectionName: string,
  documentId: string,
  data: T,
  merge: boolean = false
): Promise<boolean> {
  if (!isFirebaseConfigured() || !firestore) {
    console.warn('Firestore is not configured. Operation skipped.');
    return false;
  }

  try {
    const { id: _, ...dataWithoutId } = data;
    await setDoc(getDocRef(collectionName, documentId), dataWithoutId, { merge });
    return true;
  } catch (err) {
    console.error(`Failed to set document ${collectionName}/${documentId}:`, err);
    return false;
  }
}

/**
 * Update an existing document (partial update).
 */
export async function updateDocument<T extends FirestoreDocument>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<boolean> {
  if (!isFirebaseConfigured() || !firestore) {
    console.warn('Firestore is not configured. Operation skipped.');
    return false;
  }

  try {
    await updateDoc(getDocRef(collectionName, documentId), data as DocumentData);
    return true;
  } catch (err) {
    console.error(`Failed to update document ${collectionName}/${documentId}:`, err);
    return false;
  }
}

/**
 * Delete a document by ID.
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<boolean> {
  if (!isFirebaseConfigured() || !firestore) {
    console.warn('Firestore is not configured. Operation skipped.');
    return false;
  }

  try {
    await deleteDoc(getDocRef(collectionName, documentId));
    return true;
  } catch (err) {
    console.error(`Failed to delete document ${collectionName}/${documentId}:`, err);
    return false;
  }
}

// ─── Collection / Query Operations ────────────────────────────────────────────

/**
 * Get all documents in a collection.
 */
export async function getCollection<T extends FirestoreDocument>(
  collectionName: string
): Promise<WithId<T>[]> {
  if (!isFirebaseConfigured() || !firestore) {
    console.warn('Firestore is not configured. Returning empty array.');
    return [];
  }

  try {
    const snapshot: QuerySnapshot<T> = await getDocs(
      getCollectionRef<T>(collectionName)
    );
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as WithId<T>));
  } catch (err) {
    console.error(`Failed to get collection ${collectionName}:`, err);
    return [];
  }
}

/**
 * Query a collection with flexible constraints.
 */
export async function queryCollection<T extends FirestoreDocument>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<WithId<T>[]> {
  if (!isFirebaseConfigured() || !firestore) {
    console.warn('Firestore is not configured. Returning empty array.');
    return [];
  }

  try {
    const q = query(getCollectionRef<T>(collectionName), ...constraints);
    const snapshot: QuerySnapshot<T> = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as WithId<T>));
  } catch (err) {
    console.error(`Failed to query collection ${collectionName}:`, err);
    return [];
  }
}

// ─── Real-time listener ──────────────────────────────────────────────────────

/**
 * Subscribe to real-time updates on a collection.
 * Returns an unsubscribe function.
 */
export function subscribeToCollection<T extends FirestoreDocument>(
  collectionName: string,
  callback: (documents: WithId<T>[]) => void,
  constraints: QueryConstraint[] = []
): Unsubscribe {
  if (!isFirebaseConfigured() || !firestore) {
    console.warn('Firestore is not configured. No listener attached.');
    callback([]);
    return () => {};
  }

  try {
    const q = query(getCollectionRef<T>(collectionName), ...constraints);
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(
        (d) => ({ ...d.data(), id: d.id }) as WithId<T>
      );
      callback(docs);
    });
  } catch (err) {
    console.error(`Failed to subscribe to collection ${collectionName}:`, err);
    callback([]);
    return () => {};
  }
}

// ─── Re-export Firestore utilities for convenience ────────────────────────────

export { where, orderBy, limit };
