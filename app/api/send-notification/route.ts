import { NextResponse } from 'next/server';
import { adminAuth } from '../../../config/firebase-admin';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const { notification, tokens } = await request.json();

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ error: 'Aucun token valide' }, { status: 400 });
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(message);

    return NextResponse.json({
      success: true,
      results: response.responses,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
