/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, getDocs, setDoc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { WalletTransaction, TransactionType, TransactionSource } from '../types';

export const listWalletTransactions = async (uid: string): Promise<WalletTransaction[]> => {
  try {
    const txQuery = query(
      collection(db, 'transactions'), 
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(txQuery);
    const results: WalletTransaction[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as WalletTransaction);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `transactions?uid=${uid}`);
    return [];
  }
};

export const createWalletTransaction = async (
  transaction: WalletTransaction,
  newCoinCount: number
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const txRef = doc(collection(db, 'transactions'), transaction.transactionId);
    const userRef = doc(db, 'users', transaction.uid);
    
    batch.set(txRef, transaction);
    batch.update(userRef, { coins: newCoinCount });
    
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `transactions/${transaction.transactionId}`);
  }
};

export const adminAdjustCoinsInDb = async (
  targetUid: string,
  newCoinCount: number,
  adminTransaction: WalletTransaction
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const txRef = doc(collection(db, 'transactions'), adminTransaction.transactionId);
    const userRef = doc(db, 'users', targetUid);
    
    batch.set(txRef, adminTransaction);
    batch.update(userRef, { coins: newCoinCount });
    
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
  }
};
