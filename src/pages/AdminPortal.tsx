/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Users, CreditCard, Coins, Gift, ClipboardList, Megaphone, BarChart3, Settings, CheckCircle2, UserCheck, XCircle, Trash2, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const AdminPortal: React.FC = () => {
  const { currentUser, setUsers, users, redemptions, setRedemptions, campaigns, setCampaigns, addNotification } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<string>('Overview');

  // Manual Adjuster parameters
  const [targetUserId, setTargetUserId] = useState('');
  const [coinAdjustmentAmount, setCoinAdjustmentAmount] = useState<number>(100);

  // Administrative simulate trigger bypass
  const [simulatedRole, setSimulatedRole] = useState<UserRole>(currentUser?.role || UserRole.USER);

  const simulateAdminIdentity = () => {
    if (currentUser) {
      currentUser.role = UserRole.ADMIN;
      setSimulatedRole(UserRole.ADMIN);
      addNotification('Granted simulation administrator privileges.', 'Notification Received');
    }
  };

  const isAdmin = simulatedRole === UserRole.ADMIN || currentUser?.role === UserRole.ADMIN;

  // Real-time calculation metrics
  const totalRegisteredUsers = users.length;
  const premiumUsers = users.filter((u) => u.role === UserRole.PREMIUM_USER).length;
  const ultimatePlatformCoinsUsed = users.reduce((acc, curr) => acc + curr.coins, 0);

  // Core administrative functions
  const handleGiftCoins = () => {
    if (!targetUserId) {
      alert('Select a user to adjust.');
      return;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid === targetUserId) {
          const updatedCoins = u.coins + coinAdjustmentAmount;
          addNotification(`Admin adjustment: Added ${coinAdjustmentAmount} coins to ${u.username}`, 'Notification Received');
          return {
            ...u,
            coins: updatedCoins,
            lifetimeCoins: coinAdjustmentAmount > 0 ? u.lifetimeCoins + coinAdjustmentAmount : u.lifetimeCoins,
          };
        }
        return u;
      })
    );

    setCoinAdjustmentAmount(100);
    alert('Coins adjusted and recorded securely in database.');
  };

  const handleApproveRedemption = (redId: string) => {
    const defaultCodes = [
      'AMZN-X679-PQ81',
      'FLIP-B110-KW45',
      'STEAM-Y991-LK00',
      'PLAY-Q254-OP88',
    ];
    const pickedCode = defaultCodes[Math.floor(Math.random() * defaultCodes.length)];
    const pickedPin = Math.floor(1000 + Math.random() * 9000).toString();

    setRedemptions((prev) =>
      prev.map((red) => {
        if (red.id === redId) {
          addNotification(`Administrator delivered Gift Card for redemption #${redId}`, 'Notification Received');
          return {
            ...red,
            status: 'Delivered',
            giftCode: pickedCode,
            giftPin: pickedPin,
          };
        }
        return red;
      })
    );
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  if (!isAdmin) {
    return (
      <div className="space-y-8 pb-16 relative select-none">
        <div className="bg-gradient-to-b from-[#18181A] to-[#121215] border border-slate-800/80 rounded-2xl p-6 md:p-12 text-center max-w-xl mx-auto shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto border border-rose-500/20 text-rose-400">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">ADMINISTRATIVE ACCESS SECURED LOCK</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Your active authorization layer is standard guest. Sign in using an administrative root account or trigger simulated bypass below.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-850">
            <button
              id="btn-simulate-admin"
              onClick={simulateAdminIdentity}
              className="px-6 py-2.5 bg-[#6C63FF] hover:bg-[#5b54e0] text-white font-semibold rounded-lg text-xs cursor-pointer shadow-md"
              style={{ minHeight: '38px' }}
            >
              Simulate Admin credentials (Bypass)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 select-none relative animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-8 h-8 text-[#6C63FF]" />
            Control Center Operations ROOM
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-sans">Full-suite dashboard for user wallets adjustments, campaigns, and vouchers delivery pipelines.</p>
        </div>

        {/* Categories modules toggler */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {['Overview', 'Users Module', 'Gift-Cards Deliveries', 'Campaigns Overview'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveAdminTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                activeAdminTab === tab
                  ? 'bg-[#6C63FF] text-white'
                  : 'bg-[#18181A] text-gray-400 hover:text-white border border-slate-800/40'
              }`}
              style={{ minHeight: '34px' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER DYNAMIC MODULES */}
      {activeAdminTab === 'Overview' && (
        <div className="space-y-8">
          {/* STATS MATRIX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#18181A] rounded-2xl border border-slate-800 p-5 space-y-2 relative overflow-hidden">
              <Users className="absolute right-4 top-4 w-12 h-12 text-[#6C63FF]/5" />
              <p className="text-[10px] text-gray-500 font-mono uppercase">TOTAL USERS</p>
              <h3 className="text-3xl font-mono font-black text-white">{totalRegisteredUsers}</h3>
              <span className="text-[10px] text-gray-500">Live active consumer profiles</span>
            </div>

            <div className="bg-[#18181A] rounded-2xl border border-slate-800 p-5 space-y-2 relative overflow-hidden">
              <CreditCard className="absolute right-4 top-4 w-12 h-12 text-teal-400/5" />
              <p className="text-[10px] text-gray-500 font-mono uppercase">PREMIUM PAID MEMBERS</p>
              <h3 className="text-3xl font-mono font-black text-[#00C896]">{premiumUsers}</h3>
              <span className="text-[10px] text-gray-500">Subscribed active Razorpay passes</span>
            </div>

            <div className="bg-[#18181A] rounded-2xl border border-slate-800 p-5 space-y-2 relative overflow-hidden">
              <Coins className="absolute right-4 top-4 w-12 h-12 text-[#FFD700]/5" />
              <p className="text-[10px] text-gray-500 font-mono uppercase">COINS CIRCULATING</p>
              <h3 className="text-3xl font-mono font-black text-[#FFD700]">{ultimatePlatformCoinsUsed}</h3>
              <span className="text-[10px] text-gray-500">Total stored in user ledgers</span>
            </div>

            <div className="bg-[#18181A] rounded-2xl border border-slate-800 p-5 space-y-2 relative overflow-hidden">
              <Gift className="absolute right-4 top-4 w-12 h-12 text-rose-400/5" />
              <p className="text-[10px] text-gray-500 font-mono uppercase">PENDING VOUCHERS REDEMPTIONS</p>
              <h3 className="text-3xl font-mono font-black text-rose-400">{redemptions.filter((r) => r.status === 'Pending').length}</h3>
              <span className="text-[10px] text-gray-500">Required direct security dispatch</span>
            </div>
          </div>

          {/* Quick stats details summary card */}
          <section className="bg-gradient-to-r from-[#18181A] to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Operational Profit breakdown (Razorpay simulate)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-gray-500 block">MEMBERSHIPS REVENUE</span>
                <span className="text-lg font-black text-white mt-1 block">₹{premiumUsers * 149} INR</span>
                <span className="text-[9px] text-[#00C896] block mt-0.5">Recurring cycle estimate</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-gray-500 block">SPONSORED CAMPAIGNS SPENT</span>
                <span className="text-lg font-black text-[#FFD700] mt-1 block">₹{campaigns.reduce((a, b) => a + b.budgetINR, 0)} INR</span>
                <span className="text-[9px] text-[#00C896] block mt-0.5">Advertisers pipeline deposits</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-gray-500 block">AVERAGE CLICK CONVERSION COST</span>
                <span className="text-lg font-black text-white mt-1 block">₹0.15 INR</span>
                <span className="text-[9px] text-[#6C63FF] block mt-0.5">Optimized Offerwall metrics</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeAdminTab === 'Users Module' && (
        <div className="space-y-8">
          {/* USER WALLET ADHUSTMENT TOOLBOX */}
          <div className="bg-[#18181A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Adjustment Ledger Interface</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 font-mono block">Target User Account</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2 text-xs text-white rounded-lg focus:outline-none"
                  style={{ minHeight: '38px' }}
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u.uid} value={u.uid}>{u.username} ({u.coins} Coins)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-gray-500 font-mono block">Coins Delta value (+ / -)</label>
                <input
                  type="number"
                  placeholder="e.g. 500 or -200..."
                  value={coinAdjustmentAmount}
                  onChange={(e) => setCoinAdjustmentAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 px-3 py-2 text-xs text-white rounded-lg focus:outline-none"
                  style={{ minHeight: '38px' }}
                />
              </div>

              <div className="flex items-end">
                <button
                  id="btn-execute-coin-adjustment"
                  onClick={handleGiftCoins}
                  className="w-full py-2 bg-[#6C63FF] hover:bg-[#5b54e0] text-white font-semibold rounded-lg text-xs cursor-pointer"
                  style={{ minHeight: '38px' }}
                >
                  Adjust Client Wallet
                </button>
              </div>
            </div>
          </div>

          {/* USERS COMPLETE LIST */}
          <div className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800/40">Contenders lists ({users.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 pb-2 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                    <th className="py-2.5 px-4">UID / Username</th>
                    <th className="py-2.5 px-4">Email Details</th>
                    <th className="py-2.5 px-4">Account Role</th>
                    <th className="py-2.5 px-4">Membership Active</th>
                    <th className="py-2.5 px-4 text-right">Coins Standings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {users.map((account) => (
                    <tr key={account.uid} className="hover:bg-slate-900/40">
                      <td className="py-4 px-4 font-mono">
                        <span className="text-gray-200 block font-bold">{account.username}</span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">{account.uid}</span>
                      </td>
                      <td className="py-4 px-4 font-mono select-text">{account.email}</td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-gray-300 uppercase font-mono">{account.role}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold ${account.membershipPlan !== 'none' ? 'text-[#00C896]' : 'text-gray-500'}`}>
                          {account.membershipPlan}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-bold text-sm text-[#FFD700]">{account.coins} Coins</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'Gift-Cards Deliveries' && (
        <div className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800/40">Redemptions dispatch pipelines ({redemptions.length})</h3>

          {redemptions.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No voucher conversions requested historically.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 pb-2 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                    <th className="py-2.5 px-4">Request ID</th>
                    <th className="py-2.5 px-4">Voucher specs</th>
                    <th className="py-2.5 px-4">Target values</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {redemptions.map((red) => (
                    <tr key={red.id} className="hover:bg-slate-900/40">
                      <td className="py-4 px-4 font-mono">
                        <span className="text-gray-200 block font-bold">{red.id}</span>
                        <span className="text-[9px] text-gray-500 block">At: {new Date(red.requestDate).toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-200 block leading-tight">{red.title}</span>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs">
                        <span className="text-[#FFD700] font-bold block">{red.coinCost} Coins</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          red.status === 'Delivered'
                            ? 'bg-teal-500/10 text-[#00C896] border border-teal-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {red.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {red.status === 'Pending' ? (
                          <button
                            id={`btn-approve-redemption-${red.id}`}
                            onClick={() => handleApproveRedemption(red.id)}
                            className="px-3 py-1.5 bg-[#00C896] hover:bg-[#00ab80] text-slate-950 font-bold text-[10px] uppercase rounded transition-transform cursor-pointer"
                          >
                            Deliver Code
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-mono select-text">{red.giftCode}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeAdminTab === 'Campaigns Overview' && (
        <div className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800/40 font-mono">Interactive Sponsor Campaign boards ({campaigns.length})</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800/60 flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[9px] text-gray-500 font-mono uppercase block">{camp.type}</span>
                    <h4 className="text-xs font-bold text-gray-200 mt-0.5 leading-snug">{camp.title}</h4>
                  </div>
                  <button
                    id={`btn-delete-campaign-${camp.id}`}
                    onClick={() => handleDeleteCampaign(camp.id)}
                    className="p-1.5 hover:bg-slate-850 rounded-lg text-rose-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono font-medium text-slate-400 border-t border-b border-slate-850 py-2.5">
                  <div>
                    <span>CLICKS DELIVERED</span>
                    <span className="block font-bold text-white text-xs mt-0.5">{camp.currentClicks}</span>
                  </div>
                  <div>
                    <span>TARGET GOAL</span>
                    <span className="block font-bold text-white text-xs mt-0.5">{camp.targetClicks}</span>
                  </div>
                  <div>
                    <span>BUDGET ALLOCATED</span>
                    <span className="block font-bold text-white text-xs mt-0.5">₹{camp.budgetINR} INR</span>
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-[9px] text-gray-500">
                  <span>Adv ID: {camp.advertiserId}</span>
                  <span className={`font-bold ${camp.isActive ? 'text-[#00C896]' : 'text-rose-400'}`}>
                    {camp.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
