import { NextResponse } from 'next/server';
import { adminAuth } from '../../../config/firebase-admin';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const user = await adminAuth.getUser(decodedToken.uid);

    if (!user.customClaims?.admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }
}
