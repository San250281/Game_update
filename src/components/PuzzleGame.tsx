/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRewardEngine } from '../lib/store';
import { GameType, TransactionSource } from '../types';
import { Play, Sparkles, Clock, AlertTriangle, ShieldCheck, HelpCircle, Trophy, Shuffle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Solved target grid layout
const SOLVED_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, null];

export default function PuzzleGame() {
  const { user, cooldowns, submitGameScore, debitCoins } = useRewardEngine();
  const [board, setBoard] = useState<(number | null)[]>(SOLVED_BOARD);
  const [gameState, setGameState] = useState<'intro' | 'active' | 'complete'>('intro');
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [timePassed, setTimePassed] = useState(0); // in seconds
  const [movesCount, setMovesCount] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cooldownKey = `cooldown_${GameType.PUZZLE}`;

  // Read cooldown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const endTime = cooldowns[cooldownKey] || 0;
      if (endTime > now) {
        setCooldownLeft(Math.ceil((endTime - now) / 1000));
      } else {
        setCooldownLeft(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldowns]);

  // Handle game stopwatch active timer
  useEffect(() => {
    if (gameState !== 'active') return;

    const interval = setInterval(() => {
      setTimePassed((prev) => {
        const nextTime = prev + 1;
        if (nextTime >= 180) { // Exceeded 3 minutes limit (180s)
          clearInterval(interval);
          finishPuzzle(180, true); // Deem failed (timeout)
          return 180;
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Helper: check if the board matches SOLVED_BOARD
  const isSolved = (currentBoard: (number | null)[]) => {
    return currentBoard.every((val, idx) => val === SOLVED_BOARD[idx]);
  };

  // Helper: shuffle starting from solved board with random swaps (guaranteed solvable)
  const generateSolvableBoard = () => {
    const tempBoard = [...SOLVED_BOARD];
    let emptyIndex = 8; // null tile index

    const getValidMoves = (idx: number) => {
      const moves = [];
      const row = Math.floor(idx / 3);
      const col = idx % 3;

      if (row > 0) moves.push(idx - 3); // Up
      if (row < 2) moves.push(idx + 3); // Down
      if (col > 0) moves.push(idx - 1); // Left
      if (col < 2) moves.push(idx + 1); // Right

      return moves;
    };

    // Make 80 valid swaps to shuffle
    for (let s = 0; s < 80; s++) {
      const validIndices = getValidMoves(emptyIndex);
      const randomTargetIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
      // Swap empty tile and random adjacent tile
      tempBoard[emptyIndex] = tempBoard[randomTargetIdx];
      tempBoard[randomTargetIdx] = null;
      emptyIndex = randomTargetIdx;
    }

    // Edge case: if after shuffling it's instantly solved, make a simple manual valid swap to break
    if (tempBoard.every((val, idx) => val === SOLVED_BOARD[idx])) {
      // swap index 7 and 8
      tempBoard[8] = tempBoard[7];
      tempBoard[7] = null;
    }

    return tempBoard;
  };

  const startPuzzleGame = async () => {
    if (cooldownLeft > 0) return;
    const entryFee = 50;
    if (!user) return;

    if (user.coins < entryFee) {
      setToast({ type: 'error', text: `Insufficient balance! Puzzle entry fee is ${entryFee} Coins. Please watch sponsor ads to earn coins.` });
      return;
    }

    // Deduct entry fee
    const debited = await debitCoins(entryFee, TransactionSource.GAME);
    if (!debited) {
      setToast({ type: 'error', text: 'Error executing transaction. Please refresh and try again.' });
      return;
    }

    const shuffled = generateSolvableBoard();
    setBoard(shuffled);
    setTimePassed(0);
    setMovesCount(0);
    setEarnedCoins(0);
    setResultMessage(null);
    setToast(null);
    setGameState('active');
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'active') return;

    const emptyIndex = board.indexOf(null);
    const rowClick = Math.floor(index / 3);
    const colClick = index % 3;
    const rowEmpty = Math.floor(emptyIndex / 3);
    const colEmpty = emptyIndex % 3;

    // Adjacent checks
    const isAdjacent = (Math.abs(rowClick - rowEmpty) + Math.abs(colClick - colEmpty)) === 1;

    if (isAdjacent) {
      const nextBoard = [...board];
      nextBoard[emptyIndex] = board[index];
      nextBoard[index] = null;
      setBoard(nextBoard);
      setMovesCount((prev) => prev + 1);

      // Check if solved
      if (isSolved(nextBoard)) {
        finishPuzzle(timePassed, false, nextBoard);
      }
    }
  };

  const finishPuzzle = async (finalTime: number, timeout: boolean, finalBoard?: (number | null)[]) => {
    setGameState('complete');
    setSubmitting(true);

    let earned = 0;
    if (!timeout) {
      if (finalTime < 60) {
        earned = 200; // Under 1 min completed -> 200 Coins
      } else if (finalTime < 120) {
        earned = 150; // Under 2 min completed -> 150 Coins
      } else if (finalTime < 180) {
        earned = 100; // Under 3 min completed -> 100 Coins
      } else {
        earned = 0;
      }
    } else {
      earned = 0; // Failed / Timed out
    }

    setEarnedCoins(earned);

    if (finalBoard) {
      setBoard(finalBoard);
    }

    const result = await submitGameScore(GameType.PUZZLE, movesCount || 1, earned);
    setSubmitting(false);
    setResultMessage(result.message);
  };

  const formatTime = (secs: number) => {
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div className="bg-[#1a1c24] border border-[#2b303d] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl max-w-sm mx-auto">
      {/* Visual neon light glows */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />

      <h2 className="text-xl font-bold text-white text-center mb-1 flex items-center justify-center gap-2">
        <Trophy className="w-5 h-5 text-emerald-400" />
        8-Piece Slide Puzzle
      </h2>
      <p className="text-xs text-gray-400 text-center mb-5">Arrange adjacent blocks into sequential order to win!</p>

      {/* 1. Introductory Screen */}
      {gameState === 'intro' && (
        <div className="text-center py-5">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500/10 to-violet-500/10 border border-slate-700/60 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Shuffle className="w-8 h-8 animate-pulse text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-2">Sharpen Your Intellect</h3>
          
          <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl max-w-xs mx-auto mb-6 text-left space-y-1.5 text-[11px] text-gray-300">
            <p className="flex justify-between border-b border-slate-800 pb-1 font-semibold text-emerald-400">
              <span>Game Entry cost:</span>
              <span>50 Coins</span>
            </p>
            <p className="flex justify-between text-yellow-400">
              <span>Under 1 Minute:</span>
              <span className="font-bold">+200 Coins</span>
            </p>
            <p className="flex justify-between">
              <span>Under 2 Minutes:</span>
              <span className="font-semibold">+150 Coins</span>
            </p>
            <p className="flex justify-between text-slate-400">
              <span>Under 3 Minutes:</span>
              <span>+100 Coins</span>
            </p>
            <p className="text-[10px] text-slate-500 italic mt-1 text-center">
              Solve the 1-to-8 sliding tile challenge. Exceeding 3:00 rules failure.
            </p>
          </div>

          {toast && (
            <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-1.5 justify-center">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{toast.text}</span>
            </div>
          )}

          {cooldownLeft > 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold">
              <Clock className="w-4 h-4 animate-pulse" />
              Puzzle buffer active: next puzzle in {cooldownLeft}s
            </div>
          ) : (
            <button
              onClick={startPuzzleGame}
              className="w-full py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] shadow-lg transition-all rounded-xl text-white font-extrabold text-sm uppercase tracking-wider cursor-pointer"
            >
              Start Sliding! (50 Coins)
            </button>
          )}
        </div>
      )}

      {/* 2. Active Screen */}
      {gameState === 'active' && (
        <div className="flex flex-col items-center">
          {/* Stopwatch and moves header */}
          <div className="flex w-full justify-between items-center bg-slate-900/60 p-3 border border-slate-800 rounded-xl mb-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className={`w-4 h-4 ${timePassed > 120 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
              <span>Time: <strong className="text-white text-sm font-bold font-mono">{formatTime(timePassed)}</strong></span>
            </div>
            <div>
              <span>Moves: <strong className="text-emerald-400 font-mono">{movesCount}</strong></span>
            </div>
          </div>

          {/* Sliding Grid Arena */}
          <div className="grid grid-cols-3 gap-2 p-2 bg-slate-950/60 rounded-2xl border border-slate-800 w-full aspect-square relative shadow-inner">
            {board.map((tileValue, index) => {
              const isEmpty = tileValue === null;
              return (
                <div key={index} className="w-full h-full">
                  {!isEmpty ? (
                    <motion.button
                      layoutId={`tile-${tileValue}`}
                      onClick={() => handleTileClick(index)}
                      className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-550 via-slate-800 to-slate-900 text-2xl font-black text-white flex items-center justify-center border border-slate-700/60 shadow-lg hover:brightness-110 active:scale-95 transition-all text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 cursor-pointer"
                    >
                      {tileValue}
                    </motion.button>
                  ) : (
                    <div className="w-full h-full rounded-xl bg-slate-950/40 border border-dashed border-slate-850" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-[10px] text-gray-500 font-medium italic">
            Tips: Click tiles adjacent to the empty slot to slide them.
          </div>
        </div>
      )}

      {/* 3. Completed Screen */}
      {gameState === 'complete' && (
        <div className="text-center py-5">
          <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400/20 to-amber-500/20 border border-yellow-500/35 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Trophy className="w-8 h-8 animate-bounce text-yellow-400" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {earnedCoins > 0 ? 'Puzzle Solved!' : 'Puzzle Expired'}
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            {earnedCoins > 0 
              ? `You finished the grid sequence with ${movesCount} moves in ${formatTime(timePassed)}!`
              : 'You exceeded the 3:00 allocated minutes challenge threshold.'
            }
          </p>

          <div className="bg-slate-900/60 py-3.5 px-6 border border-slate-800 rounded-xl inline-block mb-6">
            <h4 className="text-slate-400 text-[10px] uppercase tracking-wider">Earnings Added</h4>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-200 mt-0.5">
              +{earnedCoins} GOLD COINS
            </h2>
          </div>

          {submitting ? (
            <div className="text-xs text-slate-400 animate-pulse py-2">
              Validating anti-fraud telemetry ledger...
            </div>
          ) : (
            resultMessage && (
              <div className="text-xs font-semibold text-emerald-400 mb-6 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{resultMessage}</span>
              </div>
            )
          )}

          <button
            onClick={() => setGameState('intro')}
            className="w-full py-3 px-5 bg-slate-800 hover:bg-slate-700/80 transition-all rounded-xl text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            Okay, Close puzzle
          </button>
        </div>
      )}
    </div>
  );
}
