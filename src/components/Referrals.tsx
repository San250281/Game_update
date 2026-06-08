/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRewardEngine } from '../lib/store';
import { Share2, Copy, Check, Users, Gift, Ticket, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Referrals() {
  const { user, referrals, applyReferralCode } = useRewardEngine();
  const [copied, setCopied] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const referralCode = user ? user.referralCode : 'GAMER777';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;

    setSubmitting(true);
    setErrorText(null);
    setSuccessText(null);

    const result = await applyReferralCode(codeInput.trim());
    setSubmitting(false);

    if (result.success) {
      setSuccessText(result.message);
      setCodeInput('');
    } else {
      setErrorText(result.message);
    }
  };

  return (
    <div className="bg-[#12141c] border border-[#232835] rounded-3xl p-6 relative overflow-hidden shadow-2xl max-w-lg mx-auto">
      {/* Background radial glow overlay */}
      <div className="absolute top-0 left-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Visual Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-3 animate-pulse">
          <Gift className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-white">Refer & Earn Program</h2>
        <p className="text-xs text-gray-400 max-w-xs mt-1">
          Share your game passion! Reward friends with bonus entry credits, and claim massive token payloads.
        </p>
      </div>

      {/* Reward Rules Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center text-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">You Receive</span>
          <h3 className="text-2xl font-black text-purple-400 mt-1">+500</h3>
          <p className="text-[10px] text-gray-400">Coins for every invited referee signup</p>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center text-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Friend Receives</span>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">+200</h3>
          <p className="text-[10px] text-gray-400">Welcome Coins instantly as active booster</p>
        </div>
      </div>

      {/* Code Sharing Area */}
      <div className="bg-[#1a1c24] border border-[#2b303d] rounded-2xl p-4 mb-6">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 text-center">
          YOUR REFERRAL CODE
        </p>
        <div className="flex items-center gap-2">
          {/* Main Visual Code Display */}
          <div className="flex-1 py-3 px-4 bg-slate-950 rounded-xl text-center font-mono font-black text-lg text-white select-all border border-slate-900 tracking-widest">
            {referralCode}
          </div>
          
          <button
            onClick={handleCopyCode}
            className={`p-3 rounded-xl transition-all border flex items-center justify-center shrink-0 ${
              copied
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-gray-300'
            }`}
          >
            {copied ? <Check className="w-5 h-5 shrink-0" /> : <Copy className="w-5 h-5 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Code Claiming Form */}
      {user && !user.referredBy ? (
        <form onSubmit={handleSubmitReferral} className="mb-6">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 flex items-center gap-1.5 justify-center">
            <Ticket className="w-4 h-4 text-purple-400" />
            WERE YOU INVITED?
          </h4>
          <p className="text-[10px] text-gray-400 text-center mb-3">
            Enter your inviter's referral code to instantly unlock 200 welcome coins.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. ALPHA77"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              className="flex-1 p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold font-mono tracking-widest text-center text-white focus:outline-none focus:border-purple-500 transition-colors uppercase placeholder-slate-700"
            />
            <button
              type="submit"
              disabled={submitting || !codeInput.trim()}
              className="px-5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.01] transition-all text-white font-extrabold text-xs uppercase tracking-wide rounded-xl cursor-pointer shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Applying...' : 'Claim Welcome Code!'}
            </button>
          </div>

          {errorText && (
            <p className="text-rose-400 text-[11px] font-medium text-center mt-2.5 flex items-center gap-1 justify-center animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errorText}
            </p>
          )}
          {successText && (
            <p className="text-emerald-400 text-[11px] font-bold text-center mt-2.5 flex items-center gap-1 justify-center animate-pulse">
              <Check className="w-3.5 h-3.5 shrink-0" />
              {successText}
            </p>
          )}
        </form>
      ) : (
        user && (
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl py-3 px-4 text-center text-xs text-gray-500 mb-6 flex items-center gap-1.5 justify-center">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Promo Code Active: You've unlocked Referral rewards. Happy gaming!</span>
          </div>
        )
      )}

      {/* Referral Standings list */}
      <div>
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Users className="w-4.5 h-4.5 text-purple-400" />
          Friends Referred History
        </h4>
        
        {referrals.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-[#232835] rounded-xl text-xs text-gray-500">
            No friend referrals recorded yet. Share your code to unlock!
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
            {referrals.map((ref) => (
              <div
                key={ref.referralId}
                className="bg-slate-900/60 p-3 border border-slate-800/70 rounded-xl flex justify-between items-center text-xs"
              >
                <div>
                  <p className="font-bold text-white shrink-0">User invited successfully</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                    REF-ID: {ref.referralId.substring(0, 10)}... • {new Date(ref.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  +500 Coins Claimed
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
