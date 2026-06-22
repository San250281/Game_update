/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Games } from './pages/Games';
import { SurveyCenter } from './pages/SurveyCenter';
import { Rewards } from './pages/Rewards';
import { Wallet } from './pages/Wallet';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { MembershipPage } from './pages/MembershipPage';
import { ReferEarn } from './pages/ReferEarn';
import { AdvertisePortal } from './pages/AdvertisePortal';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPortal } from './pages/AdminPortal';
import { Coins, Bell, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const [activeTab, setActiveTab ] = useState<string>('home');
  const { notifications, removeNotification, currentUser } = useApp();

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={setActiveTab} />;
      case 'games':
        return <Games />;
      case 'surveys':
        return <SurveyCenter onNavigate={setActiveTab} />;
      case 'rewards':
        return <Rewards />;
      case 'wallet':
        return <Wallet />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'membership':
        return <MembershipPage />;
      case 'refer':
        return <ReferEarn />;
      case 'advertise':
        return <AdvertisePortal />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminPortal />;
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] text-gray-100 flex flex-col md:flex-row relative">
      {/* 1. Dynamic Slide-in Push Notification Toast Panel */}
      <div id="notification-portal" className="fixed top-4 right-4 z-60 space-y-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 120, scale: 0.9 }}
              className="bg-[#1C1C1F] border border-slate-800/80 rounded-xl p-4 shadow-2xl flex items-start gap-3 pointer-events-auto cursor-pointer"
              onClick={() => removeNotification(notif.id)}
            >
              <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/10 flex items-center justify-center shrink-0 border border-[#6C63FF]/25 text-[#6C63FF]">
                <Bell className="w-4 h-4 animate-swing" />
              </div>

              <div className="flex-1 space-y-0.5">
                <span className="text-[10px] text-gray-500 font-mono block uppercase tracking-wider">{notif.type}</span>
                <p className="text-xs font-semibold text-white leading-relaxed">{notif.message}</p>
                <span className="text-[9px] text-[#00C896] block font-mono">Just now (Click to clear)</span>
              </div>

              <button
                id={`btn-close-toast-${notif.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notif.id);
                }}
                className="text-gray-500 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 2. Side navigation element */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 3. Main scrollable client viewport */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8 lg:p-12 max-h-screen">
        <div className="max-w-6xl mx-auto">
          {renderActiveTabContent()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
