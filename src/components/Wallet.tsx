/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRewardEngine } from '../lib/store';
import { TransactionSource } from '../types';
import { 
  Coins, Calendar, History, Sparkles, Check, 
  ArrowUpRight, ArrowDownRight, Clock, ShieldAlert,
  ArrowRight, FileSpreadsheet, CheckCircle2, Gift, Send, Landmark, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DAILY_REWARDS = [
  { day: 1, reward: 50 },
  { day: 2, reward: 85 },
  { day: 3, reward: 125 },
  { day: 4, reward: 180 },
  { day: 5, reward: 250 },
  { day: 6, reward: 380 },
  { day: 7, reward: 600 }
];

export default function Wallet() {
  const { 
    user, 
    transactions, 
    withdrawalRequests, 
    gameSessions, 
    creditCoins, 
    requestWithdrawal 
  } = useRewardEngine();

  const [activeTab, setActiveTab] = useState<'claim' | 'withdraw' | 'history'>('claim');
  const [currentStreak, setCurrentStreak] = useState(1);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [canClaimToday, setCanClaimToday] = useState(true);
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  // Cash-out request input state
  const [withdrawCoins, setWithdrawCoins] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<string>('PayPal');
  const [paymentDetails, setPaymentDetails] = useState<string>('');
  const [cashoutFeedback, setCashoutFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [cashoutLoading, setCashoutLoading] = useState(false);

  // Chest quest claim state
  const [chestClaimedToday, setChestClaimedToday] = useState(false);
  const [chestFeedback, setChestFeedback] = useState<string | null>(null);

  const todayStr = new Date().toDateString();

  // Sync streaks and claim timestamps
  useEffect(() => {
    if (!user) return;
    
    const sKey = `streak_${user.uid}`;
    const claimKey = `last_claim_${user.uid}`;
    const chestKey = `chest_claimed_${user.uid}_${todayStr}`;
    
    const savedStreak = localStorage.getItem(sKey);
    const savedClaim = localStorage.getItem(claimKey);
    const chestClaim = localStorage.getItem(chestKey);

    if (savedStreak) setCurrentStreak(parseInt(savedStreak));
    if (savedClaim) {
      setLastClaimDate(savedClaim);
      
      const claimDateObj = new Date(savedClaim).toDateString();
      if (todayStr === claimDateObj) {
        setCanClaimToday(false);
      } else {
        setCanClaimToday(true);
        // Break streak if idle over 36 hours
        const diffHours = (Date.now() - new Date(savedClaim).getTime()) / (1000 * 60 * 60);
        if (diffHours > 36) {
          setCurrentStreak(1);
          localStorage.setItem(sKey, '1');
        }
      }
    } else {
      setCanClaimToday(true);
    }

    if (chestClaim === 'true') {
      setChestClaimedToday(true);
    } else {
      setChestClaimedToday(false);
    }
  }, [user?.uid, todayStr]);

  // Derived check-in elements
  const playedSpin = gameSessions.some(
    gs => gs.gameId === 'spin_wheel' && new Date(gs.createdAt).toDateString() === todayStr
  );
  const playedTap = gameSessions.some(
    gs => gs.gameId === 'tap_challenge' && new Date(gs.createdAt).toDateString() === todayStr
  );
  const watchedAd = transactions.some(
    tx => tx.source === 'ad' && new Date(tx.createdAt).toDateString() === todayStr
  );
  const claimedStreak = !canClaimToday;

  // Count active quests completed today
  let completedCount = 0;
  if (playedSpin) completedCount++;
  if (playedTap) completedCount++;
  if (watchedAd) completedCount++;
  if (claimedStreak) completedCount++;

  const allQuestsDone = completedCount === 4;

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

  const handleClaimChest = async () => {
    if (!user || !allQuestsDone || chestClaimedToday) return;

    const rewardChestVal = 150;
    await creditCoins(rewardChestVal, TransactionSource.BONUS, 'chest_quest_' + todayStr);

    setChestClaimedToday(true);
    localStorage.setItem(`chest_claimed_${user.uid}_${todayStr}`, 'true');
    setChestFeedback(`Awesome! Claimed Quest Master Chest of +${rewardChestVal} golden coins.`);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCashoutFeedback(null);

    if (withdrawCoins < 1000) {
      setCashoutFeedback({ success: false, message: 'Minimum withdrawal amount is 1,000 Golden Coins ($1.00 USD equivalent).' });
      return;
    }

    if (user.coins < withdrawCoins) {
      setCashoutFeedback({ success: false, message: 'Insufficient coins in your active wallet ledger.' });
      return;
    }

    if (!paymentDetails.trim()) {
      setCashoutFeedback({ success: false, message: 'Please enter valid payment details (email / account information).' });
      return;
    }

    setCashoutLoading(true);
    try {
      const res = await requestWithdrawal(withdrawCoins, paymentMethod, paymentDetails);
      setCashoutFeedback(res);
      if (res.success) {
        setPaymentDetails('');
      }
    } catch (err: any) {
      setCashoutFeedback({ success: false, message: 'Server communication error during cash-out. Please retry.' });
    } finally {
      setCashoutLoading(false);
    }
  };

  const formatSource = (src: string) => {
    if (src === 'game') return 'Mini Game Play';
    if (src === 'ad') return 'Rewarded Sponsor Ad';
    if (src === 'referral') return 'Referral Invite';
    if (src === 'bonus') return 'Bonus / Check-in';
    if (src === 'admin') return 'Admin Adjustment';
    if (src === 'withdrawal') return 'Balance Cash-out';
    return src;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 relative overflow-hidden shadow-md max-w-xl mx-auto text-slate-800">
      {/* Background decoration radial */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Wallet header */}
      <div className="flex items-center justify-between mb-5 select-none">
        <div>
          <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active Earning Wallet</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Coins className="w-6 h-6 text-amber-500 shrink-0" />
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
              {user ? user.coins.toLocaleString() : '0'}
            </h1>
            <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold self-end mb-0.5 uppercase">
              ${user ? (user.coins / 1000).toFixed(2) : '0.00'} USD
            </span>
          </div>
        </div>

        <div className="px-3 py-1.5 bg-slate-50 border border-slate-150 rounded-xl text-right">
          <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Level Standing</p>
          <p className="text-[10px] text-amber-600 font-black flex items-center justify-end gap-1 uppercase tracking-wide mt-0.5">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            Tier-1 VIP Player
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-2xl mb-6 select-none font-sans gap-0.5">
        <button
          onClick={() => setActiveTab('claim')}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'claim'
              ? 'bg-white shadow-sm text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-505" />
          Quests Track
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'withdraw'
              ? 'bg-white shadow-sm text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-3.5 h-3.5 text-amber-500" />
          Cash-out
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white shadow-sm text-slate-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5 text-blue-500" />
          Ledger History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW 1: Daily Retention Slider and Checklists */}
        {activeTab === 'claim' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-5 font-sans"
          >
            {/* Streak Slider Tracker */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-550 animate-ping" />
                  Daily Loyalty Streaks
                </h4>
                <span className="text-[10px] text-emerald-600 font-black uppercase">
                  Streak: Day {currentStreak - 1 >= 0 ? currentStreak - 1 : 0} Completed
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 my-4 select-none">
                {DAILY_REWARDS.map((item) => {
                  const isClaimed = item.day < currentStreak && !canClaimToday;
                  const isCurrent = item.day === currentStreak && canClaimToday;

                  return (
                    <div
                      key={item.day}
                      className={`p-2 rounded-xl flex flex-col items-center justify-between text-center border transition-all ${
                        isClaimed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : isCurrent
                          ? 'bg-amber-50 border-amber-500 shadow-md text-amber-800 font-bold scale-[1.03] relative'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="text-[9px] font-bold tracking-tight">D{item.day}</span>
                      <Coins className={`w-4 h-4 my-1 shrink-0 ${isCurrent ? 'text-amber-500 animate-bounce' : isClaimed ? 'text-emerald-500' : 'text-slate-300'}`} />
                      <span className="text-[9.5px] font-mono font-black">+{item.reward}</span>
                    </div>
                  );
                })}
              </div>

              {canClaimToday ? (
                <button
                  id="claim_daily_wallet_btn"
                  onClick={handleClaimDaily}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-md transition-all cursor-pointer text-white font-black text-xs uppercase rounded-xl tracking-wider flex items-center justify-center gap-1.5 text-center mt-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  Claim Day {currentStreak} streak reward!
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-3 text-center text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-2 mt-1.5">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  Today is claimed! Return tomorrow to keep your streak multiplying!
                </div>
              )}

              {claimFeedback && (
                <p className="text-center font-bold text-[11px] text-emerald-700 mt-2.5 animate-pulse">
                  {claimFeedback}
                </p>
              )}
            </div>

            {/* Daily Retention Quest Checklist */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    Daily Retention Quests
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Complete to claim golden Chest</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-lg">
                    {completedCount}/4 Done
                  </span>
                </div>
              </div>

              {/* Milestones Meter bar */}
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-4 scroll-smooth">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-555 to-emerald-500 transition-all duration-300"
                  style={{ width: `${(completedCount / 4) * 100}%` }}
                />
              </div>

              {/* Progress items */}
              <div className="flex flex-col gap-2">
                {/* 1. Daily check-in */}
                <div className="flex items-center justify-between p-2.5 bg-white border border-slate-150 rounded-xl hover:border-slate-250 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center ${claimedStreak ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-700 uppercase tracking-wide leading-none">Daily check-in streak</h5>
                      <span className="text-[9px] text-slate-400 font-medium">Claim your 7-day rewards above</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-black ${claimedStreak ? 'text-emerald-650' : 'text-slate-400'}`}>
                    {claimedStreak ? 'COMPLETE' : '+Coins'}
                  </span>
                </div>

                {/* 2. Lucky spin wheel */}
                <div className="flex items-center justify-between p-2.5 bg-white border border-slate-150 rounded-xl hover:border-slate-250 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center ${playedSpin ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-700 uppercase tracking-wide leading-none">Spin Lucky Segment Wheel</h5>
                      <span className="text-[9px] text-slate-400 font-medium font-bold">Play lucky spin segment wheel on lobby</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-black ${playedSpin ? 'text-emerald-650' : 'text-slate-400'}`}>
                    {playedSpin ? 'COMPLETE' : '+25 COINS'}
                  </span>
                </div>

                {/* 3. Fast tap game */}
                <div className="flex items-center justify-between p-2.5 bg-white border border-slate-150 rounded-xl hover:border-slate-250 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center ${playedTap ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-700 uppercase tracking-wide leading-none">Tap speed challenge</h5>
                      <span className="text-[9px] text-slate-400 font-medium">Test click coordinates velocity</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-black ${playedTap ? 'text-emerald-650' : 'text-slate-400'}`}>
                    {playedTap ? 'COMPLETE' : '+25 COINS'}
                  </span>
                </div>

                {/* 4. Reward ad */}
                <div className="flex items-center justify-between p-2.5 bg-white border border-slate-150 rounded-xl hover:border-slate-250 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center ${watchedAd ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-700 uppercase tracking-wide leading-none">Sponsor reward ad</h5>
                      <span className="text-[9px] text-slate-400 font-medium font-bold">Watch sponsors monetized video ads</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-black ${watchedAd ? 'text-emerald-650' : 'text-slate-400'}`}>
                    {watchedAd ? 'COMPLETE' : '+50 COINS'}
                  </span>
                </div>
              </div>

              {/* Master Chest Claim Section */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                {chestClaimedToday ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl py-2 px-3 text-center text-xs text-emerald-700 font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Gift className="w-4 h-4 text-emerald-505" />
                    Master Quest Chest Claimed! (+150 Coins)
                  </div>
                ) : (
                  <button
                    disabled={!allQuestsDone}
                    onClick={handleClaimChest}
                    className={`w-full py-3.5 rounded-xl uppercase font-black text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      allQuestsDone
                        ? 'bg-gradient-to-r from-red-500 via-amber-500 to-indigo-600 text-white animate-pulse shadow-md hover:scale-[1.01]'
                        : 'bg-slate-250 text-slate-400 cursor-not-allowed border border-slate-300'
                    }`}
                  >
                    <Gift className="w-4 h-4 shrink-0" />
                    Unlock Quest Master Golden Chest (+150 Coins)
                  </button>
                )}
                
                {!allQuestsDone && (
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-2">
                    Complete all 4 daily retention tasks to unlock
                  </p>
                )}

                {chestFeedback && (
                  <p className="text-center font-bold text-xs text-indigo-750 mt-2 animate-bounce uppercase">
                    {chestFeedback}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: Withdrawal approval request form & lists */}
        {activeTab === 'withdraw' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-5 font-sans"
          >
            {/* Cash-out Form */}
            <form onSubmit={handleWithdrawSubmit} className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
              <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <Landmark className="w-4 h-4 text-emerald-600" />
                Submit Cash-out Request
              </h4>
              <p className="text-[10px] text-slate-500 mb-4 leading-normal font-medium">
                Request payouts using golden coins. Payouts are manually reviewed and audited by admins in our dashboard. 1,000 Coins = $1.00 USD.
              </p>

              <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                <div>
                  <label className="block text-[10px] font-black text-slate-650 uppercase tracking-wider mb-1.5">
                    Payment Channel
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PayPal">PayPal Account</option>
                    <option value="Amazon">Amazon Giftcard</option>
                    <option value="USDT">Crypto USDT (TRC-20)</option>
                    <option value="Wire">Direct Wire Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-650 uppercase tracking-wider mb-1.5 flex justify-between">
                    <span>Coins Amount</span>
                    <span className="text-[9px] font-sans text-slate-400 capitalize font-medium">1000 Min</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={withdrawCoins}
                    onChange={(e) => setWithdrawCoins(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full text-xs font-mono font-black bg-white border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-center"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[10px] font-black text-slate-650 uppercase tracking-wider mb-1.5">
                  Your Account Details / Address
                </label>
                <input
                  type="text"
                  placeholder={
                    paymentMethod === 'PayPal' ? 'PayPal Email Address (e.g. buyer@example.com)' :
                    paymentMethod === 'USDT' ? 'USDT TRC20 Crypto Wallet Address (e.g. TYH...)' :
                    'Enter payout contact email and bank/routing specifics'
                  }
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={cashoutLoading || !user || user.coins < withdrawCoins}
                className={`w-full py-3 rounded-xl uppercase font-black text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all text-center ${
                  !user || user.coins < withdrawCoins
                    ? 'bg-slate-250 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer'
                }`}
              >
                {cashoutLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request for Review (${(withdrawCoins / 1000).toFixed(2)} Value)
                  </>
                )}
              </button>

              {cashoutFeedback && (
                <div className={`mt-3 p-3 rounded-xl border text-[11px] font-semibold text-center flex items-center justify-center gap-2 leading-relaxed ${
                  cashoutFeedback.success 
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-850' 
                    : 'bg-red-50 border-red-250 text-red-800'
                }`}>
                  {cashoutFeedback.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-4 h-4 text-red-650 shrink-0" />}
                  {cashoutFeedback.message}
                </div>
              )}
            </form>

            {/* Cash-out Lists Log history */}
            <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col">
              <h4 className="text-xs font-black text-slate-805 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                Your Payout Audits ({withdrawalRequests.filter(r => r.uid === user?.uid).length})
              </h4>

              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {withdrawalRequests.filter(r => r.uid === user?.uid).length === 0 ? (
                  <div className="text-center py-7.5 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <Landmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-[11px] text-slate-400 font-bold uppercase">No cash-out requested from this account yet</p>
                  </div>
                ) : (
                  withdrawalRequests.filter(r => r.uid === user?.uid).map((req) => {
                    return (
                      <div
                        key={req.requestId}
                        className="p-3.5 bg-slate-55 border border-slate-200 hover:border-slate-300 rounded-xl flex flex-col gap-2.5 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-black text-slate-800 tracking-wide uppercase">
                              {req.paymentMethod} • {req.amountCoins.toLocaleString()} Coins
                            </p>
                            <span className="text-[9px] text-slate-400 font-mono">
                              ID: {req.requestId} • {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-lg border ${
                              req.status === 'pending' ? 'bg-amber-50 text-amber-650 border-amber-200' :
                              req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 animate-pulse' :
                              'bg-red-50 text-red-650 border-red-200'
                            }`}>
                              {req.status}
                            </span>
                            <p className="text-[10px] text-slate-650 font-black font-mono mt-1">
                              ${(req.amountCoins / 1000).toFixed(2)} USD
                            </p>
                          </div>
                        </div>

                        {/* Account detail label */}
                        <div className="bg-white/80 p-2 rounded-lg border border-slate-210 text-[10px] text-slate-600 font-mono truncate">
                          <span className="font-bold text-slate-400">Target Address:</span> {req.paymentDetails}
                        </div>

                        {/* Admin responses */}
                        {req.adminMessage && (
                          <div className={`p-2 rounded-lg text-[10px] leading-relaxed flex gap-1.5 ${
                            req.status === 'approved' ? 'bg-emerald-100/50 text-emerald-850' : 'bg-red-100/40 text-red-850'
                          }`}>
                            <span className="font-extrabold uppercase shrink-0">Admin review:</span>
                            <span>{req.adminMessage}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: Immutables Wallet Logs */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-3 font-sans"
          >
            <div className="flex justify-between items-center mb-1 select-none">
              <h4 className="text-xs font-black text-slate-805 uppercase tracking-widest">
                Double-Ledger Record History
              </h4>
              <span className="text-[8px] text-slate-405 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                SECURE TRIPLE-DEAL ENVELOPE
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <div className="text-center py-10 border border-slate-200 border-dashed rounded-xl bg-slate-50">
                  <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold uppercase">No ledger lines found</p>
                </div>
              ) : (
                transactions.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  return (
                    <div
                      key={tx.transactionId}
                      className="bg-slate-50 border border-slate-150 hover:border-slate-250 rounded-xl p-3 flex justify-between items-center transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 ${
                          isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {isCredit ? (
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-800 leading-none">
                            {formatSource(tx.source)}
                          </p>
                          <span className="text-[8.5px] text-slate-400 font-mono mt-0.5 block">
                            ID: {tx.transactionId.substring(0, 15)}... • {new Date(tx.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-black flex items-center justify-end ${
                          isCredit ? 'text-emerald-700' : 'text-rose-750'
                        }`}>
                          {isCredit ? '+' : '-'}{tx.coins.toLocaleString()}
                          <Coins className="w-3.5 h-3.5 text-amber-500 ml-1" />
                        </span>
                        <p className="text-[8px] text-slate-400 tracking-wider font-mono uppercase mt-0.5">
                          {tx.type} • LEDGER
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
