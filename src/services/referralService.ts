/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ReferralRecord, WalletTransaction } from '../types';

export const listReferralsFromDb = async (uid: string): Promise<ReferralRecord[]> => {
  try {
    const q = query(
      collection(db, 'referrals'),
      where('referrerUid', '==', uid)
    );
    const snap = await getDocs(q);
    const results: ReferralRecord[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as ReferralRecord);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `referrals?referrerUid=${uid}`);
    return [];
  }
};

export const applyReferralInDb = async (
  referralRecord: ReferralRecord,
  inviteeUid: string,
  referrerUid: string,
  inviteeCoins: number,
  referrerCoins: number,
  inviteeTx: WalletTransaction,
  referrerTx: WalletTransaction
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Save the main referral record
    const refDoc = doc(collection(db, 'referrals'), referralRecord.referralId);
    batch.set(refDoc, referralRecord);

    // Save transactions
    const inviteeTxRef = doc(collection(db, 'transactions'), inviteeTx.transactionId);
    const referrerTxRef = doc(collection(db, 'transactions'), referrerTx.transactionId);
    batch.set(inviteeTxRef, inviteeTx);
    batch.set(referrerTxRef, referrerTx);

    // Update user documents with newer coins and referred relationship
    const inviteeUserRef = doc(db, 'users', inviteeUid);
    const referrerUserRef = doc(db, 'users', referrerUid);
    
    batch.update(inviteeUserRef, {
      coins: inviteeCoins,
      referredBy: referrerUid
    });
    batch.update(referrerUserRef, {
      coins: referrerCoins
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `referrals/${referralRecord.referralId}`);
  }
};
