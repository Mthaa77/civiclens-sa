import { NextResponse } from 'next/server';
import {
  verifyIdToken,
  adminFirestore,
  isFirebaseAdminConfigured,
} from '@/lib/firebase/admin';
import { db } from '@/lib/db';

/**
 * GET /api/auth/user
 * Get the current user profile.
 * Requires Authorization header with Bearer token.
 */
export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Firebase Admin is not configured. Authentication is unavailable.' },
      { status: 503 }
    );
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header.' },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await verifyIdToken(idToken);

    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token.' },
        { status: 401 }
      );
    }

    const { uid } = decodedToken;

    // Try Firestore first
    if (adminFirestore) {
      const userDoc = await adminFirestore.collection('users').doc(uid).get();
      if (userDoc.exists) {
        return NextResponse.json(
          { uid, ...userDoc.data() },
          { status: 200 }
        );
      }
    }

    // Fallback to Prisma/SQLite
    const prismaUser = await db.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (prismaUser) {
      return NextResponse.json(prismaUser, { status: 200 });
    }

    return NextResponse.json(
      { error: 'User profile not found.' },
      { status: 404 }
    );
  } catch (err) {
    console.error('Get user error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve user profile.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/user
 * Update the current user profile.
 * Requires Authorization header with Bearer token.
 */
export async function PUT(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Firebase Admin is not configured. Authentication is unavailable.' },
      { status: 503 }
    );
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header.' },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await verifyIdToken(idToken);

    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token.' },
        { status: 401 }
      );
    }

    const { uid } = decodedToken;
    const body = await request.json();
    const { displayName, role, organisation, phone } = body as {
      displayName?: string;
      role?: string;
      organisation?: string;
      phone?: string;
    };

    // Update in Firestore
    if (adminFirestore) {
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (displayName !== undefined) updateData.displayName = displayName;
      if (role !== undefined) updateData.role = role;
      if (organisation !== undefined) updateData.organisation = organisation;
      if (phone !== undefined) updateData.phone = phone;

      await adminFirestore.collection('users').doc(uid).set(updateData, {
        merge: true,
      });
    }

    // Update in Prisma/SQLite
    const prismaUpdateData: Record<string, unknown> = {};
    if (displayName !== undefined) prismaUpdateData.displayName = displayName;
    if (role !== undefined) prismaUpdateData.role = role;
    if (organisation !== undefined) prismaUpdateData.organisation = organisation;
    if (phone !== undefined) prismaUpdateData.phone = phone;

    const updatedUser = await db.user.upsert({
      where: { firebaseUid: uid },
      update: prismaUpdateData,
      create: {
        firebaseUid: uid,
        email: decodedToken.email ?? '',
        displayName: displayName ?? decodedToken.name ?? '',
        role: role ?? 'viewer',
        organisation,
        phone,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (err) {
    console.error('Update user error:', err);
    return NextResponse.json(
      { error: 'Failed to update user profile.' },
      { status: 500 }
    );
  }
}
