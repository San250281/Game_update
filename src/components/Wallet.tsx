/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useRewardEngine } from '../lib/store';
import { TransactionSource } from '../types';
import { Coins, Calendar, History, Sparkles, Check, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DAILY_REWARDS = [
  { day: 1, reward: 50 },
  { day: 2, reward: 80 },
  { day: 3, reward: 120 },
  { day: 4, reward: 180 },
  { day: 5, reward: 250 },
  { day: 6, reward: 350 },
  { day: 7, reward: 600 }
];

export default function Wallet() {
  const { user, transactions, creditCoins } = useRewardEngine();
  const [activeTab, setActiveTab] = useState<'claim' | 'history'>('claim');
  const [currentStreak, setCurrentStreak] = useState(1);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [canClaimToday, setCanClaimToday] = useState(true);
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  // Sync streaks and claim timestamps
  useEffect(() => {
    if (!user) return;
    
    const sKey = `streak_${user.uid}`;
    const claimKey = `last_claim_${user.uid}`;
    
    const savedStreak = localStorage.getItem(sKey);
    const savedClaim = localStorage.getItem(claimKey);

    if (savedStreak) setCurrentStreak(parseInt(savedStreak));
    if (savedClaim) {
      setLastClaimDate(savedClaim);
      
      const todayStr = new Date().toDateString();
      const claimDateObj = new Date(savedClaim).toDateString();
      
      if (todayStr === claimDateObj) {
        setCanClaimToday(false);
      } else {
        setCanClaimToday(true);
        // Break streak if idle over 30 hours
        const diffHours = (Date.now() - new Date(savedClaim).getTime()) / (1000 * 60 * 60);
        if (diffHours > 36) {
          setCurrentStreak(1);
          localStorage.setItem(sKey, '1');
        }
      }
    } else {
      setCanClaimToday(true);
    }
  }, [user?.uid]);

  const handleClaimDaily = async () => {
    if (!user || !canClaimToday) return;

    const rewardObj = DAILY_REWARDS[(currentStreak - 1) % DAILY_REWARDS.length];
    const rewardValue = rewardObj.reward;

    // Transact write
    await creditCoins(rewardValue, TransactionSource.BONUS, 'daily_' + Date.now());

    // Progress streak state
    const nextStreak = currentStreak === 7 ? 1 : currentStreak + 1;
    const nowStr = new Date().toISOString();

    setCurrentStreak(nextStreak);
    setLastClaimDate(nowStr);
    setCanClaimToday(false);
    setClaimFeedback(`Claimed successfully! Streak reward of +${rewardValue} Coins added.`);

    localStorage.setItem(`streak_${user.uid}`, nextStreak.toString());
    localStorage.setItem(`last_claim_${user.uid}`, nowStr);
  };

  const formatSource = (src: string) => {
    if (src === 'game') return 'Mini Game Play';
    if (src === 'ad') return 'Rewarded Sponsor Ad';
    if (src === 'referral') return 'Referral Invite';
    if (src === 'bonus') return 'Streak Claim Reward';
    if (src === 'admin') return 'Admin Adjustment';
    return src;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-md max-w-lg mx-auto text-slate-800">
      {/* Background radial overlay */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Profile summary banner */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Wallet Balance</h3>
          <div className="flex items-center gap-1 mt-1">
            <Coins className="w-5.5 h-5.5 text-amber-505 shrink-0" />
            <h1 className="text-3xl font-black text-slate-900">
              {user ? user.coins.toLocaleString() : '0'}
            </h1>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Loyalty Status</p>
          <p className="text-xs text-amber-750 font-black flex items-center justify-end gap-1 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Vip Gamer
          </p>
        </div>
      </div>

      {/* Tabs navigation HUD */}
      <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('claim')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'claim'
              ? 'bg-white shadow-sm text-amber-700 font-extrabold'
              : 'text-slate-550 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Daily Rewards
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white shadow-sm text-amber-700 font-extrabold'
              : 'text-slate-550 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Transaction Logs ({transactions.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW 1: Daily Streak Claims */}
        {activeTab === 'claim' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex flex-col gap-5"
          >
            <div>
              <h4 className="text-xs font-bold text-slate-805 uppercase tracking-widest mb-2.5">
                7-Day Rewards Calendar
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Log in and tap claim daily to maintain your loyalty streak! Claiming resets back to Day 1 once you finish the weekly sheet.
              </p>
            </div>

            {/* Streaks Map Row */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAILY_REWARDS.map((item) => {
                const isClaimed = item.day < currentStreak && !canClaimToday;
                const isCurrent = item.day === currentStreak && canClaimToday;

                return (
                  <div
                    key={item.day}
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-between text-center border transition-all ${
                      isClaimed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : isCurrent
                        ? 'bg-amber-50 border-amber-500 shadow-sm text-amber-700 animate-pulse'
                        : 'bg-slate-50 border-slate-150 text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] font-bold">D{item.day}</span>
                    <Coins className={`w-5 h-5 my-1.5 ${isCurrent ? 'text-amber-550' : isClaimed ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span className="text-[10px] font-mono font-black">+{item.reward}</span>

                    {/* Miniature verification icons */}
                    {isClaimed && (
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-1 scale-90">
                        <Check className="w-2.5 h-2.5 stroke-[3px]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Execute Claim button */}
            <div className="mt-4">
              {canClaimToday ? (
                <button
                  id="claim_daily_wallet_btn"
                  onClick={handleClaimDaily}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-md transition-all cursor-pointer text-white font-black text-xs uppercase rounded-xl tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4.5 h-4.5" />
                  Claim Day {currentStreak} Reward!
                </button>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-5 text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Your streak reward is claimed! Return on the next calendar date.
                </div>
              )}
            </div>

            {claimFeedback && (
              <p className="text-center font-bold text-xs text-emerald-650 mt-1 animate-pulse">
                {claimFeedback}
              </p>
            )}
          </motion.div>
        )}

        {/* VIEW 2: Immutable Transaction Log History */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Double-Ledger Audit
              </h4>
              <span className="text-[10px] text-slate-400 font-mono font-bold">
                SECURE SHA-256 SYMMETRIC LEDGERS
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <div className="text-center py-10 border border-slate-200 border-dashed rounded-xl">
                  <History className="w-8 h-8 text-slate-300 mx-auto mb-2.5" />
                  <p className="text-xs text-slate-400">No transactions recorded yet in your wallet ledger.</p>
                </div>
              ) : (
                transactions.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  return (
                    <div
                      key={tx.transactionId}
                      className="bg-slate-50 border border-slate-150 hover:border-slate-250 rounded-xl p-3 flex justify-between items-center transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isCredit ? 'bg-emerald-50 text-emerald-605' : 'bg-rose-50 text-rose-605'
                        }`}>
                          {isCredit ? (
                            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-rose-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">
                            {formatSource(tx.source)}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ID: {tx.transactionId.substring(0, 12)}... • {new Date(tx.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-black flex items-center gap-0.5 justify-end ${
                          isCredit ? 'text-emerald-700' : 'text-rose-750'
                        }`}>
                          {isCredit ? '+' : '-'}{tx.coins.toLocaleString()}
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                        <p className="text-[9px] text-slate-500 tracking-wider font-mono">
                          {tx.type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
