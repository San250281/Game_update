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
import PuzzleGame from './components/PuzzleGame';
import Wallet from './components/Wallet';
import Referrals from './components/Referrals';
import Leaderboard from './components/Leaderboard';
import AdCenter from './components/AdCenter';
import AdminPanel from './components/AdminPanel';
import ArcadeGames from './components/ArcadeGames';
import UserAvatar from './components/UserAvatar';
import { 
  Gamepad2, WalletCards, Trophy, Users, MonitorPlay, Shield, 
  LogOut, Coins, Sparkles, Clock, Menu, X, ChevronRight, Zap, 
  Search, UsersRound, PlusCircle, Check, ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function DashboardLobby() {
  const { 
    user, 
    logout, 
    isFirebaseMode, 
    allUsers, 
    switchUser, 
    loginAsGuest 
  } = useRewardEngine();

  const [activeTab, setActiveTab] = useState<'lobby' | 'wallet' | 'referrals' | 'leaderboard' | 'ads' | 'admin'>('lobby');
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Game filtering of the Play Arena
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'board' | 'arcade' | 'action'>('all');
  
  // Profile Switcher lists toggle popup
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  if (!user) return <AuthScreen />;

  // Complete List of All 45+ Games (Originals + All Requested Categories)
  const allGames = [
    // Original 5 Games
    { id: GameType.SPIN_WHEEL, title: 'Lucky Wheel Spin', icon: '🎡', category: 'arcade', desc: 'Spin the physical segment wheel. Max jackpot is +200 coins. Profit probability optimized!', cost: 20, maxReward: 200, isNew: false },
    { id: GameType.SCRATCH_CARD, title: 'Golden Scratch Card', icon: '✉️', category: 'arcade', desc: 'Rub off metallic coatings interactively on touch paths to claim random coin bags.', cost: 15, maxReward: 40, isNew: false },
    { id: GameType.QUIZ, title: 'Knowledge Arena Quiz', icon: '🧠', category: 'action', desc: 'Sharpen your engineering background! Clear up to 10 question rounds to earn tiered limits.', cost: 30, maxReward: 60, isNew: false },
    { id: GameType.TAP_CHALLENGE, title: 'Hyper Tap Velocity', icon: '⚡', category: 'action', desc: 'Test click velocity! Tab as fast as possible in 10s to win highest payouts.', cost: 25, maxReward: 80, isNew: false },
    { id: GameType.PUZZLE, title: '8-Piece Slide Puzzle', icon: '🧩', category: 'action', desc: 'Sliding block intelligence challenge. Puzzle numbers sequentially under 1 minute!', cost: 50, maxReward: 200, isNew: false },
    
    // Board Games requested (Ludo, Chess, TicTacToe)
    { id: GameType.LUDO, title: 'Royal Ludo', icon: '🎲', category: 'board', desc: 'Roll dice, advance tokens, reach the center safe home coordinates first!', cost: 25, maxReward: 75, isNew: false },
    { id: GameType.CHESS, title: 'Grandmaster Chess', icon: '♟️', category: 'board', desc: 'Play actual board rules with captures, select pieces and defeat smart local AI!', cost: 40, maxReward: 120, isNew: false },
    { id: GameType.TIC_TAC_TOE, title: 'Tic-Tac-Toe Grid', icon: '❌', category: 'board', desc: 'Connect 3-in-a-row in a classic slate grid. Defeat the computer block tactics.', cost: 10, maxReward: 25, isNew: false },
    
    // Arcade / Casual Games (Snake, Tetris, Pong, Flappy Bird, Memory Match, 2048, Minesweeper, Word Guesser)
    { id: GameType.SNAKE, title: 'Classic Snake', icon: '🐍', category: 'arcade', desc: 'Guide pixel snakes to eat rising cherries 🍒. Grow longer and don\'t smash borders!', cost: 15, maxReward: 45, isNew: false },
    { id: GameType.TETRIS, title: 'Retro Block Fall', icon: '🧱', category: 'arcade', desc: 'Align descending geometric cubes to clear line rows and score jackpot rewards.', cost: 20, maxReward: 50, isNew: false },
    { id: GameType.PONG, title: 'Aesthetic Pong', icon: '🏓', category: 'arcade', desc: 'Realtime 2D bouncing ball pong. Control paddle with mouse/keys and outlive AI.', cost: 15, maxReward: 35, isNew: false },
    { id: GameType.FLAPPY_BIRD, title: 'Flappy Flyer', icon: '🐦', category: 'arcade', desc: 'Help the cute flybird flap through hazardous gaps recursively. 60fps graphics!', cost: 15, maxReward: 40, isNew: false },
    { id: GameType.MEMORY_MATCH, title: 'Card Memory Pairs', icon: '🃏', category: 'arcade', desc: 'Flip pairs of culinary tiles. Match all symbols quickly under countdown limits.', cost: 10, maxReward: 25, isNew: false },
    { id: GameType.GAME_2048, title: 'Merge 2048 Blocks', icon: '🔢', category: 'arcade', desc: 'Slide identical numbered blocks upwards to aggregate 2048 score targets.', cost: 25, maxReward: 75, isNew: false },
    { id: GameType.MINESWEEPER, title: 'Nuclear Minesweeper', icon: '💣', category: 'arcade', desc: 'Locate radioactive elements! Flag danger blocks, reveal entire safe grids.', cost: 15, maxReward: 50, isNew: false },
    { id: GameType.WORD_GUESSER, title: 'Wordle Guess Solver', icon: '🔤', category: 'arcade', desc: 'Classic 5-letter word solver. Fill green, yellow and gray status tiles.', cost: 20, maxReward: 40, isNew: false },
    
    // Action / Skill reflexes (Space Shooter, Whack-O-Mole, Balloon, Bricks, Simon, Sudoku, RPS, Coin, Dodge)
    { id: GameType.SPACE_SHOOTER, title: 'Galaxy Fighter', icon: '🚀', category: 'action', desc: 'Shoot laser rounds at space meteorites to claim deep orbit coin starships.', cost: 20, maxReward: 60, isNew: false },
    { id: GameType.WHACK_A_MOLE, title: 'Whack-a-Mole', icon: '🐹', category: 'action', desc: 'Tap rapid popping moles. Test high reaction rate under time limits!', cost: 15, maxReward: 30, isNew: false },
    { id: GameType.BALLOON_POPPER, title: 'Balloon Popper', icon: '🎈', category: 'action', desc: 'Pop rising hydrogen balloons before they fly. Claim instant multipliers.', cost: 10, maxReward: 20, isNew: false },
    { id: GameType.BRICK_BREAKER, title: 'Brick Crusher', icon: '🔥', category: 'action', desc: 'Bounce balls using responsive paddles to break rows of colorful brick lines.', cost: 20, maxReward: 45, isNew: false },
    { id: GameType.COLOR_MATCHER, title: 'Simon Simon memory', icon: '🟡', category: 'action', desc: 'Observe, memorize and repeat sequential flashing light signal cues.', cost: 15, maxReward: 30, isNew: false },
    { id: GameType.ROCK_PAPER_SESSORS, title: 'R-P-S Duel', icon: '✊', category: 'action', desc: 'Play rock, paper or scissors against our mathematical AI generator.', cost: 10, maxReward: 20, isNew: false },
    { id: GameType.SUDOKU, title: 'Sudoku mini 4x4', icon: '🧩', category: 'action', desc: 'Fill empty slots so numbers 1 to 4 do not overlap inside square lines.', cost: 25, maxReward: 60, isNew: false },
    { id: GameType.COIN_FLIP, title: 'Coin Flipper', icon: '🪙', category: 'action', desc: 'Secure 50/50 heads or tails. Multiply coin reserves effortlessly.', cost: 10, maxReward: 20, isNew: false },
    { id: GameType.DODGE_OBSTACLES, title: 'Highway Car Dodger', icon: '🏎️', category: 'action', desc: 'Steer left or right on highways to dodge oncoming speed blocks.', cost: 15, maxReward: 35, isNew: false },

    // REWARD / ARCADE WEBSITES category (Lucky Draw, Daily Check-in Rewards, Coin Collector, Treasure Hunt)
    { id: GameType.LUCKY_DRAW, title: 'Jackpot Lucky Draw', icon: '🎟️', category: 'arcade', desc: 'Draw a gold ticket from the reward dispenser. Stand a chance to multiply stakes by 5x!', cost: 15, maxReward: 75, isNew: true },
    { id: GameType.DAILY_CHECKIN, title: 'Checkin Calendar Match', icon: '📅', category: 'arcade', desc: 'Fulfill daily streaks for active claim counts! Match consecutive dates for coin multipliers.', cost: 10, maxReward: 30, isNew: true },
    { id: GameType.COIN_COLLECTOR, title: 'Sky Coin Collector', icon: '⭐', category: 'arcade', desc: 'Coins falling from the cloud! Control your chest and scoop bags of gold before timer runs out!', cost: 15, maxReward: 50, isNew: true },
    { id: GameType.TREASURE_HUNT, title: 'Deep Treasure Hunt', icon: '🏴‍☠️', category: 'arcade', desc: 'Solve island coordinate puzzles! Select grid locations to uncover chests. Watch out for sharks!', cost: 20, maxReward: 80, isNew: true },

    // CASUAL GAMES (Match-3 Sweet Crush, Word Search, Crossword Panel)
    { id: GameType.MATCH_3, title: 'Sweet Match-3 Blast', icon: '🍬', category: 'arcade', desc: 'Swap neighboring sweets. Pop blocks of 3 matching units to level up!', cost: 20, maxReward: 60, isNew: true },
    { id: GameType.WORD_SEARCH, title: 'Word Search Sleuth', icon: '🔍', category: 'board', desc: 'Locate hidden secret words spelled in horizontal or vertical layout panels!', cost: 15, maxReward: 45, isNew: true },
    { id: GameType.CROSSWORD, title: 'Mini Cryptic Crossword', icon: '📝', category: 'board', desc: 'Fill crossword cells using textual clues. Overlap characters correctly to score!', cost: 20, maxReward: 60, isNew: true },

    // SKILL GAMES requested (Checkers Board, Connect 4)
    { id: GameType.CHECKERS, title: 'Checkers Drafts Duel', icon: '🔴', category: 'board', desc: 'Jump over enemy red counters in standard drafts board paths against our local AI!', cost: 25, maxReward: 75, isNew: true },
    { id: GameType.CONNECT_4, title: 'Connect 4 Drops', icon: '🔵', category: 'board', desc: 'Drop blue discs into column grids. Slot 4 of your tokens adjacent to beat the AI!', cost: 20, maxReward: 50, isNew: true },

    // QUICK MINI-GAMES reflexes (Reaction Time Test, Click Speed Clicker)
    { id: GameType.REACTION_TIME, title: 'Reaction Speed Test', icon: '⏱️', category: 'action', desc: 'Click immediately when visual layouts transition into green light values!', cost: 10, maxReward: 30, isNew: true },
    { id: GameType.CLICK_SPEED, title: 'Click Speed Test 10s', icon: '💥', category: 'action', desc: 'Mash click targets! Discover your CPS (Clicks Per Second) to capture gold pools.', cost: 10, maxReward: 30, isNew: true },

    // RUNNER GAMES reflexes (Temple Run Style, Subway Surfers Style, Dino Runner, Endless Jump Jumper)
    { id: GameType.RUNNER_TEMPLE, title: 'Lost Temple runner', icon: '🛕', category: 'action', desc: 'Dodge crumbling pathway obstacles, leap logs, turn corners in high-speed temples.', cost: 20, maxReward: 60, isNew: true },
    { id: GameType.RUNNER_SUBWAY, title: 'Subway Rail Surfer', icon: '🚇', category: 'action', desc: 'Steer between 3-tracks to avoid oncoming metro train cars, gather glowing coins.', cost: 20, maxReward: 60, isNew: true },
    { id: GameType.DINO_RUNNER, title: 'Jumping Chrome Dino', icon: '🦖', category: 'action', desc: 'The offline internet legend! Leap over prickly cacti and score milestones.', cost: 15, maxReward: 45, isNew: true },
    { id: GameType.ENDLESS_JUMP, title: 'Cloud Jump Jumper', icon: '☁️', category: 'action', desc: 'Bounce upwards off celestial platforms endlessly without falling down!', cost: 15, maxReward: 45, isNew: true },

    // CARD GAMES (Solitaire, Poker Play Money, Blackjack Dealer, Rummy Draw, Uno Discard)
    { id: GameType.SOLITAIRE, title: 'Solitaire Classic Klondike', icon: '🎴', category: 'board', desc: 'Group standard cards by sequential alternating suites to set up card pyramids!', cost: 25, maxReward: 75, isNew: true },
    { id: GameType.POKER, title: '5-Card Draw Poker', icon: '🃏', category: 'board', desc: 'Play-money betting room! Match royal pairs, flushes and straights against AI hands.', cost: 30, maxReward: 90, isNew: true },
    { id: GameType.BLACKJACK, title: 'Vegas Blackjack 21', icon: '🪙', category: 'board', desc: 'Vegas classic! Hit, Stand or Double to reach 21 or defeat the AI dealer hands.', cost: 20, maxReward: 50, isNew: true },
    { id: GameType.RUMMY, title: 'Rummy Deck Melder', icon: '🀄', category: 'board', desc: 'Arrange cards into consecutive runs and of-a-kind sets. Solve your hands first!', cost: 25, maxReward: 75, isNew: true },
    { id: GameType.UNO, title: 'Uno Discard Party', icon: '🌈', category: 'board', desc: 'Discard matching colored/valued cards. Intercept opponent leads with Action Cards!', cost: 20, maxReward: 60, isNew: true }
  ];

  const navigationTabs = [
    { id: 'lobby', label: 'Play Arena', icon: Gamepad2, color: 'text-emerald-450' },
    { id: 'wallet', label: 'My Wallet', icon: WalletCards, color: 'text-amber-450' },
    { id: 'referrals', label: 'Invite Referrals', icon: Users, color: 'text-purple-450' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-yellow-450' },
    { id: 'ads', label: 'Sponsor Ads', icon: MonitorPlay, color: 'text-sky-450' },
  ];

  if (user.isAdmin) {
    navigationTabs.push({ id: 'admin', label: 'Admin Hub', icon: Shield, color: 'text-rose-450' });
  }

  const handleTabSelect = (tabId: any) => {
    setActiveTab(tabId);
    setActiveGame(null);
    setMobileMenuOpen(false);
  };

  const handleCreateNewGuestProfile = async () => {
    try {
      await loginAsGuest();
      setShowProfileSwitcher(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter games based on search queries & categories
  const filteredGames = allGames.filter((g) => {
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      <header className="md:hidden w-full bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between select-none relative z-45">
        <div className="flex items-center gap-2">
          <div className="w-8.5 h-8.5 bg-emerald-50/10 border border-emerald-500 rounded-lg flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-emerald-650" />
          </div>
          <span className="text-xs font-black text-slate-900 tracking-widest uppercase">REWARDYN</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Balance indicator */}
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-1 text-[11px] font-black text-amber-750">
            <Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-305" />
            {user.coins.toLocaleString()}
          </div>

          {/* Dedicated user login/profile icon directly on top header */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setShowProfileSwitcher(true);
            }}
            className="w-8 h-8 rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:scale-105 active:scale-95 transition-transform"
            title="Switch User Profile"
          >
            <UserAvatar src={user.photoURL} name={user.name} className="w-full h-full" />
          </button>

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
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full relative">
        
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
                user.provider === 'guest' ? 'bg-amber-50 text-amber-505 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                {user.provider === 'guest' ? '👤' : '👑'}
              </div>
              <div className="text-left">
                <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none block">User Login Status</span>
                <span className="text-[11px] font-extrabold text-slate-700 block mt-0.5">
                  {user.provider === 'guest' ? 'Logged In as Guest (500 Gift Coins)' : 'Logged In as Member'}
                </span>
              </div>
              
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
          {/* LOBBY HUB VIEW */}
          {activeTab === 'lobby' && (
            <div>
              {!activeGame ? (
                <div>
                  <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Zap className="w-6.5 h-6.5 text-emerald-600 fill-emerald-500 animate-pulse" />
                        Arcade Play Arena
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Select an active HTML5 mini-game to compete and claim instant token rewards</p>
                    </div>

                    {/* Integrated Search and Category Filtering UI */}
                    <div className="flex items-center gap-2.5 max-w-sm w-full bg-white p-1.5 px-3 border border-slate-200 rounded-2xl shadow-sm">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search 25 Arcade games..."
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
                      🕹️ All Games (25)
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
                        <div 
                          key={game.id}
                          onClick={() => setActiveGame(game.id)}
                          className="group bg-white border border-slate-200 hover:border-emerald-300 rounded-3xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                          
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-10 h-10 bg-slate-50 border rounded-xl flex items-center justify-center text-xl shadow-sm">
                                {game.icon}
                              </div>
                              {game.isNew && (
                                <span className="text-[8px] uppercase tracking-widest font-black bg-emerald-100 text-emerald-800 px-1.5 pr-2 py-0.5 rounded-full animate-pulse border border-emerald-300">
                                  ★ NEW Game
                                </span>
                              )}
                            </div>
                            
                            <h3 className="text-xs font-extrabold text-slate-850 uppercase tracking-wide flex items-center gap-1.5">
                              {game.title}
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed h-[42px] overflow-hidden">
                              {game.desc}
                            </p>
                          </div>

                          <div className="mt-5 border-t pt-3 flex justify-between items-center text-[9.5px] font-bold">
                            <span className="text-slate-700 uppercase font-black tracking-wide flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 text-amber-500" /> 
                              Cost: {game.cost} • Max: +{game.maxReward}
                            </span>
                            <span className="text-emerald-600/75 flex items-center gap-0.5 font-bold uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
                              Enter Arena <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto">
                      <Gamepad2 className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5] mb-2" />
                      <h3 className="font-extrabold text-[#3a4454] uppercase tracking-wide">No Arena matches found</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">None of the 25 games match your query. Clear active filters and search queries to reset.</p>
                      <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                        className="mt-4 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
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
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-black flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      ACTIVE REWARD CONTEXT ENGINE
                    </span>
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
