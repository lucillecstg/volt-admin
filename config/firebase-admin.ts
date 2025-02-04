import * as admin from 'firebase-admin';
import type { FirebaseAdminConfig } from '../types/firebase';

if (!admin.apps.length) {
  try {
    const config: FirebaseAdminConfig = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY
    };

    admin.initializeApp({
      credential: admin.credential.cert(config as admin.ServiceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
