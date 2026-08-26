import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfigJson from "../firebase-applet-config.json";

export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId || undefined
};

// Initialize Firebase App instance
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase Authentication & Firestore instances
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || undefined);

// Helper function to sign in with Google (supports popup with redirect fallback)
export async function signInWithGoogle(): Promise<{
  firebaseUser: FirebaseUser;
  token: string;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    return { firebaseUser: result.user, token };
  } catch (error: any) {
    // If popup is blocked (e.g. mobile Safari / Chrome in-app), fallback to redirect
    if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr) {
        throw redirectErr;
      }
    }
    throw error;
  }
}

// Helper to log out
export async function logOutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

export { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged 
};
