/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gift, Search, Tag, Check, CheckCircle2, X, AlertTriangle, Coins, Eye, Copy, Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { REWARD_ITEMS } from '../data';
import { RewardCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const Rewards: React.FC = () => {
  const { currentUser, redeemReward, redemptions, addNotification } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confirmation state
  const [confirmReward, setConfirmReward] = useState<any | null>(null);
  const [redemptionProcessing, setRedemptionProcessing] = useState(false);
  const [claimReceipt, setClaimReceipt] = useState<string | null>(null);

  // Clipboard copies helper
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 1500);
  };

  const categories: string[] = ['All', 'Gift Cards', 'Shopping', 'Travel', 'OTT', 'Learning', 'Finance', 'Health'];

  // Filter rewards
  const filteredRewards = REWARD_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleRedeemConfirmClick = async () => {
    if (!confirmReward || !currentUser) return;
    setRedemptionProcessing(true);

    try {
      const result = await redeemReward(confirmReward.id);
      if (result.success) {
        setClaimReceipt(confirmReward.title);
        setConfirmReward(null);
      } else {
        alert(result.error || 'Redemption failed due to unexplained parameters');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRedemptionProcessing(false);
    }
  };

  const myRedemptions = redemptions.filter((r) => r.userId === currentUser?.uid);

  return (
    <div className="space-y-8 pb-16 select-none relative animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Gift className="w-8 h-8 text-[#FFD700]" />
            Rewards Marketplace
          </h1>
          <p className="text-sm text-gray-400 mt-1">Convert your Game arena coins into verified high-value shopping vouchers and direct codes.</p>
        </div>

        {/* Secured Badge */}
        <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-gray-400">
          <ShieldCheck className="w-4.5 h-4.5 text-[#00C896]" />
          <span>Verified Instant Deliveries</span>
        </div>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Categories search */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                activeCategory === cat
                  ? 'bg-[#FFD700] text-slate-950 font-bold'
                  : 'bg-[#18181A] text-gray-400 hover:text-white border border-slate-800'
              }`}
              style={{ minHeight: '36px' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input tab */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181A] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/50"
            style={{ minHeight: '38px' }}
          />
        </div>
      </div>

      {/* REWARD CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => {
          const canAfford = currentUser ? currentUser.coins >= reward.coinCost : false;
          return (
            <div
              id={`mkt-reward-${reward.id}`}
              key={reward.id}
              className="bg-[#18181A] rounded-2xl border border-slate-800/40 overflow-hidden hover:border-[#FFD700]/30 transition-all flex flex-col justify-between"
            >
              {/* Image banner */}
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src={reward.imageUrl}
                  alt={reward.title}
                  className="w-full h-full object-cover select-none"
                />
                <span className="absolute top-3 left-3 text-[9px] bg-slate-950/80 px-2 py-0.5 rounded text-gray-300 font-semibold uppercase tracking-wider">
                  {reward.category}
                </span>
                <span className="absolute bottom-3 right-3 text-xs bg-gradient-to-r from-amber-500/90 to-[#FFD700]/90 px-3 py-1 rounded text-slate-950 font-mono font-bold border border-amber-600/30">
                  Value ₹{reward.valueINR}
                </span>
              </div>

              {/* Specs */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white tracking-tight leading-snug">{reward.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{reward.description}</p>
                </div>

                <div className="space-y-3.5 pt-3 border-t border-slate-850">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-mono">REDEEM VALUE COST</span>
                    <div className="flex items-center gap-1.5 font-mono text-[#FFD700]">
                      <Coins className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                      <span className="text-sm font-black leading-none">{reward.coinCost} <span className="text-[10px] text-gray-500 font-normal">Coins</span></span>
                    </div>
                  </div>

                  <button
                    id={`btn-redeem-item-${reward.id}`}
                    onClick={() => {
                      if (!currentUser) {
                        alert('Log in to redeem your rewards.');
                        return;
                      }
                      setConfirmReward(reward);
                    }}
                    className={`w-full py-2.5 font-sans font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      canAfford
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 hover:shadow-amber-400/10'
                        : 'bg-slate-800/40 text-slate-500 border border-slate-800/60 cursor-not-allowed shadow-none'
                    }`}
                    style={{ minHeight: '42px' }}
                  >
                    <span>Redeem Gift eVoucher</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIRMATION DRAWER MODAL OVERLAYS */}
      <AnimatePresence>
        {confirmReward && (
          <div id="confirm-reward-modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#18181A] rounded-2xl border border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Redeem Confirmation
                </h3>
                <button
                  id="btn-close-redeem-modal"
                  onClick={() => setConfirmReward(null)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-start gap-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-700">
                    <img 
                      src={confirmReward.imageUrl} 
                      alt={`${confirmReward.title} - Voucher Reward`} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">{confirmReward.title}</h4>
                    <span className="text-[10px] text-gray-500 font-mono uppercase mt-0.5 inline-block border border-slate-800/60 px-1.5 py-0.2 rounded bg-slate-950/30">
                      Cost: {confirmReward.coinCost} Coins
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-yellow-500/5 rounded-xl border border-yellow-500/10 space-y-1 text-xs text-yellow-400">
                  <p className="font-semibold">&#128274; Security verification details</p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    Upon clicking Confirm, {confirmReward.coinCost} Coins will immediately be deducted from your Arena account balance. Digital voucher keys are delivered within 2 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-800/30 pt-4">
                <button
                  id="btn-cancel-redemption"
                  onClick={() => setConfirmReward(null)}
                  className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-gray-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-redemption"
                  onClick={handleRedeemConfirmClick}
                  disabled={redemptionProcessing}
                  className="flex-1 py-2.5 bg-[#FFD700] hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  {redemptionProcessing ? 'Processing verify...' : 'Confirm Deduction'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* RECEIPT NOTIFIER MODAL */}
        {claimReceipt && (
          <div id="receipt-modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18181A] rounded-2xl border border-slate-800 p-6 max-w-sm w-full shadow-2xl text-center space-y-6"
            >
              <div className="w-14 h-14 bg-[#00C896]/10 border border-[#00C896]/20 rounded-full flex items-center justify-center mx-auto text-[#00C896] animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-sans font-extrabold text-white">REDEMPTION REQUEST PLACED!</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your purchase for <span className="text-white font-bold">{claimReceipt}</span> was acknowledged. Let our administrative team deliver e-Voucher keys to your profile below within 2 hours.
                </p>
              </div>

              <button
                id="btn-close-receipt"
                onClick={() => setClaimReceipt(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-gray-300 font-bold rounded-lg text-xs"
                style={{ minHeight: '40px' }}
              >
                Return to Marketplace
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MY REDEMPTION CODES INVENTORY TRACKER */}
      <section id="redeem-inventory" className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/40 pb-3">
          <Gift className="w-5 h-5 text-[#FFD700]" />
          <h2 className="text-base font-sans font-bold text-white tracking-tight">Active e-Vouchers Inventory ({myRedemptions.length})</h2>
        </div>

        {myRedemptions.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6 leading-relaxed">No redemption requests recorded on this profile. Accumulate coins and redeem vouchers upper list.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRedemptions.map((red) => (
              <div key={red.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">{red.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Redemption ID: {red.id}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    red.status === 'Delivered'
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                      : red.status === 'Approved'
                      ? 'bg-[#00C896]/10 text-[#00C896]'
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {red.status}
                  </span>
                </div>

                {red.status === 'Delivered' && red.giftCode ? (
                  <div className="p-3 bg-slate-950/80 rounded-lg space-y-2 font-mono text-center border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-[9px] text-gray-500">GIFT CODE KEY:</span>
                      <button
                        id={`btn-copy-code-${red.id}`}
                        onClick={() => handleCopyCode(red.id, red.giftCode!)}
                        className="text-[10px] text-[#FFD700] hover:underline flex items-center gap-0.5"
                      >
                        {copiedCodeId === red.id ? 'Copied' : 'Copy'}
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-[#FFD700] tracking-wider select-text">{red.giftCode}</p>
                    {red.giftPin && (
                      <p className="text-xs text-gray-400 mt-1 select-text">Security PIN: <span className="font-bold text-white">{red.giftPin}</span></p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/20 rounded-lg text-center border border-dashed border-slate-800 text-[11px] text-gray-500 flex items-center justify-center gap-1.5 select-none">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Awaiting e-Voucher keys allocation...</span>
                  </div>
                )}

                <span className="text-[9px] text-slate-500 font-mono block text-right">Requested at: {new Date(red.requestDate).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
