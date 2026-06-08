/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously as firebaseSignInAnonymously,
  signInWithPopup as firebaseSignInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

export const getFriendlyNameFromEmail = (emailStr: string): string => {
  if (!emailStr) return 'Gamer';
  const prefix = emailStr.split('@')[0];
  return prefix
    .split(/[\._\-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const loginUserWithEmail = async (email: string, password?: string) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password || 'defaultSecurePasscode123';
  return await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
};

export const registerUserWithEmail = async (email: string, password?: string) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password || 'defaultSecurePasscode123';
  return await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
};

export const loginUserAnonymously = async () => {
  return await firebaseSignInAnonymously(auth);
};

export const loginUserWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return await firebaseSignInWithPopup(auth, provider);
};

export const signOutUser = async () => {
  return await firebaseSignOut(auth);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
};

export const saveUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};

export const updateUserLastLogin = async (uid: string, lastLogin: string) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { lastLogin });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
};
