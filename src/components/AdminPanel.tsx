/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRewardEngine } from '../lib/store';
import { UserProfile } from '../types';
import UserAvatar from './UserAvatar';
import { 
  Shield, Users, TrendingUp, AlertTriangle, Coins, RefreshCw, 
  Search, ShieldAlert, ArrowUpRight, ArrowDownRight, UserX, UserCheck, Trash
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const { 
    allUsers, auditLogs, adminAdjustCoins, adminToggleUserStatus, 
    adminClearAuditLogs, adminTriggerMockFraud, user,
    withdrawalRequests, adminApproveWithdrawal, adminRejectWithdrawal
  } = useRewardEngine();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('100');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adminTab, setAdminTab] = useState<'users' | 'withdrawals' | 'fraud' | 'analytics'>('users');
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [successNotif, setSuccessNotif] = useState<string | null>(null);

  // Authenticate Admin level page permissions
  if (!user || !user.isAdmin) {
    return (
      <div className="bg-white border border-red-200 rounded-3xl p-8 text-center max-w-md mx-auto shadow-lg relative">
        <div className="w-14 h-14 bg-red-50 border border-red-150 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Access Clearance Failure</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The requested administrative directory is restricted to secure staff tokens. Your current token (<span className="text-rose-600 font-mono font-bold">{user?.email || 'unauthorized'}</span>) lacks administrative clearance.
        </p>
      </div>
    );
  }

  // Analytics helper calculations
  const totalUsersCount = allUsers.length;
  const bannedUsers = allUsers.filter((u) => !u.isActive);
  const totalCoinsEcosystem = allUsers.reduce((acc, u) => acc + u.coins, 0);
  const highLogs = auditLogs.filter((l) => l.severity === 'high');

  const filteredUserList = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Recharts metric dataset mapping
  const analyticsDataMap = allUsers
    .slice(0, 7)
    .map((u) => ({
      name: u.name.split(' ')[0],
      coins: u.coins,
      color: u.uid === user.uid ? '#d97706' : '#2563eb'
    }));

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const value = parseInt(adjustAmount);
    if (isNaN(value) || value <= 0) return;

    try {
      await adminAdjustCoins(selectedUser.uid, value, adjustType);
      setSuccessNotif(`Successfully adjusted balance! Adjusted ${selectedUser.name}'s wallet.`);
      setTimeout(() => setSuccessNotif(null), 3000);
      
      // Update local modal user state to show immediate sync
      const nextCoins = adjustType === 'credit' ? selectedUser.coins + value : Math.max(0, selectedUser.coins - value);
      setSelectedUser({
        ...selectedUser,
        coins: nextCoins
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleToggleBan = async (u: UserProfile) => {
    try {
      await adminToggleUserStatus(u.uid);
      setSuccessNotif(`Status changed! ${u.name}'s active state toggled.`);
      setTimeout(() => setSuccessNotif(null), 3500);

      if (selectedUser?.uid === u.uid) {
        setSelectedUser({
          ...selectedUser,
          isActive: !selectedUser.isActive
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Safe manual injection simulation for testing the Cyber Fraud Logs
  const handleSimulateAnomalies = () => {
    if (filteredUserList.length > 0) {
      const offender = filteredUserList[Math.floor(Math.random() * filteredUserList.length)];
      adminTriggerMockFraud(
        offender.uid, 
        'Concurrent Clicks Collision Caught', 
        'User triggered 8 taps/s on Spin Wheel. High risk pattern matching clickbot frequency schemas.'
      );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 relative shadow-md max-w-4xl mx-auto w-full text-slate-800">
      
      {/* Top Admin Section Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-5 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 border border-rose-200 text-rose-500 rounded-xl flex items-center justify-center">
            <Shield className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              Cyber Sentinel Admin Suite
              <span className="text-[9px] bg-red-100 text-red-650 px-2 py-0.5 rounded font-black border border-red-200">
                SECURE ACCESS
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">Ledger auditing, anti-cheat diagnostics, and player status adjust panel</p>
          </div>
        </div>

        {/* Tab Swappers */}
        <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-xl text-xs font-bold gap-0.5 select-none shrink-0">
          <button
            onClick={() => { setAdminTab('users'); setSelectedUser(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              adminTab === 'users' ? 'bg-white shadow-sm text-slate-900 font-extrabold' : 'text-slate-550 hover:text-slate-900'
            }`}
          >
            Players Desk
          </button>
          <button
            onClick={() => { setAdminTab('withdrawals'); setSelectedUser(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              adminTab === 'withdrawals' ? 'bg-white shadow-sm text-slate-900 font-extrabold' : 'text-slate-550 hover:text-slate-900'
            }`}
          >
            Cashouts Review {withdrawalRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="bg-amber-600 text-white px-1.5 py-0.2 select-none font-black text-[9px] rounded-full shrink-0">
                {withdrawalRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setAdminTab('fraud'); setSelectedUser(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              adminTab === 'fraud' ? 'bg-white shadow-sm text-slate-900 font-extrabold' : 'text-slate-550 hover:text-slate-900'
            }`}
          >
            Cyber Fraud {auditLogs.length > 0 && (
              <span className="bg-rose-505 text-white px-1.5 py-0.2 select-none font-black text-[9px] rounded-full shrink-0">
                {auditLogs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setAdminTab('analytics'); setSelectedUser(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              adminTab === 'analytics' ? 'bg-white shadow-sm text-slate-900 font-extrabold' : 'text-slate-550 hover:text-slate-900'
            }`}
          >
            Data Analytics
          </button>
        </div>
      </div>

      {/* NEW: Explicit Current Active User indicator (as requested by user) */}
      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm">
            👤
          </div>
          <div>
            <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
              Current Active User (You)
            </span>
            <h3 className="text-xs font-black text-slate-850 mt-1">
              {user.name} <span className="font-normal text-slate-550">({user.email})</span>
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Active State</span>
        </div>
      </div>

      {/* KPI Cards Hub */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-50 border border-rose-200 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-black">Registered</p>
            <h4 className="text-base font-black text-slate-900">{totalUsersCount} Profiles</h4>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-black">Total Circulation</p>
            <h4 className="text-base font-black text-amber-705">{totalCoinsEcosystem.toLocaleString()} Units</h4>
          </div>
        </div>

        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 text-red-650 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-red-650 uppercase font-black">Total Anomalies</p>
            <h4 className="text-base font-black text-red-700">{highLogs.length} High-Risk</h4>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-black">Banned Accounts</p>
            <h4 className="text-base font-black text-slate-900">{bannedUsers.length} Users</h4>
          </div>
        </div>
      </div>

      {successNotif && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-855 text-xs py-2.5 px-4 rounded-xl text-center font-bold mb-4 animate-pulse">
          {successNotif}
        </div>
      )}

      {/* TAB SUB-VIEWS */}
      <AnimatePresence mode="wait">
        {/* VIEW 1: User Profile Admin desk */}
        {adminTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left: User Search Table */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-2 mb-4">
                <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter users by alias/email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-transparent focus:outline-none placeholder-slate-400 text-slate-800 font-medium"
                />
              </div>

              {/* Scrollable list */}
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                {filteredUserList.map((usr) => {
                  const isCurrentActive = usr.uid === user.uid;
                  return (
                    <div
                      key={usr.uid}
                      onClick={() => setSelectedUser(usr)}
                      className={`p-3 border rounded-xl flex justify-between items-center transition-all cursor-pointer ${
                        selectedUser?.uid === usr.uid
                          ? 'bg-rose-50 border-rose-300 text-slate-905'
                          : 'bg-slate-50/50 border-slate-150 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={usr.photoURL}
                          name={usr.name}
                          className="w-9 h-9 rounded-xl border border-slate-200"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-850 leading-tight flex items-center gap-1.5">
                            {usr.name}
                            {isCurrentActive && (
                              <span className="text-[7.5px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                                Active You
                              </span>
                            )}
                            {!usr.isActive && (
                              <span className="text-[8px] bg-red-500 text-white px-1 py-0.2 rounded font-black uppercase">
                                Banned
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-none mt-1.5 truncate">
                            {usr.email} • {usr.provider.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-4">
                        <div>
                          <span className="text-xs font-black text-amber-700 flex items-center gap-0.5 justify-end">
                            {usr.coins.toLocaleString()}
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                          </span>
                          <p className="text-[9px] text-slate-500 mt-0.5">Coins Balance</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected User Actions Sheet */}
            <div className="lg:col-span-1">
              {selectedUser ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative">
                  <div className="flex flex-col items-center text-center border-b border-slate-200 pb-4 mb-4">
                    <UserAvatar
                      src={selectedUser.photoURL}
                      name={selectedUser.name}
                      className="w-14 h-14 rounded-2xl border-2 border-slate-200"
                    />
                    <h3 className="text-xs font-black text-rose-950 mt-2">{selectedUser.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 pr-1 truncate max-w-full">
                      UID: {selectedUser.uid}
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-4">
                    {/* Active Ban status toggle */}
                    <div className="flex justify-between items-center bg-white border border-slate-200 p-3.5 rounded-xl text-xs">
                      <div>
                        <p className="font-extrabold text-slate-800">Profile status</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Toggle bans immediately</p>
                      </div>

                      <button
                        id="admin_status_toggle_btn"
                        onClick={() => handleToggleBan(selectedUser)}
                        className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold text-[10px] uppercase cursor-pointer transition-all ${
                          selectedUser.isActive
                            ? 'bg-red-50 border-red-200 text-red-650 hover:bg-red-100'
                            : 'bg-emerald-50 border-emerald-250 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {selectedUser.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        {selectedUser.isActive ? 'Ban User' : 'Revoke Ban'}
                      </button>
                    </div>

                    {/* Manual Balance Credit Adjustment Form */}
                    <form onSubmit={handleAdjustBalance} className="bg-white border border-slate-200 p-3.5 rounded-xl">
                      <p className="text-xs font-bold text-slate-850 mb-2 text-center">Coin balance overrides</p>
                      
                      {/* credit vs debit tabs */}
                      <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-lg text-[10px] font-bold mb-3">
                        <button
                          type="button"
                          onClick={() => setAdjustType('credit')}
                          className={`py-1.5 rounded-md flex items-center justify-center gap-1 cursor-pointer ${
                            adjustType === 'credit' ? 'bg-white shadow-sm text-slate-900 font-black' : 'text-slate-500'
                          }`}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                          Credit (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustType('debit')}
                          className={`py-1.5 rounded-md flex items-center justify-center gap-1 cursor-pointer ${
                            adjustType === 'debit' ? 'bg-white shadow-sm text-slate-900 font-black' : 'text-slate-500'
                          }`}
                        >
                          <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                          Debit (-)
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          className="w-1/2 p-2 bg-slate-50 border border-slate-250 text-xs text-center text-slate-800 rounded-lg focus:outline-none placeholder-slate-400 font-bold"
                        />
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-rose-550 border border-rose-650 text-slate-900 text-[10px] font-black uppercase rounded-lg tracking-wider cursor-pointer hover:bg-rose-50 bg-rose-50 transition-colors"
                        >
                          Push Adjust
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 text-center text-xs text-slate-500 h-64 flex flex-col items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-slate-400 mb-2" />
                  <span>Select an active profile from the ledger list to make coin adjustments or handle account bans.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW: Withdrawal Approvals reviewed by Admins */}
        {adminTab === 'withdrawals' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-4 font-sans text-slate-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Pending and Resolved Cash-out Auditing Ledger
              </h3>
            </div>

            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {withdrawalRequests.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl text-xs text-slate-400 bg-slate-50">
                  Perfect! Zero withdrawal request lines registered on ecosystem servers.
                </div>
              ) : (
                withdrawalRequests.map((req) => {
                  const isPending = req.status === 'pending';
                  const userAccount = allUsers.find(u => u.uid === req.uid);
                  const userCoins = userAccount?.coins ?? 0;

                  return (
                    <div
                      key={req.requestId}
                      className={`p-4 border rounded-2xl flex flex-col gap-3 transition-colors ${
                        isPending 
                          ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-850">
                              {req.userName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">({req.userEmail})</span>
                            
                            <span className="text-[9px] bg-slate-250 border border-slate-300 rounded px-1.5 py-0.5 text-slate-600 font-mono font-bold">
                              User Bal: {userCoins.toLocaleString()} Coins
                            </span>
                          </div>
                          
                          <p className="text-[10px] font-mono text-slate-400 mt-1">
                            Req ID: {req.requestId} • Created: {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="text-right sm:self-start">
                          <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-lg border leading-none ${
                            req.status === 'pending' ? 'bg-amber-150 text-amber-800 border-amber-300' :
                            req.status === 'approved' ? 'bg-emerald-100/70 text-emerald-800 border-emerald-300 animate-pulse' :
                            'bg-red-50 text-red-650 border-red-200'
                          }`}>
                            {req.status}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 mt-1.5">
                            {req.amountCoins.toLocaleString()} Coins (${(req.amountCoins / 1000).toFixed(2)})
                          </h4>
                        </div>
                      </div>

                      {/* Payment Address Box */}
                      <div className="bg-white/95 p-2.5 rounded-xl border border-slate-210 text-xs font-mono text-slate-700 select-all truncate">
                        <span className="font-extrabold text-slate-450 uppercase text-[9px] mr-1.5">Payout Target:</span>
                        {req.paymentMethod} • {req.paymentDetails}
                      </div>

                      {/* Action forms for review of pending payout tickets */}
                      {isPending ? (
                        <div className="bg-white border border-amber-200 p-3 rounded-xl flex flex-col gap-2">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">
                            Administrator audit review note (reasons, codes, references)
                          </label>
                          
                          <div className="flex flex-col sm:flex-row gap-2.5">
                            <input
                              type="text"
                              placeholder="Review note (e.g. PayPal Transaction ID: FX-183 or Rejection: flag anomaly fraud detected)"
                              value={adminNotes[req.requestId] || ''}
                              onChange={(e) => setAdminNotes({
                                ...adminNotes,
                                [req.requestId]: e.target.value
                              })}
                              className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-400"
                            />

                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={async () => {
                                  await adminApproveWithdrawal(req.requestId, adminNotes[req.requestId]);
                                  setSuccessNotif(`Approved withdrawal request to ${req.userName}! Successfully debited points.`);
                                  setTimeout(() => setSuccessNotif(null), 3500);
                                }}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-1"
                              >
                                Approve
                              </button>
                              
                              <button
                                onClick={async () => {
                                  await adminRejectWithdrawal(req.requestId, adminNotes[req.requestId]);
                                  setSuccessNotif(`Rejected cash-out request from ${req.userName}. Refund intact.`);
                                  setTimeout(() => setSuccessNotif(null), 3500);
                                }}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-1"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        req.adminMessage && (
                          <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed flex gap-1.5 ${
                            req.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-850' : 'bg-red-50 border-red-100 text-red-800'
                          }`}>
                            <span className="font-extrabold uppercase tracking-wider shrink-0">Admin Log:</span>
                            <span>{req.adminMessage}</span>
                            {req.processedAt && (
                              <span className="text-[10px] text-slate-400 font-mono font-medium ml-auto">
                                {new Date(req.processedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 2: Cyber Fraud Logging */}
        {adminTab === 'fraud' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Active Anti-Cheat Intrusion Detections
                </h3>
              </div>

              <div className="flex gap-2">
                {/* Simulated payload generator */}
                <button
                  id="simulate_fraud_admin_btn"
                  onClick={handleSimulateAnomalies}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-200 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Trigger Test Collision
                </button>

                {auditLogs.length > 0 && (
                  <button
                    id="clear_fraud_admin_btn"
                    onClick={adminClearAuditLogs}
                    className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-655 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Trash className="w-3.5 h-3.5" />
                    Wipe Logs
                  </button>
                )}
              </div>
            </div>

            {/* Fraud list Table */}
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl text-xs text-slate-400">
                  Total Integrity Clear: No security/cheat flags recorded yet in system monitors.
                </div>
              ) : (
                auditLogs.map((log) => {
                  const isHigh = log.severity === 'high';
                  return (
                    <div
                      key={log.id}
                      className={`p-3.5 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-colors ${
                        isHigh
                          ? 'bg-red-50 border-red-200 text-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isHigh ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {log.severity.toUpperCase()} ALERT
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 shrink-0 truncate">{log.message}</h4>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2">{log.details}</p>
                        <span className="text-[9px] text-slate-500 font-mono mt-1 font-semibold flex items-center gap-1">
                          Offender: <span className="text-slate-700 font-bold">{log.userName}</span> ({log.uid})
                        </span>
                      </div>

                      <span className="text-[9px] text-slate-550 font-mono shrink-0 font-bold">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 3: Recharts Analytical graphs */}
        {adminTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-5 border border-slate-200 bg-slate-50 p-5 rounded-3xl"
          >
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1">Ecosystem Holdings Analytics</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Comparison of net coin ledger aggregates across the top 7 competing accounts on the platform.
              </p>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsDataMap} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px', color: '#1e293b' }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                  />
                  <Bar dataKey="coins" radius={[8, 8, 0, 0]}>
                    {analyticsDataMap.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
