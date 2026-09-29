import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Workspace Gmail scopes
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');

let cachedAccessToken: string | null = null;

export const signInWithGoogle = async (): Promise<{
  firebaseUser: FirebaseUser;
  accessToken: string;
}> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token.');
    }
    cachedAccessToken = credential.accessToken;
    return {
      firebaseUser: result.user,
      accessToken: cachedAccessToken,
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  try {
    await auth.signOut();
  } catch {}
  cachedAccessToken = null;
};
