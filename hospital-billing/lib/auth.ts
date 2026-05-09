import { auth, db } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithPopup(auth!, googleProvider);
}

export async function signOutUser() {
  return signOut(auth!);
}

export function onAuthStateChangedListener(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth!, callback);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db!, 'users', uid));
  if (!userDoc.exists()) {
    return null;
  }

  return {
    uid: userDoc.id,
    ...(userDoc.data() as Omit<UserProfile, 'uid'>),
  };
}

export async function createUserProfile(
  uid: string,
  email: string,
  name: string,
  role: UserProfile['role']
): Promise<UserProfile> {
  const userProfile: Omit<UserProfile, 'uid'> = {
    email,
    name,
    role,
  };

  await setDoc(doc(db!, 'users', uid), userProfile);

  return { uid, ...userProfile };
}
