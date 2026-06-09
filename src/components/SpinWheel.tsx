/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { useRewardEngine } from '../lib/store';
import { GameType, TransactionSource } from '../types';
import { Play, Sparkles, Clock, AlertTriangle, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SECTORS = [
  { value: 5, label: '5 Coins', color: '#4b5563', probability: 0.40 },     // Gray
  { value: 10, label: '10 Coins', color: '#3b82f6', probability: 0.30 },   // Blue
  { value: 20, label: '20 Coins', color: '#10b981', probability: 0.20 },   // Emerald
  { value: 50, label: '50 Coins', color: '#8b5cf6', probability: 0.09 },   // Violet
  { value: 200, label: 'JACKPOT 🌟', color: '#ec4899', probability: 0.01 } // Pink
];

export default function SpinWheel() {
  const { user, cooldowns, submitGameScore, debitCoins } = useRewardEngine();
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<typeof SECTORS[0] | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  const cooldownKey = `cooldown_${GameType.SPIN_WHEEL}`;

  // Track cooldown in real-time
  useEffect(() => {
    const checkCooldown = () => {
      const now = Date.now();
      const endTime = cooldowns[cooldownKey] || 0;
      if (endTime > now) {
        setCooldownLeft(Math.ceil((endTime - now) / 1000));
      } else {
        setCooldownLeft(0);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [cooldowns]);

  const handleSpin = async () => {
    if (spinning || cooldownLeft > 0) return;
    
    const entryFee = 20;
    if (!user) return;
    if (user.coins < entryFee) {
      setToast({ type: 'error', text: `Insufficient balance! Lucky Wheel entry fee is ${entryFee} Coins. Please watch sponsor ads to earn coins.` });
      return;
    }

    setSpinning(true);
    setPrize(null);

    // Deduct entry fee
    const debited = await debitCoins(entryFee, TransactionSource.GAME);
    if (!debited) {
      setSpinning(false);
      setToast({ type: 'error', text: 'Error executing transaction. Please refresh and try again.' });
      return;
    }

    // Roll based on sector probabilities
    const random = Math.random();
    let cumulative = 0;
    let selectedIndex = 0;

    for (let i = 0; i < SECTORS.length; i++) {
      cumulative += SECTORS[i].probability;
      if (random <= cumulative) {
        selectedIndex = i;
        break;
      }
    }

    const selectedPrize = SECTORS[selectedIndex];
    const sectorAngle = 360 / SECTORS.length;
    // Align so selected prize is centered at the top indicator (which represents 270 deg of circle normally, 
    // but spinning the wheel clockwise requires offset: 360 - index * sectorAngle - target offset)
    const baseRotations = 5 * 360; // 5 full turns
    const targetAngle = 360 - (selectedIndex * sectorAngle) - (sectorAngle / 2);
    const finalRotation = rotation + baseRotations + targetAngle;

    setRotation(finalRotation);

    // Wait for the transition to finish
    setTimeout(async () => {
      setSpinning(false);
      setPrize(selectedPrize);

      const res = await submitGameScore(GameType.SPIN_WHEEL, selectedPrize.value, selectedPrize.value);
      if (res.success) {
        setToast({ type: 'success', text: res.message });
      } else {
        setToast({ type: 'error', text: res.message });
      }
    }, 4000);
  };

  return (
    <div className="bg-[#1a1c24] border border-[#2b303d] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl max-w-md mx-auto">
      {/* Absolute background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <h2 className="text-xl font-bold text-white text-center mb-1 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
        Lucky Wheel Spin
      </h2>
      <p className="text-xs text-gray-400 text-center mb-6">Spin the premium neon wheel to multiply your digital coins!</p>

      {/* Wheel Visual Arena */}
      <div className="relative w-72 h-72 mx-auto my-4 flex items-center justify-center">
        {/* Needle pointer indicator */}
        <div className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 z-30 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-rose-500" />
          <div className="w-3 h-3 bg-white rounded-full absolute top-[-6px] left-1/2 transform -translate-x-1/2 shadow-inner" />
        </div>

        {/* Wheel body structure */}
        <div 
          ref={wheelRef}
          style={{ 
            transform: `rotate(${rotation}deg)`, 
            transition: spinning ? 'transform 4s cubic-bezier(0.25, 1, 0.5, 1)' : 'none' 
          }}
          className="w-full h-full rounded-full border-8 border-slate-800 shadow-2xl overflow-hidden relative z-10 bg-slate-900 flex items-center justify-center pointer-events-none"
        >
          {/* Inner Pie Segments rendering */}
          {SECTORS.map((sector, idx) => {
            const rotAngle = idx * (360 / SECTORS.length);
            const skewAngle = 90 - (360 / SECTORS.length);
            return (
              <div 
                key={idx}
                style={{ 
                  transform: `rotate(${rotAngle}deg) skewY(-${skewAngle}deg)`,
                  backgroundColor: sector.color,
                  transformOrigin: '0% 0%'
                }}
                className={`absolute top-1/2 left-1/2 w-[250%] h-[250%] opacity-90 border-r border-t border-slate-950/20`}
              />
            );
          })}

          {/* Texts overlaying segments */}
          {SECTORS.map((sector, idx) => {
            const angle = (idx * 360 / SECTORS.length) + (180 / SECTORS.length);
            return (
              <div
                key={idx}
                style={{
                  transform: `rotate(${angle}deg) translateY(-85px)`,
                  transformOrigin: 'center center'
                }}
                className="absolute text-[10px] font-black text-white tracking-wider filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] flex flex-col items-center gap-1 uppercase"
              >
                <Coins className="w-3.5 h-3.5 text-yellow-300" />
                {sector.value === 0 ? 'FAIL' : `${sector.value}`}
              </div>
            );
          })}

          {/* Golden Center Core Hub */}
          <div className="absolute w-12 h-12 bg-slate-950 rounded-full z-20 flex items-center justify-center border-4 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <div className="w-4 h-4 bg-amber-400 rounded-full animate-ping opacity-75 absolute" />
            <div className="w-5 h-5 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full z-10" />
          </div>
        </div>
      </div>

      {/* Controller Buttons */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {cooldownLeft > 0 ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2 text-amber-400 text-sm font-medium w-full justify-center animate-pulse">
            <Clock className="w-4 h-4 shrink-0" />
            Cooldown: Next spin available in {cooldownLeft}s
          </div>
        ) : (
          <button
            id="spin_button_wheel"
            disabled={spinning}
            onClick={handleSpin}
            className={`w-full py-3.5 px-6 rounded-xl text-white font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              spinning 
                ? 'bg-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer'
            }`}
          >
            <Play className={`w-5 h-5 fill-current ${spinning ? 'animate-spin' : ''}`} />
            {spinning ? 'Wheel is spinning...' : 'SPIN FOR REWARDS (20 Coins)'}
          </button>
        )}
      </div>

      {/* Success Modal / Toast Dialog */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {toast.type === 'success' ? (
              <Sparkles className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span className="font-medium">{toast.text}</span>
            <button 
              onClick={() => setToast(null)} 
              className="ml-auto hover:opacity-80 font-bold px-1.5 py-0.5 rounded transition-all"
            >
              okay
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
