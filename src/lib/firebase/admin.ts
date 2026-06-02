import * as admin from 'firebase-admin';

/** Check if Firebase Admin SDK config is available */
function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

let adminApp: admin.app.App | null = null;
let adminAuth: admin.auth.Auth | null = null;
let adminFirestore: admin.firestore.Firestore | null = null;

if (isFirebaseAdminConfigured()) {
  try {
    adminApp =
      admin.apps.length === 0
        ? admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(
                /\\n/g,
                '\n'
              ),
            }),
            projectId: process.env.FIREBASE_PROJECT_ID,
          })
        : admin.apps[0];

    adminAuth = adminApp.auth();
    adminFirestore = adminApp.firestore();
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK:', err);
  }
}

export { adminApp, adminAuth, adminFirestore, isFirebaseAdminConfigured };

/**
 * Verify a Firebase ID token and return the decoded token.
 * Returns null if Firebase Admin is not configured or verification fails.
 */
export async function verifyIdToken(
  idToken: string
): Promise<admin.auth.DecodedIdToken | null> {
  if (!isFirebaseAdminConfigured() || !adminAuth) {
    console.warn('Firebase Admin is not configured. Token verification skipped.');
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (err) {
    console.error('Failed to verify ID token:', err);
    return null;
  }
}

/**
 * Create a custom Firebase token for a given UID.
 * Returns null if Firebase Admin is not configured or token creation fails.
 */
export async function createCustomToken(
  uid: string,
  additionalClaims?: Record<string, unknown>
): Promise<string | null> {
  if (!isFirebaseAdminConfigured() || !adminAuth) {
    console.warn('Firebase Admin is not configured. Custom token creation skipped.');
    return null;
  }

  try {
    const customToken = await adminAuth.createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (err) {
    console.error('Failed to create custom token:', err);
    return null;
  }
}
