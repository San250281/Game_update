/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useRewardEngine } from '../lib/store';
import { GameType } from '../types';
import { Sparkles, ShoppingBag, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const REWARD_TIERS = [
  { coins: 50, label: 'Standard Pack', weight: 0.5 },
  { coins: 150, label: 'Mega Bag 💰', weight: 0.35 },
  { coins: 300, label: 'Jackpot Box 💎', weight: 0.15 }
];

export default function ScratchCard() {
  const { cooldowns, submitGameScore } = useRewardEngine();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scratching, setScratching] = useState(false);
  const [reward, setReward] = useState<typeof REWARD_TIERS[0] | null>(null);
  const [complete, setComplete] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const cooldownKey = `cooldown_${GameType.SCRATCH_CARD}`;

  // Initialize random reward on component mount or reset
  const initReward = () => {
    const random = Math.random();
    let cumulative = 0;
    for (const tier of REWARD_TIERS) {
      cumulative += tier.weight;
      if (random <= cumulative) {
        setReward(tier);
        break;
      }
    }
  };

  useEffect(() => {
    initReward();
  }, []);

  // Track cooloff timing
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

  // Paint scratch mask on the canvas
  const drawMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear any previous frames
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create silver metallic gradient mask
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#94a3b8'); // Gray 400
    grad.addColorStop(0.5, '#cbd5e1'); // Gray 300
    grad.addColorStop(1, '#64748b'); // Gray 500
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some textured dots or overlay to look metallic
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Write instructions on the card coat
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡ SCRATCH COAT ⚡', canvas.width / 2, canvas.height / 2 - 10);

    ctx.fillStyle = '#475569';
    ctx.font = '500 11px sans-serif';
    ctx.fillText('Reveal hidden golden tokens', canvas.width / 2, canvas.height / 2 + 15);
  };

  // Re-draw when canvas appears, or when cooloff shifts to idle
  useEffect(() => {
    if (cooldownLeft === 0) {
      drawMask();
      setComplete(false);
      setScratchedPercentage(0);
    }
  }, [cooldownLeft, reward]);

  // Handle scratches drawing interactions
  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || complete || cooldownLeft > 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Debounce percentage calculation to keep rendering fluid
    if (Math.random() < 0.12) {
      calculateScratchPercentage();
    }
  };

  const calculateScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || complete) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scan pixels alpha channel of a 24x24 grid (cost-effective)
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    let transparent = 0;

    // Skip steps in scan loop for quick performance
    for (let i = 3; i < pixels.length; i += 40) {
      if (pixels[i] === 0) {
        transparent++;
      }
    }

    const totalSamples = pixels.length / 40;
    const pct = Math.round((transparent / totalSamples) * 100);
    setScratchedPercentage(pct);

    if (pct > 40) {
      revealAllAndReward();
    }
  };

  const revealAllAndReward = async () => {
    setComplete(true);
    setScratchedPercentage(100);
    
    // Animate canvas fading away entirely
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (reward) {
      const result = await submitGameScore(GameType.SCRATCH_CARD, reward.coins, reward.coins);
      setToast(result.message);
    }
  };

  // Interaction events routing
  const handleMouseDown = () => setScratching(true);
  const handleMouseUp = () => setScratching(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!scratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handleTouchStart = () => setScratching(true);
  const handleTouchEnd = () => setScratching(false);
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!scratching || e.touches.length === 0) return;
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleManualReset = () => {
    initReward();
    setComplete(false);
    setScratchedPercentage(0);
    setToast(null);
    setTimeout(drawMask, 50);
  };

  return (
    <div className="bg-[#1a1c24] border border-[#2b303d] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl max-w-sm mx-auto">
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

      <h2 className="text-xl font-bold text-white text-center mb-1 flex items-center justify-center gap-2">
        <ShoppingBag className="w-5 h-5 text-purple-400" />
        Golden Scratch Card
      </h2>
      <p className="text-xs text-gray-400 text-center mb-5">Rub off the cover to redeem instant bonus rewards</p>

      {/* Main card stage */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-video rounded-xl bg-gradient-to-tr from-[#2d1b4e] to-[#12082b] border-2 border-dashed border-purple-500/30 overflow-hidden flex flex-col items-center justify-center shadow-inner select-none cursor-pointer"
      >
        {/* Underlayer: revealed payload info */}
        {reward && (
          <div className="text-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] mb-2.5">
                <Sparkles className="w-7 h-7 text-white animate-bounce" />
              </div>
              <p className="text-xs text-purple-300 font-bold uppercase tracking-widest">{reward.label}</p>
              <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-200 mt-1">
                +{reward.coins} COINS
              </h3>
              <p className="text-[10px] text-emerald-400 font-medium tracking-wide mt-1 animate-pulse flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Anti-Cheat Verified Ledger
              </p>
            </motion.div>
          </div>
        )}

        {/* Dynamic canvas top overlay layer */}
        <canvas
          id="scratch_card_canvas"
          ref={canvasRef}
          width={310}
          height={175}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className={`absolute top-0 left-0 w-full h-full z-10 transition-opacity duration-300 ${
            complete ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />
      </div>

      {/* Progress HUD bar */}
      {!complete && cooldownLeft === 0 && (
        <div className="mt-4 flex flex-col gap-1">
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>Scratching ratio:</span>
            <span className="font-bold text-purple-400">{scratchedPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, (scratchedPercentage / 40) * 100)}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-150"
            />
          </div>
        </div>
      )}

      {/* Actions and cooldown handlers */}
      <div className="mt-6">
        {cooldownLeft > 0 ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2 text-amber-400 text-xs font-semibold w-full justify-center">
            <Clock className="w-4 h-4 shrink-0 animate-pulse" />
            Ad-Sponsor Reload: Next scratch in {cooldownLeft}s
          </div>
        ) : (
          complete && (
            <button
              id="reset_button_scratch"
              onClick={handleManualReset}
              className="w-full py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] shadow-lg transition-all text-white font-bold text-xs rounded-xl uppercase tracking-wider"
            >
              Okay, Scratch Another Card
            </button>
          )
        )}
      </div>

      {/* Payout dialog notifier */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-xl text-center flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
