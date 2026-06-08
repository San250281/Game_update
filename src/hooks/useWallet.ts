/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { listWalletTransactions, createWalletTransaction, adminAdjustCoinsInDb } from '../services/walletService';
import { WalletTransaction, TransactionType, TransactionSource } from '../types';

export const useWallet = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  const fetchTransactions = async (uid: string) => {
    setLoading(true);
    try {
      const records = await listWalletTransactions(uid);
      setTransactions(records);
      return records;
    } finally {
      setLoading(false);
    }
  };

  const executeCredit = async (
    uid: string,
    currentCoins: number,
    amount: number,
    source: TransactionSource,
    customId?: string
  ): Promise<{ transaction: WalletTransaction; nextCoins: number }> => {
    const txId = customId || 'tx_' + Math.random().toString(36).substring(2, 15);
    const newTx: WalletTransaction = {
      transactionId: txId,
      uid,
      type: TransactionType.CREDIT,
      coins: amount,
      source,
      createdAt: new Date().toISOString()
    };
    
    const nextCoins = currentCoins + amount;
    await createWalletTransaction(newTx, nextCoins);
    
    setTransactions(prev => [newTx, ...prev]);
    return { transaction: newTx, nextCoins };
  };

  const executeDebit = async (
    uid: string,
    currentCoins: number,
    amount: number,
    source: TransactionSource
  ): Promise<{ success: boolean; transaction?: WalletTransaction; nextCoins: number }> => {
    if (currentCoins < amount) {
      return { success: false, nextCoins: currentCoins };
    }

    const txId = 'tx_' + Math.random().toString(36).substring(2, 15);
    const newTx: WalletTransaction = {
      transactionId: txId,
      uid,
      type: TransactionType.DEBIT,
      coins: amount,
      source,
      createdAt: new Date().toISOString()
    };

    const nextCoins = currentCoins - amount;
    await createWalletTransaction(newTx, nextCoins);

    setTransactions(prev => [newTx, ...prev]);
    return { success: true, transaction: newTx, nextCoins };
  };

  return {
    loading,
    transactions,
    setTransactions,
    fetchTransactions,
    executeCredit,
    executeDebit,
  };
};
