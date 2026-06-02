import { NextResponse } from 'next/server';
import {
  verifyIdToken,
  isFirebaseAdminConfigured,
} from '@/lib/firebase/admin';

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 5 * 1000; // 5 days in ms

/**
 * POST /api/auth/session
 * Create a session cookie from a Firebase ID token.
 */
export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Firebase Admin is not configured. Authentication is unavailable.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { idToken } = body as { idToken?: string };

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing idToken in request body.' },
        { status: 400 }
      );
    }

    const decodedToken = await verifyIdToken(idToken);

    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid ID token.' },
        { status: 401 }
      );
    }

    // Create session cookie using Firebase Admin
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth();
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_COOKIE_MAX_AGE,
    });

    const response = NextResponse.json(
      { uid: decodedToken.uid, email: decodedToken.email },
      { status: 200 }
    );

    response.cookies.set('session', sessionCookie, {
      maxAge: SESSION_COOKIE_MAX_AGE / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.error('Session creation error:', err);
    return NextResponse.json(
      { error: 'Failed to create session.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Clear the session cookie (sign out).
 */
export async function DELETE() {
  const response = NextResponse.json(
    { message: 'Session cleared.' },
    { status: 200 }
  );

  response.cookies.set('session', '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  return response;
}
