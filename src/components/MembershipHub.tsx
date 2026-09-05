/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Crown, Sparkles, Check, ShieldCheck, Zap, 
  Clock, Calendar, Coins, Gamepad2, AlertCircle, ArrowRight,
  CheckCircle2, Star, Trophy, Ban
} from 'lucide-react';
import { useRewardEngine } from '../lib/store';
import { GameType } from '../types';
import { motion } from 'motion/react';

interface MembershipHubProps {
  onSelectGame?: (gameId: GameType) => void;
}

interface PlanOption {
  id: string;
  name: string;
  badge?: string;
  priceINR: number;
  coinCost: number;
  bonusCoins: number;
  durationDays: number;
  isPopular?: boolean;
  perks: string[];
}

const MEMBERSHIP_PLANS: PlanOption[] = [
  {
    id: 'silver_weekly',
    name: 'Silver Gamer Pass',
    badge: 'Starter',
    priceINR: 49,
    coinCost: 300,
    bonusCoins: 300,
    durationDays: 7,
    perks: [
      '100% Ad-Free Arcade (No sponsor ads or promo walls)',
      'Instant access to all 8 VIP Exclusive games',
      '+300 Welcome Bonus Coins credited to wallet',
      'Standard leaderboard eligibility'
    ]
  },
  {
    id: 'gold_monthly',
    name: 'Gold Master Pass',
    badge: 'Most Popular',
    priceINR: 149,
    coinCost: 800,
    bonusCoins: 1000,
    durationDays: 30,
    isPopular: true,
    perks: [
      '100% Ad-Free Experience across all games',
      'All 8 VIP Exclusive games unlocked (Chess, Poker, Ludo & more)',
      '+1,000 Free Coins bonus airdropped immediately',
      '2x Daily check-in rewards & referral earnings',
      'Golden VIP Crown badge displayed on profile & leaderboards',
      'Priority withdrawal processing'
    ]
  },
  {
    id: 'diamond_annual',
    name: 'Diamond Legend Pass',
    badge: 'Best Value',
    priceINR: 499,
    coinCost: 2500,
    bonusCoins: 5000,
    durationDays: 365,
    perks: [
      'Lifetime 365-day 100% Ad-Free experience',
      'Unlimited VIP access to all 8 games + future releases',
      '+5,000 Giant Welcome Coin bounty',
      '3x Daily reward multipliers on all arcade achievements',
      'Exclusive Diamond Prestige badge & avatar borders',
      'VIP concierge support with instant withdrawals'
    ]
  }
];

const VIP_GAMES_SHOWCASE = [
  { id: GameType.CHESS, title: 'Grandmaster Chess', icon: '♟️', reward: 120, desc: 'Strategic AI masterclass with captures & board rules' },
  { id: GameType.LUDO, title: 'Royal Ludo Tournament', icon: '🎲', reward: 75, desc: '4-player classic roll-and-move to safe home coordinates' },
  { id: GameType.POKER, title: '5-Card Draw Poker', icon: '🃏', reward: 90, desc: 'High-stakes play room with royal flushes & AI dealers' },
  { id: GameType.BLACKJACK, title: 'Vegas Blackjack 21', icon: '🪙', reward: 50, desc: 'Hit, Stand or Double to hit 21 at the casino table' },
  { id: GameType.TREASURE_HUNT, title: 'Deep Treasure Hunt', icon: '🏴‍☠️', reward: 80, desc: 'Solve secret coordinates to uncover jackpot sunken chests' },
  { id: GameType.SPACE_SHOOTER, title: 'Galaxy Fighter Pro', icon: '🚀', reward: 60, desc: 'Shoot meteorite squadrons in high-velocity cosmic dogfights' },
  { id: GameType.RUMMY, title: 'Rummy Deck Melder', icon: '🀄', reward: 75, desc: 'Arrange cards into consecutive runs & color melds' },
  { id: GameType.SOLITAIRE, title: 'Solitaire Klondike Gold', icon: '🎴', reward: 75, desc: 'Royal alternating card pyramid puzzle with jackpot clear' },
];

export default function MembershipHub({ onSelectGame }: MembershipHubProps) {
  const { user, isMember, upgradeMembership, toggleMembershipStatus } = useRewardEngine();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const handleCoinUpgrade = async (plan: PlanOption) => {
    if (!user) return;
    if (user.coins < plan.coinCost) {
      showToast(`Insufficient coins (${user.coins}). You need ${plan.coinCost} coins for the ${plan.name}.`, 'error');
      return;
    }

    setProcessingPlanId(plan.id);
    try {
      const result = await upgradeMembership(plan.name, plan.durationDays, plan.bonusCoins, plan.coinCost);
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Upgrade failed. Please retry.', 'error');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleCashUpgrade = async (plan: PlanOption) => {
    if (!user) return;
    setProcessingPlanId(plan.id);
    try {
      // Simulate secure instant gateway payment
      await new Promise(r => setTimeout(r, 650));
      const result = await upgradeMembership(plan.name, plan.durationDays, plan.bonusCoins, 0);
      if (result.success) {
        showToast(`Payment of ₹${plan.priceINR} verified! ${plan.name} is now active with +${plan.bonusCoins} bonus coins!`, 'success');
      }
    } catch (err: any) {
      showToast('Payment processing exception.', 'error');
    } finally {
      setProcessingPlanId(null);
    }
  };

  return (
    <section aria-labelledby="membership-title" className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-bold transition-all ${
            toast.type === 'success' 
              ? 'bg-emerald-600 text-white border-emerald-400' 
              : 'bg-rose-600 text-white border-rose-400'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              VIP Member Club
            </span>
          </div>
          <h2 id="membership-title" className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            REWARDYN VIP Membership
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
            Upgrade your membership status for an ad-free arcade, exclusive access to 8 member-only games, bonus coin drops, and priority rewards.
          </p>
        </div>

        {/* Security & Quick Toggle Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMembershipStatus}
            title="Switch your membership status for instant preview"
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-900 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isMember ? 'VIP Active (Click to Toggle)' : '⚡ Quick Activate VIP'}</span>
          </button>
        </div>
      </div>

      {/* ACTIVE MEMBERSHIP STATUS CARD */}
      {isMember ? (
        <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-amber-500/10 via-amber-50/60 to-emerald-500/5 border-2 border-amber-400 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-700 font-mono uppercase tracking-widest font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  MEMBERSHIP CLEARANCE: ACTIVE & VERIFIED
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-500 fill-amber-500" />
                {user?.membershipPlan || 'VIP Master Member'}
              </h3>
            </div>
            <div className="bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md self-start sm:self-auto">
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>VIP PRIVILEGES ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-slate-700">
            <div className="bg-white/80 p-4 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>EXPIRATION DATE</span>
              </div>
              <span className="text-sm font-black text-slate-900 block mt-1.5">
                {user?.membershipExpiresAt ? new Date(user.membershipExpiresAt).toLocaleDateString() : 'Active Member'}
              </span>
            </div>

            <div className="bg-white/80 p-4 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Ban className="w-4 h-4 text-emerald-600" />
                <span>AD STATUS</span>
              </div>
              <span className="text-sm font-black text-emerald-700 block mt-1.5 flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                100% Ad-Free (No Ads)
              </span>
            </div>

            <div className="bg-white/80 p-4 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Gamepad2 className="w-4 h-4 text-purple-600" />
                <span>EXCLUSIVE GAMES</span>
              </div>
              <span className="text-sm font-black text-purple-700 block mt-1.5 flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                8 VIP Games Unlocked
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl p-6 bg-slate-100 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-slate-900">You are currently using the Free Guest Tier</h4>
              <p className="mt-0.5 text-slate-500 leading-relaxed">
                Unlock all 8 VIP Games (Chess, Ludo, Poker, Blackjack, etc.), enjoy an ad-free experience with zero promotional interruptions, and receive instant welcome coins.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCashUpgrade(MEMBERSHIP_PLANS[1])}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Crown className="w-4 h-4" />
            <span>Join VIP Today</span>
          </button>
        </div>
      )}

      {/* CORE MEMBERSHIP VALUE HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-wide">100% Ad-Free</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">Zero sponsor ads, no promo offerwalls or video interrupts while playing.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-wide">8 VIP Games</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">Exclusive access to Chess, Ludo Master, Texas Poker, Blackjack 21 & more.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-wide">Bonus Coin Drops</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">Receive up to +5,000 instant bonus coins directly in your wallet.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-wide">2x Multipliers</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">Double your daily streak coins and climb competitive leaderboard brackets.</p>
          </div>
        </div>
      </div>

      {/* MEMBERSHIP PLANS SELECTION */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Choose Your VIP Membership Plan</h3>
          <p className="text-xs text-slate-500">Select a membership pass to activate instant VIP perks. Upgrade with coins or standard payment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MEMBERSHIP_PLANS.map((plan) => {
            const isCurrent = isMember && user?.membershipPlan?.includes(plan.name);
            const isBusy = processingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 border relative flex flex-col justify-between transition-all ${
                  plan.isPopular 
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-lg' 
                    : 'border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-6 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border shadow-sm ${
                    plan.isPopular 
                      ? 'bg-amber-500 text-slate-950 border-amber-400' 
                      : 'bg-slate-800 text-white border-slate-700'
                  }`}>
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{plan.name}</h4>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                      Valid for {plan.durationDays} Days
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 pb-4 border-b border-slate-100">
                    <span className="text-3xl font-black text-slate-900">₹{plan.priceINR}</span>
                    <span className="text-xs text-slate-400 font-bold">or</span>
                    <span className="text-sm font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      {plan.coinCost} Coins
                    </span>
                  </div>

                  {/* Perks list */}
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {plan.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="leading-snug">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Upgrade Action Buttons */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    disabled={isCurrent || isBusy}
                    onClick={() => handleCashUpgrade(plan)}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : plan.isPopular
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-amber-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                    <span>{isCurrent ? 'Current Active Plan' : `Subscribe (₹${plan.priceINR})`}</span>
                  </button>

                  <button
                    disabled={isCurrent || isBusy}
                    onClick={() => handleCoinUpgrade(plan)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'hidden'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pay with {plan.coinCost} Coins</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXCLUSIVE MEMBERSHIP GAMES DIRECTORY */}
      <div className="bg-gradient-to-b from-amber-50/50 to-white rounded-3xl p-6 md:p-8 border border-amber-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-4">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
              MEMBER CLEARANCE ONLY
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">Exclusive VIP Games (8)</h3>
            <p className="text-xs text-slate-500">These games are unlocked exclusively for REWARDYN Members. Higher reward pools and masterplay.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300">
              👑 {VIP_GAMES_SHOWCASE.length} VIP Games
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VIP_GAMES_SHOWCASE.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl">
                    {game.icon}
                  </div>
                  <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" />
                    VIP
                  </span>
                </div>

                <h4 className="text-xs font-black text-slate-900">{game.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">{game.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-600">
                  Up to +{game.reward} Coins
                </span>

                <button
                  onClick={() => onSelectGame?.(game.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isMember
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                >
                  <span>{isMember ? 'Play Now' : 'VIP Locked'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
