# Task 4-5-6-7: Firebase/GCP Integration — Work Record

**Agent:** Firebase/GCP Integration Agent
**Date:** 2026-03-05
**Status:** COMPLETED

---

## Summary

Set up Firebase/GCP integration for the CivicLens SA project, including client SDK, Admin SDK, auth helpers, Firestore helpers, context provider, API routes, Prisma schema update, and GCP deployment configuration.

---

## Work Completed

### Step 1: Installed Firebase packages
- `firebase@12.14.0` — Client SDK
- `firebase-admin@13.10.0` — Admin SDK for server-side operations

### Step 2: Created Firebase Client Configuration
**File:** `/src/lib/firebase/client.ts`
- Initializes Firebase app with environment variables (7 NEXT_PUBLIC_ vars)
- Exports `app`, `auth`, `firestore`, `storage` instances
- Exports `isFirebaseConfigured()` helper
- Graceful fallback: all instances are `null` when config is missing

### Step 3: Created Firebase Auth Helpers
**File:** `/src/lib/firebase/auth.ts`
- `signInWithEmail(email, password)` → `AuthResult`
- `signUpWithEmail(email, password)` → `AuthResult`
- `signOut()` → `{ error: string | null }`
- `onAuthStateChanged(callback)` → `Unsubscribe`
- `getCurrentUser()` → `User | null`
- All functions handle unconfigured Firebase gracefully

### Step 4: Created Firebase Firestore Helpers
**File:** `/src/lib/firebase/firestore.ts`
- CRUD: `getDocument`, `setDocument`, `updateDocument`, `deleteDocument`
- Query: `getCollection`, `queryCollection` (with QueryConstraint support)
- Real-time: `subscribeToCollection` with Unsubscribe return
- Re-exports: `where`, `orderBy`, `limit` for convenience
- All operations return null/false/empty on missing config

### Step 5: Created Firebase Admin SDK Configuration
**File:** `/src/lib/firebase/admin.ts`
- Initializes Admin SDK with `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Exports `adminApp`, `adminAuth`, `adminFirestore`, `isFirebaseAdminConfigured()`
- `verifyIdToken(idToken)` → `DecodedIdToken | null`
- `createCustomToken(uid, claims?)` → `string | null`
- Graceful fallback with null instances when not configured

### Step 6: Created FirebaseProvider Component
**File:** `/src/components/providers/FirebaseProvider.tsx`
- React context providing: `user`, `loading`, `configured`, `signIn`, `signUp`, `handleSignOut`
- Uses `useSyncExternalStore` to avoid lint violations from setState-in-effect
- Custom external store pattern for Firebase auth state
- Exports `useFirebaseAuth()` hook

### Step 7: Created API Routes for Firebase Auth
**File:** `/src/app/api/auth/session/route.ts`
- POST: Creates session cookie from Firebase ID token (5-day expiry)
- DELETE: Clears session cookie
- Returns 503 when Firebase Admin not configured

**File:** `/src/app/api/auth/user/route.ts`
- GET: Retrieves user profile from Firestore (fallback to Prisma/SQLite)
- PUT: Updates user profile (upsert pattern in both Firestore and Prisma)
- Bearer token auth via Authorization header

### Step 8: Updated Prisma Schema
**File:** `/prisma/schema.prisma`
- Added `User` model with: `firebaseUid` (unique), `email` (unique), `displayName`, `photoURL`, `role`, `organisation`, `phone`, `lastSignInAt`, timestamps
- Added `userId` + `user` relation to `SavedSearch` model
- Ran `bun run db:push` successfully

### Step 9: Created GCP Deployment Configuration
**File:** `/Dockerfile`
- Multi-stage build (deps → builder → runner)
- node:20-alpine base, bun for building
- Standalone Next.js output, non-root user
- Exposes port 3000

**File:** `/cloudbuild.yaml`
- Cloud Build → Cloud Run pipeline
- africa-south1 region, 1Gi memory, 1-10 instances
- Environment variables and secrets for Firebase config

**File:** `/app.yaml`
- App Engine alternative deployment
- nodejs20 runtime, F2 instance class
- Auto-scaling 1-10 instances, secure handlers

**File:** `/.env.example`
- All required/optional env vars documented
- Clear [REQUIRED]/[OPTIONAL] labels

### Step 10: Updated Layout with FirebaseProvider
**File:** `/src/app/layout.tsx`
- Added `FirebaseProvider` import
- Wrapped `QueryClientProvider` inside `FirebaseProvider`
- Provider hierarchy: ThemeProvider → FirebaseProvider → QueryClientProvider

### Step 11: Lint Check
- Ran `bun run lint` — passes with 0 errors
- Fixed initial lint error: replaced useState+useEffect pattern with useSyncExternalStore in FirebaseProvider
- Dev server compiles successfully (GET / 200)

---

## Architecture Notes

- **Client SDK** (`firebase`): Used in browser components with `'use client'` directive
- **Admin SDK** (`firebase-admin`): Used in server-side API routes only (no `'use client'`)
- **Dual storage**: User profiles stored in both Firestore (real-time) and Prisma/SQLite (relational)
- **Graceful degradation**: All Firebase features return safe defaults when not configured
- **Session management**: Server-side session cookies via Firebase Admin for API route auth
