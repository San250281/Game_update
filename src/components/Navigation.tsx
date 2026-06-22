/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Home,
  Gamepad2,
  ClipboardList,
  Gift,
  Wallet as WalletIcon,
  Trophy,
  Zap,
  Share2,
  Megaphone,
  User,
  ShieldAlert,
  LogOut,
  Coins,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useApp();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'surveys', label: 'Survey Center', icon: ClipboardList },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'wallet', label: 'Wallet', icon: WalletIcon },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'membership', label: 'Membership', icon: Zap },
    { id: 'refer', label: 'Refer & Earn', icon: Share2 },
    { id: 'advertise', label: 'Advertise With Us', icon: Megaphone },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const getRoleBadgeColor = (role: UserRole | undefined) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
      case UserRole.PREMIUM_USER:
        return 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 glow-amber';
      default:
        return 'bg-slate-400/10 text-slate-300 border border-slate-500/20';
    }
  };

  return (
    <>
      {/* MOBILE HEADER BAR */}
      <header id="mobile-header" className="md:hidden flex items-center justify-between bg-[#18181A] px-4 py-3 border-b border-[#2C2C30] sticky top-0 z-50">
        <button
          id="btn-toggle-menu"
          onClick={() => setMobileOpen(true)}
          className="p-2 text-gray-300 hover:text-white transition-colors"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <Menu className="w-6 h-6" />
        </button>

        <div onClick={() => setActiveTab('home')} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6C63FF] to-[#00C896] flex items-center justify-center font-bold text-white text-base shadow-lg shadow-[#6C63FF]/20">
            RA
          </div>
          <span className="font-sans font-bold tracking-tight text-white text-lg">
            Reward<span className="text-[#00C896]">Arena</span>
          </span>
        </div>

        {currentUser ? (
          <div
            id="wallet-coin-counter-mobile"
            onClick={() => handleTabClick('wallet')}
            className="flex items-center gap-1.5 bg-[#222226] hover:bg-[#2C2C32] px-2.5 py-1 rounded-full border border-[#FFD700]/30 cursor-pointer transition-all"
            style={{ minHeight: '34px' }}
          >
            <Coins className="w-4 h-4 text-[#FFD700]" />
            <span className="text-xs font-mono font-medium text-[#FFD700]">{currentUser.coins}</span>
          </div>
        ) : (
          <button
            id="btn-nav-login-mobile"
            onClick={() => handleTabClick('profile')}
            className="text-xs px-3 py-1.5 rounded-full bg-[#6C63FF] text-white font-medium hover:bg-[#5b54e0] transition-all"
          >
            Login
          </button>
        )}
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside
        id="desktop-sidebar"
        className="hidden md:flex flex-col w-64 bg-[#141416] border-r border-[#222224] h-screen sticky top-0 shrink-0 select-none overflow-y-auto"
      >
        {/* LOGO AREA */}
        <div className="p-6 border-b border-[#222224] flex items-center justify-between">
          <div
            id="logo-brand-full"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer hover:scale-102 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#00C896] flex items-center justify-center font-bold text-white text-lg shadow-xl shadow-[#6C63FF]/30">
              RA
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold tracking-tight text-white text-xl leading-none">
                Reward<span className="text-[#00C896]">Arena</span>
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Arena of Gamers</span>
            </div>
          </div>
        </div>

        {/* ACTIVE USER PANEL */}
        {currentUser && (
          <div id="user-nav-panel" className="p-4 mx-4 my-5 rounded-xl bg-gradient-to-b from-[#1E1E22] to-[#16161A] border border-[#2A2A30] shadow-md flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="w-11 h-11 rounded-lg border border-[#6C63FF]/30 object-cover bg-slate-800"
            />
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-sans font-medium text-white truncate leading-snug">{currentUser.displayName}</h4>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium select-none ${getRoleBadgeColor(currentUser.role)}`}>
                  {currentUser.role}
                </span>
                {currentUser.membershipPlan && currentUser.membershipPlan !== 'none' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00C896]/10 text-[#00C896] font-medium border border-[#00C896]/30 animate-pulse">
                    PRM
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MENU LINKS */}
        <nav id="desktop-nav-menu" className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                id={`btn-nav-${item.id}`}
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium tracking-normal transition-all group relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#6C63FF]/10 text-[#6C63FF] border-l-2 border-[#6C63FF] font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/20 border-l-2 border-transparent'
                }`}
                style={{ minHeight: '44px' }}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <IconComp className={`w-4.5 h-4.5 transition-colors ${
                    isSelected ? 'text-[#6C63FF]' : 'text-gray-400 group-hover:text-gray-200'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'membership' && currentUser?.role !== UserRole.PREMIUM_USER && currentUser?.role !== UserRole.ADMIN && (
                  <span className="text-[10px] bg-[#6C63FF]/20 text-[#6C63FF] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider group-hover:scale-105 transition-transform">
                    Unlock
                  </span>
                )}
                {item.id === 'surveys' && currentUser?.role === UserRole.PREMIUM_USER && (
                  <span className="w-2 h-2 rounded-full bg-[#00C896] animate-ping" />
                )}
              </button>
            );
          })}

          {/* ADMIN PORTAL SPECIAL ACCESSIBILITY */}
          {currentUser?.role === UserRole.ADMIN && (
            <button
              id="btn-nav-admin"
              onClick={() => handleTabClick('admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold tracking-normal transition-all border-l-2 ${
                activeTab === 'admin'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500'
                  : 'text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 border-transparent'
              }`}
              style={{ minHeight: '44px' }}
            >
              <ShieldAlert className="w-4.5 h-4.5" />
              <span>Admin Dashboard</span>
            </button>
          )}
        </nav>

        {/* LOGOUT AREA & WALLET ACCUMULATOR */}
        <div className="p-4 border-t border-[#222224] space-y-3">
          {currentUser && (
            <div className="flex items-center justify-between rounded-xl p-3 bg-gradient-to-r from-amber-500/5 to-amber-500/0 border border-[#FFD700]/15">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#FFD700] animate-bounce" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest leading-none">TOTAL BALANCE</span>
                  <span className="text-base font-mono font-bold text-[#FFD700] leading-snug mt-1">{currentUser.coins} <span className="text-xs text-gray-400">Coins</span></span>
                </div>
              </div>
            </div>
          )}

          {currentUser ? (
            <button
              id="btn-nav-logout"
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:text-white bg-rose-500/5 hover:bg-rose-600 transition-all border border-rose-500/20"
              style={{ minHeight: '44px' }}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Account</span>
            </button>
          ) : (
            <button
              id="btn-nav-signin-footer"
              onClick={() => setActiveTab('profile')}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#8077FF] text-white font-sans font-semibold text-sm shadow-lg shadow-[#6C63FF]/15 hover:opacity-95 transition-opacity"
              style={{ minHeight: '44px' }}
            >
              Log In Profile
            </button>
          )}
        </div>
      </aside>

      {/* MOBILE NAV DRAWER OVERLAY */}
      {mobileOpen && (
        <div id="mobile-drawer-overlay" className="fixed inset-0 bg-black/75 z-55 flex justify-start md:hidden backdrop-blur-sm animate-fade-in">
          <div className="w-72 bg-[#121212] border-r border-[#252528] h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6C63FF] to-[#00C896] flex items-center justify-center font-bold text-white text-sm">
                  RA
                </div>
                <span className="font-sans font-bold text-white text-base">RewardArena</span>
              </div>
              <button
                id="btn-close-mobile-drawer"
                aria-label="Close"
                onClick={() => setMobileOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile User Panel */}
            {currentUser && (
              <div className="p-3 mb-4 rounded-xl bg-slate-800/30 border border-slate-700/30 flex items-center gap-2.5">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-10 h-10 rounded-lg object-cover bg-slate-700"
                />
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-xs font-semibold text-white truncate">{currentUser.displayName}</h4>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded inline-block mt-0.5 font-bold ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Navigation List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {navItems.map((item) => {
                const IconComp = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    id={`btn-nav-mobile-${item.id}`}
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#6C63FF]/15 text-[#6C63FF] font-bold border-l-2 border-[#6C63FF]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    <IconComp className="w-4.5 h-4.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {currentUser?.role === UserRole.ADMIN && (
                <button
                  id="btn-nav-mobile-admin"
                  onClick={() => handleTabClick('admin')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-400 border-l-2 ${
                    activeTab === 'admin' ? 'bg-rose-500/10 border-rose-500' : 'border-transparent'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  <ShieldAlert className="w-4.5 h-4.5" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              {currentUser ? (
                <button
                  id="btn-logout-mobile"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
                  style={{ minHeight: '44px' }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  id="btn-login-mobile-drawer"
                  onClick={() => handleTabClick('profile')}
                  className="w-full py-2.5 rounded-lg bg-[#6C63FF] text-white text-xs font-semibold"
                  style={{ minHeight: '44px' }}
                >
                  Sign In Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
