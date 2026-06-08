/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRewardEngine, AuditLog } from '../lib/store';
import { UserProfile } from '../types';
import { 
  Shield, Users, TrendingUp, AlertTriangle, Coins, RefreshCw, 
  Search, ShieldAlert, ArrowUpRight, ArrowDownRight, UserX, UserCheck, Trash
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const { 
    allUsers, auditLogs, adminAdjustCoins, adminToggleUserStatus, 
    adminClearAuditLogs, adminTriggerMockFraud, user 
  } = useRewardEngine();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('100');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adminTab, setAdminTab] = useState<'users' | 'fraud' | 'analytics'>('users');
  const [successNotif, setSuccessNotif] = useState<string | null>(null);

  // Authenticate Admin level page permissions
  if (!user || !user.isAdmin) {
    return (
      <div className="bg-[#12141c] border border-red-500/30 rounded-3xl p-8 text-center max-w-md mx-auto shadow-2xl relative">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-white uppercase tracking-wider">Access Clearance Failure</h2>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          The requested administrative directory is restricted to secure staff tokens. Your current token (<span className="text-rose-400 font-mono font-bold">{user?.email || 'unauthorized'}</span>) lacks administrative clearance.
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
      color: u.uid === user.uid ? '#fbbf24' : '#8b5cf6'
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
    <div className="bg-[#12141c] border border-[#232835] rounded-3xl p-6 relative shadow-2xl max-w-4xl mx-auto w-full">
      {/* Top Admin Section Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
            <Shield className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              Cyber Sentinel Admin Suite
              <span className="text-[9px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded font-black border border-red-500/25">
                SECURE ACCESS
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">Ledger auditing, anti-cheat diagnostics, and player status adjust panel</p>
          </div>
        </div>

        {/* Tab Swappers */}
        <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-xs font-bold gap-0.5">
          <button
            onClick={() => { setAdminTab('users'); setSelectedUser(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              adminTab === 'users' ? 'bg-rose-500/15 border border-rose-500/10 text-rose-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            Players Desk
          </button>
          <button
            onClick={() => { setAdminTab('fraud'); setSelectedUser(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              adminTab === 'fraud' ? 'bg-rose-500/15 border border-rose-500/10 text-rose-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            Cyber Fraud {auditLogs.length > 0 && (
              <span className="bg-rose-500 text-slate-950 px-1 py-0.1 select-none font-black text-[9px] rounded-full shrink-0">
                {auditLogs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setAdminTab('analytics'); setSelectedUser(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              adminTab === 'analytics' ? 'bg-rose-500/15 border border-rose-500/10 text-rose-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            Data Analytics
          </button>
        </div>
      </div>

      {/* KPI Cards Hub */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-black">Registered</p>
            <h4 className="text-lg font-black text-white">{totalUsersCount} Profiles</h4>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-500/10 text-yellow-400 rounded-xl flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-black">Total Circulation</p>
            <h4 className="text-lg font-black text-yellow-450">{totalCoinsEcosystem.toLocaleString()} Units</h4>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-black">Total Anomalies</p>
            <h4 className="text-lg font-black text-red-405">{highLogs.length} High-Risk</h4>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-800 text-gray-400 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-black">Banned Accounts</p>
            <h4 className="text-lg font-black text-white">{bannedUsers.length} Users</h4>
          </div>
        </div>
      </div>

      {successNotif && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-2.5 px-4 rounded-xl text-center font-bold mb-4 animate-pulse">
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
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-2 mb-4">
                <Search className="w-4.5 h-4.5 text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter users by alias/email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-transparent focus:outline-none placeholder-slate-600 text-white font-medium"
                />
              </div>

              {/* Scrollable list */}
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                {filteredUserList.map((usr) => (
                  <div
                    key={usr.uid}
                    onClick={() => setSelectedUser(usr)}
                    className={`p-3 border rounded-xl flex justify-between items-center transition-all cursor-pointer ${
                      selectedUser?.uid === usr.uid
                        ? 'bg-rose-500/5 border-rose-500/40 text-rose-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        referrerPolicy="no-referrer"
                        src={usr.photoURL}
                        alt={usr.name}
                        className="w-9 h-9 rounded-xl border border-slate-800 object-cover shrink-0 bg-slate-950"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                          {usr.name}
                          {!usr.isActive && (
                            <span className="text-[8px] bg-red-500 text-slate-950 px-1 py-0.2 rounded font-black uppercase">
                              Banned
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-gray-500 leading-none mt-1.5 truncate">
                          {usr.email} • {usr.provider.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div>
                        <span className="text-xs font-black text-yellow-450 flex items-center gap-0.5 justify-end">
                          {usr.coins.toLocaleString()}
                          <Coins className="w-3.5 h-3.5 text-yellow-500" />
                        </span>
                        <p className="text-[9px] text-gray-500 mt-0.5">Coins Balance</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Selected User Actions Sheet */}
            <div className="lg:col-span-1">
              {selectedUser ? (
                <div className="bg-slate-905 border border-slate-800 rounded-2xl p-5 relative">
                  <div className="flex flex-col items-center text-center border-b border-slate-800/80 pb-4 mb-4">
                    <img
                      referrerPolicy="no-referrer"
                      src={selectedUser.photoURL}
                      alt={selectedUser.name}
                      className="w-14 h-14 rounded-2xl border-2 border-slate-800 object-cover bg-slate-950 mb-2.5"
                    />
                    <h3 className="text-xs font-black text-white">{selectedUser.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-1 pr-1 truncate max-w-full">
                      UID: {selectedUser.uid}
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-4">
                    {/* Active Ban status toggle */}
                    <div className="flex justify-between items-center bg-slate-900 border border-slate-800/60 p-3.5 rounded-xl text-xs">
                      <div>
                        <p className="font-bold text-white">Profile Lock status</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Toggle bans immediately</p>
                      </div>

                      <button
                        id="admin_status_toggle_btn"
                        onClick={() => handleToggleBan(selectedUser)}
                        className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold text-[10px] uppercase cursor-pointer ${
                          selectedUser.isActive
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15'
                            : 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {selectedUser.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        {selectedUser.isActive ? 'Ban User' : 'Revoke Ban'}
                      </button>
                    </div>

                    {/* Manual Balance Credit Adjustment Form */}
                    <form onSubmit={handleAdjustBalance} className="bg-slate-900 border border-slate-800/60 p-3.5 rounded-xl">
                      <p className="text-xs font-bold text-white mb-2 text-center">Coin balance overrides</p>
                      
                      {/* credit vs debit tabs */}
                      <div className="grid grid-cols-2 p-0.5 bg-slate-950 rounded-lg text-[10px] font-bold mb-3">
                        <button
                          type="button"
                          onClick={() => setAdjustType('credit')}
                          className={`py-1.5 rounded-md flex items-center justify-center gap-1 ${
                            adjustType === 'credit' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-gray-400'
                          }`}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Credit (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustType('debit')}
                          className={`py-1.5 rounded-md flex items-center justify-center gap-1 ${
                            adjustType === 'debit' ? 'bg-red-500 text-slate-950 font-black' : 'text-gray-400'
                          }`}
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          Debit (-)
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          className="w-1/2 p-2 bg-slate-950 border border-slate-800 text-xs text-center text-white rounded-lg focus:outline-none placeholder-slate-700"
                        />
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-rose-500 hover:scale-[1.01] transition-transform text-slate-950 text-[10px] font-black uppercase rounded-lg tracking-wider"
                        >
                          Push Adjust
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-6 text-center text-xs text-gray-500 h-64 flex flex-col items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-slate-700 mb-2" />
                  <span>Select an active profile from the ledger list to make coin adjustments or handle account bans.</span>
                </div>
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
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                  Active Anti-Cheat Intrusion Detections
                </h3>
              </div>

              <div className="flex gap-2">
                {/* Simulated payload generator */}
                <button
                  id="simulate_fraud_admin_btn"
                  onClick={handleSimulateAnomalies}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Trigger Test Collision
                </button>

                {auditLogs.length > 0 && (
                  <button
                    id="clear_fraud_admin_btn"
                    onClick={adminClearAuditLogs}
                    className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 text-rose-450 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 shrink-0"
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
                <div className="text-center py-16 border border-dashed border-[#232835] rounded-3xl text-xs text-slate-600">
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
                          ? 'bg-red-500/5 border-red-500/30'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isHigh ? 'bg-red-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                          }`}>
                            {log.severity.toUpperCase()} ALERT
                          </span>
                          <h4 className="text-xs font-bold text-white shrink-0 truncate">{log.message}</h4>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">{log.details}</p>
                        <span className="text-[9px] text-gray-500 font-mono mt-1 font-semibold flex items-center gap-1">
                          Offender: <span className="text-slate-350 font-bold">{log.userName}</span> ({log.uid})
                        </span>
                      </div>

                      <span className="text-[9px] text-gray-500 font-mono shrink-0 font-bold">
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
            className="flex flex-col gap-5 border border-slate-800/50 bg-slate-900/25 p-5 rounded-3xl"
          >
            <div>
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest mb-1">Ecosystem Holdings Analytics</h3>
              <p className="text-[10px] text-gray-450 leading-relaxed">
                Comparison of net coin ledger aggregates across the top 7 competing accounts on the platform.
              </p>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsDataMap} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} stroke="#334155" />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} stroke="#334155" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1c24', border: '1px solid #2b303d', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
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
