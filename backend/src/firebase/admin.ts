import admin from 'firebase-admin';

function getApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase credentials are not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.');
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export function getFirebaseAuth() {
  return getApp().auth();
}

export function getFirestore() {
  return getApp().firestore();
}

export function getMessaging() {
  return getApp().messaging();
}

export async function verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  return getFirebaseAuth().verifyIdToken(idToken, true);
}

export async function getFirebaseUser(uid: string): Promise<admin.auth.UserRecord> {
  return getFirebaseAuth().getUser(uid);
}
