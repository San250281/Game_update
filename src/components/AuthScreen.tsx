/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRewardEngine } from '../lib/store';
import { 
  Gamepad2, Mail, Lock, User, Sparkles, LogIn, 
  ShieldCheck, AlertCircle, Coins, Award, Info, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Live mock claims telemetry data to make the landing page feel extremely active and engaging
const LIVE_CLAIMS_MOCK = [
  { id: 1, user: 'cyber_pulsar', reward: '+500 Coins', action: 'Spin Wheel Jackpot', time: 'Just now', color: 'text-purple-600' },
  { id: 2, user: 'reaper_fury', reward: '+300 Coins', action: 'Golden Scratch Card', time: '3 seconds ago', color: 'text-indigo-650' },
  { id: 3, user: 'web3_sol', reward: '+40 Coins', action: 'Trivia Correct Step', time: '8 seconds ago', color: 'text-emerald-600' },
  { id: 4, user: 'tap_warlord', reward: '+60 Coins', action: 'TAP Velocity Peak', time: '12 seconds ago', color: 'text-rose-600' },
  { id: 5, user: 'luna_hustle', reward: '+600 Coins', action: 'Streak BONUS Day 7', time: '18 seconds ago', color: 'text-amber-600' },
  { id: 6, user: 'gumball_3000', reward: '+120 Coins', action: 'Streak BONUS Day 3', time: '35 seconds ago', color: 'text-teal-600' },
  { id: 7, user: 'sol_mortal', reward: '+500 Coins', action: 'Lucky Spin Jackpot', time: '1 minute ago', color: 'text-purple-600' }
];

export default function AuthScreen() {
  const { loginWithEmail, loginAsGuest, loginWithGoogleMock } = useRewardEngine();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorHandled, setErrorHandled] = useState<string | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(false);

  const [showSsoModal, setShowSsoModal] = useState(false);
  const [ssoName, setSsoName] = useState('');
  const [ssoEmail, setSsoEmail] = useState('');
  const [ssoProvider, setSsoProvider] = useState<'Google' | 'Facebook' | null>(null);

  // Left-pane sub-tabs for interactive research
  const [leftTab, setLeftTab] = useState<'mission' | 'simulator' | 'matrix'>('simulator');

  // Interactive slider parameters for platform engagement simulation
  const [estimatePlays, setEstimatePlays] = useState(6);
  const [estimateStreak, setEstimateStreak] = useState(true);

  // Live Claim tracking index state
  const [tickerIndex, setTickerIndex] = useState(0);

  // Rotate simulated global claims ticker 
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_CLAIMS_MOCK.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

  const handleGoogleJoinMock = () => {
    setSsoProvider('Google');
    setSsoName('Rewardyn Admin');
    setSsoEmail('game.rewardyn@gmail.com');
    setShowSsoModal(true);
  };

  const handleFacebookJoinMock = () => {
    setSsoProvider('Facebook');
    setSsoName('Facebook Gamer');
    setSsoEmail('fb.player@facebook.com');
    setShowSsoModal(true);
  };

  const handleSsoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoName.trim() || !ssoEmail.trim()) return;

    setLoadingLocal(true);
    setErrorHandled(null);
    setShowSsoModal(false);

    try {
      const photoURL = ssoProvider === 'Google'
        ? `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`
        : `https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80`;

      await loginWithGoogleMock(
        ssoName.trim(),
        ssoEmail.trim().toLowerCase(),
        photoURL
      );
    } catch (err: any) {
      setErrorHandled(err.message || `${ssoProvider} Auth Error.`);
    } finally {
      setLoadingLocal(false);
    }
  };

  // Interactive reward algorithm calculation mapping
  const calculateEstimateReward = () => {
    const averageGameReward = 85; 
    const gameMultiplier = estimatePlays * averageGameReward * 7;
    const streakBonus = estimateStreak ? 1600 : 0;
    return gameMultiplier + streakBonus;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 relative font-sans text-slate-800 bg-[#f8fafc]">
      {/* Background radial soft shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container Widescreen Setup */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10 my-6">
        
        {/* LEFT COLUMN: Highly Interactive Company Showcase, Stats & Rewards Simulator */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-slate-200 rounded-[32px] p-6 lg:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] relative overflow-hidden">
          {/* Subtle design corners */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent blur-md rounded-full pointer-events-none" />
          
          <div className="flex flex-col gap-6">
            {/* Enterprise Branding header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.08)]">
                <Gamepad2 className="w-6.5 h-6.5 text-emerald-600 stroke-[2]" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-widest uppercase flex items-center gap-2">
                  REWARDYN
                </h1>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider leading-tight">Next-Generation Micro-rewards Enterprise</p>
              </div>
            </div>

            {/* Corporate Brief Headline */}
            <div className="space-y-2 mt-2">
              <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Where casual gaming meets immutable ledger economies.
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-full">
                REWARDYN is a client-trusted gamified system designed to turn focus and casual entertainment into digital assets, recorded instantly on transparent cryptographic ledgers. Play short web sessions, accumulate coin weight, and rise in community standing.
              </p>
            </div>

            {/* Interactive Showcase Tabs navigation */}
            <div className="grid grid-cols-3 bg-slate-100/80 border border-slate-200 p-1 rounded-xl text-xs font-bold mt-2 gap-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
              <button
                onClick={() => setLeftTab('simulator')}
                className={`py-2 px-2.5 rounded-lg transition-all cursor-pointer text-[11px] text-center uppercase tracking-wide shrink-0 ${
                  leftTab === 'simulator' 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                🎮 Yield Simulator
              </button>
              <button
                onClick={() => setLeftTab('matrix')}
                className={`py-2 px-2.5 rounded-lg transition-all cursor-pointer text-[11px] text-center uppercase tracking-wide shrink-0 ${
                  leftTab === 'matrix' 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                📊 Pay Rates
              </button>
              <button
                onClick={() => setLeftTab('mission')}
                className={`py-2 px-2.5 rounded-lg transition-all cursor-pointer text-[11px] text-center uppercase tracking-wide shrink-0 ${
                  leftTab === 'mission' 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' 
                    : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                🏢 Company Info
              </button>
            </div>

            {/* TAB PANES BLOCK WITH ANIMATION */}
            <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl min-h-[220px] flex flex-col justify-between relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.01)]">
              <AnimatePresence mode="wait">
                {/* 1. Yield Simulator Tab */}
                {leftTab === 'simulator' && (
                  <motion.div
                    key="simulator"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-emerald-600 animate-pulse fill-emerald-100" />
                          Proof-of-Attention Simulator
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">Dynamic Yield Math</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Customize your projected playing cycle below to forecast your weekly coin ledger accumulation instantly:
                      </p>
                    </div>

                    {/* Simulator Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2.5 bg-white p-4.5 rounded-xl border border-slate-200/80">
                      
                      {/* Daily Plays Custom Slider */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-550 mr-1">
                          <span>Plays Daily Cycle</span>
                          <span className="text-emerald-600 font-mono font-bold text-xs">{estimatePlays} Sessions</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={estimatePlays}
                          onChange={(e) => setEstimatePlays(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <span className="text-[9px] text-slate-400">Includes scratch cards, spins, & trivia quiz.</span>
                      </div>

                      {/* Loyalty Checkbox */}
                      <div className="flex flex-col justify-center">
                        <label className="flex items-center gap-3 cursor-pointer select-none group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={estimateStreak}
                              onChange={(e) => setEstimateStreak(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-10 h-5.5 rounded-full transition-all border ${
                              estimateStreak ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-200 border-slate-350'
                            }`} />
                            <div className={`absolute left-1 top-1 w-3.5 h-3.5 rounded-full transition-all ${
                              estimateStreak ? 'translate-x-4.5 bg-emerald-650' : 'bg-slate-400'
                            }`} />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">
                              Claim 7-Day Loyalty Streak
                            </span>
                            <span className="text-[9px] text-slate-400 block">Adds static +1,600 Weekly Coins</span>
                          </div>
                        </label>
                      </div>

                    </div>

                    {/* Result projected panel */}
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 mt-1.5">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">PROJECTED COINS / WEEK</p>
                        <h4 className="text-lg font-black text-amber-605 flex items-center gap-1 mt-0.5 animate-pulse">
                          <Coins className="w-4.5 h-4.5 text-amber-500" />
                          {calculateEstimateReward().toLocaleString()} Coins
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-405 uppercase block font-mono">Simulated Multiplier</span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-black mt-0.5 inline-block">
                          {((calculateEstimateReward() / 1600)).toFixed(1)}x Rate Weight
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. Platform Matrix Tab */}
                {leftTab === 'matrix' && (
                  <motion.div
                    key="matrix"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full justify-between gap-3"
                  >
                    <div>
                      <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                        <Award className="w-4 h-4 text-emerald-655" />
                        Gamer Yield Matrix & Limits
                      </h3>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                        Secure payouts are hardcapped by system algorithms to guard the platform economy against automation botting:
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center">
                        <p className="text-[9px] text-purple-600 font-black uppercase">🎡 Lucky Spin</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">Up to +500</p>
                        <span className="text-[8px] text-slate-404">Uncapped tries</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center">
                        <p className="text-[9px] text-indigo-600 font-black uppercase">✉️ Scratch Card</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">Up to +300</p>
                        <span className="text-[8px] text-slate-404">Pure Fortune</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center">
                        <p className="text-[9px] text-emerald-600 font-black uppercase">🧠 Trivia Quiz</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">+40 / Step</p>
                        <span className="text-[8px] text-slate-404">Max 200 / day</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center">
                        <p className="text-[9px] text-rose-600 font-black uppercase">⚡ Tap Velocity</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">Up to +60</p>
                        <span className="text-[8px] text-slate-404">10-second test</span>
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-450 text-center leading-relaxed mt-2.5 border-t border-slate-200/50 pt-2 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-555" />
                      Ledger audits run symmetrically to trace concurrent click collisions.
                    </p>
                  </motion.div>
                )}

                {/* 3. Company Info Tab */}
                {leftTab === 'mission' && (
                  <motion.div
                    key="mission"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-teal-700 uppercase tracking-widest flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-teal-655" />
                        REWARDYN Corporate Identity
                      </h3>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        Incorporated globally in 2026, REWARDYN pioneers stateful internet retention solutions. We convert standard, low-value attention margins into hyper-focused arcade sessions built with custom HTML5 speed layers.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-1.5">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Zero gas friction</h4>
                        <p className="text-[9px] text-slate-404 mt-1">All platform transactions utilize lightweight custom double-entry systems backed by high-speed server clusters.</p>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">100% Safe Audits</h4>
                        <p className="text-[9px] text-slate-404 mt-1">Real-time anti-intrusion telemetry catches macro clicking patterns to keep point distribution balance pristine.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Interactive live claim rolling feed */}
          <div className="mt-8 border-t border-slate-100 pt-5">
            <span className="text-[9px] text-slate-450 uppercase tracking-widest font-black flex items-center gap-1.5 mb-3.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              PLATFORM LEDGER REVENUE TELEMETRY
            </span>

            {/* Rotating claim ticket slot */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between relative overflow-hidden shadow-[inset_0_1.5px_4px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs text-emerald-600 font-bold">
                  🎮
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-slate-900 flex items-center gap-2">
                    @{LIVE_CLAIMS_MOCK[tickerIndex].user}
                    <span className="text-[9px] text-slate-550 font-normal">claimed</span>
                    <span className={`font-mono font-black ${LIVE_CLAIMS_MOCK[tickerIndex].color}`}>
                      {LIVE_CLAIMS_MOCK[tickerIndex].reward}
                    </span>
                  </h4>
                  <p className="text-[9px] text-slate-455 mt-0.5">
                    Triggered action: <span className="text-slate-600 font-semibold">{LIVE_CLAIMS_MOCK[tickerIndex].action}</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] text-slate-455 font-mono block">
                  {LIVE_CLAIMS_MOCK[tickerIndex].time}
                </span>
                <span className="text-[8px] bg-emerald-50 text-[#047857] border border-emerald-100 px-1.5 py-0.2 rounded mt-0.5 inline-block font-black uppercase">
                  Verified
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Highly Polished Secure Access Entry Terminal */}
        <div className="lg:col-span-12 xl:col-span-5 lg:col-span-5 flex flex-col justify-center">
          <div className="w-full bg-white border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.04)] rounded-[32px] p-6 lg:p-7 relative overflow-hidden">
            
            {/* Visual glow on upper-right */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />

            {/* Title */}
            <div className="text-center mb-6 mt-1">
              <h2 className="text-lg font-black text-slate-900 tracking-widest uppercase flex items-center justify-center gap-2">
                Secure Access Gate
              </h2>
              <p className="text-[10px] text-slate-450 uppercase tracking-wider mt-1">
                Authorized entry with client-vouched credentials
              </p>
            </div>

            {/* Sign in / Register Selector Tab */}
            <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-2xl mb-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
              <button
                onClick={() => { setActiveTab('signin'); setErrorHandled(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50 font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In account
              </button>
              <button
                onClick={() => { setActiveTab('register'); setErrorHandled(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50 font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                New registration
              </button>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleEmailAction} className="flex flex-col gap-4 mb-5">
              {activeTab === 'register' && (
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4 shrink-0" />
                  </span>
                  <input
                    required
                    type="text"
                    placeholder="User profile public name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-450 focus:outline-none focus:border-emerald-500 transition-colors font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                  />
                </div>
              )}

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4 shrink-0" />
                </span>
                <input
                  required
                  type="email"
                  placeholder="Registry Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-450 focus:outline-none focus:border-emerald-500 transition-colors font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4 h-4 shrink-0" />
                </span>
                <input
                  required
                  type="password"
                  placeholder="Registry password phrase"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-450 focus:outline-none focus:border-emerald-500 transition-colors font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                />
              </div>

              {errorHandled && (
                <p className="text-rose-600 font-bold text-[11px] flex items-center gap-1.5 justify-center animate-pulse mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {errorHandled}
                </p>
              )}

              <button
                type="submit"
                disabled={loadingLocal}
                className="w-full py-3.5 bg-emerald-500 text-slate-950 hover:bg-emerald-600 hover:shadow-[0_4px_12px_rgba(16,185,129,0.15)] transition-all cursor-pointer font-black text-xs uppercase rounded-xl tracking-wider flex items-center justify-center gap-2 shadow-sm border-t border-white/20"
              >
                <LogIn className="w-4.5 h-4.5" />
                {loadingLocal ? 'Vouching credentials...' : activeTab === 'signin' ? 'Unlock Account' : 'Initialize Account Now'}
              </button>
            </form>

            {/* Separator block */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">
                VERIFIED PARTNERS
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* SSO Action list */}
            <div className="grid grid-cols-2 gap-3 mb-4 mt-1.5 font-sans">
              <button
                id="google_sso_btn"
                onClick={handleGoogleJoinMock}
                className="py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-100 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
              >
                {/* Google G visual vector */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#ea4335" d="M12 5.04c1.61 0 3.05.55 4.19 1.63L19.3 3.6A11.9 11.9 0 0 0 12 1A11.9 11.9 0 0 0 1.29 8h4.55A6.9 6.9 0 0 1 12 5.04z"/>
                  <path fill="#4285f4" d="M23 12c0-.79-.07-1.54-.19-2.27H12v4.51h6.18a5.29 5.29 0 0 1-2.29 3.47v2.89h3.7A11.9 11.9 0 0 0 23 12z"/>
                  <path fill="#fbbc05" d="M5.84 14.53a7.07 7.07 0 0 1 0-5.06V5.92H1.29a11.9 11.9 0 0 0 0 12.16l4.55-3.55z"/>
                  <path fill="#34a853" d="M12 23a11.8 11.8 0 0 0 8.01-2.92l-3.7-2.89a6.9 6.9 0 0 1-9.76-3.66H1.29v3.55A11.9 11.9 0 0 0 12 23z"/>
                </svg>
                Google
              </button>
              <button
                id="facebook_sso_btn"
                onClick={handleFacebookJoinMock}
                className="py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-100 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
              >
                {/* Facebook branding vector */}
                <svg className="w-4 h-4 fill-[#1877f2] shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Instant Guest bypass */}
            <button
              id="guest_login_btn"
              onClick={handleGuestJoin}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200/80 text-emerald-700 text-xs font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-500/10 shadow-sm uppercase tracking-wide mb-4"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse fill-emerald-100" />
              Play instantly as guest
            </button>

            {/* Quality badge assurances */}
            <div className="mt-6 border-t border-slate-150 pt-4 flex flex-col gap-2 items-center text-center">
              <span className="text-[9px] text-slate-450 flex items-center gap-1.5 leading-none font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Firebase Auth active • Zero-Trust ledger session
              </span>
              <p className="text-[8.5px] text-slate-400 max-w-xs leading-normal">
                By entering this arcade site you agree to automatic secure tamper-detection scans which run passively on state change routines.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Customizable SSO popup modal for sandboxed previews (light-mode styled) */}
      {showSsoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.15)] rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-16 bg-emerald-500 rounded-br-2xl" />
            <div className="absolute top-0 left-0 w-16 h-2 bg-emerald-500 rounded-br-2xl" />

            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              {ssoProvider} Sign-in Profile
            </h2>
            <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
              Since auth popups are restricted in sandboxed previews, specify your customized profile parameters below to log in or register instantly.
            </p>

            <form onSubmit={handleSsoSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] text-emerald-700 uppercase font-black tracking-widest mb-1.5">
                  {ssoProvider} profile display name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type="text"
                    placeholder={`My ${ssoProvider} Name`}
                    value={ssoName}
                    onChange={(e) => setSsoName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-emerald-700 uppercase font-black tracking-widest mb-1.5">
                  {ssoProvider} signed email address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="e.g. game.rewardyn@gmail.com"
                    value={ssoEmail}
                    onChange={(e) => setSsoEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowSsoModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:text-white hover:bg-slate-700 transition-colors border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 text-slate-950 font-black text-xs uppercase rounded-xl tracking-wider hover:scale-[1.01] transition-transform cursor-pointer border-t border-white/20"
                >
                  Authorize Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
