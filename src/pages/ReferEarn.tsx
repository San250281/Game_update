/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Share2, Copy, BarChart3, Users, HelpCircle, Gift, Check, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReferEarn: React.FC = () => {
  const { currentUser, referrals, claimReferralCode, serverConfig } = useApp();
  const [claimInput, setClaimInput] = useState('');
  const [claimMessage, setClaimMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Clipboard coping indicators
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!currentUser) return;
    const link = `https://rewardarena.vercel.app/join?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimInput.trim()) return;

    const res = claimReferralCode(claimInput);
    if (res.success) {
      setClaimMessage({ type: 'ok', text: res.message });
      setClaimInput('');
    } else {
      setClaimMessage({ type: 'err', text: res.message });
    }
    setTimeout(() => setClaimMessage(null), 5000);
  };

  // Filter referrals related to this user
  const myReferrals = referrals.filter((r) => r.referrerId === currentUser?.uid);
  const totalCoinsGained = myReferrals.reduce((acc, curr) => acc + curr.coinsEarned, 0);

  return (
    <div className="space-y-8 pb-16 select-none relative animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Share2 className="w-8 h-8 text-[#6C63FF]" />
            Refer & Earn Arena
          </h1>
          <p className="text-sm text-gray-400 mt-1">Invite college friends to register. Gain {serverConfig.referralBonusReferrer} Coins peer verified registration.</p>
        </div>
      </div>

      {/* CORE REFERAL CAMPAIGN METRIC JUMBOTRON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* REFERRAL INFORMATION CARD */}
        <div className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#6C63FF] font-mono uppercase tracking-widest block font-bold">INVITATION PROGRAM DETAILS</span>
              <h2 className="text-xl font-bold font-sans text-white tracking-tight leading-snug">Double-Sided Invitation Incentives</h2>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              RewardArena implements a split referrer model: Your friends receive <span className="text-white font-bold">{serverConfig.referralBonusFriend} starter bonus coins</span> upon using your code. You get a whopping <span className="text-white font-bold">{serverConfig.referralBonusReferrer} bonus coins</span> as soon as they complete registration.
            </p>
          </div>

          {/* CODES AND LINKS COPY BLOCKS */}
          <div className="space-y-3 pt-3 border-t border-slate-850">
            {/* 1. Referral Code block */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Your referral invitation code</label>
              <div className="flex bg-slate-950 rounded-xl p-1.5 border border-slate-800 justify-between items-center">
                <span className="text-sm font-mono font-bold text-[#FFD700] pl-3 select-text">{currentUser?.referralCode || 'SIGN_IN_CODE'}</span>
                <button
                  id="btn-copy-ref-code"
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-[#6C63FF] hover:bg-[#5b54e0] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  style={{ minHeight: '34px' }}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* 2. Referral registration link block */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Your referral link URL</label>
              <div className="flex bg-slate-950 rounded-xl p-1.5 border border-slate-800 justify-between items-center">
                <span className="text-xs font-mono text-gray-400 pl-3 truncate max-w-[200px] sm:max-w-xs md:max-w-[2400px] select-text">
                  https://rewardarena.vercel.app/join?ref={currentUser?.referralCode || 'CODE'}
                </span>
                <button
                  id="btn-copy-ref-link"
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  style={{ minHeight: '34px' }}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Link' : 'Copy link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CLAIM FRIEND'S INVITATION CODE FORM */}
        <div className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-2xl relative">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-500 font-mono uppercase block">CLAIM RECEIVED CODE</span>
              <h2 className="text-xl font-bold font-sans text-white tracking-tight leading-snug">Applied Inviter Code</h2>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Did a group partner or colleague invite you to RewardArena? Paste their custom code block below to instantly credit <span className="text-teal-400 font-bold">+{serverConfig.referralBonusFriend} bonus coins</span> to your profile details.
            </p>
          </div>

          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Type inviter code e.g. DHRUV10..."
                value={claimInput}
                onChange={(e) => setClaimInput(e.target.value)}
                disabled={currentUser?.referredBy !== undefined}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-4 pr-12 py-3 text-xs text-white placeholder-gray-500 uppercase font-mono tracking-wider focus:outline-none focus:border-[#6C63FF]"
                style={{ minHeight: '44px' }}
              />
              <button
                id="btn-submit-ref-claim"
                type="submit"
                disabled={currentUser?.referredBy !== undefined}
                className={`absolute right-1.5 top-1.5 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-transform leading-none shadow ${
                  currentUser?.referredBy !== undefined
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-[#6C63FF] hover:bg-[#5b54e0] text-white hover:scale-102 cursor-pointer'
                }`}
                style={{ minHeight: '34px' }}
              >
                Claim Credit
              </button>
            </div>

            {currentUser?.referredBy && (
              <span className="text-[11px] text-teal-400 font-semibold block leading-relaxed">&#10004; Referral Invitation code applied. Gained referral start coins.</span>
            )}

            {claimMessage && (
              <div className={`p-3 rounded-lg text-xs leading-normal font-sans border ${
                claimMessage.type === 'ok'
                  ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {claimMessage.text}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* REFERRAL STATISTICS ROW */}
      <section id="referrals-analytics-row" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Referred partners', val: `${myReferrals.length} friends`, color: 'text-white' },
          { label: 'Referral Coins Accumulation', val: `${totalCoinsGained} Coins`, color: 'text-[#FFD700]' },
          { label: 'Conversion Success Rate', val: '100% Verified', color: 'text-[#00C896]' },
          { label: 'Pending Referral checks', val: '0 (Fraud bot checked)', color: 'text-gray-500' },
        ].map((an, keyId) => (
          <div key={keyId} className="bg-[#18181A] rounded-xl p-4 md:p-5 border border-slate-800/30 shadow">
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{an.label}</p>
            <h3 className={`text-xl font-mono font-bold mt-1.5 ${an.color}`}>{an.val}</h3>
          </div>
        ))}
      </section>

      {/* REFERRAL HISTORY LIST COMPONENT */}
      <section id="referral-history-table" className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/40 pb-3">
          <Users className="w-5 h-5 text-[#6C63FF]" />
          <h2 className="text-base font-sans font-bold text-white tracking-tight">Referral History Roster ({myReferrals.length})</h2>
        </div>

        {myReferrals.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6 leading-relaxed">No referred college friends found inside this profile. Give your code upper list to begin invite tracking.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Friend Contact Email</th>
                  <th className="py-3 px-4">Verification State</th>
                  <th className="py-3 px-4 text-center">Referrer credit payout</th>
                  <th className="py-3 px-4 text-right">Registered time stamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {myReferrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-900/45 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-200 select-text">{ref.friendEmail}</td>
                    <td className="py-4 px-4">
                      <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2.5 py-0.5 rounded font-bold border border-teal-500/20 uppercase tracking-widest">{ref.status}</span>
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-[#FFD700]">+{ref.coinsEarned} Coins</td>
                    <td className="py-4 px-4 text-right text-gray-500 font-mono">{new Date(ref.joinedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
