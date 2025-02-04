import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from './config/firebase-admin';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Rediriger vers la page de connexion si aucun token n'est présent
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Vérifier le token avec Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Vérifier si l'utilisateur a le rôle admin
    const user = await adminAuth.getUser(decodedToken.uid);
    const isAdmin = user.customClaims?.admin === true;

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Ajouter les informations utilisateur à l'en-tête de la requête
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user', JSON.stringify(decodedToken));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Token invalide ou expiré
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/users/:path*',
    '/activities/:path*',
    '/channels/:path*',
  ],
};
