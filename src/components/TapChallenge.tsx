/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRewardEngine } from '../lib/store';
import { GameType } from '../types';
import { MousePointerClick, Hourglass, Zap, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClickParticle {
  id: number;
  x: number;
  y: number;
}

export default function TapChallenge() {
  const { cooldowns, submitGameScore } = useRewardEngine();
  const [gameState, setGameState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const cooldownKey = `cooldown_${GameType.TAP_CHALLENGE}`;

  // Hook cooldown
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

  // Main countdown timer
  useEffect(() => {
    if (gameState !== 'running') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = () => {
    if (cooldownLeft > 0) return;
    setTaps(0);
    setTimeLeft(10);
    setGameState('running');
    setToastMsg(null);
    setParticles([]);
  };

  const handleTap = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (gameState !== 'running') return;
    setTaps((prev) => prev + 1);

    // Spawn neat visual floating text click floaters
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (buttonRef.current && clientX > 0) {
      const rect = buttonRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;

      const newParticle = {
        id: Date.now() + Math.random(),
        x: relativeX,
        y: relativeY
      };

      setParticles((prev) => [...prev, newParticle].slice(-15)); // Keep only recent 15 particles
    }
  };

  // Clean up particles
  useEffect(() => {
    if (particles.length === 0) return;
    const cleanTimer = setTimeout(() => {
      setParticles((prev) => prev.filter(p => Date.now() - p.id < 600));
    }, 600);
    return () => clearTimeout(cleanTimer);
  }, [particles]);

  const finishGame = async () => {
    setGameState('finished');
    setSubmitting(true);

    // Reward payout: 1 coin per 2 taps (Max score allowed without cheat-ban is 150 taps)
    const earned = Math.min(60, Math.floor(taps / 2.2)); // capped logically at 60 coins to align with strict limits

    const result = await submitGameScore(GameType.TAP_CHALLENGE, taps, earned);
    setSubmitting(false);
    setToastMsg(result.message);
  };

  // Get dynamic speed comment / multiplier based on performance
  const getTapMilestone = () => {
    if (taps < 20) return { label: 'Warm up...', color: 'text-slate-400' };
    if (taps < 45) return { label: 'Steady Tempo! ⚡', color: 'text-blue-400' };
    if (taps < 70) return { label: 'Turbo Clicker! 🔥', color: 'text-purple-400' };
    if (taps < 110) return { label: 'GOD SPEED FINGERS! 🚨', color: 'text-amber-400 font-bold' };
    return { label: 'SUSPICIOUSLY QUICK 😱', color: 'text-rose-400 font-black animate-bounce' };
  };

  const currentCps = (taps / (10 - timeLeft || 1)).toFixed(1);
  const milestone = getTapMilestone();

  return (
    <div className="bg-[#1a1c24] border border-[#2b303d] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl max-w-sm mx-auto">
      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />

      <h2 className="text-xl font-bold text-white text-center mb-1 flex items-center justify-center gap-2">
        <MousePointerClick className="w-5 h-5 text-rose-400" />
        Hyper Tap Speed Test
      </h2>
      <p className="text-xs text-gray-400 text-center mb-5">Click or press the button as fast as you can in 10s</p>

      {/* Primary gameplay area */}
      {gameState === 'idle' && (
        <div className="text-center py-6 px-1 border border-slate-800 rounded-2xl bg-slate-900/40 relative">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-400">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1.5">Are your fingers ready?</h3>
          <p className="text-[11px] text-gray-400 max-w-xs mx-auto mb-6 px-3">
            Earn coins based on tapping intervals! Be mindful: speed-clicker apps or bots will be caught.
          </p>

          {cooldownLeft > 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 mx-4 flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold">
              <Hourglass className="w-4 h-4" />
              Sponsor buffer cooling: reopens in {cooldownLeft}s
            </div>
          ) : (
            <button
              onClick={startGame}
              className="w-11/12 py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:scale-[1.02] shadow-[0_4px_15px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.4)] transition-all rounded-xl text-white font-extrabold text-xs uppercase tracking-widest"
            >
              Start Challenges!
            </button>
          )}
        </div>
      )}

      {gameState === 'running' && (
        <div className="flex flex-col items-center">
          {/* Real-time stats HUD */}
          <div className="flex w-full justify-between items-center bg-slate-900/50 p-3.5 border border-slate-800 rounded-xl mb-5 text-xs">
            <div>
              <p className="text-gray-400 text-[10px] uppercase">Clock Remaining</p>
              <h4 className="text-lg font-bold text-white flex items-center gap-1">
                <Hourglass className="w-4 h-4 text-rose-400 animate-spin" />
                {timeLeft}s
              </h4>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-[10px] uppercase">Velocity Ratio</p>
              <h4 className="text-lg font-bold text-yellow-400">{currentCps} CPS</h4>
            </div>
          </div>

          {/* Current Taps Counter */}
          <div className="text-center mb-6">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-yellow-300 animate-bounce">
              {taps}
            </h1>
            <p className={`text-[10px] font-bold tracking-widest uppercase mt-1.5 ${milestone.color}`}>
              {milestone.label}
            </p>
          </div>

          {/* Giant Interactive Tap Area button */}
          <button
            id="tap_interactive_button"
            ref={buttonRef}
            onMouseDown={handleTap}
            onTouchStart={handleTap}
            className="w-44 h-44 rounded-full bg-gradient-to-br from-rose-600 via-orange-500 to-rose-700 border-8 border-slate-800 shadow-[0_0_35px_rgba(239,68,68,0.4)] active:scale-95 hover:brightness-110 active:shadow-[0_0_20px_rgba(239,68,68,0.5)] transform transition-transform flex flex-col items-center justify-center text-white font-black overflow-hidden relative cursor-pointer select-none"
          >
            {/* Visual particle overlays */}
            {particles.map((p) => (
              <span
                key={p.id}
                style={{ left: p.x, top: p.y }}
                className="absolute text-white text-base font-bold pointer-events-none animate-ping opacity-75"
              >
                +1!
              </span>
            ))}
            
            <Zap className="w-10 h-10 mb-1 animate-pulse" />
            <span className="text-sm tracking-widest uppercase">TAP ME!</span>
            <span className="text-[9px] text-rose-200 mt-1 uppercase font-semibold">Fast!</span>
          </button>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-400">
            <Sparkles className="w-7 h-7" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-1.5">Game Finished!</h2>
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl max-w-xs mx-auto mb-6">
            <div className="flex justify-between items-center mb-2.5 text-xs">
              <span className="text-gray-400">Total Taps:</span>
              <span className="font-bold text-white">{taps} clicks</span>
            </div>
            <div className="flex justify-between items-center mb-2.5 text-xs">
              <span className="text-gray-400">Average Velocity:</span>
              <span className="font-bold text-orange-400">{(taps / 10).toFixed(1)} clicks/s</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Coins Disbursed:</span>
              <span className="font-bold text-yellow-400 font-mono">
                +{Math.max(0, Math.min(60, Math.floor(taps / 2.2)))} Units
              </span>
            </div>
          </div>

          {submitting ? (
            <p className="text-xs text-gray-400 animate-pulse mb-3">Auditing clicks patterns security...</p>
          ) : (
            toastMsg && (
              <p className={`text-xs font-semibold mb-5 p-2 rounded-lg ${
                toastMsg.includes('Audit') || toastMsg.includes('flagged')
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {toastMsg}
              </p>
            )
          )}

          <button
            onClick={() => setGameState('idle')}
            className="w-full py-2.5 bg-slate-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase transition-all tracking-wider flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
