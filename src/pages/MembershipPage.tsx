/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Zap, Sparkles, Check, AlertCircle, RefreshCw, Calendar, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MEMBERSHIP_PLANS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

export const MembershipPage: React.FC = () => {
  const { currentUser, purchaseMembership, addNotification } = useApp();
  const [buyingPlanId, setBuyingPlanId] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    setBuyingPlanId(planId);
    try {
      const success = await purchaseMembership(planId);
      if (success) {
        // Success complete
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBuyingPlanId(null);
    }
  };

  const isPremium = currentUser?.membershipPlan && currentUser.membershipPlan !== 'none';

  return (
    <div className="space-y-8 pb-16 select-none relative animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Zap className="w-8 h-8 text-[#FFD700] fill-[#FFD700] animate-bounce" />
            Arena Premium Membership
          </h1>
          <p className="text-sm text-gray-400 mt-1">Upgrade your clearance level. Gain high coin-earning access, prioritised e-Vouchers and executive surveys.</p>
        </div>

        {/* Secured Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <ShieldCheck className="w-4.5 h-4.5 text-[#00C896]" />
          <span>Razorpay gateway secure</span>
        </div>
      </div>

      {/* ACTIVE MEMBERSHIP DASHBOARD CARD */}
      {isPremium ? (
        <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/20 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/10 pb-5">
            <div className="space-y-1.5">
              <span className="text-[10px] text-amber-500 font-mono uppercase tracking-widest block font-bold">CLEARANCE ACCESS STATE: ACTIVE</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#FFD700] animate-pulse" />
                {currentUser?.membershipPlan} Premium Pass Active
              </h2>
            </div>
            <div className="bg-[#FFD700] text-slate-950 font-sans font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md select-none">
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>PREMIUM GRANTED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-mono text-slate-300">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="text-xs">
                <span className="text-gray-500 block">MEMBERSHIP EXPIRE DATE</span>
                <span className="text-white font-semibold block mt-1">{currentUser?.membershipExpiresAt ? new Date(currentUser.membershipExpiresAt).toLocaleDateString() : 'Active'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div className="text-xs">
                <span className="text-gray-500 block">DAYS REMAINING IN CURRENT CYCLE</span>
                <span className="text-[#00C896] font-extrabold block mt-1">
                  {currentUser?.membershipExpiresAt
                    ? `${Math.max(1, Math.round((new Date(currentUser.membershipExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days left`
                    : 'Unending'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[#00C896]" />
              <div className="text-xs">
                <span className="text-gray-500 block">INCLUDED BENEFITS STATUS</span>
                <span className="text-white font-semibold block mt-1">BitLabs & CPX surveys unlocked</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-5 bg-[#18181A] border border-slate-800/40 text-xs text-gray-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            You are operating with a FREE standard guest sandbox account level. Please buy an active pass below to participate in premium market consumer surveys, convert high-tier vouchers and get priority transaction processing.
          </p>
        </div>
      )}

      {/* SUBSCRIPTION PLANS SELECTION LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {MEMBERSHIP_PLANS.map((plan) => {
          const isCurrent = currentUser?.membershipPlan === plan.name;
          const isPopular = plan.id === 'plan_weekly';

          return (
            <div
              id={`plan-card-${plan.id}`}
              key={plan.id}
              className={`bg-[#18181A] rounded-2xl p-6 border relative flex flex-col justify-between space-y-6 shadow-2xl transition-all ${
                isCurrent
                  ? 'border-[#00C896] ring-2 ring-[#00C896]/10'
                  : isPopular
                  ? 'border-[#6C63FF]/80 scale-103 shadow-[#6C63FF]/5'
                  : 'border-slate-800/40'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6C63FF] text-white font-sans font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full border border-[#6C63FF]/30">
                  OUR TARGET SELECTION
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                  <span className="text-[10px] text-gray-500 uppercase font-mono mt-0.5 block">Access valid for {plan.durationDays} days</span>
                </div>

                <div className="flex items-baseline gap-1 font-sans border-b border-slate-850 pb-4">
                  <span className="text-3xl font-extrabold text-white">₹{plan.priceINR}</span>
                  <span className="text-xs text-gray-500 font-mono">/one-time</span>
                </div>

                {/* perks lists */}
                <ul className="text-xs text-gray-300 space-y-3 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#00C896] shrink-0" />
                    <span className="text-amber-400 font-bold font-mono">+{plan.coins} Free Coins bonus air-dropped</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#00C896] shrink-0" />
                    <span>Unlocks BitLabs surveys</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#00C896] shrink-0" />
                    <span>Unlocks CPX Research panels</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#00C896] shrink-0" />
                    <span>AdGate High-payout tracking</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#00C896] shrink-0" />
                    <span>Priority Gift-card dispatch under 2 hours</span>
                  </li>
                </ul>
              </div>

              <button
                id={`btn-purchase-plan-${plan.id}`}
                onClick={() => handlePurchase(plan.id)}
                disabled={isCurrent || buyingPlanId !== null}
                className={`w-full py-3 font-sans font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-500 border border-slate-800/40 cursor-default'
                    : isPopular
                    ? 'bg-gradient-to-r from-[#6C63FF] to-[#8077FF] hover:from-[#5b54e0] hover:to-[#6C63FF] text-white shadow-[#6C63FF]/15'
                    : 'bg-slate-800 hover:bg-slate-750 text-gray-200'
                }`}
                style={{ minHeight: '44px' }}
              >
                {buyingPlanId === plan.id ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Authorising Gateway...</span>
                  </span>
                ) : isCurrent ? (
                  'Active Clearanced Plan'
                ) : (
                  `Subscribe (₹${plan.priceINR})`
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
