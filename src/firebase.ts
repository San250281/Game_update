/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import rawConfig from './firebase-applet-config.json';

// We fetch the config dynamically as an optional module
let firebaseConfig: any = null;
let isFirebaseLive = false;

if (rawConfig && rawConfig.apiKey && rawConfig.apiKey !== 'MY_GEMINI_API_KEY' && !rawConfig.apiKey.includes('placeholder')) {
  firebaseConfig = rawConfig;
  isFirebaseLive = true;
}


let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;

if (isFirebaseLive && firebaseConfig) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
    authInstance = getAuth(appInstance);
  } catch (error) {
    console.warn('Failed to initialize live Firebase, sliding into Sandbox Mode:', error);
    isFirebaseLive = false;
  }
}

export { isFirebaseLive };
export const db = dbInstance;
export const auth = authInstance;

// Helper to support error throwing according to standard Firebase Integration guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid || 'anonymous_sandbox_uid',
      email: authInstance?.currentUser?.email || 'guest@sandbox.dev',
      emailVerified: authInstance?.currentUser?.emailVerified || false,
      isAnonymous: authInstance?.currentUser?.isAnonymous || false,
      tenantId: authInstance?.currentUser?.tenantId || null,
      providerInfo: authInstance?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
