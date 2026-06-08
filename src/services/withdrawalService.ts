/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, setDoc, getDocs, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { WithdrawalRequest } from '../types';

export const listWithdrawalsFromDb = async (uid?: string): Promise<WithdrawalRequest[]> => {
  try {
    const colRef = collection(db, 'withdrawals');
    const q = uid 
      ? query(colRef, where('uid', '==', uid), orderBy('createdAt', 'desc'))
      : query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const results: WithdrawalRequest[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as WithdrawalRequest);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `withdrawals?uid=${uid || 'all'}`);
    return [];
  }
};

export const createWithdrawalInDb = async (request: WithdrawalRequest): Promise<void> => {
  try {
    const docRef = doc(collection(db, 'withdrawals'), request.requestId);
    await setDoc(docRef, request);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `withdrawals/${request.requestId}`);
  }
};

export const updateWithdrawalInDb = async (
  requestId: string,
  updatedFields: Partial<WithdrawalRequest>,
  userUid?: string,
  newCoinsCount?: number,
  debitTx?: any
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const reqRef = doc(db, 'withdrawals', requestId);
    batch.update(reqRef, updatedFields);
    
    if (userUid && typeof newCoinsCount === 'number' && debitTx) {
      const userRef = doc(db, 'users', userUid);
      const txRef = doc(collection(db, 'transactions'), debitTx.transactionId);
      batch.update(userRef, { coins: newCoinsCount });
      batch.set(txRef, debitTx);
    }
    
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `withdrawals/${requestId}`);
  }
};
