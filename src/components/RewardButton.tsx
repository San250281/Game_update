/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { useRewardEngine } from '../lib/store';
import { Play, Sparkles, Clock, CheckCircle2, ShieldAlert, Coins, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AD_REWARD_DELAY = 15000; // 15 seconds watching delay
const AD_COOLDOWN = 5000; // 5 seconds mandatory cooldown
const REWARD_VALUE = 25;

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

export default function RewardButton() {
  const { watchAd, user } = useRewardEngine();
  
  // States: 'ready' | 'loading' | 'rewarded' | 'cooldown'
  const [status, setStatus] = useState<'ready' | 'loading' | 'rewarded' | 'cooldown'>('ready');
  const [loadSecondsLeft, setLoadSecondsLeft] = useState(15);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(5);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [monetagUrl, setMonetagUrl] = useState('https://www.profitablecpmrate.com/direct-monetag-smartlink');

  // Multi-click / Spam prevention refs
  const isClickingRef = useRef(false);
  const loadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sound effect generator using Web Audio API
  const playClaimSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };
      
      const now = audioCtx.currentTime;
      playTone(523.25, now, 0.12); // C5
      playTone(659.25, now + 0.08, 0.12); // E5
      playTone(783.99, now + 0.16, 0.28); // G5 (arcade coin chord)
    } catch (err) {
      console.warn('Audio Context sound play blocked by browser policy:', err);
    }
  };

  // Confetti Particle Explosion Burst Generator
  const triggerConfettiExplosion = () => {
    const palette = ['#10B981', '#34D399', '#059669', '#FBBF24', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];
    const newParticles: ConfettiParticle[] = Array.from({ length: 45 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 260, // Spread outwards left & right
      y: -Math.random() * 150 - 40,   // Spread high upwards
      color: palette[Math.floor(Math.random() * palette.length)],
      size: Math.random() * 10 + 5,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
    // Auto purge particles to free memory
    setTimeout(() => {
      setParticles([]);
    }, 2100);
  };

  // Cooldown timer interval tick handoff
  const startCooldownTimer = (targetTimestamp: number) => {
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);

    const tick = () => {
      const now = Date.now();
      const leftMs = targetTimestamp - now;
      if (leftMs <= 0) {
        if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
        localStorage.removeItem('ad_cooldown_until');
        setStatus('ready');
        setCooldownSecondsLeft(5);
        setToast(null);
      } else {
        setStatus('cooldown');
        setCooldownSecondsLeft(Math.ceil(leftMs / 1000));
      }
    };

    tick(); // Execute initial check
    cooldownIntervalRef.current = setInterval(tick, 500);
  };

  // Main lifecycle check: mounting, resuming, and visual synchronization
  useEffect(() => {
    // 1. Restore stale cooldown timer after accidental page load/tab return
    const savedCooldownUntil = localStorage.getItem('ad_cooldown_until');
    if (savedCooldownUntil) {
      const expiresAt = parseInt(savedCooldownUntil, 10);
      if (expiresAt > Date.now()) {
        setStatus('cooldown');
        startCooldownTimer(expiresAt);
      } else {
        localStorage.removeItem('ad_cooldown_until');
      }
    }

    // 2. Tab Visibility Focus Sync - Refreshes timer state dynamically if tab was minimized
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const checkCooldown = localStorage.getItem('ad_cooldown_until');
        if (checkCooldown) {
          const expiresAt = parseInt(checkCooldown, 10);
          if (expiresAt > Date.now()) {
            startCooldownTimer(expiresAt);
          } else {
            if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
            localStorage.removeItem('ad_cooldown_until');
            setStatus('ready');
            setCooldownSecondsLeft(5);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Launch transmission stream click event
  const handleLaunchAdStream = () => {
    if (isClickingRef.current || status !== 'ready' || !user) return;
    
    isClickingRef.current = true;
    setToast(null);

    // 1. Enter Loading state and initialize 15s timer
    setStatus('loading');
    setLoadSecondsLeft(15);

    // 2. Open Monetag Smartlink Direct Campaign URL in a new sandboxed tab
    try {
      const openedTab = window.open(monetagUrl, '_blank', 'noopener,noreferrer');
      if (!openedTab) {
        setToast({
          type: 'info',
          message: 'Redirect Notice: Dynamic smartlink launched! Please allow popups if the tab did not load.'
        });
      } else {
        setToast({
          type: 'success',
          message: 'Monetag Ad stream started in a new tab! Keep this window open for 15s.'
        });
      }
    } catch (popupErr) {
      console.warn('Popup blocked:', popupErr);
    }

    // Timer bypass protection
    const startTimestamp = Date.now();
    const expectedEndTimestamp = startTimestamp + AD_REWARD_DELAY;

    loadIntervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTimestamp;
      const left = Math.max(0, Math.ceil((AD_REWARD_DELAY - elapsed) / 1000));

      setLoadSecondsLeft(left);

      if (elapsed >= AD_REWARD_DELAY - 100) {
        if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
        isClickingRef.current = false;
        claimCoinsRewardTransaction();
      }
    }, 250);
  };

  // Securely request coins registration upon video finish checks
  const claimCoinsRewardTransaction = async () => {
    try {
      // Execute live cloud / mock reward claim against secure database service layers
      const result = await watchAd('ad_instant');
      
      if (result.success) {
        // 1. Enter stateful Reward success state
        setStatus('rewarded');
        playClaimSound();
        triggerConfettiExplosion();
        setToast({
          type: 'success',
          message: `Awesome! Earned ${REWARD_VALUE} Coins successfully in your balance.`
        });

        // 2. Trigger the mandatory five seconds countdown lock
        setTimeout(() => {
          const cooldownExpiration = Date.now() + AD_COOLDOWN;
          localStorage.setItem('ad_cooldown_until', cooldownExpiration.toString());
          startCooldownTimer(cooldownExpiration);
        }, 2200); // Hold celebration visual context briefly
      } else {
        setStatus('ready');
        setToast({
          type: 'error',
          message: result.message || 'Ad verification failure. Try reloading.'
        });
      }
    } catch (err: any) {
      setStatus('ready');
      setToast({
        type: 'error',
        message: 'Reward verified exception. Transaction timed out.'
      });
    }
  };

  // Active status color states styling helper maps
  const getButtonStateUI = () => {
    switch (status) {
      case 'ready':
        return {
          bg: 'bg-gradient-to-r from-amber-550 via-emerald-555 to-teal-550 border-amber-400 hover:brightness-110 active:scale-98 text-slate-950 font-black shadow-[0_4px_20px_rgba(16,185,129,0.3)]',
          label: `Watch Ad & Earn ${REWARD_VALUE} Coins`,
          icon: <Play className="w-5 h-5 fill-current animate-pulse" />
        };
      case 'loading':
        return {
          bg: 'bg-slate-850 border-slate-750 text-slate-400 cursor-not-allowed',
          label: `Ad Loading... ${loadSecondsLeft}s`,
          icon: <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        };
      case 'rewarded':
        return {
          bg: 'bg-emerald-900 border-emerald-500 text-emerald-300 font-extrabold cursor-default shadow-[0_0_25px_rgba(16,185,129,0.55)]',
          label: `+${REWARD_VALUE} Coins Added!`,
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-300" />
        };
      case 'cooldown':
        return {
          bg: 'bg-slate-900/90 border-slate-800 text-slate-500 cursor-not-allowed',
          label: `Next Ad In ${cooldownSecondsLeft}s`,
          icon: <Clock className="w-5 h-5 text-amber-500 animate-[spin_10s_linear_infinite]" />
        };
    }
  };

  const currentUI = getButtonStateUI();

  return (
    <div id="reward_button_container" className="bg-[#181d29] border border-[#2b3345] rounded-3xl p-5 md:p-6 w-full max-w-xl mx-auto shadow-xl relative overflow-hidden flex flex-col gap-4 text-slate-200">
      
      {/* Absolute Confetti Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{ 
                x: p.x, 
                y: p.y, 
                scale: [0.2, 1.2, p.size / 6, 0], 
                rotate: p.rotation + 720,
                opacity: [1, 1, 0.9, 0] 
              }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute"
              style={{ 
                backgroundColor: p.color, 
                width: p.size, 
                height: Math.random() > 0.4 ? p.size : p.size / 2, // variable aspect rects
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                left: '50%',
                top: '55%',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              Instant Monetag Booster
              <span className="text-[9px] bg-red-500/20 text-red-400 font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Hot</span>
            </h3>
            <p className="text-[11px] text-gray-400">Watch the exclusive transmission and earn rewards with absolute ease.</p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs text-amber-400 font-extrabold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 fill-amber-500" />
            +{REWARD_VALUE} Coins
          </span>
          <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">No Limits</span>
        </div>
      </div>

      {/* Campaign URL Configuration Tool Accordion for Admins/Advanced Users */}
      {user?.isAdmin && (
        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl flex flex-col gap-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            ⚙️ Admin Monetag Smartlink Redirect Routing
          </span>
          <input 
            type="text" 
            value={monetagUrl}
            onChange={(e) => setMonetagUrl(e.target.value)}
            placeholder="Paste your Monetag smartlink direct CPM link here"
            className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg p-2 text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      )}

      {/* Simulated Active Screen Progress visual when watching */}
      {status === 'loading' && (
        <div id="monetag_progress_screen" className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 flex flex-col items-center gap-3.5 text-center animate-pulse">
          <div className="relative flex items-center justify-center">
            {/* Pulsing visual radial glow */}
            <div className="absolute w-12 h-12 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" />
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black">
              {loadSecondsLeft}s
            </div>
          </div>
          
          <div className="w-full max-w-sm">
            <div className="flex justify-between text-[10px] text-slate-500 font-black mb-1.5 uppercase">
              <span>Establishing Smartlink Connection</span>
              <span>{Math.round(((15 - loadSecondsLeft) / 15) * 100)}% Verified</span>
            </div>
            {/* Linear Progress Bar */}
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-[1px]">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 rounded-full"
                animate={{ width: `${((15 - loadSecondsLeft) / 15) * 100}%` }}
                transition={{ duration: 0.35, ease: 'linear' }}
              />
            </div>
          </div>
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-spin" /> Do not close or refresh this tab or risk losing coin distribution.
          </p>
        </div>
      )}

      {/* Interactive Main Button State trigger */}
      <div className="relative">
        <button
          id="instant_reward_ad_btn"
          onClick={handleLaunchAdStream}
          disabled={status !== 'ready'}
          className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all border outline-none ${currentUI.bg}`}
        >
          {currentUI.icon}
          <span>{currentUI.label}</span>
        </button>

        {/* Cooldown Percentage progress bar overlay */}
        {status === 'cooldown' && (
          <div className="absolute bottom-0 inset-x-4 h-1 rounded-full overflow-hidden z-10 bg-slate-950/65">
            <motion.div 
              className="h-full bg-amber-550"
              initial={{ width: `${(cooldownSecondsLeft / 5) * 100}%` }}
              animate={{ width: `${(cooldownSecondsLeft / 5) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        )}
      </div>

      {/* Internal beautiful Toasts inside components */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3 rounded-2xl flex items-start gap-2.5 text-xs font-bold border ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : toast.type === 'error'
                  ? 'bg-red-500/10 border-red-500/25 text-red-400'
                  : 'bg-blue-500/10 border-blue-500/25 text-cyan-405'
            }`}
          >
            {toast.type === 'error' ? (
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-400" />
            )}
            <div className="flex-1">
              {toast.message}
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-[10px] opacity-60 hover:opacity-100 uppercase font-black"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
