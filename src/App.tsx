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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* 1. Sidemenu Rail sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-5 shrink-0 select-none">
        {/* Brand visual header */}
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Gamepad2 className="w-5.5 h-5.5 text-emerald-650 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-widest uppercase">REWARDYN</h1>
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
                    ? 'bg-emerald-50 shadow-sm text-emerald-700 border-l-[3px] border-emerald-500 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Database environment indicator info */}
        <div className="mt-auto pt-6 border-t border-slate-200 flex flex-col gap-3">
          <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl">
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Connection Engine</p>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${isFirebaseMode ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
              {isFirebaseMode ? 'Firebase Cloud Live' : 'Sandbox Emulator'}
            </p>
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-650 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* 2. Top header helper bar for Mobile layout */}
      <header className="md:hidden w-full bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between select-none relative z-40">
        <div className="flex items-center gap-2">
          <div className="w-8.5 h-8.5 bg-emerald-50/10 border border-emerald-500 rounded-lg flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-emerald-650" />
          </div>
          <span className="text-xs font-black text-slate-900 tracking-widest uppercase">REWARDYN</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Balance indicator */}
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-1 text-[11px] font-black text-amber-700 font-bold">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            {user.coins.toLocaleString()}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-600 hover:text-slate-900"
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
              className="absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-2xl overflow-hidden flex flex-col p-4 gap-1.5 z-50 animate-in fade-in"
            >
              {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`w-full p-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                      isSelected ? 'bg-slate-100 text-emerald-700 font-black' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <button
                onClick={logout}
                className="w-full mt-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 border border-red-150 hover:bg-red-100"
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
        <div className="hidden md:flex justify-between items-center bg-white p-4.5 border border-slate-200 rounded-3xl mb-8 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              referrerPolicy="no-referrer"
              src={user.photoURL}
              alt={user.name}
              className="w-11 h-11 rounded-2xl border border-slate-200 object-cover bg-slate-55"
            />
            <div>
              <h3 className="text-sm font-black text-slate-850">{user.name}</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide font-medium">
                Gamer account • {user.provider.toUpperCase()} Provider
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Eco stats pill */}
            <div className="py-2.5 px-4 bg-slate-100 border border-slate-200 rounded-2xl">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">WALLET STANDING</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Coins className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                <h4 className="text-sm font-black text-amber-700">
                  {user.coins.toLocaleString()}
                </h4>
              </div>
            </div>

            <div className="py-2.5 px-4 bg-slate-100 border border-slate-200 rounded-2xl">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">Unique Invite Code</span>
              <h4 className="text-xs font-mono font-black text-emerald-600 tracking-wider mt-1 uppercase text-center">
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
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Zap className="w-6.5 h-6.5 text-emerald-600 fill-emerald-500 animate-pulse" />
                      Arcade Play Arena
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Select an active HTML5 mini-game to compete and claim instant token rewards</p>
                  </div>

                  {/* 4 Games Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none">
                    {/* Game 1: Spinwheel */}
                    <div 
                      onClick={() => setActiveGame(GameType.SPIN_WHEEL)}
                      className="group bg-white border border-purple-100 hover:border-purple-300 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                      <div>
                        <div className="w-11 h-11 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center font-bold text-purple-600 mb-4 shadow-sm">
                          🎡
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Lucky Wheel Spin</h3>
                        <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                          Test your physical fortune! Spin the premium segment wheel loaded with diverse tokens and Jackpots up to +500 coins.
                        </p>
                      </div>
                      <div className="mt-8 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-purple-605 uppercase font-black tracking-wider flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-500" /> Max: 500 Coins Base
                        </span>
                        <span className="text-slate-500 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                          Play Game <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Game 2: Scratch Card */}
                    <div 
                      onClick={() => setActiveGame(GameType.SCRATCH_CARD)}
                      className="group bg-white border border-blue-100 hover:border-blue-300 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                      <div>
                        <div className="w-11 h-11 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center font-bold text-blue-600 mb-4 shadow-sm">
                          ✉️
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Golden Scratch Card</h3>
                        <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                          Rub off metallic coatings interactively on standard mouse/touch paths to claim coin allocations up to +300 units instantly.
                        </p>
                      </div>
                      <div className="mt-8 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-blue-605 uppercase font-black tracking-wider flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-500" /> Max: 300 Coins Claim
                        </span>
                        <span className="text-slate-500 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                          Play Game <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Game 3: Trivia Quiz */}
                    <div 
                      onClick={() => setActiveGame(GameType.QUIZ)}
                      className="group bg-white border border-emerald-100 hover:border-emerald-300 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                      <div>
                        <div className="w-11 h-11 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center font-bold text-emerald-650 mb-4 shadow-sm">
                          🧠
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Knowledge Arena Quiz</h3>
                        <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                          Sharpen your computing and Web3 knowledge trivia. Correct answers grant +40 coins instantly, with 5 multi-choice steps.
                        </p>
                      </div>
                      <div className="mt-8 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-emerald-650 uppercase font-black tracking-wider flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-500" /> Day limit: 200 Coins
                        </span>
                        <span className="text-slate-500 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                          Play Game <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Game 4: Fast Tap speed test */}
                    <div 
                      onClick={() => setActiveGame(GameType.TAP_CHALLENGE)}
                      className="group bg-white border border-rose-100 hover:border-rose-300 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                      <div>
                        <div className="w-11 h-11 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center font-bold text-rose-600 mb-4 shadow-sm">
                          ⚡
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Hyper Tap Velocity</h3>
                        <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                          Test your finger click dexterity. Tap the neon orb as many times as possible within a strict 10 second countdown.
                        </p>
                      </div>
                      <div className="mt-8 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-rose-605 uppercase font-black tracking-wider flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-500" /> Max: 60 Coins Payout
                        </span>
                        <span className="text-slate-500 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                          Play Game <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Close active game lobby overlay header */}
                  <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                    <button
                      onClick={() => setActiveGame(null)}
                      className="py-1.5 px-3 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Exit Game Area
                    </button>
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-black">
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
