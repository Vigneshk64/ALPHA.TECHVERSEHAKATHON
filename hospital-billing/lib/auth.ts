import { auth, db } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserProfile, UserRole } from '@/lib/types';

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

export async function createUserProfile(uid: string, email: string, name: string, role: UserRole) {
  const userDocRef = doc(db!, 'users', uid);
  const userData = {
    email,
    name,
    role,
    createdAt: Date.now(),
  };

  // Special role assignment for dasvignesh797@gmail.com
  if (email === 'dasvignesh797@gmail.com') {
    userData.role = 'billing';
  }

  await setDoc(userDocRef, userData);
}

export async function verifyPatient(patientId: string): Promise<{ exists: boolean; name?: string }> {
  try {
    const userDoc = await getDoc(doc(db!, 'users', patientId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return { exists: true, name: data.name };
    }
    return { exists: false };
  } catch (error) {
    console.error('Error verifying patient:', error);
    return { exists: false };
  }
}
