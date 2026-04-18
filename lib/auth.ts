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

/**
 * Persist a paid Stripe session to the signed-in user's Firestore doc.
 * Called after the client gets a verified token from /api/unlock or /api/verify-purchase.
 */
export async function syncPremiumToFirestore(stripeSessionId: string): Promise<void> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth?.currentUser || !db) return;

  const ref = doc(db, "users", auth.currentUser.uid);
  await setDoc(
    ref,
    {
      email: auth.currentUser.email,
      premiumUnlockedAt: new Date().toISOString(),
      stripeSessionId,
    },
    { merge: true }
  );
}

/**
 * Check the signed-in user's Firestore doc for premium and restore it locally.
 * Requests a signed token from /api/verify-purchase so the local isPremium()
 * check passes (bare flags are rejected — we need a proper HMAC token).
 */
export async function checkFirestorePremium(): Promise<boolean> {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth?.currentUser || !db) return false;

  const ref = doc(db, "users", auth.currentUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists() || !snap.data()?.premiumUnlockedAt) return false;

  const email = auth.currentUser.email;
  if (!email) return false;

  try {
    const res = await fetch("/api/verify-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.verified && data.token) {
      unlockPremiumWithToken(data.token);
      return true;
    }
  } catch {
    // Network or server error — leave local state alone
  }
  return false;
}
