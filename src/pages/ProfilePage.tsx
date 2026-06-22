/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Mail, Shield, ShieldCheck, Save, CheckCircle, RefreshCw, KeyRound, BellRing, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfilePage: React.FC = () => {
  const { currentUser, setUsers, addNotification } = useApp();

  // Profile forms
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState(currentUser?.avatarUrl || '');

  // Password fields
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Notification states
  const [inApp, setInApp] = useState(true);
  const [push, setPush] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);

  // States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    setTimeout(() => {
      // update state
      currentUser.username = username;
      currentUser.email = email;
      currentUser.avatarUrl = avatar;

      setUsers((prev) => prev.map((u) => u.uid === currentUser.uid ? { ...u, username, email, avatarUrl: avatar } : u));
      localStorage.setItem('arena_current_user', JSON.stringify(currentUser));

      setLoading(false);
      setMessage({ type: 'ok', text: 'Display profile parameters updated successfully!' });
      addNotification('Profile parameters saved successfully!', 'Notification Received');
      setTimeout(() => setMessage(null), 4000);
    }, 1000);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword || !newPassword) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setCurrPassword('');
      setNewPassword('');
      setMessage({ type: 'ok', text: 'Account password changed securely (Simulated)' });
      setTimeout(() => setMessage(null), 4000);
    }, 1200);
  };

  const avatars = [
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="space-y-8 pb-16 select-none relative animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <User className="w-8 h-8 text-[#6C63FF]" />
            Account settings & Profile controls
          </h1>
          <p className="text-sm text-gray-400 mt-1">Configure profile details, avatar identities, credentials security, and notification settings.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          message.type === 'ok'
            ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMN 1: EDIT PROFILE */}
        <div className="lg:col-span-2 bg-[#18181A] border border-slate-800/40 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-850 pb-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-[#6C63FF]" />
              Modify Profile Information
            </h2>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-5">
            {/* Avatar picker */}
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">CHOOSE AVATAR TO REPRESENT IN LEADERBOARD</span>
              <div className="flex items-center gap-3">
                <img
                  src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-slate-800"
                />
                <div className="flex gap-2">
                  {avatars.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`w-9 h-9 rounded-lg overflow-hidden border cursor-pointer hover:border-[#6C63FF] ${
                        avatar === av ? 'border-[#6C63FF] ring-2 ring-[#6C63FF]/30' : 'border-slate-800'
                      }`}
                    >
                      <img src={av} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Contender Display Name</label>
                <input
                  type="text"
                  placeholder="Your display username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#6C63FF]"
                  style={{ minHeight: '44px' }}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Verified Account Email</label>
                <input
                  type="email"
                  placeholder="e.g. college_friend@gmail.com..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#6C63FF]"
                  style={{ minHeight: '44px' }}
                  required
                />
              </div>
            </div>

            <button
              id="btn-save-profile-settings"
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#6C63FF] hover:bg-[#5b54e0] text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              style={{ minHeight: '40px' }}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </form>
        </div>

        {/* COLUMN 2: SECURITY & PREFERENCES */}
        <div className="space-y-8">
          {/* PASSWORD RESET CARD */}
          <div className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-850 pb-3">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#6C63FF]" />
                Change Password
              </h3>
            </div>

            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase block">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6C63FF]"
                  style={{ minHeight: '40px' }}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase block">New Premium Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#6C63FF]"
                  style={{ minHeight: '40px' }}
                  required
                />
              </div>

              <button
                id="btn-update-security-pass"
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-gray-300 font-bold rounded-lg text-xs cursor-pointer"
                style={{ minHeight: '38px' }}
              >
                Update password
              </button>
            </form>
          </div>

          {/* NOTIFICATION CHANNELS TOGGLE */}
          <div className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-850 pb-3">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <BellRing className="w-4.5 h-4.5 text-[#6C63FF]" />
                Notification Preferences
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-semibold block">In-App Banner Alerts</span>
                  <p className="text-[10px] text-gray-500 leading-normal">Alerts upon completing tasks or coin awards.</p>
                </div>
                <input
                  type="checkbox"
                  checked={inApp}
                  onChange={(e) => setInApp(e.target.checked)}
                  className="w-4 h-4 accent-[#6C63FF] outline-none"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-850 pt-3">
                <div className="space-y-0.5">
                  <span className="font-semibold block">Browser Push Notifications</span>
                  <p className="text-[10px] text-gray-500 leading-normal">Notifies when gift-cards are approved.</p>
                </div>
                <input
                  type="checkbox"
                  checked={push}
                  onChange={(e) => setPush(e.target.checked)}
                  className="w-4 h-4 accent-[#6C63FF] outline-none"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-850 pt-3">
                <div className="space-y-0.5">
                  <span className="font-semibold block">Direct Customer Emails</span>
                  <p className="text-[10px] text-gray-500 leading-normal">Sends receipts for plans or redemptions.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="w-4 h-4 accent-[#6C63FF] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
