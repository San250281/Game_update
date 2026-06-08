/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRewardEngine } from '../lib/store';
import { ProviderType } from '../types';
import { 
  Gamepad2, Mail, Lock, User, Sparkles, LogIn, ChevronRight, 
  HelpCircle, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AuthScreen() {
  const { loginWithEmail, loginAsGuest, loginWithGoogleMock } = useRewardEngine();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorHandled, setErrorHandled] = useState<string | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(false);

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoadingLocal(true);
    setErrorHandled(null);

    try {
      if (activeTab === 'signin') {
        await loginWithEmail(email.trim(), '', password.trim());
      } else {
        await loginWithEmail(email.trim(), username.trim(), password.trim());
      }
    } catch (err: any) {
      setErrorHandled(err.message || 'Authentication error happened.');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleGuestJoin = async () => {
    setLoadingLocal(true);
    setErrorHandled(null);
    try {
      await loginAsGuest();
    } catch (err: any) {
      setErrorHandled(err.message || 'Failed log in as Guest.');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleGoogleJoinMock = async () => {
    setLoadingLocal(true);
    setErrorHandled(null);
    try {
      // Prompt nice quick selection or pre-fill a mock Google profile
      const randName = `GoogleGamer #${Math.floor(100 + Math.random() * 900)}`;
      const randId = Math.random().toString(36).substring(2, 7);
      const randEmail = `google.play.${randId}@gmail.com`;
      await loginWithGoogleMock(
        randName,
        randEmail,
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`
      );
    } catch (err: any) {
      setErrorHandled(err.message || 'Google Auth Error.');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleFacebookJoinMock = async () => {
    setLoadingLocal(true);
    setErrorHandled(null);
    try {
      const randName = `FacebookPro #${Math.floor(100 + Math.random() * 900)}`;
      const randId = Math.random().toString(36).substring(2, 7);
      const randEmail = `fb.player.${randId}@facebook.com`;
      await loginWithGoogleMock(
        randName,
        randEmail,
        `https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80`
      );
    } catch (err: any) {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative font-sans">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card box with high neon arcade designs */}
      <div className="w-full max-w-md bg-[#13151f] border-2 border-slate-800 shadow-[0_0_30px_rgba(16,185,129,0.15)] rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
        {/* Glow corners */}
        <div className="absolute top-0 left-0 w-2 h-16 bg-emerald-500 rounded-br-2xl" />
        <div className="absolute top-0 left-0 w-16 h-2 bg-emerald-500 rounded-br-2xl" />

        {/* Brand header */}
        <div className="text-center mb-6 mt-2">
          <div className="w-12 h-12 bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Gamepad2 className="w-6.5 h-6.5 text-emerald-400 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5 uppercase">
            REWARDYN <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
          </h1>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-1">
            Gaming Reward Platform MVP
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-900/60 p-1 border border-slate-800 rounded-2xl mb-6">
          <button
            onClick={() => { setActiveTab('signin'); setErrorHandled(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'signin'
                ? 'bg-[#1b1e2a] text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] border border-slate-800'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In Account
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorHandled(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-[#1b1e2a] text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] border border-slate-800'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Core input fields */}
        <form onSubmit={handleEmailAction} className="flex flex-col gap-4 mb-6">
          {activeTab === 'register' && (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <User className="w-4 h-4 shrink-0" />
              </span>
              <input
                required
                type="text"
                placeholder="User Profile Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
              <Mail className="w-4 h-4 shrink-0" />
            </span>
            <input
              required
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
              <Lock className="w-4 h-4 shrink-0" />
            </span>
            <input
              required
              type="password"
              placeholder="Password validation phrase"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          {errorHandled && (
            <p className="text-rose-400 font-bold text-[11px] flex items-center gap-1 justify-center animate-pulse mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errorHandled}
            </p>
          )}

          <button
            type="submit"
            disabled={loadingLocal}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer text-slate-950 font-black text-xs uppercase rounded-xl tracking-wider flex items-center justify-center gap-1 border-t border-white/20"
          >
            <LogIn className="w-4 h-4" />
            {loadingLocal ? 'Connecting secure gateways...' : activeTab === 'signin' ? 'Sign In Now' : 'Complete Registration!'}
          </button>
        </form>

        {/* Separator splits */}
        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-slate-850" />
          <span className="flex-shrink mx-4 text-[9px] text-gray-500 font-black uppercase tracking-widest">
            AUTHENTICATION PROVIDERS
          </span>
          <div className="flex-grow border-t border-slate-850" />
        </div>

        {/* SSO Providers */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            id="google_sso_btn"
            onClick={handleGoogleJoinMock}
            className="py-3 bg-[#171a26] border border-slate-800 rounded-xl text-[11px] font-bold text-gray-300 hover:text-white transition-all hover:bg-[#1a1e2f] flex items-center justify-center gap-2 cursor-pointer"
          >
            {/* Google G icon SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" width="16" height="16">
              <path fill="#ea4335" d="M12 5.04c1.61 0 3.05.55 4.19 1.63L19.3 3.6A11.9 11.9 0 0 0 12 1A11.9 11.9 0 0 0 1.29 8h4.55A6.9 6.9 0 0 1 12 5.04z"/>
              <path fill="#4285f4" d="M23 12c0-.79-.07-1.54-.19-2.27H12v4.51h6.18a5.29 5.29 0 0 1-2.29 3.47v2.89h3.7A11.9 11.9 0 0 0 23 12z"/>
              <path fill="#fbbc05" d="M5.84 14.53a7.07 7.07 0 0 1 0-5.06V5.92H1.29a11.9 11.9 0 0 0 0 12.16l4.55-3.55z"/>
              <path fill="#34a853" d="M12 23a11.8 11.8 0 0 0 8.01-2.92l-3.7-2.89a6.9 6.9 0 0 1-9.76-3.66H1.29v3.55A11.9 11.9 0 0 0 12 23z"/>
            </svg>
            Google SSO
          </button>
          <button
            id="facebook_sso_btn"
            onClick={handleFacebookJoinMock}
            className="py-3 bg-[#171a26] border border-slate-800 rounded-xl text-[11px] font-bold text-gray-300 hover:text-white transition-all hover:bg-[#1a1e2f] flex items-center justify-center gap-2 cursor-pointer"
          >
            {/* Facebook icon SVG */}
            <svg className="w-4.5 h-4.5 fill-[#1877f2]" viewBox="0 0 24 24" width="18" height="18">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        {/* Guest instant enter button */}
        <button
          id="guest_login_btn"
          onClick={handleGuestJoin}
          className="w-full py-3 bg-[#1e2335] text-emerald-400 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors border border-emerald-500/10 hover:bg-[#1e2335]/70"
        >
          <Sparkles className="w-4.5 h-4.5 text-emerald-400 blink" />
          Play Instantly as Guest Player
        </button>

        {/* Footer specifications compliance */}
        <p className="text-[9px] text-gray-500 text-center mt-6 flex items-center gap-1 justify-center leading-none">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Firebase encryption active • Zero-Trust ledger session
        </p>
      </div>
    </div>
  );
}
