import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { unlockPremiumWithToken } from "@/lib/premium";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): Unsubscribe | null {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth();
  return auth?.currentUser ?? null;
}

export async function syncPremiumToFirestore(stripeSessionId: string): Promise<void> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth?.currentUser || !db) return;

  const ref = doc(db, "users", auth.currentUser.uid);
  await setDoc(ref, {
    premiumUnlockedAt: new Date().toISOString(),
    stripeSessionId,
    createdAt: new Date().toISOString(),
  }, { merge: true });
}

export async function checkFirestorePremium(): Promise<boolean> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth?.currentUser || !db) return false;

  const ref = doc(db, "users", auth.currentUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data()?.premiumUnlockedAt) {
    const sid = snap.data()?.stripeSessionId;
    if (sid) {
      // Build a token matching the expected format: base64(payload).signature
      const payload = btoa(`premium:${sid}`);
      unlockPremiumWithToken(`${payload}.firestore`);
    }
    return true;
  }
  return false;
}
