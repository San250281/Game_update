/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { RewardEngineProvider, useRewardEngine } from './lib/store';
import { GameType } from './types';
import AuthScreen from './components/AuthScreen';
import SpinWheel from './components/SpinWheel';
import ScratchCard from './components/ScratchCard';
import QuizGame from './components/QuizGame';
import TapChallenge from './components/TapChallenge';
import PuzzleGame from './components/PuzzleGame';
import Wallet from './components/Wallet';
import Referrals from './components/Referrals';
import Leaderboard from './components/Leaderboard';
import MembershipHub from './components/MembershipHub';
import AdminPanel from './components/AdminPanel';
import ArcadeGames from './components/ArcadeGames';
import UserAvatar from './components/UserAvatar';
import SEOHead from './components/SEOHead';
import SEOContentSection from './components/SEOContentSection';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ServicesPage from './components/ServicesPage';
import BlogPage from './components/BlogPage';
import ContactPage from './components/ContactPage';
import { 
  Gamepad2, WalletCards, Trophy, Users, Shield, 
  LogOut, Coins, Sparkles, Clock, Menu, X, ChevronRight, Zap, 
  Search, UsersRound, PlusCircle, Check, ArrowRightLeft, Crown, Lock,
  Home, Compass, Layers, BookOpen, Mail, ShieldCheck, Laptop, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Complete List of All 45+ Games (Originals + All Requested Categories)
const ALL_GAMES = [
  // Original 5 Games
  { id: GameType.SPIN_WHEEL, title: 'Lucky Wheel Spin', icon: '🎡', category: 'arcade', desc: 'Spin the physical segment wheel. Max jackpot is +200 coins. Profit probability optimized!', cost: 20, maxReward: 200, isNew: false, isMembershipOnly: false },
  { id: GameType.SCRATCH_CARD, title: 'Golden Scratch Card', icon: '✉️', category: 'arcade', desc: 'Rub off metallic coatings interactively on touch paths to claim random coin bags.', cost: 15, maxReward: 40, isNew: false, isMembershipOnly: false },
  { id: GameType.QUIZ, title: 'Knowledge Arena Quiz', icon: '🧠', category: 'action', desc: 'Sharpen your engineering background! Clear up to 10 question rounds to earn tiered limits.', cost: 30, maxReward: 60, isNew: false, isMembershipOnly: false },
  { id: GameType.TAP_CHALLENGE, title: 'Hyper Tap Velocity', icon: '⚡', category: 'action', desc: 'Test click velocity! Tab as fast as possible in 10s to win highest payouts.', cost: 25, maxReward: 80, isNew: false, isMembershipOnly: false },
  { id: GameType.PUZZLE, title: '8-Piece Slide Puzzle', icon: '🧩', category: 'action', desc: 'Sliding block intelligence challenge. Puzzle numbers sequentially under 1 minute!', cost: 50, maxReward: 200, isNew: false, isMembershipOnly: false },
  
  // Board Games requested (Ludo, Chess, TicTacToe) - Chess & Ludo are exclusive VIP Games
  { id: GameType.LUDO, title: 'Royal Ludo', icon: '🎲', category: 'board', desc: 'Roll dice, advance tokens, reach the center safe home coordinates first!', cost: 25, maxReward: 75, isNew: false, isMembershipOnly: true },
  { id: GameType.CHESS, title: 'Grandmaster Chess', icon: '♟️', category: 'board', desc: 'Play actual board rules with captures, select pieces and defeat smart local AI!', cost: 40, maxReward: 120, isNew: false, isMembershipOnly: true },
  { id: GameType.TIC_TAC_TOE, title: 'Tic-Tac-Toe Grid', icon: '❌', category: 'board', desc: 'Connect 3-in-a-row in a classic slate grid. Defeat the computer block tactics.', cost: 10, maxReward: 25, isNew: false, isMembershipOnly: false },
  
  // Arcade / Casual Games (Snake, Tetris, Pong, Flappy Bird, Memory Match, 2048, Minesweeper, Word Guesser)
  { id: GameType.SNAKE, title: 'Classic Snake', icon: '🐍', category: 'arcade', desc: 'Guide pixel snakes to eat rising cherries 🍒. Grow longer and don\'t smash borders!', cost: 15, maxReward: 45, isNew: false, isMembershipOnly: false },
  { id: GameType.TETRIS, title: 'Retro Block Fall', icon: '🧱', category: 'arcade', desc: 'Align descending geometric cubes to clear line rows and score jackpot rewards.', cost: 20, maxReward: 50, isNew: false, isMembershipOnly: false },
  { id: GameType.PONG, title: 'Aesthetic Pong', icon: '🏓', category: 'arcade', desc: 'Realtime 2D bouncing ball pong. Control paddle with mouse/keys and outlive AI.', cost: 15, maxReward: 35, isNew: false, isMembershipOnly: false },
  { id: GameType.FLAPPY_BIRD, title: 'Flappy Flyer', icon: '🐦', category: 'arcade', desc: 'Help the cute flybird flap through hazardous gaps recursively. 60fps graphics!', cost: 15, maxReward: 40, isNew: false, isMembershipOnly: false },
  { id: GameType.MEMORY_MATCH, title: 'Card Memory Pairs', icon: '🃏', category: 'arcade', desc: 'Flip pairs of culinary tiles. Match all symbols quickly under countdown limits.', cost: 10, maxReward: 25, isNew: false, isMembershipOnly: false },
  { id: GameType.GAME_2048, title: 'Merge 2048 Blocks', icon: '🔢', category: 'arcade', desc: 'Slide identical numbered blocks upwards to aggregate 2048 score targets.', cost: 25, maxReward: 75, isNew: false, isMembershipOnly: false },
  { id: GameType.MINESWEEPER, title: 'Nuclear Minesweeper', icon: '💣', category: 'arcade', desc: 'Locate radioactive elements! Flag danger blocks, reveal entire safe grids.', cost: 15, maxReward: 50, isNew: false, isMembershipOnly: false },
  { id: GameType.WORD_GUESSER, title: 'Wordle Guess Solver', icon: '🔤', category: 'arcade', desc: 'Classic 5-letter word solver. Fill green, yellow and gray status tiles.', cost: 20, maxReward: 40, isNew: false, isMembershipOnly: false },
  
  // Action / Skill reflexes (Space Shooter is exclusive VIP Game)
  { id: GameType.SPACE_SHOOTER, title: 'Galaxy Fighter', icon: '🚀', category: 'action', desc: 'Shoot laser rounds at space meteorites to claim deep orbit coin starships.', cost: 20, maxReward: 60, isNew: false, isMembershipOnly: true },
  { id: GameType.WHACK_A_MOLE, title: 'Whack-a-Mole', icon: '🐹', category: 'action', desc: 'Tap rapid popping moles. Test high reaction rate under time limits!', cost: 15, maxReward: 30, isNew: false, isMembershipOnly: false },
  { id: GameType.BALLOON_POPPER, title: 'Balloon Popper', icon: '🎈', category: 'action', desc: 'Pop rising hydrogen balloons before they fly. Claim instant multipliers.', cost: 10, maxReward: 20, isNew: false, isMembershipOnly: false },
  { id: GameType.BRICK_BREAKER, title: 'Brick Crusher', icon: '🔥', category: 'action', desc: 'Bounce balls using responsive paddles to break rows of colorful brick lines.', cost: 20, maxReward: 45, isNew: false, isMembershipOnly: false },
  { id: GameType.COLOR_MATCHER, title: 'Simon Simon memory', icon: '🟡', category: 'action', desc: 'Observe, memorize and repeat sequential flashing light signal cues.', cost: 15, maxReward: 30, isNew: false, isMembershipOnly: false },
  { id: GameType.ROCK_PAPER_SESSORS, title: 'R-P-S Duel', icon: '✊', category: 'action', desc: 'Play rock, paper or scissors against our mathematical AI generator.', cost: 10, maxReward: 20, isNew: false, isMembershipOnly: false },
  { id: GameType.SUDOKU, title: 'Sudoku mini 4x4', icon: '🧩', category: 'action', desc: 'Fill empty slots so numbers 1 to 4 do not overlap inside square lines.', cost: 25, maxReward: 60, isNew: false, isMembershipOnly: false },
  { id: GameType.COIN_FLIP, title: 'Coin Flipper', icon: '🪙', category: 'action', desc: 'Secure 50/50 heads or tails. Multiply coin reserves effortlessly.', cost: 10, maxReward: 20, isNew: false, isMembershipOnly: false },
  { id: GameType.DODGE_OBSTACLES, title: 'Highway Car Dodger', icon: '🏎️', category: 'action', desc: 'Steer left or right on highways to dodge oncoming speed blocks.', cost: 15, maxReward: 35, isNew: false, isMembershipOnly: false },

  // REWARD / ARCADE WEBSITES category (Treasure Hunt is exclusive VIP Game)
  { id: GameType.LUCKY_DRAW, title: 'Jackpot Lucky Draw', icon: '🎟️', category: 'arcade', desc: 'Draw a gold ticket from the reward dispenser. Stand a chance to multiply stakes by 5x!', cost: 15, maxReward: 75, isNew: true, isMembershipOnly: false },
  { id: GameType.DAILY_CHECKIN, title: 'Checkin Calendar Match', icon: '📅', category: 'arcade', desc: 'Fulfill daily streaks for active claim counts! Match consecutive dates for coin multipliers.', cost: 10, maxReward: 30, isNew: true, isMembershipOnly: false },
  { id: GameType.COIN_COLLECTOR, title: 'Sky Coin Collector', icon: '⭐', category: 'arcade', desc: 'Coins falling from the cloud! Control your chest and scoop bags of gold before timer runs out!', cost: 15, maxReward: 50, isNew: true, isMembershipOnly: false },
  { id: GameType.TREASURE_HUNT, title: 'Deep Treasure Hunt', icon: '🏴‍☠️', category: 'arcade', desc: 'Solve island coordinate puzzles! Select grid locations to uncover chests. Watch out for sharks!', cost: 20, maxReward: 80, isNew: true, isMembershipOnly: true },

  // CASUAL GAMES (Match-3 Sweet Crush, Word Search, Crossword Panel)
  { id: GameType.MATCH_3, title: 'Sweet Match-3 Blast', icon: '🍬', category: 'arcade', desc: 'Swap neighboring sweets. Pop blocks of 3 matching units to level up!', cost: 20, maxReward: 60, isNew: true, isMembershipOnly: false },
  { id: GameType.WORD_SEARCH, title: 'Word Search Sleuth', icon: '🔍', category: 'board', desc: 'Locate hidden secret words spelled in horizontal or vertical layout panels!', cost: 15, maxReward: 45, isNew: true, isMembershipOnly: false },
  { id: GameType.CROSSWORD, title: 'Mini Cryptic Crossword', icon: '📝', category: 'board', desc: 'Fill crossword cells using textual clues. Overlap characters correctly to score!', cost: 20, maxReward: 60, isNew: true, isMembershipOnly: false },

  // SKILL GAMES requested (Checkers Board, Connect 4)
  { id: GameType.CHECKERS, title: 'Checkers Drafts Duel', icon: '🔴', category: 'board', desc: 'Jump over enemy red counters in standard drafts board paths against our local AI!', cost: 25, maxReward: 75, isNew: true, isMembershipOnly: false },
  { id: GameType.CONNECT_4, title: 'Connect 4 Drops', icon: '🔵', category: 'board', desc: 'Drop blue discs into column grids. Slot 4 of your tokens adjacent to beat the AI!', cost: 20, maxReward: 50, isNew: true, isMembershipOnly: false },

  // QUICK MINI-GAMES reflexes (Reaction Time Test, Click Speed Clicker)
  { id: GameType.REACTION_TIME, title: 'Reaction Speed Test', icon: '⏱️', category: 'action', desc: 'Click immediately when visual layouts transition into green light values!', cost: 10, maxReward: 30, isNew: true, isMembershipOnly: false },
  { id: GameType.CLICK_SPEED, title: 'Click Speed Test 10s', icon: '💥', category: 'action', desc: 'Mash click targets! Discover your CPS (Clicks Per Second) to capture gold pools.', cost: 10, maxReward: 30, isNew: true, isMembershipOnly: false },

  // RUNNER GAMES reflexes (Temple Run Style, Subway Surfers Style, Dino Runner, Endless Jump Jumper)
  { id: GameType.RUNNER_TEMPLE, title: 'Lost Temple runner', icon: '🛕', category: 'action', desc: 'Dodge crumbling pathway obstacles, leap logs, turn corners in high-speed temples.', cost: 20, maxReward: 60, isNew: true, isMembershipOnly: false },
  { id: GameType.RUNNER_SUBWAY, title: 'Subway Rail Surfer', icon: '🚇', category: 'action', desc: 'Steer between 3-tracks to avoid oncoming metro train cars, gather glowing coins.', cost: 20, maxReward: 60, isNew: true, isMembershipOnly: false },
  { id: GameType.DINO_RUNNER, title: 'Jumping Chrome Dino', icon: '🦖', category: 'action', desc: 'The offline internet legend! Leap over prickly cacti and score milestones.', cost: 15, maxReward: 45, isNew: true, isMembershipOnly: false },
  { id: GameType.ENDLESS_JUMP, title: 'Cloud Jump Jumper', icon: '☁️', category: 'action', desc: 'Bounce upwards off celestial platforms endlessly without falling down!', cost: 15, maxReward: 45, isNew: true, isMembershipOnly: false },

  // CARD GAMES (Solitaire, Poker, Blackjack, Rummy are exclusive VIP Games)
  { id: GameType.SOLITAIRE, title: 'Solitaire Classic Klondike', icon: '🎴', category: 'board', desc: 'Group standard cards by sequential alternating suites to set up card pyramids!', cost: 25, maxReward: 75, isNew: true, isMembershipOnly: true },
  { id: GameType.POKER, title: '5-Card Draw Poker', icon: '🃏', category: 'board', desc: 'Play-money betting room! Match royal pairs, flushes and straights against AI hands.', cost: 30, maxReward: 90, isNew: true, isMembershipOnly: true },
  { id: GameType.BLACKJACK, title: 'Vegas Blackjack 21', icon: '🪙', category: 'board', desc: 'Vegas classic! Hit, Stand or Double to reach 21 or defeat the AI dealer hands.', cost: 20, maxReward: 50, isNew: true, isMembershipOnly: true },
  { id: GameType.RUMMY, title: 'Rummy Deck Melder', icon: '🀄', category: 'board', desc: 'Arrange cards into consecutive runs and of-a-kind sets. Solve your hands first!', cost: 25, maxReward: 75, isNew: true, isMembershipOnly: true },
  { id: GameType.UNO, title: 'Uno Discard Party', icon: '🌈', category: 'board', desc: 'Discard matching colored/valued cards. Intercept opponent leads with Action Cards!', cost: 20, maxReward: 60, isNew: true, isMembershipOnly: false }
];

type AppNavTab = 'home' | 'lobby' | 'about' | 'services' | 'blog' | 'contact' | 'wallet' | 'referrals' | 'leaderboard' | 'membership' | 'admin';

function parseUrlHash(): { tab: AppNavTab; gameId: GameType | null } {
  if (typeof window === 'undefined') return { tab: 'home', gameId: null };
  const rawHash = window.location.hash || '';
  const hash = rawHash.toLowerCase();

  if (hash.startsWith('#game=')) {
    const gameParam = decodeURIComponent(rawHash.replace(/^[#]game=/i, '')).toLowerCase();
    const matched = ALL_GAMES.find(g => 
      g.title.toLowerCase().replace(/\s+/g, '-') === gameParam ||
      g.id.toLowerCase().replace(/\s+/g, '-') === gameParam ||
      g.id.toLowerCase() === gameParam
    );
    if (matched) {
      return { tab: 'lobby', gameId: matched.id as GameType };
    }
    return { tab: 'lobby', gameId: null };
  }

  if (hash === '#games' || hash === '#faq' || hash === '#lobby' || hash === '#play') {
    return { tab: 'lobby', gameId: null };
  }
  if (hash === '#about') return { tab: 'about', gameId: null };
  if (hash === '#services') return { tab: 'services', gameId: null };
  if (hash === '#blog') return { tab: 'blog', gameId: null };
  if (hash === '#contact') return { tab: 'contact', gameId: null };
  if (hash === '#wallet') return { tab: 'wallet', gameId: null };
  if (hash === '#referrals') return { tab: 'referrals', gameId: null };
  if (hash === '#leaderboard') return { tab: 'leaderboard', gameId: null };
  if (hash === '#membership') return { tab: 'membership', gameId: null };
  if (hash === '#admin') return { tab: 'admin', gameId: null };

  return { tab: 'home', gameId: null };
}

function DashboardLobby() {
  const { 
    user, 
    logout, 
    isFirebaseMode, 
    allUsers, 
    switchUser, 
    loginAsGuest,
    isMember,
    toggleMembershipStatus
  } = useRewardEngine();

  const [activeTab, setActiveTab] = useState<AppNavTab>(() => parseUrlHash().tab);
  const [activeGame, setActiveGame] = useState<GameType | null>(() => parseUrlHash().gameId);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [membershipPromptGame, setMembershipPromptGame] = useState<any | null>(null);
  
  // Game filtering of the Play Arena
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'board' | 'arcade' | 'action' | 'membership'>('all');
  
  // Profile Switcher lists toggle popup
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [userRequestedAuth, setUserRequestedAuth] = useState(false);

  // Auto-authenticate guest on direct visit to #games or any page if no active session
  useEffect(() => {
    if (!user && !userRequestedAuth) {
      loginAsGuest().catch((err) => {
        console.warn('Auto guest login notice:', err);
      });
    }
  }, [user, userRequestedAuth, loginAsGuest]);

  const allGames = ALL_GAMES;

  const websiteTabs = [
    { id: 'home', label: 'Home', icon: Home, color: 'text-blue-500' },
    { id: 'lobby', label: 'Play Arena', icon: Gamepad2, color: 'text-emerald-500', badge: '45+ Games' },
    { id: 'about', label: 'About Us', icon: Compass, color: 'text-indigo-500' },
    { id: 'services', label: 'Services', icon: Layers, color: 'text-teal-500' },
    { id: 'blog', label: 'Blog & Guides', icon: BookOpen, color: 'text-purple-500' },
    { id: 'contact', label: 'Contact Us', icon: Mail, color: 'text-rose-500' },
  ];

  const arcadeTabs = [
    { id: 'membership', label: 'VIP Membership', icon: Crown, color: 'text-amber-500', badge: 'VIP' },
    { id: 'wallet', label: 'My Wallet', icon: WalletCards, color: 'text-amber-600' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-yellow-500' },
    { id: 'referrals', label: 'Invite Friends', icon: Users, color: 'text-purple-500' },
  ];

  if (user?.isAdmin) {
    arcadeTabs.push({ id: 'admin', label: 'Admin Hub', icon: Shield, color: 'text-rose-500' });
  }

  const allNavigationTabs = [...websiteTabs, ...arcadeTabs];

  const handleLogout = () => {
    setUserRequestedAuth(true);
    logout();
  };

  const handleTabSelect = (tabId: any) => {
    setActiveTab(tabId);
    setActiveGame(null);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      const targetHash = tabId === 'lobby' ? '#games' : `#${tabId}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
    }
  };

  const handleGameSelect = (gid: GameType) => {
    const targetGame = ALL_GAMES.find((g) => g.id === gid);
    if (targetGame?.isMembershipOnly && !isMember) {
      setMembershipPromptGame(targetGame);
    } else {
      setActiveTab('lobby');
      setActiveGame(gid);
      if (targetGame && typeof window !== 'undefined') {
        const gameSlug = targetGame.title.toLowerCase().replace(/\s+/g, '-');
        window.history.pushState(null, '', `#game=${encodeURIComponent(gameSlug)}`);
      }
    }
  };

  const handleCreateNewGuestProfile = async () => {
    try {
      await loginAsGuest();
      setShowProfileSwitcher(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Active game object for dynamic SEO title and meta descriptions
  const activeGameObj = allGames.find((g) => g.id === activeGame);

  // Synchronize browser URL hash with tabs & games for SEO crawler deep-linking
  useEffect(() => {
    const handleHash = () => {
      const parsed = parseUrlHash();
      if (parsed.gameId) {
        const matched = ALL_GAMES.find(g => g.id === parsed.gameId);
        if (matched?.isMembershipOnly && !isMember) {
          setMembershipPromptGame(matched);
          setActiveTab('lobby');
          setActiveGame(null);
        } else {
          setActiveTab('lobby');
          setActiveGame(parsed.gameId);
        }
      } else {
        setActiveTab(parsed.tab);
        setActiveGame(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isMember]);

  // Filter games based on search queries & categories
  const filteredGames = allGames.filter((g) => {
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' 
      ? true 
      : selectedCategory === 'membership'
      ? g.isMembershipOnly
      : g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // If visitor requested custom credentials, render AuthScreen with guest bypass
  if (userRequestedAuth && !user) {
    return (
      <AuthScreen 
        onContinueAsGuest={async () => {
          setUserRequestedAuth(false);
          await loginAsGuest();
        }} 
      />
    );
  }

  // Instant guest loader for new arrivals (finishes within milliseconds)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0D1A] text-slate-100 flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
        <SEOHead tab={activeTab} />
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="flex flex-col items-center gap-5 text-center max-w-sm relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.25)] animate-pulse">
            <Gamepad2 className="w-9 h-9 text-emerald-400 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xl font-black tracking-widest uppercase text-slate-100 block">REWARDYN</span>
            <p className="text-xs text-emerald-400 font-bold mt-1">Connecting to Play Arena...</p>
            <p className="text-[11px] text-slate-400 mt-2">Instant Guest Pass Loading &bull; No Download Required</p>
          </div>
          <button
            onClick={() => setUserRequestedAuth(true)}
            className="mt-2 text-xs text-slate-400 hover:text-emerald-400 underline underline-offset-4 cursor-pointer transition-colors"
          >
            Sign in with email instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      <SEOHead 
        tab={activeTab} 
        gameTitle={activeGameObj?.title} 
        gameCategory={activeGameObj?.category} 
        gameMaxReward={activeGameObj?.maxReward} 
        isGuest={user.provider === 'guest'} 
      />

      {/* Accessible Skip Link for screen readers & keyboard navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-xl focus:font-bold text-xs"
      >
        Skip to main content
      </a>
      
      {/* 1. Sidemenu Rail sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-5 shrink-0 select-none">
        {/* Brand visual header */}
        <button 
          onClick={() => handleTabSelect('home')} 
          className="flex items-center gap-2.5 mb-8 px-2 cursor-pointer text-left group"
          title="Return to Home Overview"
        >
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5.5 h-5.5 text-emerald-650 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-widest uppercase group-hover:text-emerald-700 transition-colors">REWARDYN</h1>
            <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider">Home / Play Arena</p>
          </div>
        </button>

        {/* Navigation Map links */}
        <nav className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1">
          {/* Main Website Pages */}
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-3 block">
              Website
            </span>
            {websiteTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSelect(tab.id)}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 shadow-xs text-emerald-800 border-l-[3px] border-emerald-500 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${tab.color}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Player Economy & VIP */}
          <div className="space-y-1 border-t border-slate-100 pt-3">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-3 block">
              Player Hub
            </span>
            {arcadeTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSelect(tab.id)}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 shadow-xs text-emerald-800 border-l-[3px] border-emerald-500 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${tab.color}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Persistent Seamless Profile Switchers / Quick Guest Login Panel */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5 bg-slate-50/50 p-3 rounded-2xl border">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1">
              <ArrowRightLeft className="w-3" />
              Quick Switchers
            </span>
            <span className="text-[8px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
              {allUsers.length} Saved
            </span>
          </div>

          {/* List recently accessed profiles block */}
          <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
            {allUsers.slice(0, 3).map((savedUser) => {
              const isCurrent = savedUser.uid === user.uid;
              const isGuest = savedUser.provider === 'guest';
              return (
                <button
                  key={savedUser.uid}
                  onClick={async () => {
                    if (!isCurrent) {
                      await switchUser(savedUser.uid);
                    }
                  }}
                  className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50/60 border-emerald-250 font-black text-emerald-800'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-705'
                  }`}
                  title={`Seamless Switch to ${savedUser.name}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 max-w-[125px]">
                    <UserAvatar src={savedUser.photoURL} name={savedUser.name} className="w-5.5 h-5.5 rounded-lg" />
                    <span className="text-[10.5px] tracking-tight truncate block">
                      {isCurrent ? '● ' : ''}{savedUser.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9.5px] font-black text-amber-600 flex items-center">
                      🪙{savedUser.coins}
                    </span>
                    <span className={`text-[7px] font-mono leading-none font-black uppercase px-1 py-0.5 rounded-sm ${
                      isGuest ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isGuest ? 'Guest' : 'Reg'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Guest account creator option */}
          {user.provider !== 'guest' ? (
            <button
              onClick={handleCreateNewGuestProfile}
              className="w-full py-1.5 bg-slate-905 hover:bg-slate-805 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-450 fill-amber-450 animate-pulse" />
              Toggle Guest (+500 CP)
            </button>
          ) : (
            <button
              onClick={() => {
                const registeredUser = allUsers.find(u => u.provider !== 'guest');
                if (registeredUser) {
                  switchUser(registeredUser.uid);
                } else {
                  logout();
                }
              }}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-755 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowRightLeft className="w-3 h-3 text-white" />
              Switch Registered
            </button>
          )}
        </div>

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
            className="w-full py-2.5 bg-red-55/10 hover:bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* 2. Top header helper bar for Mobile layout */}
      <header className="md:hidden w-full bg-white border-b border-slate-200 sticky top-0 select-none z-45 shadow-xs">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <button 
            onClick={() => handleTabSelect('home')}
            className="flex items-center gap-2 cursor-pointer text-left"
            title="Go to Home"
          >
            <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-4.5 h-4.5 text-emerald-650" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 tracking-wider uppercase block leading-tight">REWARDYN</span>
              <span className="text-[9px] text-emerald-700 font-bold block leading-none">Home / Play Arena</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* Quick Balance indicator */}
            <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-1 text-[11px] font-black text-amber-750">
              <Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-305" />
              {user.coins.toLocaleString()}
            </div>

            {/* Dedicated user login/profile icon directly on top header */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowProfileSwitcher(true);
              }}
              className="w-7.5 h-7.5 rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:scale-105 active:scale-95 transition-transform"
              title="Switch User Profile"
            >
              <UserAvatar src={user.photoURL} name={user.name} className="w-full h-full" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>

        {/* MOBILE TOP HOME / PLAY ARENA SWITCHER & BREADCRUMBS */}
        <div className="px-3 pb-2 pt-1 border-t border-slate-100 bg-slate-50/70 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => handleTabSelect('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'home' && !activeGame
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('lobby');
              setActiveGame(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'lobby' || activeGame
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Play Arena</span>
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
              activeTab === 'lobby' || activeGame ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              45+
            </span>
          </button>

          <button
            onClick={() => handleTabSelect('membership')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'membership'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Crown className="w-3 h-3 fill-current" />
            <span>VIP</span>
          </button>

          <button
            onClick={() => handleTabSelect('about')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-indigo-600 text-white font-black'
                : 'text-slate-500 bg-white border border-slate-200 hover:text-slate-800'
            }`}
          >
            About
          </button>

          <button
            onClick={() => handleTabSelect('services')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-teal-600 text-white font-black'
                : 'text-slate-500 bg-white border border-slate-200 hover:text-slate-800'
            }`}
          >
            Services
          </button>

          <button
            onClick={() => handleTabSelect('blog')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'blog'
                ? 'bg-purple-600 text-white font-black'
                : 'text-slate-500 bg-white border border-slate-200 hover:text-slate-800'
            }`}
          >
            Blog
          </button>

          <button
            onClick={() => handleTabSelect('contact')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-rose-600 text-white font-black'
                : 'text-slate-500 bg-white border border-slate-200 hover:text-slate-800'
            }`}
          >
            Contact
          </button>
        </div>

        {/* Mobile dropdown lists drawer wrapper */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-2xl overflow-hidden flex flex-col p-4 gap-1.5 z-50"
            >
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    src={user.photoURL}
                    className="w-8 h-8 rounded-lg"
                    name={user.name}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">{user.name}</span>
                    <span className="text-[9px] text-slate-400 capitalize">{user.provider} account</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowProfileSwitcher(true);
                  }}
                  className="px-2 py-1 bg-emerald-50 text-emerald-650 text-[10px] font-bold rounded border uppercase"
                >
                  Switch Profile
                </button>
              </div>

              {/* Website Navigation */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-3 block">
                  Website Pages
                </span>
                {websiteTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabSelect(tab.id)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-emerald-50 text-emerald-800 font-black' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${tab.color}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Player Hub Navigation */}
              <div className="space-y-1 border-t border-slate-100 pt-2.5 mt-1">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-3 block">
                  Player Hub &amp; VIP
                </span>
                {arcadeTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabSelect(tab.id)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-emerald-50 text-emerald-800 font-black' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${tab.color}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={logout}
                className="w-full mt-4 p-3 bg-red-50 text-red-650 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 border border-red-150 hover:bg-red-100 animate-pulse"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Logout Account
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. Primary Workspace Arena viewport */}
      <main id="main-content" role="main" className="flex-1 p-4 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full relative">
        
        {/* PROMINENT TOP SITE NAVIGATION & BREADCRUMB: HOME / PLAY ARENA */}
        <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-3 md:p-3.5 px-4 md:px-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md bg-white/95">
          {/* Breadcrumb Trail: Home / Play Arena */}
          <nav aria-label="Breadcrumb Navigation" className="flex items-center gap-1.5 md:gap-2 text-xs font-bold text-slate-500 flex-wrap select-none">
            <button
              onClick={() => handleTabSelect('home')}
              className={`hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-100 ${
                activeTab === 'home' && !activeGame ? 'text-blue-600 font-black bg-blue-50/70' : 'text-slate-600'
              }`}
            >
              <Home className="w-4 h-4 text-blue-500" />
              <span>Home</span>
            </button>

            <span className="text-slate-300 font-normal select-none">/</span>

            <button
              onClick={() => {
                setActiveTab('lobby');
                setActiveGame(null);
              }}
              className={`hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-100 ${
                (activeTab === 'lobby' || activeGame) ? 'text-emerald-700 font-black bg-emerald-50/70' : 'text-slate-600'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-emerald-600" />
              <span>Play Arena</span>
              <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                45+ Games
              </span>
            </button>

            {activeGameObj && (
              <>
                <span className="text-slate-300 font-normal select-none">/</span>
                <span className="text-slate-900 font-black flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-emerald-900 shadow-2xs">
                  <span>{activeGameObj.icon}</span>
                  <span>{activeGameObj.title}</span>
                </span>
              </>
            )}

            {activeTab !== 'home' && activeTab !== 'lobby' && (
              <>
                <span className="text-slate-300 font-normal select-none">/</span>
                <span className="text-slate-900 font-black capitalize bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  {activeTab === 'about' 
                    ? 'About Us' 
                    : activeTab === 'services' 
                    ? 'Services' 
                    : activeTab === 'blog' 
                    ? 'Blog & Guides' 
                    : activeTab === 'contact' 
                    ? 'Contact Us' 
                    : activeTab === 'membership'
                    ? 'VIP Membership'
                    : activeTab.replace('-', ' ')}
                </span>
              </>
            )}
          </nav>

          {/* Quick Segmented Switcher & Direct Page Links */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Master Home / Play Arena Dual Pill Switcher */}
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/90 rounded-2xl shadow-2xs">
              <button
                onClick={() => handleTabSelect('home')}
                className={`flex items-center gap-1.5 md:gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'home' && !activeGame
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Go to Home Overview"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('lobby');
                  setActiveGame(null);
                }}
                className={`flex items-center gap-1.5 md:gap-2 px-3.5 md:px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  (activeTab === 'lobby' || activeGame)
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Go to Play Arena with 45+ Games"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Play Arena</span>
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                  (activeTab === 'lobby' || activeGame)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  45+
                </span>
              </button>
            </div>

            {/* Quick Links across Website */}
            <div className="hidden lg:flex items-center gap-1 border-l border-slate-200 pl-2 text-xs">
              <button 
                onClick={() => handleTabSelect('about')} 
                className={`px-2.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                  activeTab === 'about' ? 'text-indigo-700 font-black bg-indigo-50 border border-indigo-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                About
              </button>
              <button 
                onClick={() => handleTabSelect('services')} 
                className={`px-2.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                  activeTab === 'services' ? 'text-teal-700 font-black bg-teal-50 border border-teal-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Services
              </button>
              <button 
                onClick={() => handleTabSelect('blog')} 
                className={`px-2.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                  activeTab === 'blog' ? 'text-purple-700 font-black bg-purple-50 border border-purple-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Blog
              </button>
              <button 
                onClick={() => handleTabSelect('contact')} 
                className={`px-2.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                  activeTab === 'contact' ? 'text-rose-700 font-black bg-rose-50 border border-rose-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Contact
              </button>
              <button 
                onClick={() => handleTabSelect('membership')} 
                className={`px-2.5 py-1.5 rounded-xl font-black uppercase tracking-wider text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                  activeTab === 'membership' ? 'text-amber-900 font-black bg-amber-400 border border-amber-500 shadow-xs' : 'text-amber-800 hover:text-amber-900 bg-amber-50 border border-amber-200'
                }`}
              >
                <Crown className="w-3 h-3 fill-current" />
                <span>VIP Club</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top desktop profile summary hub with Integrated SEAMLESS PROFILE SWITCHER */}
        <div className="hidden md:flex justify-between items-center bg-white p-4.5 border border-slate-200 rounded-3xl mb-8 shadow-sm relative z-30">
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
              className="w-11 h-11 rounded-2xl border border-slate-300 overflow-hidden shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer ring-2 ring-emerald-500/20"
              title="Manage User Profiles"
            >
              <UserAvatar src={user.photoURL} name={user.name} className="w-full h-full" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-black text-slate-850 leading-none">{user.name}</h3>
                {isMember && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex items-center gap-1 border border-amber-400 shadow-xs">
                    <Crown className="w-2.5 h-2.5 fill-slate-950" />
                    VIP Member
                  </span>
                )}
                <span className={`text-[8px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  user.provider === 'guest' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {user.provider} Profile
                </span>
              </div>
              <button
                onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                className="text-[10px] text-emerald-650 hover:text-emerald-850 font-black uppercase tracking-wider flex items-center gap-1 mt-1 transition-colors cursor-pointer select-none"
              >
                <ArrowRightLeft className="w-3 h-3 text-emerald-600 animate-pulse" />
                Manage & Switch Profiles ({allUsers.length} Accounts)
              </button>
            </div>

            {/* HIGHLY INTERACTIVE GUEST USER LOGIN STATUS ICON & DIRECT ACCESS BADGE */}
            <div className="ml-4 flex items-center gap-3 border-l pl-4 border-slate-200">
              <div className={`p-2 rounded-xl flex items-center justify-center text-lg ${
                isMember ? 'bg-amber-100 text-amber-600 border border-amber-300 shadow-sm' : user.provider === 'guest' ? 'bg-amber-50 text-amber-505 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                {isMember ? '👑' : user.provider === 'guest' ? '👤' : '🎮'}
              </div>
              <div className="text-left">
                <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none block">User Login Status</span>
                <span className="text-[11px] font-extrabold text-slate-700 block mt-0.5">
                  {isMember 
                    ? 'VIP Member (Zero Ads & All Games)' 
                    : user.provider === 'guest' 
                    ? 'Logged In as Guest (500 Gift Coins)' 
                    : 'Logged In as Standard Player'}
                </span>
              </div>
              
              {!isMember && (
                <button
                  onClick={() => setActiveTab('membership')}
                  className="ml-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1 transition-transform active:scale-95 cursor-pointer shadow-sm"
                  title="Unlock all VIP games & enjoy an ad-free arcade"
                >
                  <Crown className="w-3 h-3 fill-slate-950 stroke-[2.5]" />
                  Join VIP
                </button>
              )}

              {/* Seamless, One-Click Direct profile switching trigger directly on top header */}
              {user.provider !== 'guest' ? (
                <button
                  onClick={handleCreateNewGuestProfile}
                  className="ml-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-transform active:scale-95 cursor-pointer shadow-sm"
                  title="Seamlessly log in as a Guest User with 500 playing coins"
                >
                  <Sparkles className="w-3 h-3 text-amber-200 stroke-[2.5]" />
                  Log in Guest
                </button>
              ) : (
                <button
                  onClick={() => {
                    const registeredUser = allUsers.find(u => u.provider !== 'guest');
                    if (registeredUser) {
                      switchUser(registeredUser.uid);
                    } else {
                      logout();
                    }
                  }}
                  className="ml-2 px-3 py-1.5 bg-emerald-650 hover:bg-emerald-755 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-transform active:scale-95 cursor-pointer shadow-sm"
                  title="Switch back to registered profiles"
                >
                  <ArrowRightLeft className="w-3 h-3 text-emerald-200" />
                  Logout Guest
                </button>
              )}
            </div>
            
            {/* Desktop Popover Switcher menu */}
            <AnimatePresence>
              {showProfileSwitcher && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-[110%] w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-40 max-h-[340px] overflow-y-auto"
                >
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Switch accounts securely</span>
                    <button onClick={() => setShowProfileSwitcher(false)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Account list */}
                  <div className="flex flex-col gap-1.5">
                    {allUsers.map((savedUser) => {
                      const isCurrent = savedUser.uid === user.uid;
                      const isGuestType = savedUser.provider === 'guest';
                      return (
                        <button
                          key={savedUser.uid}
                          onClick={async () => {
                            if (!isCurrent) {
                              await switchUser(savedUser.uid);
                            }
                            setShowProfileSwitcher(false);
                          }}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all text-left cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-50 border-slate-300 font-bold'
                              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <UserAvatar
                              src={savedUser.photoURL}
                              name={savedUser.name}
                              className="w-7 h-7 rounded-lg"
                            />
                            <div className="truncate max-w-[130px]">
                              <span className="font-extrabold text-slate-800 block truncate">{savedUser.name}</span>
                              <span className="text-[9px] text-[#4b587d] truncate block">{savedUser.email}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[10px] font-black text-amber-600 flex items-center gap-0.5">
                              <Coins className="w-3 h-3 text-amber-500 shrink-0" />
                              {savedUser.coins}
                            </span>
                            <span className={`text-[8px] font-mono uppercase px-1 rounded-sm ${
                              isGuestType ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {savedUser.provider}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Quick Profile generators */}
                  <div className="border-t pt-3 mt-3 flex flex-col gap-2">
                    <button
                      onClick={handleCreateNewGuestProfile}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-150 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      + Guest (500 Coins)
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileSwitcher(false);
                        logout();
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                    >
                      <UsersRound className="w-3.5 h-3.5" />
                      + Add New Account
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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

        {/* Global/Mobile Switcher Trigger Dialog */}
        <AnimatePresence>
          {(showProfileSwitcher && !mobileMenuOpen) && (
            <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wide">Multi-Profile Swapping</h3>
                  <button onClick={() => setShowProfileSwitcher(false)} className="p-1 text-slate-450">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {allUsers.map((savedUser) => {
                    const isCurrent = savedUser.uid === user.uid;
                    const isGuestType = savedUser.provider === 'guest';
                    return (
                      <button
                        key={savedUser.uid}
                        onClick={async () => {
                          if (!isCurrent) {
                            await switchUser(savedUser.uid);
                          }
                          setShowProfileSwitcher(false);
                        }}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left ${
                          isCurrent
                            ? 'bg-slate-50 border-slate-350'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 text-xs">
                          <UserAvatar
                            src={savedUser.photoURL}
                            name={savedUser.name}
                            className="w-8 h-8 rounded-lg"
                          />
                          <div>
                            <span className="font-black text-slate-850 block">{savedUser.name}</span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">{savedUser.email}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-black text-amber-600 flex items-center gap-0.5">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            {savedUser.coins}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t pt-4 mt-4 flex flex-col gap-2.5">
                  <button
                    onClick={handleCreateNewGuestProfile}
                    className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-emerald-150"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create New Guest (+500 Coins)
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileSwitcher(false);
                      logout();
                    }}
                    className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-200"
                  >
                    <UsersRound className="w-4 h-4" />
                    Sign in with different credentials
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Tab display switches router */}
        <div className="w-full">
          {/* HOME OVERVIEW VIEW */}
          {activeTab === 'home' && (
            <HomePage 
              onNavigate={handleTabSelect} 
              onSelectGame={(gid) => {
                const targetGame = allGames.find((g) => g.id === gid);
                if (targetGame?.isMembershipOnly && !isMember) {
                  setMembershipPromptGame(targetGame);
                } else {
                  setActiveTab('lobby');
                  setActiveGame(gid);
                }
              }}
            />
          )}

          {/* ABOUT US VIEW */}
          {activeTab === 'about' && (
            <AboutPage onNavigate={handleTabSelect} />
          )}

          {/* SERVICES VIEW */}
          {activeTab === 'services' && (
            <ServicesPage 
              onNavigate={handleTabSelect} 
              onSelectGame={(gid) => {
                const targetGame = allGames.find((g) => g.id === gid);
                if (targetGame?.isMembershipOnly && !isMember) {
                  setMembershipPromptGame(targetGame);
                } else {
                  setActiveTab('lobby');
                  setActiveGame(gid);
                }
              }}
            />
          )}

          {/* BLOG & GUIDES VIEW */}
          {activeTab === 'blog' && (
            <BlogPage 
              onNavigate={handleTabSelect} 
              onSelectGame={(gid) => {
                const targetGame = allGames.find((g) => g.id === gid);
                if (targetGame?.isMembershipOnly && !isMember) {
                  setMembershipPromptGame(targetGame);
                } else {
                  setActiveTab('lobby');
                  setActiveGame(gid);
                }
              }}
            />
          )}

          {/* CONTACT & SUPPORT VIEW */}
          {activeTab === 'contact' && (
            <ContactPage onNavigate={handleTabSelect} />
          )}

          {/* LOBBY HUB VIEW */}
          {activeTab === 'lobby' && (
            <div>
              {!activeGame ? (
                <div>
                  <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Zap className="w-6.5 h-6.5 text-emerald-600 fill-emerald-500 animate-pulse" />
                        Arcade Play Arena: Play 45+ Games &amp; Earn Rewards
                      </h1>
                      <p className="text-xs text-slate-500 mt-1">Play free HTML5 arcade, board, and action mini-games. Compete on global leaderboards and earn instant rewards.</p>
                    </div>

                    {/* Integrated Search and Category Filtering UI */}
                    <div className="flex items-center gap-2.5 max-w-sm w-full bg-white p-1.5 px-3 border border-slate-200 rounded-2xl shadow-sm">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder={`Search ${allGames.length} Arcade & Board games...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="text-xs text-slate-700 outline-none w-full bg-transparent font-medium"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="p-0.5 text-slate-400 hover:text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>                  

                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-4 select-none mb-6">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                        selectedCategory === 'all' 
                          ? 'bg-slate-905 text-slate-900 border border-slate-350 bg-slate-200' 
                          : 'bg-white border text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      🕹️ All Games ({allGames.length})
                    </button>
                    <button
                      onClick={() => setSelectedCategory('membership')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedCategory === 'membership' 
                          ? 'bg-amber-500 text-slate-950 border border-amber-400 font-black shadow-xs' 
                          : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      VIP Members Only ({allGames.filter(g => g.isMembershipOnly).length})
                    </button>
                    <button
                      onClick={() => setSelectedCategory('board')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                        selectedCategory === 'board' 
                          ? 'bg-slate-905 text-slate-900 border border-slate-350 bg-slate-200' 
                          : 'bg-white border text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      🎲 Board Challenges ({allGames.filter(g => g.category==='board').length})
                    </button>
                    <button
                      onClick={() => setSelectedCategory('arcade')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                        selectedCategory === 'arcade' 
                          ? 'bg-slate-905 text-slate-900 border border-slate-350 bg-slate-200' 
                          : 'bg-white border text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      📺 Retro Arcade ({allGames.filter(g => g.category==='arcade').length})
                    </button>
                    <button
                      onClick={() => setSelectedCategory('action')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                        selectedCategory === 'action' 
                          ? 'bg-slate-905 text-slate-900 border border-slate-350 bg-slate-200' 
                          : 'bg-white border text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ⚡ Action Reflex ({allGames.filter(g => g.category==='action').length})
                    </button>
                  </div>

                  {/* Games Cards grid with interactive hover classes */}
                  {filteredGames.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
                      {filteredGames.map((game) => (
                        <article 
                          key={game.id}
                          onClick={() => {
                            if (game.isMembershipOnly && !isMember) {
                              setMembershipPromptGame(game);
                            } else {
                              setActiveGame(game.id);
                            }
                          }}
                          role="article"
                          aria-label={`Play ${game.title}: ${game.desc}. Max reward ${game.maxReward} coins.`}
                          className={`group bg-white border ${
                            game.isMembershipOnly 
                              ? 'border-amber-200 hover:border-amber-400 bg-gradient-to-b from-amber-50/20 to-white' 
                              : 'border-slate-200 hover:border-emerald-300'
                          } rounded-3xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:scale-[1.01] cursor-pointer flex flex-col justify-between`}
                        >
                          <div className={`absolute top-0 right-0 w-24 h-24 ${game.isMembershipOnly ? 'bg-amber-500/10' : 'bg-emerald-500/5'} rounded-full blur-2xl group-hover:scale-125 transition-transform`} />
                          
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`w-10 h-10 ${game.isMembershipOnly ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'} border rounded-xl flex items-center justify-center text-xl shadow-sm`} role="img" aria-label={`${game.title} icon`}>
                                {game.icon}
                              </div>
                              {game.isMembershipOnly ? (
                                <span className="text-[8px] uppercase tracking-widest font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 shadow-xs">
                                  <Crown className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                                  VIP Exclusive
                                </span>
                              ) : game.isNew ? (
                                <span className="text-[8px] uppercase tracking-widest font-black bg-emerald-100 text-emerald-800 px-1.5 pr-2 py-0.5 rounded-full animate-pulse border border-emerald-300">
                                  ★ NEW Game
                                </span>
                              ) : null}
                            </div>
                            
                            <h2 className="text-xs font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-1.5">
                              {game.title}
                              {game.isMembershipOnly && (
                                <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                              )}
                            </h2>
                            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed h-[42px] overflow-hidden">
                              {game.desc}
                            </p>
                          </div>

                          <div className="mt-5 border-t pt-3 flex justify-between items-center text-[9.5px] font-bold">
                            <span className="text-slate-700 uppercase font-black tracking-wide flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 text-amber-500" /> 
                              Cost: {game.cost} • Max: +{game.maxReward}
                            </span>
                            {game.isMembershipOnly && !isMember ? (
                              <span className="text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold uppercase tracking-wider group-hover:bg-amber-200 transition-colors">
                                <Lock className="w-3 h-3 text-amber-700" /> VIP Only
                              </span>
                            ) : game.isMembershipOnly && isMember ? (
                              <span className="text-amber-700 flex items-center gap-0.5 font-bold uppercase tracking-wider group-hover:text-amber-800 transition-colors">
                                <Crown className="w-3 h-3 fill-amber-500 text-amber-500" /> Play VIP
                              </span>
                            ) : (
                              <span className="text-emerald-600/75 flex items-center gap-0.5 font-bold uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
                                Enter Arena <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                              </span>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto">
                      <Gamepad2 className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5] mb-2" />
                      <h3 className="font-extrabold text-[#3a4454] uppercase tracking-wide">No Arena matches found</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">None of the {allGames.length} games match your query. Clear active filters and search queries to reset.</p>
                      <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                        className="mt-4 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}

                  {/* SEO-Optimized Content Section: 45+ Games Overview, FAQs, How It Works, and GEO Schema for Search Engines */}
                  <div className="mt-10">
                    <SEOContentSection 
                      onSelectCategory={(cat) => setSelectedCategory(cat)} 
                      onSelectGame={(gid) => setActiveGame(gid)} 
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {/* Close active game lobby overlay header */}
                  <div className="mb-6 flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTabSelect('home')}
                        className="py-1.5 px-3 bg-white border border-slate-200 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold shadow-2xs hover:bg-blue-50 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Return to Home Overview"
                      >
                        <Home className="w-3.5 h-3.5 text-blue-500" />
                        <span>Home</span>
                      </button>

                      <button
                        onClick={() => setActiveGame(null)}
                        className="py-1.5 px-3 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold shadow-2xs hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Return to Play Arena Lobby"
                      >
                        <Gamepad2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Play Arena</span>
                      </button>

                      {activeGameObj && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-black">
                          <span>{activeGameObj.icon}</span>
                          <span>{activeGameObj.title}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden md:flex text-xs text-slate-400 uppercase tracking-widest font-black items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        Live Reward Engine
                      </span>

                      <button
                        onClick={() => setActiveGame(null)}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Exit Game Area
                      </button>
                    </div>
                  </div>

                  {/* Render active loaded game component wrapper */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col justify-center items-center w-full"
                  >
                    {/* Run Original 5 Games */}
                    {activeGame === GameType.SPIN_WHEEL && <SpinWheel />}
                    {activeGame === GameType.SCRATCH_CARD && <ScratchCard />}
                    {activeGame === GameType.QUIZ && <QuizGame />}
                    {activeGame === GameType.TAP_CHALLENGE && <TapChallenge />}
                    {activeGame === GameType.PUZZLE && <PuzzleGame />}
                    
                    {/* Dispatch custom new 20 games via extended ArcadeGames */}
                    {![GameType.SPIN_WHEEL, GameType.SCRATCH_CARD, GameType.QUIZ, GameType.TAP_CHALLENGE, GameType.PUZZLE].includes(activeGame) && (
                      <ArcadeGames gameId={activeGame} onExit={() => setActiveGame(null)} />
                    )}
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

          {/* VIP MEMBERSHIP TAB */}
          {activeTab === 'membership' && (
            <MembershipHub 
              onSelectGame={(gid) => {
                const targetGame = allGames.find((g) => g.id === gid);
                if (targetGame?.isMembershipOnly && !isMember) {
                  setMembershipPromptGame(targetGame);
                } else {
                  setActiveTab('lobby');
                  setActiveGame(gid);
                }
              }} 
            />
          )}

          {/* SECURED STAFF ADMINISTRATIVE CONTROLS */}
          {activeTab === 'admin' && <AdminPanel />}
        </div>

        {/* FAST-LOADING RESPONSIVE GLOBAL FOOTER */}
        <footer className="mt-16 pt-10 border-t border-slate-200 space-y-8 text-xs text-slate-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4 text-emerald-650" />
                </div>
                <span className="text-xs font-black text-slate-900 tracking-wider uppercase">REWARDYN</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                The fast-loading play-and-earn browser arcade. Over 45+ board, retro, and action games with zero downloads and 100% ad-free VIP memberships.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Zero Installs • Instant Play</span>
              </div>
            </div>

            <div>
              <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-wider mb-3">Website Pages</h5>
              <ul className="space-y-2 text-[11px]">
                <li><button onClick={() => handleTabSelect('home')} className="hover:text-emerald-700 transition-colors cursor-pointer">Home Overview</button></li>
                <li><button onClick={() => handleTabSelect('lobby')} className="hover:text-emerald-700 transition-colors cursor-pointer">Play Arena (45+ Games)</button></li>
                <li><button onClick={() => handleTabSelect('about')} className="hover:text-emerald-700 transition-colors cursor-pointer">About Us &amp; Mission</button></li>
                <li><button onClick={() => handleTabSelect('services')} className="hover:text-emerald-700 transition-colors cursor-pointer">Services &amp; Platform</button></li>
                <li><button onClick={() => handleTabSelect('blog')} className="hover:text-emerald-700 transition-colors cursor-pointer">Blog &amp; Game Guides</button></li>
                <li><button onClick={() => handleTabSelect('contact')} className="hover:text-emerald-700 transition-colors cursor-pointer">Contact Desk</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-wider mb-3">Player Hub</h5>
              <ul className="space-y-2 text-[11px]">
                <li><button onClick={() => handleTabSelect('membership')} className="hover:text-amber-700 font-bold transition-colors cursor-pointer">VIP Membership Hub</button></li>
                <li><button onClick={() => handleTabSelect('wallet')} className="hover:text-emerald-700 transition-colors cursor-pointer">My Wallet &amp; Ledger</button></li>
                <li><button onClick={() => handleTabSelect('leaderboard')} className="hover:text-emerald-700 transition-colors cursor-pointer">Global Leaderboards</button></li>
                <li><button onClick={() => handleTabSelect('referrals')} className="hover:text-emerald-700 transition-colors cursor-pointer">Invite Friends (+100 CP)</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-wider">Direct Inquiries</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                For player support, membership questions, game submissions, or corporate partnerships:
              </p>
              <a 
                href="mailto:rewardyn1@gmail.com" 
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-mono text-[11px] font-bold transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>rewardyn1@gmail.com</span>
              </a>
              <p className="text-[10px] text-slate-400">Response time: usually under 12 hours.</p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>© 2026 REWARDYN. All rights reserved. Play &amp; Earn Browser Arcade.</p>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> Mobile
              </span>
              <span className="flex items-center gap-1">
                <Laptop className="w-3 h-3" /> Tablet &amp; Desktop
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" /> Fast-Loading
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* VIP Membership Exclusive Game Intercept Modal */}
      {membershipPromptGame && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-amber-300 relative text-center space-y-5 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setMembershipPromptGame(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-300 text-3xl flex items-center justify-center mx-auto shadow-sm">
              {membershipPromptGame.icon}
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                VIP Membership Required
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2.5">
                {membershipPromptGame.title} is Members-Only
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                This game is reserved exclusively for REWARDYN Members. Join VIP to unlock all 8 exclusive games, play with zero ads, and get daily bonus multiplier boosts!
              </p>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-left text-xs space-y-2.5 text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>Play all 8 VIP Games: Chess, Ludo, Poker, Blackjack &amp; more</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>100% Ad-Free Arcade experience without promotions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>Instant welcome coin rewards up to +1,000 coins</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  setMembershipPromptGame(null);
                  setActiveTab('membership');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Unlock with VIP Membership</span>
              </button>

              <button
                onClick={async () => {
                  await toggleMembershipStatus();
                  const g = membershipPromptGame;
                  setMembershipPromptGame(null);
                  setActiveGame(g.id as GameType);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-50 border border-amber-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>⚡ Instant 1-Click VIP Trial (Test Now)</span>
              </button>

              <button
                onClick={() => setMembershipPromptGame(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium pt-1 cursor-pointer"
              >
                Explore Free Games Instead
              </button>
            </div>
          </div>
        </div>
      )}
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
