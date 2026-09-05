/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRewardEngine } from '../lib/store';
import { 
  Gamepad2, Mail, Lock, User, Sparkles, LogIn, 
  ShieldCheck, AlertCircle, Coins, Award, Info, Zap,
  Globe, Cpu, ChevronRight, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SEOHead from './SEOHead';
import SEOContentSection from './SEOContentSection';

// Live dynamic claims ticker mimicking real-time player claims
const LIVE_CLAIMS_MOCK = [
  { id: 1, user: 'starlight_rider', reward: '+500 Coins', action: 'Lucky Wheel Jackpot', time: 'Just now', color: 'text-emerald-400' },
  { id: 2, user: 'vortex_play', reward: '+300 Coins', action: 'Golden Scratch Card', time: '3s ago', color: 'text-indigo-400' },
  { id: 3, user: 'apex_hunter', reward: '+40 Coins', action: 'Trivia Correct Answer', time: '8s ago', color: 'text-cyan-400' },
  { id: 4, user: 'zephyr_core', reward: '+60 Coins', action: 'Rapid Tap Burst', time: '12s ago', color: 'text-emerald-400' },
  { id: 5, user: 'nebula_pulse', reward: '+600 Coins', action: '7-Day Streak BONUS', time: '18s ago', color: 'text-amber-400' },
  { id: 6, user: 'krypton_tap', reward: '+120 Coins', action: 'Trivia Challenge Completed', time: '35s ago', color: 'text-teal-400' },
  { id: 7, user: 'shadow_strike', reward: '+500 Coins', action: 'Lucky Wheel Jackpot', time: '1m ago', color: 'text-purple-400' }
];

export default function AuthScreen() {
  const { loginWithEmail, loginAsGuest } = useRewardEngine();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorHandled, setErrorHandled] = useState<string | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(false);

  // Tab selections for arcade specifications layout
  const [leftTab, setLeftTab] = useState<'simulator' | 'matrix' | 'mission'>('simulator');

  // Multiplier forecast state
  const [estimatePlays, setEstimatePlays] = useState(6);
  const [estimateStreak, setEstimateStreak] = useState(true);

  // Active ledger claims ticket ticker loop index
  const [tickerIndex, setTickerIndex] = useState(0);

  // Rotate simulated global claims ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_CLAIMS_MOCK.length);
    }, 3600);
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
      setErrorHandled(err.message || 'Authentication failed. Please verify credentials.');
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
      setErrorHandled(err.message || 'Guest session initialization is temporarily unavailable.');
    } finally {
      setLoadingLocal(false);
    }
  };

  // Forecast values calculator
  const calculateEstimateReward = () => {
    const baseRewardPerGame = 85; 
    const gameMultiplier = estimatePlays * baseRewardPerGame * 7;
    const streakBonus = estimateStreak ? 1600 : 0;
    return gameMultiplier + streakBonus;
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 lg:p-12 relative font-sans text-slate-200 overflow-x-hidden bg-[#0A0D1A]"
      style={{
        backgroundImage: `radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08) 0%, transparent 60%), 
                          radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.06) 0%, transparent 60%),
                          linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), 
                          linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)`,
        backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px'
      }}
    >
      {/* Dynamic ambient lights blurs */}
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Main viewport limit frame */}
      <div className="w-full max-w-6xl relative z-10 flex flex-col gap-6 my-4">
        <SEOHead tab="lobby" />
        
        {/* PREMIUM STATUS HEADER RAIL (Modern, minimal and elegant) */}
        <div className="w-full bg-[#111625]/90 backdrop-blur-md border border-slate-800 rounded-2xl px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xl text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-slate-200 font-bold tracking-tight">
              <span className="w-2s h-2s rounded-full bg-emerald-400 animate-pulse-subtle" />
              PORTAL READY
            </span>
            <span className="w-px h-3.5 bg-slate-800 hidden md:block" />
            <span className="text-slate-400 font-medium hidden md:flex items-center gap-1.5 font-mono">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              ARCADE LOUNGE: <span className="font-bold text-emerald-400">14,290 ACTIVE NOW</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-medium font-mono text-[11px]">
            <span className="hidden sm:block">STABLE INSTANCE PING: <span className="text-emerald-400 font-bold">18ms</span></span>
            <span className="w-px h-3.5 bg-slate-800 hidden sm:block" />
            <span className="bg-[#10b981]/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              CLOUD BACKEND SECURED
            </span>
          </div>
        </div>

        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN PANEL: Arcade Introduction & Interactive forecast slider block */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-[#111625]/80 border border-slate-800 rounded-[24px] p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
            
            {/* Top design accent glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            
            <div className="flex flex-col gap-6">
              {/* Launcher Header branding */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-indigo-500 p-[1.5px] rounded-2xl shadow-[0_4px_24px_rgba(16,185,129,0.15)] flex items-center justify-center">
                  <div className="w-full h-full bg-[#0a0d1a] rounded-[14px] flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-emerald-400 stroke-[2] animate-pulse" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded leading-none border border-emerald-500/20">
                      PLAY DECK
                    </span>
                    <span className="text-slate-500 text-[10px] font-mono">v2.4 PRO</span>
                  </div>
                  <h1 className="text-2xl font-black text-white tracking-tight font-display flex items-center gap-1.5">
                    REWARDYN <span className="text-emerald-450 font-normal text-slate-400">ARCADE</span>
                  </h1>
                </div>
              </div>

              {/* Catchy gaming platform intro text */}
              <div className="space-y-2.5 mt-1">
                <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight font-display leading-tight">
                  Casual arcade play linked straight to real ledger economies.
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Join a trusted micro-reward universe where focus-fueled loyalty cycles yield digital assets recorded instantly on secure ledgers. Play web mini-sessions, spin fortune wheels, and stack coins seamlessly from your browser dashboard.
                </p>
              </div>

              {/* Sub-tabs with high-end console feel layout */}
              <div className="grid grid-cols-3 bg-[#0a0d1a]/80 p-1 rounded-xl text-xs font-bold gap-1 border border-slate-800">
                <button
                  onClick={() => setLeftTab('simulator')}
                  className={`py-2.5 px-3 rounded-lg transition-all cursor-pointer text-[10.5px] uppercase tracking-wide text-center font-bold ${
                    leftTab === 'simulator' 
                      ? 'bg-[#1a2138] text-emerald-400 border border-slate-700/50 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  🎮 Yield Forecast
                </button>
                <button
                  onClick={() => setLeftTab('matrix')}
                  className={`py-2.5 px-3 rounded-lg transition-all cursor-pointer text-[10.5px] uppercase tracking-wide text-center font-bold ${
                    leftTab === 'matrix' 
                      ? 'bg-[#1a2138] text-emerald-400 border border-slate-700/50 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  📊 Dynamic Rates
                </button>
                <button
                  onClick={() => setLeftTab('mission')}
                  className={`py-2.5 px-3 rounded-lg transition-all cursor-pointer text-[10.5px] uppercase tracking-wide text-center font-bold ${
                    leftTab === 'mission' 
                      ? 'bg-[#1a2138] text-emerald-400 border border-slate-700/50 shadow-lg' 
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  🏢 Platform Info
                </button>
              </div>

              {/* Interactive Tab View panel block */}
              <div className="bg-[#0a0d1a]/60 border border-slate-800/80 p-5 rounded-xl min-h-[214px] flex flex-col justify-between relative shadow-inner">
                <AnimatePresence mode="wait">
                  {leftTab === 'simulator' && (
                    <motion.div
                      key="simulator"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex flex-col h-full justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-500/10" />
                            Dynamic Payout Forecast
                          </h3>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
                            LIVE CALCULATOR
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Adjust daily play cycles to estimate your weekly ledger coin claims yield:
                        </p>
                      </div>

                      {/* Sliders Control area */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#111726]/40 p-4 rounded-xl border border-slate-800 shadow-sm">
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-400 uppercase">
                            <span>Daily Games Played</span>
                            <span className="text-emerald-300 font-mono font-bold text-xs bg-[#111625] border border-slate-800 px-2 py-0.5 rounded">
                              {estimatePlays} Sessions
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={estimatePlays}
                            onChange={(e) => setEstimatePlays(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                          />
                          <span className="text-[9px] text-slate-500">Includes wheel, scratch, trivias & button taps</span>
                        </div>

                        {/* Interactive toggle block */}
                        <div className="flex items-center justify-start md:justify-center">
                          <label className="flex items-center gap-3 cursor-pointer select-none group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={estimateStreak}
                                onChange={(e) => setEstimateStreak(e.target.checked)}
                                className="sr-only"
                              />
                              <div className={`w-10 h-5.5 rounded-full transition-colors border ${
                                estimateStreak ? 'bg-emerald-500/25 border-emerald-450' : 'bg-slate-800 border-slate-700'
                              }`} />
                              <div className={`absolute left-0.5 top-0.5 w-4.5 h-4.5 rounded-full transition-all ${
                                estimateStreak ? 'translate-x-4.5 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-500'
                              }`} />
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors block">
                                7-Day Active Streak Bonus
                              </span>
                              <span className="text-[9px] text-slate-500 block font-mono">Adds constant +1,600 Coins</span>
                            </div>
                          </label>
                        </div>

                      </div>

                      {/* Display calculations outputs */}
                      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 mt-1">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">PROJECTED WEEKLY OUTPUt</p>
                          <h4 className="text-xl font-bold text-amber-400 flex items-center gap-1.5 mt-0.5 font-display">
                            <Coins className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                            {calculateEstimateReward().toLocaleString()} Coins
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 uppercase block font-mono">Simulated Game Rate</span>
                          <span className="text-[10px] bg-[#111625] text-emerald-400 border border-slate-800 px-2.5 py-0.5 rounded font-bold font-mono mt-0.5 inline-block">
                            x{((calculateEstimateReward() / 1600)).toFixed(1)} Base Weight
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {leftTab === 'matrix' && (
                    <motion.div
                      key="matrix"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex flex-col h-full justify-between gap-3"
                    >
                      <div>
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <Award className="w-4 h-4 text-emerald-400" />
                          Platform Play Yield Limits
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
                          Standard parameters prevent inflation. Maximum session values configured:
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        <div className="p-3 bg-[#111625]/60 border border-slate-800 rounded-xl text-center shadow-inner">
                          <span className="text-[10px] text-indigo-400 font-bold block uppercase mb-1">🎡 LUCKY SPIN</span>
                          <span className="text-xs font-bold text-white block">Up to +500</span>
                          <span className="text-[8px] text-slate-500 font-mono block mt-0.5">Coins jackpot</span>
                        </div>
                        <div className="p-3 bg-[#111625]/60 border border-slate-800 rounded-xl text-center shadow-inner">
                          <span className="text-[10px] text-emerald-450 font-bold block uppercase mb-1">✉️ SCRATCH</span>
                          <span className="text-xs font-bold text-white block">Up to +300</span>
                          <span className="text-[8px] text-slate-500 font-mono block mt-0.5">Golden layers</span>
                        </div>
                        <div className="p-3 bg-[#111625]/60 border border-slate-800 rounded-xl text-center shadow-inner">
                          <span className="text-[10px] text-cyan-400 font-bold block uppercase mb-1">🧠 QUIZ TIMED</span>
                          <span className="text-xs font-bold text-white block">+40 / Step</span>
                          <span className="text-[8px] text-slate-500 font-mono block mt-0.5">Trivia matrix</span>
                        </div>
                        <div className="p-3 bg-[#111625]/60 border border-slate-800 rounded-xl text-center shadow-inner">
                          <span className="text-[10px] text-rose-400 font-bold block uppercase mb-1">⚡ TAP FORCE</span>
                          <span className="text-xs font-bold text-white block">Up to +60</span>
                          <span className="text-[8px] text-slate-500 font-mono block mt-0.5">Speed test limit</span>
                        </div>
                      </div>

                      <p className="text-[9.5px] text-slate-500 text-center leading-normal border-t border-slate-800/40 pt-2 flex items-center justify-center gap-1.5 mt-1">
                        Active security checks verify the integrity of every payout session.
                      </p>
                    </motion.div>
                  )}

                  {leftTab === 'mission' && (
                    <motion.div
                      key="mission"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex flex-col h-full justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-emerald-400" />
                          Platform Safe Architecture
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          REWARDYN runs dynamic instant mini-games in complete sync with your private user profile session, leveraging a robust secure Firestore backend to track balances and logs.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <div className="p-3 bg-[#111625]/40 border border-slate-800 rounded-xl">
                          <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Secured Sync
                          </h4>
                          <p className="text-[9px] text-slate-500 leading-normal">Anti-bot safeguards defend balances from malicious code adjustments.</p>
                        </div>
                        <div className="p-3 bg-[#111625]/40 border border-slate-800 rounded-xl">
                          <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            Durable Storage
                          </h4>
                          <p className="text-[9px] text-slate-500 leading-normal">Balances, wallet references, and play streams persist under high-grade TLS 1.3 systems.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Simulated Live Claims rolling ledger */}
            <div className="mt-8 border-t border-slate-800/80 pt-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE RECENT CLAIMS TICKER
              </span>

              {/* Ticker block layout */}
              <div className="bg-[#0B0F19] border border-slate-800 p-4 rounded-xl flex items-center justify-between relative overflow-hidden shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-sm">
                    🎮
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-white flex items-center gap-1.5">
                      @{LIVE_CLAIMS_MOCK[tickerIndex].user}
                      <span className="text-[10px] text-slate-400 font-normal">earned</span>
                      <span className={`font-mono font-bold ${LIVE_CLAIMS_MOCK[tickerIndex].color}`}>
                        {LIVE_CLAIMS_MOCK[tickerIndex].reward}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Game: <span className="text-slate-300 font-medium">{LIVE_CLAIMS_MOCK[tickerIndex].action}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] text-slate-500 font-mono block">
                    {LIVE_CLAIMS_MOCK[tickerIndex].time}
                  </span>
                  <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded mt-1.5 inline-block font-bold uppercase font-mono tracking-wider">
                    CLAIM SUCCESSFUL
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN PANEL: Frictionless Access Gate Card (Sleek Gaming Login style) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="w-full bg-[#111625]/80 border border-slate-800 shadow-2xl rounded-[24px] p-6 lg:p-8 relative overflow-hidden backdrop-blur-md">
              
              {/* Highlight upper accent blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full" />

              {/* Title Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 bg-[#171f35] px-3 py-1 rounded-full text-[10px] font-bold text-slate-300 uppercase tracking-wider border border-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  SECURED SSL ACCESS
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight uppercase font-display mt-3">
                  Arcade Access Portal
                </h2>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Sign in or register to track your coins balance
                </p>
              </div>

              {/* Form tabs */}
              <div className="flex bg-[#0a0d1a]/80 p-1 border border-slate-800 rounded-xl mb-6">
                <button
                  onClick={() => { setActiveTab('signin'); setErrorHandled(null); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer uppercase tracking-wider ${
                    activeTab === 'signin'
                      ? 'bg-[#1a2138] text-white border border-slate-705 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setActiveTab('register'); setErrorHandled(null); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer uppercase tracking-wider ${
                    activeTab === 'register'
                      ? 'bg-[#1a2138] text-white border border-slate-705 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* ONE-CLICK INSTANT GUEST PLAY */}
              <div className="flex flex-col gap-3 mb-6">
                <button
                  id="guest_login_btn"
                  onClick={handleGuestJoin}
                  className="w-full py-3.5 bg-[#10b981]/15 hover:bg-[#10b981]/25 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-500/20 shadow-sm uppercase tracking-wider active:scale-[0.99] hover:border-emerald-500/40"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-bounce" />
                  Instant Guest Play (Fast Test)
                </button>
              </div>

              {/* Styled clean partition */}
              <div className="relative flex py-2 items-center mb-5">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3.5 text-[9.5px] text-slate-550 font-bold uppercase tracking-widest leading-none font-mono">
                  OR SIGN IN WITH EMAIL
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              {/* Custom Traditional Email Form */}
              <form onSubmit={handleEmailAction} className="flex flex-col gap-4">
                {activeTab === 'register' && (
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                      <User className="w-4 h-4 shrink-0" />
                    </span>
                    <input
                      required
                      type="text"
                      placeholder="Enter a gaming nickname"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#0a0d1a]/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
                    />
                  </div>
                )}

                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                    <Mail className="w-4 h-4 shrink-0" />
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0d1a]/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>

                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                    <Lock className="w-4 h-4 shrink-0" />
                  </span>
                  <input
                    required
                    type="password"
                    placeholder="Enter account security password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0d1a]/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>

                {errorHandled && (
                  <p className="text-rose-400 font-bold text-[10.5px] flex items-center gap-1.5 justify-center animate-pulse py-1.5 rounded bg-rose-500/5 border border-rose-500/10">
                    <AlertCircle className="w-3.5 h-3.5" /> {errorHandled}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loadingLocal}
                  className="w-full py-3.5 bg-slate-100 text-slate-900 hover:bg-slate-200 hover:text-emerald-700 transition-all cursor-pointer font-bold text-xs uppercase rounded-xl tracking-wider flex items-center justify-center gap-2 shadow-lg active:translate-y-[1px]"
                >
                  <LogIn className="w-4.5 h-4.5" />
                  {loadingLocal ? 'CONNECTING PLAY DECK...' : activeTab === 'signin' ? 'Sign In Securely' : 'Create Free Account'}
                </button>
              </form>

              {/* Bottom SSL verification badges */}
              <div className="mt-6 border-t border-slate-800/80 pt-5 flex flex-col gap-2.5 items-center text-center">
                <span className="text-[10px] text-slate-400 flex items-center gap-1.5 leading-none font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  AUTHENTICATION PROTOCOL ACTIVE • SHA-256 ENCRYPTED
                </span>
                <p className="text-[9.5px] text-slate-550 max-w-xs leading-normal">
                  Our double-entry ledger verifies your sessions seamlessly across game actions. Standard terms apply.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* SEO-Friendly Content Structure & AI GEO Data Section */}
        <div className="mt-8 bg-[#111625]/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-md">
          <SEOContentSection 
            onSelectCategory={() => loginAsGuest()} 
            onSelectGame={() => loginAsGuest()} 
          />
        </div>

      </div>

    </div>
  );
}
