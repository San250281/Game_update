/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { WalletTransaction, UserProfile } from '../types';

export const saveAdWatchInDb = async (
  userId: string,
  txId: string,
  tx: WalletTransaction,
  coins: number,
  adsWatchedToday: number,
  lastAdWatchedAt: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const txRef = doc(collection(db, 'transactions'), txId);
    const userRef = doc(db, 'users', userId);

    batch.set(txRef, tx);
    batch.update(userRef, {
      coins,
      adsWatchedToday,
      lastAdWatchedAt
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `transactions/${txId}`);
  }
};

export const checkAdWatchEligibility = (
  user: UserProfile,
  todayStr: string
): { eligible: boolean; message?: string; cleanAdsWatchedToday: number } => {
  let cleanAdsWatchedToday = user.adsWatchedToday || 0;
  const lastAdWatchedAt = user.lastAdWatchedAt || '';

  // 1. Double check delay since last ad (5 seconds required)
  if (lastAdWatchedAt) {
    const elapsed = Date.now() - new Date(lastAdWatchedAt).getTime();
    if (elapsed < 5050) {
      const remainingDelay = Math.ceil((5050 - elapsed) / 1000);
      return {
        eligible: false,
        message: `Please wait ${remainingDelay} second(s) between ads as required by Monetag.`,
        cleanAdsWatchedToday
      };
    }
  }

  // 2. Clear daily ticker on day transition
  if (lastAdWatchedAt && lastAdWatchedAt.split('T')[0] !== todayStr) {
    cleanAdsWatchedToday = 0;
  }

  // 3. Max active watches (20 plays cap)
  if (cleanAdsWatchedToday >= 20) {
    return {
      eligible: false,
      message: 'Daily Monetag limit reached! You can watch a maximum of 20 ads per day.',
      cleanAdsWatchedToday
    };
  }

  return { eligible: true, cleanAdsWatchedToday };
};
