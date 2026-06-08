/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { RewardEngineProvider, useRewardEngine } from './lib/store';
import { GameType } from './types';
import AuthScreen from './components/AuthScreen';
import SpinWheel from './components/SpinWheel';
import ScratchCard from './components/ScratchCard';
import QuizGame from './components/QuizGame';
import TapChallenge from './components/TapChallenge';
import Wallet from './components/Wallet';
import Referrals from './components/Referrals';
import Leaderboard from './components/Leaderboard';
import AdCenter from './components/AdCenter';
import AdminPanel from './components/AdminPanel';
import { 
  Gamepad2, WalletCards, Trophy, Users, MonitorPlay, Shield, 
  LogOut, Coins, Sparkles, Clock, Menu, X, ChevronRight, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function DashboardLobby() {
  const { user, logout, isFirebaseMode } = useRewardEngine();
  const [activeTab, setActiveTab] = useState<'lobby' | 'wallet' | 'referrals' | 'leaderboard' | 'ads' | 'admin'>('lobby');
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <AuthScreen />;

  const navigationTabs = [
    { id: 'lobby', label: 'Play Arena', icon: Gamepad2, color: 'text-emerald-450' },
    { id: 'wallet', label: 'My Wallet', icon: WalletCards, color: 'text-amber-450' },
    { id: 'referrals', label: 'Invite Referrals', icon: Users, color: 'text-purple-450' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-yellow-450' },
    { id: 'ads', label: 'Sponsor Ads', icon: MonitorPlay, color: 'text-sky-450' },
  ];

  // Securely reveal Admin controls ONLY if staff permissions are met
  if (user.isAdmin) {
    navigationTabs.push({ id: 'admin', label: 'Admin Hub', icon: Shield, color: 'text-rose-450' });
  }

  const handleTabSelect = (tabId: any) => {
    setActiveTab(tabId);
    setActiveGame(null);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#090a10] text-[#cfd3e0] flex flex-col md:flex-row font-sans">
      
      {/* 1. Sidemenu Rail sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d0f17] border-r border-[#191c28] p-5 shrink-0 select-none">
        {/* Brand visual header */}
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Gamepad2 className="w-5.5 h-5.5 text-emerald-400 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">REWARDYN</h1>
            <p className="text-[9px] text-[#4b587d] font-bold uppercase tracking-wider">Play & Earn platform</p>
          </div>
        </div>

        {/* Navigation Map links */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {navigationTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent text-emerald-400 border-l-[3px] border-emerald-500'
                    : 'text-[#6f7eab] hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Database environment indicator info */}
        <div className="mt-auto pt-6 border-t border-[#1a1e2d] flex flex-col gap-3">
          <div className="px-3.5 py-2.5 bg-slate-950/70 border border-slate-900 rounded-xl">
            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Connection Engine</p>
            <p className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${isFirebaseMode ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
              {isFirebaseMode ? 'Firebase Cloud Live' : 'Sandbox Emulator'}
            </p>
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 bg-[#1a0f17] border border-red-500/10 hover:border-red-500/20 text-red-400 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* 2. Top header helper bar for Mobile layout */}
      <header className="md:hidden w-full bg-[#0d0f17] border-b border-[#191c28] px-5 py-3.5 flex items-center justify-between select-none relative z-40">
        <div className="flex items-center gap-2">
          <div className="w-8.5 h-8.5 bg-emerald-500/10 border border-emerald-500 rounded-lg flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xs font-black text-white tracking-widest uppercase">REWARDYN</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Balance indicator */}
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-900 rounded-xl flex items-center gap-1 text-[11px] font-black text-yellow-450">
            <Coins className="w-3.5 h-3.5 text-yellow-500" />
            {user.coins.toLocaleString()}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown lists drawer wrapper */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute left-0 right-0 top-full bg-[#0d0f17] border-b border-[#1b1c2b] shadow-2xl overflow-hidden flex flex-col p-4 gap-1.5 z-50"
            >
              {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`w-full p-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                      isSelected ? 'bg-slate-900 text-emerald-400' : 'text-[#6f7eab]'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <button
                onClick={logout}
                className="w-full mt-4 p-3 bg-red-500/10 text-red-400 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Logout Account
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. Primary Workspace Arena viewport */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
        
        {/* Top desktop profile summary hub */}
        <div className="hidden md:flex justify-between items-center bg-[#0d0f17] p-4.5 border border-[#191c28] rounded-3xl mb-8 shadow-md">
          <div className="flex items-center gap-3">
            <img
              referrerPolicy="no-referrer"
              src={user.photoURL}
              alt={user.name}
              className="w-11 h-11 rounded-2xl border border-slate-800 object-cover bg-slate-950"
            />
            <div>
              <h3 className="text-sm font-black text-white">{user.name}</h3>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                Gamer account • {user.provider.toUpperCase()} Provider
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Eco stats pill */}
            <div className="py-2.5 px-4 bg-slate-950 border border-slate-900 rounded-2xl">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider">WALLET STANDING</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Coins className="w-4.5 h-4.5 text-yellow-400 shrink-0" />
                <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-250">
                  {user.coins.toLocaleString()}
                </h4>
              </div>
            </div>

            <div className="py-2.5 px-4 bg-slate-950 border border-slate-900 rounded-2xl">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider">Unique Invite Code</span>
              <h4 className="text-xs font-mono font-black text-emerald-400 tracking-wider mt-1 uppercase text-center">
                {user.referralCode}
              </h4>
            </div>
          </div>
        </div>

        {/* Tab display switches router */}
        <div className="w-full">
          {/* LOBBY HUB VIEW */}
          {activeTab === 'lobby' && (
            <div>
              {!activeGame ? (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <Zap className="w-6.5 h-6.5 text-emerald-450 fill-emerald-500 animate-pulse" />
                      Arcade Play Arena
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Select an active HTML5 mini-game to compete and claim instant token rewards</p>
                  </div>

                  {/* 4 Games Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none">
                    {/* Game 1: Spinwheel */}
                    <div 
                      onClick={() => setActiveGame(GameType.SPIN_WHEEL)}
                      className="group bg-gradient-to-br from-[#1d143c] via-[#100d1e] to-[#0c0a15] border border-purple-500/20 hover:border-purple-400 rounded-3xl p-6 relative overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] transition-all transform hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                      <div>
                        <div className="w-11 h-11 bg-purple-500/10 border-2 border-purple-500 rounded-xl flex items-center justify-center font-bold text-purple-400 mb-4 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                          🎡
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Lucky Wheel Spin</h3>
                        <p className="text-[11px] text-[#8e94be] mt-2.5 leading-relaxed">
                          Test your physical fortune! Spin the premium segment wheel loaded with diverse tokens and Jackpots up to +500 coins.
                        </p>
                      </div>
                      <div className="mt-8 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-purple-450 uppercase font-black tracking-wider flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-yellow-400" /> Max: 500 Coins Base
                        </span>
                        <span className="text-gray-450 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                          Play Game <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Game 2: Scratch Card */}
                    <div 
                      onClick={() => setActiveGame(GameType.SCRATCH_CARD)}
                      className="group bg-gradient-to-br from-[#101e28] via-[#0b141b] to-[#06080d] border border-blue-500/20 hover:border-blue-400 rounded-3xl p-6 relative overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] transition-all transform hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                      <div>
                        <div className="w-11 h-11 bg-blue-500/10 border-2 border-blue-500 rounded-xl flex items-center justify-center font-bold text-blue-400 mb-4 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                          ✉️
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Golden Scratch Card</h3>
                        <p className="text-[11px] text-[#8e94be] mt-2.5 leading-relaxed">
                          Rub off metallic coatings interactively on standard mouse/touch paths to claim coin allocations up to +300 units instantly.
                        </p>
                      </div>
                      <div className="mt-8 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-blue-450 uppercase font-black tracking-wider flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-yellow-400" /> Max: 300 Coins Claim
                        </span>
                        <span className="text-gray-450 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                          Play Game <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Game 3: Trivia Quiz */}
                    <div 
                      onClick={() => setActiveGame(GameType.QUIZ)}
                      className="group bg-gradient-to-br from-[#0e2a22] via-[#091714] to-[#040807] border border-emerald-500/20 hover:border-emerald-400 rounded-3xl p-6 relative overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all transform hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                      <div>
                        <div className="w-11 h-11 bg-emerald-500/10 border-2 border-emerald-500 rounded-xl flex items-center justify-center font-bold text-emerald-400 mb-4 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          🧠
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Knowledge Arena Quiz</h3>
                        <p className="text-[11px] text-[#8e94be] mt-2.5 leading-relaxed">
                          Sharpen your computing and Web3 knowledge trivia. Correct answers grant +40 coins instantly, with 5 multi-choice steps.
                        </p>
                      </div>
                      <div className="mt-8 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-emerald-450 uppercase font-black tracking-wider flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-yellow-400" /> Day limit: 200 Coins
                        </span>
                        <span className="text-gray-450 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                          Play Game <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Game 4: Fast Tap speed test */}
                    <div 
                      onClick={() => setActiveGame(GameType.TAP_CHALLENGE)}
                      className="group bg-gradient-to-br from-[#2a1324] via-[#150a12] to-[#0a0509] border border-rose-500/20 hover:border-rose-400 rounded-3xl p-6 relative overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(244,63,94,0.15)] transition-all transform hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                      <div>
                        <div className="w-11 h-11 bg-rose-500/10 border-2 border-rose-500 rounded-xl flex items-center justify-center font-bold text-rose-400 mb-4 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                          ⚡
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Hyper Tap Velocity</h3>
                        <p className="text-[11px] text-[#8e94be] mt-2.5 leading-relaxed">
                          Test your finger click dexterity. Tap the neon orb as many times as possible within a strict 10 second countdown.
                        </p>
                      </div>
                      <div className="mt-8 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-rose-450 uppercase font-black tracking-wider flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-yellow-400" /> Max: 60 Coins Payout
                        </span>
                        <span className="text-gray-450 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                          Play Game <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Close active game lobby overlay header */}
                  <div className="mb-6 flex items-center justify-between border-b border-slate-900 pb-4">
                    <button
                      onClick={() => setActiveGame(null)}
                      className="py-1.5 px-3 bg-slate-900 border border-slate-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Exit Game Area
                    </button>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-black">
                      ACTIVE SECURE CONTEXT ENGINE
                    </span>
                  </div>

                  {/* Render active loaded game component wrapper */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col justify-center items-center w-full"
                  >
                    {activeGame === GameType.SPIN_WHEEL && <SpinWheel />}
                    {activeGame === GameType.SCRATCH_CARD && <ScratchCard />}
                    {activeGame === GameType.QUIZ && <QuizGame />}
                    {activeGame === GameType.TAP_CHALLENGE && <TapChallenge />}
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {/* MY WALLET TAB */}
          {activeTab === 'wallet' && <Wallet />}

          {/* REFERRAL SYSTEM TAB */}
          {activeTab === 'referrals' && <Referrals />}

          {/* COMPETITIVE LEADERBOARDS TAB */}
          {activeTab === 'leaderboard' && <Leaderboard />}

          {/* REWARDED VIDEO ADS TAB */}
          {activeTab === 'ads' && <AdCenter />}

          {/* SECURED STAFF ADMINISTRATIVE CONTROLS */}
          {activeTab === 'admin' && <AdminPanel />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <RewardEngineProvider>
      <DashboardLobby />
    </RewardEngineProvider>
  );
}
