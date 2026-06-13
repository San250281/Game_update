/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

// Strict Reward Economy Constants
export const DAILY_AD_LIMIT = 40;
export const AD_REWARD = 10;
export const AD_WAIT_TIME = 10;
export const COOLDOWN_SECONDS = 5;

export const saveAdWatchInDb = async (
  userId: string,
  txId: string,
  txPayload: any,
  coins: number,
  adsWatchedToday: number,
  lastAdWatchedAt: string
): Promise<void> => {
  console.log("saveAdWatchInDb starting", {
    userId,
    txId,
    txPayload,
    coins,
    adsWatchedToday,
    lastAdWatchedAt,
    authUid: auth?.currentUser?.uid,
    authEmail: auth?.currentUser?.email
  });
  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      const userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists()) {
        throw new Error('User profile does not exist.');
      }

      const userData = userSnapshot.data();
      let currentAdsWatchedToday = userData.adsWatchedToday || 0;
      const dbLastAdWatchedAt = userData.lastAdWatchedAt || '';
      const todayStr = new Date().toISOString().split('T')[0];

      // Reset daily counter on database level if day transition occurred
      if (dbLastAdWatchedAt && dbLastAdWatchedAt.split('T')[0] !== todayStr) {
        currentAdsWatchedToday = 0;
      }

      // Anti-abuse limit check in Firestore
      if (currentAdsWatchedToday >= DAILY_AD_LIMIT) {
        throw new Error('Daily Ad Limit Reached');
      }

      // Generate the fresh transaction reference
      const txRef = doc(collection(db, 'transactions'), txId);

      const currentCoins = userData.coins || 0;
      const verifiedNextCoins = currentCoins + AD_REWARD;

      // Add transaction history with Server Timestamp formatted as an ISO String
      transaction.set(txRef, {
        ...txPayload,
        timestamp: new Date().toISOString()
      });

      // Update User balance, ad counts, and last watch time
      transaction.update(userRef, {
        coins: verifiedNextCoins,
        adsWatchedToday: currentAdsWatchedToday + 1,
        lastAdWatchedAt
      });
    });
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
    if (elapsed < COOLDOWN_SECONDS * 1000) {
      const remainingDelay = Math.ceil((COOLDOWN_SECONDS * 1000 - elapsed) / 1000);
      return {
        eligible: false,
        message: `Please wait ${remainingDelay} second(s) between ads.`,
        cleanAdsWatchedToday
      };
    }
  }

  // 2. Clear daily ticker on day transition
  if (lastAdWatchedAt && lastAdWatchedAt.split('T')[0] !== todayStr) {
    cleanAdsWatchedToday = 0;
  }

  // 3. Max active watches (40 plays cap)
  if (cleanAdsWatchedToday >= DAILY_AD_LIMIT) {
    return {
      eligible: false,
      message: `Daily Sponsor limit reached! You can watch a maximum of ${DAILY_AD_LIMIT} ads per day.`,
      cleanAdsWatchedToday
    };
  }

  return { eligible: true, cleanAdsWatchedToday };
};
