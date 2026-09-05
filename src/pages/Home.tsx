/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gamepad2, ArrowRight, ClipboardList, Gift, Trophy, CheckCircle, Flame, Star, Quote, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GAME_DEFINITIONS, SURVEY_PROVIDERS, REWARD_ITEMS, TESTIMONIALS } from '../data';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigate: (tabId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { currentUser, leaderboards } = useApp();

  // Pick some items
  const featuredGames = GAME_DEFINITIONS.slice(0, 2);
  const trendingGames = GAME_DEFINITIONS.slice(2, 4);
  const surveyProviders = SURVEY_PROVIDERS.slice(0, 3);
  const rewardsPreview = REWARD_ITEMS.slice(0, 4);

  return (
    <div className="space-y-12 pb-16 animate-fade-in select-none">
      {/* 1. HERO BANNER */}
      <section
        id="home-hero"
        className="relative rounded-2xl overflow-hidden bg-cover bg-center min-h-[420px] flex items-center p-6 md:p-12 shadow-2xl border border-slate-800/40"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(18, 18, 18, 0.95) 40%, rgba(108, 99, 255, 0.15) 100%), url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80')`,
        }}
      >
        <div className="max-w-2xl space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6C63FF]/20 text-[#6C63FF] text-xs font-semibold rounded-full border border-[#6C63FF]/30 tracking-wide uppercase"
          >
            <Flame className="w-4.5 h-4.5 text-[#6C63FF] animate-pulse" />
            <span>PLAY & EARN COINS INSTANTLY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-white leading-none"
          >
            Play Games. <br />
            Earn Coins. <br />
            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#00C896]">Rewards.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-300 text-sm md:text-base leading-relaxed max-w-lg"
          >
            The ultimate gaming rewards arena. Play multiple engaging browser games, share your opinion in premium surveys, and redeem accumulated coins for Amazon, Flipkart, Google Play, or Steam Gift Cards!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-4 pt-2 flex-wrap"
          >
            <button
              id="hero-btn-play"
              onClick={() => onNavigate('games')}
              className="px-6 py-3.5 bg-[#6C63FF] hover:bg-[#5b54e0] text-white font-sans font-semibold rounded-xl transition-all shadow-lg hover:shadow-[#6C63FF]/30 flex items-center gap-2 group cursor-pointer text-sm"
              style={{ minHeight: '44px' }}
            >
              <span>Launch Arcade Arena</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              id="hero-btn-membership"
              onClick={() => onNavigate('membership')}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-sans font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer text-sm border-b-2 border-amber-700/50"
              style={{ minHeight: '44px' }}
            >
              <Zap className="w-4.5 h-4.5 fill-slate-950" />
              <span>Get Premium Pass</span>
            </button>
          </motion.div>
        </div>

        {/* Ambient floating elements */}
        <div className="absolute right-10 bottom-10 hidden lg:block w-72 h-72 rounded-full bg-[#6C63FF]/10 blur-3xl" />
        <div className="absolute right-40 top-10 hidden lg:block w-48 h-48 rounded-full bg-[#00C896]/10 blur-3xl" />
      </section>

      {/* 2. CORE STATS ROW */}
      <section id="banner-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Arena Players', val: '14,200+', color: 'text-[#6C63FF]' },
          { label: 'Total Coins Distributed', val: '2.4 Million', color: 'text-[#00C896]' },
          { label: 'Gift Cards Delivered', val: '₹3,40,000+', color: 'text-[#FFD700]' },
          { label: 'Merchant Offer Partners', val: '15+ Networks', color: 'text-purple-400' },
        ].map((st, idx) => (
          <div key={idx} className="bg-[#18181A] rounded-xl p-4 md:p-5 border border-slate-800/30 text-center shadow-lg">
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{st.label}</p>
            <h3 className={`text-2xl md:text-3xl font-mono font-bold mt-1.5 ${st.color}`}>{st.val}</h3>
          </div>
        ))}
      </section>

      {/* 3. FEATURED & TRENDING GAMES PREVIEW */}
      <section id="home-featured-games" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#6C63FF]" />
            <h2 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight">Featured Arcade Arena</h2>
          </div>
          <button
            id="home-find-games"
            onClick={() => onNavigate('games')}
            className="text-xs text-[#6C63FF] hover:text-[#5b54e0] font-sans font-semibold flex items-center gap-1 group"
          >
            <span>See all 4 games</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredGames.map((game) => (
            <div
              id={`game-card-${game.id}`}
              key={game.id}
              className="group rounded-xl overflow-hidden bg-[#18181A] border border-slate-800/40 shadow-lg flex flex-col md:flex-row cursor-pointer hover:border-[#6C63FF]/40 transition-colors"
              onClick={() => onNavigate('games')}
            >
              <img
                src={game.imageUrl}
                alt={game.name}
                className="w-full md:w-48 h-48 object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700/50">
                      {game.category}
                    </span>
                    <span className="text-[10px] font-mono text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full border border-[#00C896]/20">
                      ● {game.activePlayers} Playing
                    </span>
                  </div>
                  <h3 className="text-lg font-sans font-bold text-white tracking-tight">{game.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{game.description}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/30 pt-3">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">WINS AWARD: +10 COINS</span>
                  <span className="text-xs font-semibold text-[#6C63FF] group-hover:underline flex items-center gap-1">
                    Play Now <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SURVEYS & REWARDS PREVIEW SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* MEMBERSHIP & SURVEY CENTER PREVIEW */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#00C896]" />
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Earn in Survey Center</h2>
            </div>
            <button
              id="home-lnk-surveys"
              onClick={() => onNavigate('surveys')}
              className="text-xs text-[#00C896] hover:text-[#009b74] font-semibold flex items-center gap-1"
            >
              <span>Unlock Surveys</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#18181A] rounded-xl p-5 border border-slate-800/40 shadow-xl space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-[#00C896]/5 to-[#00C896]/0 border border-[#00C896]/10">
              <div className="w-10 h-10 rounded-lg bg-[#00C896]/15 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-[#00C896]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Unlock High-Paying Survey Panels</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Only premium subscribers have access to executive consumer survey panels, guaranteeing massive coins payout!
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">INTEGRATED SURVEY PROVIDERS</span>
              <div className="grid grid-cols-3 gap-3">
                {surveyProviders.map((prov) => (
                  <div key={prov.id} className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800/50 rounded-lg p-3 text-center flex flex-col items-center justify-center space-y-1.5 transition-colors">
                    <img src={prov.logoUrl} alt={prov.name} className="w-8 h-8 rounded-full object-cover grayscale opacity-80" />
                    <span className="text-xs font-semibold text-gray-300 leading-none">{prov.name}</span>
                    <span className="text-[9px] font-mono text-[#00C896]">+{prov.rewardCoins} Coins</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              id="home-btn-lock-survey"
              onClick={() => onNavigate('surveys')}
              className="w-full py-3 rounded-lg bg-teal-500/10 hover:bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/20 font-semibold text-xs text-center transition-all cursor-pointer flex items-center justify-center gap-2"
              style={{ minHeight: '44px' }}
            >
              <span>Navigate to Survey Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* REWARD MARKETPLACE PREVIEW */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#FFD700]" />
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Reward Marketplace</h2>
            </div>
            <button
              id="home-lnk-rewards"
              onClick={() => onNavigate('rewards')}
              className="text-xs text-[#FFD700] hover:text-amber-500 font-semibold flex items-center gap-1"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {rewardsPreview.map((item) => (
              <div
                id={`reward-card-${item.id}`}
                key={item.id}
                onClick={() => onNavigate('rewards')}
                className="group bg-[#18181A] rounded-xl overflow-hidden border border-slate-800/40 hover:border-[#FFD700]/30 transition-colors cursor-pointer p-3.5 space-y-3"
              >
                <div className="relative h-24 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-slate-950/80 px-2 py-0.5 rounded text-white font-mono uppercase tracking-wider">{item.category}</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-sans font-bold text-white line-clamp-1">{item.title}</h4>
                  <div className="flex items-center gap-1 text-[#FFD700] font-mono">
                    <Star className="w-3.5 h-3.5 fill-[#FFD700]" />
                    <span className="text-xs font-bold leading-none">{item.coinCost} <span className="text-[10px] text-gray-500 font-normal">Coins</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. LEADERBOARD HIGHLIGHT SECTION */}
      <section id="home-leaderboard" className="bg-[#18181A] rounded-2xl p-6 md:p-8 border border-slate-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#FFD700] animate-pulse" />
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Arena Leaderboard</h2>
            </div>
            <p className="text-xs text-gray-400">Compete with gamers across India. Updates automated every single match win.</p>
          </div>
          <button
            id="home-btn-leaderboard"
            onClick={() => onNavigate('leaderboard')}
            className="md:px-5 py-2.5 bg-indigo-500/5 hover:bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/30 font-semibold rounded-xl text-xs text-center transition-all cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Show Full Standings
          </button>
        </div>

        {/* Podium Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboards.allTime.slice(0, 3).map((player, idx) => (
            <div
              key={player.userId}
              className={`relative rounded-xl p-4 flex items-center gap-3 border ${
                idx === 0
                  ? 'bg-amber-500/5 border-amber-500/20 shadow-amber-500/5'
                  : idx === 1
                  ? 'bg-slate-400/5 border-slate-400/10'
                  : 'bg-orange-500/5 border-orange-500/10'
              }`}
            >
              <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-white">
                #{idx + 1}
              </div>
              <img src={player.avatarUrl} alt={player.username} className="w-11 h-11 rounded-lg border border-slate-700/60 bg-slate-800 object-cover" />
              <div>
                <h4 className="text-xs font-semibold text-white">{player.username}</h4>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">Games: {player.gamesPlayed} wins</p>
                <p className="text-xs font-mono font-bold text-[#FFD700] mt-1">{player.coinsEarned} Coins</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section id="home-testimonials" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Loved by 10,000+ Indian Gamers</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto">See what our active premium members say about speed payouts and reward deliveries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((test) => (
            <div key={test.id} className="bg-[#18181A] rounded-xl p-5 border border-slate-800/40 flex flex-col justify-between shadow-xl space-y-6 relative overflow-hidden">
              <Quote className="absolute right-4 top-4 w-10 h-10 text-slate-800/20" />
              <p className="text-xs text-gray-400 leading-relaxed italic relative z-10">"{test.quote}"</p>
              <div className="flex items-center gap-3 relative z-10 pt-2 border-t border-slate-800/30">
                <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full object-cover border border-slate-700/50" />
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{test.name}</h4>
                  <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">{test.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer id="home-footer" className="border-t border-[#222224] pt-8 mt-12 space-y-8 select-none">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6C63FF] to-[#00C896] flex items-center justify-center font-bold text-white text-sm">
                RA
              </div>
              <span className="font-sans font-bold text-white text-lg">RewardArena</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Premium browser based gaming reward hub. Accumulate coin drops, unlock membership pathways, participate in verified surveys and redeem instant shopping certificates.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Navigations</h4>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li><button onClick={() => onNavigate('games')} className="hover:text-[#6C63FF]" style={{ minHeight: '32px' }}>Arcade games</button></li>
              <li><button onClick={() => onNavigate('surveys')} className="hover:text-[#6C63FF]" style={{ minHeight: '32px' }}>Survey Center</button></li>
              <li><button onClick={() => onNavigate('rewards')} className="hover:text-[#6C63FF]" style={{ minHeight: '32px' }}>Redeem Marketplace</button></li>
              <li><button onClick={() => onNavigate('membership')} className="hover:text-[#6C63FF]" style={{ minHeight: '32px' }}>Membership Plans</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Earn Coins</h4>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li><button onClick={() => onNavigate('refer')} className="hover:text-[#6C63FF]" style={{ minHeight: '32px' }}>Refer friends (Invite)</button></li>
              <li><button onClick={() => onNavigate('membership')} className="hover:text-[#6C63FF]" style={{ minHeight: '32px' }}>VIP Member Perks</button></li>
              <li><button onClick={() => onNavigate('wallet')} className="hover:text-[#6C63FF]" style={{ minHeight: '32px' }}>Wallet Earnings ledger</button></li>
              <li><button onClick={() => onNavigate('leaderboard')} className="hover:text-[#6C63FF]" style={{ minHeight: '32px' }}>Daily Stands</button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Gateway Secure</h4>
            <p className="text-xs text-gray-500">Fully compliant client integration via Razorpay API and Firebase Auth backend.</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-gray-400 px-2 py-1 rounded">Razorpay</span>
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-gray-400 px-2 py-1 rounded">SSL Secure</span>
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-gray-400 px-2 py-1 rounded">PCI Compliant</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/50 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-500 font-mono">
          <p>© 2026 RewardArena Enterprise. All rights preserved.</p>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <span className="cursor-pointer hover:text-white">Privacy Standard</span>
            <span className="cursor-pointer hover:text-white">General Terms</span>
            <span className="cursor-pointer hover:text-white">API Feedbacks</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
