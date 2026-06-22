/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Gamepad2, Play, Trophy, Users, Star, ArrowLeft, RefreshCw, Sparkles, Zap, Coins } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GAME_DEFINITIONS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

export const Games: React.FC = () => {
  const { playSession, currentUser, playGameSession, addNotification } = useApp();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Floating coin anim states
  const [floatingCoins, setFloatingCoins] = useState<{ id: string; amount: number; x: number; y: number }[]>([]);

  const handleTriggerCoinAnimation = (amount: number, e?: React.MouseEvent) => {
    const id = 'coin_' + Math.random().toString(36).substr(2, 9);
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    setFloatingCoins((prev) => [...prev, { id, amount, x, y }]);
    setTimeout(() => {
      setFloatingCoins((current) => current.filter((c) => c.id !== id));
    }, 1200);
  };

  // 1. Daily Login Claim logic representation
  const [dailyClaimed, setDailyClaimed] = useState(() => {
    return localStorage.getItem('arena_daily_claimed_today') === 'true';
  });

  const claimDailyLogin = (e: React.MouseEvent) => {
    if (dailyClaimed) return;
    localStorage.setItem('arena_daily_claimed_today', 'true');
    setDailyClaimed(true);
    playGameSession('Daily Login Claim', 1, 5);
    handleTriggerCoinAnimation(5, e);
    addNotification('Daily Login Bonus applied! Added +5 Coins.', 'Referral Success');
  };

  const categories = ['All', 'Arcade', 'Puzzle', 'Action', 'Casual'];

  const filteredGames = activeCategory === 'All'
    ? GAME_DEFINITIONS
    : GAME_DEFINITIONS.filter((g) => g.category === activeCategory);

  return (
    <div className="space-y-8 pb-16 select-none relative">
      {/* Dynamic Floating Coin Indicators */}
      <AnimatePresence>
        {floatingCoins.map((fc) => (
          <motion.div
            key={fc.id}
            initial={{ opacity: 1, y: fc.y - 40, x: fc.x - 20, scale: 0.8 }}
            animate={{ opacity: 0, y: fc.y - 120, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="fixed pointer-events-none z-50 flex items-center gap-1 text-amber-400 font-mono font-black text-xl drop-shadow-[0_4px_12px_rgba(255,215,0,0.5)]"
          >
            <Coins className="w-6 h-6 text-[#FFD700] fill-[#FFD700]" />
            <span>+{fc.amount}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Gamepad2 className="w-8 h-8 text-[#6C63FF]" />
            Arena Browser Arcade
          </h1>
          <p className="text-sm text-gray-400 mt-1">Play matches, secure scores, and log transactions instantly to accumulate Coins.</p>
        </div>

        {/* Daily Bonus Button */}
        <button
          id="btn-claim-daily"
          onClick={claimDailyLogin}
          disabled={dailyClaimed}
          className={`px-5 py-3 rounded-xl border font-semibold flex items-center gap-2 transition-all cursor-pointer text-sm ${
            dailyClaimed
              ? 'bg-slate-800/20 text-slate-500 border-slate-800/40 cursor-default'
              : 'bg-gradient-to-r from-[#00C896]/10 to-[#00C896]/5 hover:from-[#00C896]/20 text-[#00C896] border-[#00C896]/30 shadow-md animate-pulse'
          }`}
          style={{ minHeight: '44px' }}
        >
          <Sparkles className="w-4 h-4" />
          <span>{dailyClaimed ? 'Daily claimed (+5)' : 'Claim Daily Bonus (+5 Coins)'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!selectedGameId ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Category selection */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/40">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium text-xs transition-colors shrink-0 ${
                    activeCategory === cat
                      ? 'bg-[#6C63FF] text-white font-bold'
                      : 'bg-[#18181A] text-gray-400 hover:text-white border border-slate-800'
                  }`}
                  style={{ minHeight: '38px' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid of games */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <div
                  id={`arcade-game-${game.id}`}
                  key={game.id}
                  className="bg-[#18181A] rounded-xl overflow-hidden border border-slate-800/40 hover:border-[#6C63FF]/30 transition-all shadow-lg flex flex-col group"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={game.imageUrl}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-slate-950/80 text-[10px] text-gray-300 font-mono px-2 py-0.5 rounded border border-slate-800">
                      {game.category}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white tracking-tight">{game.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{game.description}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-800/40">
                      <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{game.activePlayers} Live</span>
                        </span>
                        <span className="text-[#00C896]">+10 Coins Win</span>
                      </div>

                      <button
                        id={`btn-play-game-${game.id}`}
                        onClick={() => setSelectedGameId(game.id)}
                        className="w-full py-2 bg-[#6C63FF]/10 text-[#6C63FF] hover:bg-[#6C63FF] hover:text-white transition-all font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{ minHeight: '40px' }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Game</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coin Earning Rules Callout */}
            <div className="rounded-xl p-5 bg-[#18181A] border border-slate-800/40 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#FFD700]" />
                Coin Engine Earning Rules
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Daily Sign In Log', prize: '5 Coins', desc: 'Claim every 24 hours on the platform.' },
                  { label: 'Match Winning Score reached', prize: '10 Coins', desc: 'Reach target benchmarks inside games.' },
                  { label: 'High Score Benchmark', prize: '25 Coins', desc: 'Secure the ultimate score in one match.' },
                ].map((rule, idx) => (
                  <div key={idx} className="bg-slate-900/40 rounded-lg p-3.5 border border-slate-800/30 space-y-1">
                    <span className="text-xs font-bold text-gray-200 block">{rule.label}</span>
                    <span className="text-xs font-mono font-bold text-[#00C896]">{rule.prize}</span>
                    <p className="text-[11px] text-gray-500 leading-snug">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sandbox"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <button
              id="btn-back-to-arena"
              onClick={() => setSelectedGameId(null)}
              className="px-4 py-2 border border-slate-800 text-gray-300 hover:text-white hover:bg-slate-800/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              style={{ minHeight: '38px' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to games grid</span>
            </button>

            {/* ACTIVE INTERACTIVE GAME SANDBOX WINDOW */}
            <GameBox gameId={selectedGameId} onFinished={handleTriggerCoinAnimation} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* INNER GAME SANDBOX CONTROLLER INTERFACES */
interface GameBoxProps {
  gameId: string;
  onFinished: (coins: number, e?: React.MouseEvent) => void;
}

const GameBox: React.FC<GameBoxProps> = ({ gameId, onFinished }) => {
  const { playGameSession, addNotification } = useApp();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [highScore, setHighScore] = useState(0);

  // Tap target variables
  const [grid, setGrid] = useState<boolean[]>(Array(16).fill(false));
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Memory card game variables
  const [cards, setCards] = useState<{ id: number; symbol: string; matched: boolean; flipped: boolean }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  // Mine sweeper style
  const [mines, setMines] = useState<{ id: number; hasMine: boolean; revealed: boolean }[]>([]);
  const [minesOver, setMinesOver] = useState(false);
  const [minesCashed, setMinesCashed] = useState(false);

  // Initialize highscores from localStorage
  useEffect(() => {
    const cachedScore = localStorage.getItem(`high_score_${gameId}`);
    if (cachedScore) setHighScore(parseInt(cachedScore, 10));
  }, [gameId]);

  // Game cycle timers
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && gameId === 'tap_target') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleGameEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, gameId]);

  // --- TAP TARGET GAME WORK ACTIONS ---
  const startTapTarget = () => {
    setScore(0);
    setTimeLeft(15);
    setGameState('playing');
    spawnTarget();
  };

  const spawnTarget = () => {
    const randomIdx = Math.floor(Math.random() * 16);
    setActiveIndex(randomIdx);
  };

  const clickCell = (idx: number, e: React.MouseEvent) => {
    if (gameState !== 'playing') return;
    if (idx === activeIndex) {
      setScore((p) => p + 10);
      spawnTarget();
      onFinished(2, e); // micro floating payout effect
    } else {
      setScore((p) => Math.max(0, p - 5));
    }
  };

  // --- MEMORY MATCH CODES ---
  const startMemoryMatch = () => {
    setScore(0);
    setGameState('playing');
    const symbols = ['💎', '🚀', '🔮', '🔥', '⭐️', '👑', '🍀', '🍕'];
    const deck = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((sym, idx) => ({
        id: idx,
        symbol: sym,
        matched: false,
        flipped: false,
      }));
    setCards(deck);
    setSelectedCards([]);
  };

  const clickCard = (idx: number, e: React.MouseEvent) => {
    if (gameState !== 'playing') return;
    if (cards[idx].flipped || cards[idx].matched) return;
    if (selectedCards.length >= 2) return;

    // Flip card
    const updated = [...cards];
    updated[idx].flipped = true;
    setCards(updated);

    const matchCandidate = [...selectedCards, idx];
    setSelectedCards(matchCandidate);

    if (matchCandidate.length === 2) {
      const [first, second] = matchCandidate;
      if (cards[first].symbol === cards[second].symbol) {
        // MATCHED
        setTimeout(() => {
          const matchResult = [...cards];
          matchResult[first].matched = true;
          matchResult[second].matched = true;
          setCards(matchResult);
          setSelectedCards([]);
          setScore((p) => p + 25);
          onFinished(5, e);

          // Check Win Condition
          if (matchResult.every((c) => c.matched)) {
            handleGameEnd();
          }
        }, 500);
      } else {
        // MISMATCH FLIP BACK
        setTimeout(() => {
          const revertResult = [...cards];
          revertResult[first].flipped = false;
          revertResult[second].flipped = false;
          setCards(revertResult);
          setSelectedCards([]);
        }, 800);
      }
    }
  };

  // --- MINES BLOCK ENGINE ---
  const startBlockMines = () => {
    setScore(0);
    setMinesCashed(false);
    setMinesOver(false);
    setGameState('playing');

    const board = Array(16)
      .fill(null)
      .map((_, idx) => ({
        id: idx,
        hasMine: idx === 1 || idx === 6 || idx === 11 || idx === 14, // seed strategic mines
        revealed: false,
      }));
    setMines(board);
  };

  const clickMineCell = (idx: number, e: React.MouseEvent) => {
    if (gameState !== 'playing' || minesOver || minesCashed) return;
    if (mines[idx].revealed) return;

    const updated = [...mines];
    updated[idx].revealed = true;
    setMines(updated);

    if (updated[idx].hasMine) {
      // BOOM
      setMinesOver(true);
      setScore(0);
      setTimeout(() => {
        handleGameEnd();
      }, 1000);
    } else {
      // Reward Multiplier accumulation
      setScore((p) => p + 30);
      onFinished(2, e);
    }
  };

  const cashoutMines = () => {
    if (gameState !== 'playing' || minesOver || score === 0) return;
    setMinesCashed(true);
    handleGameEnd();
  };

  // --- FINALIZE GAME SCORE AND CONVERT TO COINS ---
  const handleGameEnd = () => {
    setGameState('ended');

    // Rule engine conversion: Score > 100 -> Wins (+10 coins). High score achieved -> Bonus +25.
    let coinsEarned = 0;
    let comments = 'Participated in Arena game';

    if (score >= 100) {
      coinsEarned = 10;
      comments = 'Arena Match Win Target reached!';
    } else if (score > 40) {
      coinsEarned = 5;
      comments = 'Good score match coins reward';
    }

    if (score > highScore) {
      localStorage.setItem(`high_score_${gameId}`, score.toString());
      setHighScore(score);
      coinsEarned += 25; // High score achieve bonus
      comments = 'NEW ARENA HIGH SCORE ACHIEVED!';
      addNotification(`New Highscore on ${gameId.replace('_', ' ')}! Gained 25 bonus coins.`, 'Referral Success');
    }

    playGameSession(gameId, score, coinsEarned);
  };

  const renderGameArea = () => {
    switch (gameId) {
      case 'tap_target':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between font-mono bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-gray-400 font-sans">TIMER: <span className="text-rose-400 font-bold font-mono">{timeLeft}s</span></span>
              <span className="text-[#00C896] font-sans">SCORE: <span className="font-bold">{score}</span></span>
            </div>

            {gameState === 'idle' && (
              <div className="text-center p-8 bg-slate-900 rounded-xl border border-[#2D2D30] space-y-4">
                <p className="text-xs text-gray-400">Spawn clicking tiles. Hit as many targets as you can inside 15 seconds. Score negative on miss!</p>
                <button
                  id="btn-play-tap"
                  onClick={startTapTarget}
                  className="px-6 py-2.5 bg-[#6C63FF] hover:bg-[#5b54e0] text-white font-semibold rounded-lg text-xs"
                >
                  Start Game Session
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto p-4 bg-slate-950 rounded-2xl border border-slate-800">
                {grid.map((_, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={idx}
                      onClick={(e) => clickCell(idx, e)}
                      className={`h-16 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-[#00C896] border-[#00C896] scale-105 shadow-lg shadow-[#00C896]/30 animate-pulse'
                          : 'bg-slate-900 border-slate-850 hover:bg-slate-850'
                      }`}
                      style={{ minHeight: '64px' }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'memory_match':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between font-mono bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[#00C896] font-sans">COMBO SCORE: <span className="font-bold">{score}</span></span>
            </div>

            {gameState === 'idle' && (
              <div className="text-center p-8 bg-slate-900 rounded-xl border border-slate-850 space-y-4">
                <p className="text-xs text-gray-400">Match the pairs of hidden tokens with minimum steps. Match all pairs to finish.</p>
                <button
                  id="btn-play-match"
                  onClick={startMemoryMatch}
                  className="px-6 py-2.5 bg-[#6C63FF] hover:bg-[#5b54e0] text-white font-semibold rounded-lg text-xs"
                >
                  Start Matcher Session
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="grid grid-cols-4 gap-3 max-w-md mx-auto p-4 bg-slate-950 rounded-2xl border border-slate-800">
                {cards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={(e) => clickCard(idx, e)}
                    className={`h-16 rounded-xl border font-sans text-xl flex items-center justify-center transition-all ${
                      card.flipped || card.matched
                        ? 'bg-indigo-950 border-[#6C63FF] text-white'
                        : 'bg-slate-900 border-slate-800 text-transparent hover:bg-slate-850'
                    }`}
                    style={{ minHeight: '64px' }}
                  >
                    {(card.flipped || card.matched) ? card.symbol : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'mines_sweeper':
      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between font-mono bg-slate-900 p-4 rounded-xl border border-slate-850">
              <span className="text-[#00C896] font-sans">CURRENT GAIN: <span className="font-bold">{score} Coins Equivalent</span></span>
              {gameState === 'playing' && score > 0 && (
                <button
                  id="btn-mines-cashout"
                  onClick={cashoutMines}
                  className="px-4 py-1.5 bg-[#00C896] hover:bg-[#00ab80] text-white text-xs font-bold rounded-lg transition-transform hover:scale-103"
                >
                  Cash out Securely
                </button>
              )}
            </div>

            {gameState === 'idle' && (
              <div className="text-center p-8 bg-slate-900 rounded-xl border border-slate-850 space-y-4">
                <p className="text-xs text-gray-400">Swipe cells. There are 4 hidden explosions. Click to gain score bonuses, but trigger a bomb and explode back to zero!</p>
                <button
                  id="btn-play-mines"
                  onClick={startBlockMines}
                  className="px-6 py-2.5 bg-[#6C63FF] hover:bg-[#5b54e0] text-white font-semibold rounded-lg text-xs"
                >
                  Start Block Sweeper
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto p-4 bg-slate-950 rounded-2xl border border-slate-880">
                  {mines.map((block, idx) => (
                    <button
                      key={block.id}
                      onClick={(e) => clickMineCell(idx, e)}
                      disabled={minesOver || minesCashed}
                      className={`h-16 rounded-xl border flex items-center justify-center font-bold text-lg transition-all ${
                        block.revealed
                          ? block.hasMine
                            ? 'bg-rose-950 border-rose-500 text-rose-400'
                            : 'bg-teal-950 border-[#00C896] text-[#00C896]'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                      style={{ minHeight: '64px' }}
                    >
                      {block.revealed ? (block.hasMine ? '💣' : '💎') : ''}
                    </button>
                  ))}
                </div>
                {minesOver && (
                  <p className="text-center text-xs font-semibold text-rose-400 animate-bounce">Ouch! Triggered a block mine bomb trap!</p>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  const getCardGameLabelName = (id: string) => {
    switch (id) {
      case 'tap_target':
        return 'Tap Target Hero';
      case 'memory_match':
        return 'Crypto Matcher';
      default:
        return 'Block Mines';
    }
  };

  return (
    <div id="game-sandbox-card" className="bg-[#18181A] rounded-2xl p-6 border border-[#2D2D30] max-w-2xl mx-auto shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">{getCardGameLabelName(gameId)}</h2>
          <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">High score benchmark record: {highScore}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-5 h-5 text-[#FFD700]" />
          <span className="text-sm font-bold text-[#FFD700] font-mono">{highScore} pts</span>
        </div>
      </div>

      <div className="py-4">
        {renderGameArea()}
      </div>

      {/* GAME OVER STATE VIEW */}
      {gameState === 'ended' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-sans font-bold text-[#00C896] uppercase tracking-wider">Session concluded!</h4>
            <p className="text-2xl font-mono font-bold text-white">Scores Gained: {score} pts</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              id="btn-retry-session"
              onClick={() => {
                if (gameId === 'tap_target') startTapTarget();
                else if (gameId === 'memory_match') startMemoryMatch();
                else if (gameId === 'mines_sweeper') startBlockMines();
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-gray-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
              style={{ minHeight: '40px' }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry match</span>
            </button>
            <button
              id="btn-return-lobby"
              onClick={() => {
                // finished session
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-indigo-500/10 text-[#6C63FF] border border-[#6C63FF]/30 hover:bg-[#6C63FF] hover:text-white transition-colors rounded-lg text-xs font-semibold"
              style={{ minHeight: '40px' }}
            >
              Return to arcade lobby
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
