/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

export const listAllUsersFromDb = async (): Promise<UserProfile[]> => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const results: UserProfile[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as UserProfile);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
};

export const filterAndSortLeaderboard = (users: UserProfile[]): UserProfile[] => {
  return [...users]
    .filter((u) => u.isActive)
    .sort((a, b) => b.coins - a.coins);
};
