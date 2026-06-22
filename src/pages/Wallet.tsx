/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet as WalletIcon, Coins, Star, ArrowUpRight, ArrowDownLeft, Activity, Grid, Filter, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TransactionType } from '../types';

export const Wallet: React.FC = () => {
  const { currentUser, transactions } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Filter user transactions
  const userTx = transactions.filter((tx) => tx.userId === currentUser?.uid);

  // Compute stats
  const currentBalance = currentUser?.coins || 0;
  const lifetimeCoins = currentUser?.lifetimeCoins || 0;

  const earnedTx = userTx.filter((t) => t.amount > 0);
  const totalEarnedAmount = earnedTx.reduce((acc, curr) => acc + curr.amount, 0);

  const redeemedTx = userTx.filter((t) => t.amount < 0);
  const totalRedeemedAmount = Math.abs(redeemedTx.reduce((acc, curr) => acc + curr.amount, 0));

  const walletTypes = [
    'All',
    'Game Reward',
    'Survey Reward',
    'Referral Reward',
    'Membership Bonus',
    'Redemption',
    'Admin Adjustment',
  ];

  const filteredTx = activeFilter === 'All'
    ? userTx
    : userTx.filter((tx) => tx.type === activeFilter);

  const getTxTypeBadgeColor = (type: TransactionType) => {
    switch (type) {
      case 'Game Reward':
        return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
      case 'Survey Reward':
        return 'bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20';
      case 'Referral Reward':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Membership Bonus':
        return 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20';
      case 'Redemption':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Admin Adjustment':
      default:
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-16 select-none relative animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <WalletIcon className="w-8 h-8 text-[#6C63FF]" />
            Arena Wallet Ledger
          </h1>
          <p className="text-sm text-gray-400 mt-1">Audit, monitor and track your full coin conversions, game reward drops, and marketplace redemptions.</p>
        </div>

        {/* Security check */}
        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>Secured Ledger Syncing</span>
        </div>
      </div>

      {/* FINANCIAL METRICS SPREADSHEET */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-[#18181A] rounded-2xl border border-slate-800/40 p-5 space-y-3 shadow-lg relative overflow-hidden">
          <Coins className="absolute right-4 top-4 w-12 h-12 text-[#FFD700]/5" />
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">CURRENT BALANCE</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-mono font-black text-[#FFD700]">{currentBalance}</h3>
            <span className="text-xs text-gray-400">Coins</span>
          </div>
          <span className="text-[10px] text-gray-500 block">Available for instant marketplace eVouchers.</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#18181A] rounded-2xl border border-slate-800/40 p-5 space-y-3 shadow-lg relative overflow-hidden">
          <Star className="absolute right-4 top-4 w-12 h-12 text-[#6C63FF]/5" />
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">LIFETIME COINS</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-mono font-black text-white">{lifetimeCoins}</h3>
            <span className="text-xs text-gray-400">Coins</span>
          </div>
          <span className="text-[10px] text-gray-500 block">Ultimate historically accumulated volume.</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#18181A] rounded-2xl border border-slate-800/40 p-5 space-y-3 shadow-lg relative overflow-hidden">
          <ArrowUpRight className="absolute right-4 top-4 w-12 h-12 text-[#00C896]/5" />
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">TOTAL COINS EARNED</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-mono font-black text-[#00C896]">{totalEarnedAmount}</h3>
            <span className="text-xs text-gray-400">Coins</span>
          </div>
          <span className="text-[10px] text-gray-500 block">Sum earned from games and opinion pools.</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#18181A] rounded-2xl border border-slate-800/40 p-5 space-y-3 shadow-lg relative overflow-hidden">
          <ArrowDownLeft className="absolute right-4 top-4 w-12 h-12 text-rose-400/5" />
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">TOTAL COINS REDEEMED</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-mono font-black text-rose-400">{totalRedeemedAmount}</h3>
            <span className="text-xs text-gray-400">Coins</span>
          </div>
          <span className="text-[10px] text-gray-500 block">Converted into active card voucher values.</span>
        </div>
      </div>

      {/* FILTER BUTTONS ROW */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>FILTER REPORT BY SPECIFIED TRANSACTION SOURCE TYPE:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/20">
          {walletTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                activeFilter === type
                  ? 'bg-[#6C63FF] text-white font-bold'
                  : 'bg-[#18181A] text-gray-400 hover:text-white border border-slate-800'
              }`}
              style={{ minHeight: '36px' }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* TRANSACTION SPREADSHEEET LEDGER LIST */}
      <section id="wallet-ledger-entries" className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/40 pb-3">
          <Activity className="w-5 h-5 text-[#00C896]" />
          <h2 className="text-base font-sans font-bold text-white tracking-tight">Financial Ledger Logs ({filteredTx.length})</h2>
        </div>

        {filteredTx.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-8">No transaction history lines captured under filter parameter {activeFilter}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 pb-3 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction Code / Date</th>
                  <th className="py-3 px-4">Source Category</th>
                  <th className="py-3 px-4">Details Description</th>
                  <th className="py-3 px-4 text-right">Credit / Debit Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredTx.map((tx) => {
                  const isEarn = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-4 font-mono">
                        <span className="text-gray-200 block font-bold">{tx.id}</span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">{new Date(tx.timestamp).toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] inline-block px-2.5 py-0.5 rounded-full font-bold select-none ${getTxTypeBadgeColor(tx.type)}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300 max-w-sm">{tx.description}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-mono font-black text-sm ${isEarn ? 'text-[#00C896]' : 'text-rose-400'}`}>
                          {isEarn ? `+${tx.amount}` : `${tx.amount}`} <span className="text-[10px] font-normal text-gray-500">Coins</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
