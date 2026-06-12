/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { useRewardEngine } from '../lib/store';
import { Play, Sparkles, Clock, CheckCircle2, ShieldAlert, Coins, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AD_REWARD_DELAY = 10000; // 10 seconds watching delay (conforms to AD_WAIT_TIME = 10)
const AD_COOLDOWN = 5000; // 5 seconds mandatory cooldown (conforms to COOLDOWN_SECONDS = 5)
const REWARD_VALUE = 10; // Conforms to 10 Coins Per Ad reward

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
  
  // States: 'ready' | 'loading' | 'claimable' | 'rewarded' | 'cooldown'
  const [status, setStatus] = useState<'ready' | 'loading' | 'claimable' | 'rewarded' | 'cooldown'>('ready');
  const [loadSecondsLeft, setLoadSecondsLeft] = useState(10);
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
        
        // Complete clean state reset after cooldown expires
        setLoadSecondsLeft(10);
        isClickingRef.current = false;
        localStorage.removeItem('ad_verification_start');
        localStorage.removeItem('ad_verification_status');
        setCooldownSecondsLeft(5);
        setStatus('ready');
        setToast(null);
      } else {
        setStatus('cooldown');
        setCooldownSecondsLeft(Math.ceil(leftMs / 1000));
      }
    };

    tick(); // Execute initial check
    cooldownIntervalRef.current = setInterval(tick, 500);
  };

  // Active validation & recovery synchronizer (eliminates timer pausing bugs)
  const startVerificationCountdown = (startTime: number) => {
    if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const left = Math.max(0, Math.ceil((AD_REWARD_DELAY - elapsed) / 1000));

      setLoadSecondsLeft(left);

      // Critical debug logging
      console.log("Reward Status: loading");
      console.log("Verification Elapsed:", elapsed);
      console.log("Claim Button Enabled: false");

      if (elapsed >= AD_REWARD_DELAY) {
        if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
        setStatus('claimable');
        localStorage.setItem('ad_verification_status', 'claimable');
        
        console.log("Reward Status: claimable");
        console.log("Verification Elapsed:", elapsed);
        console.log("Claim Button Enabled: true");

        setToast({
          type: 'success',
          message: 'Verification Complete! Click the "CLAIM 10 COINS" button below.'
        });
      }
    };

    tick();
    loadIntervalRef.current = setInterval(tick, 250);
  };

  const syncStateFromStorage = () => {
    // If status is "rewarded", hold celebratory view state
    if (status === 'rewarded') return;

    // 1. Check if cooldown timer is active
    const savedCooldownUntil = localStorage.getItem('ad_cooldown_until');
    if (savedCooldownUntil) {
      const expiresAt = parseInt(savedCooldownUntil, 10);
      if (expiresAt > Date.now()) {
        setStatus('cooldown');
        startCooldownTimer(expiresAt);
        return; // Cooldown takes absolute precedence
      } else {
        localStorage.removeItem('ad_cooldown_until');
        // Complete clean state reset if cooldown has already expired
        setLoadSecondsLeft(10);
        isClickingRef.current = false;
        localStorage.removeItem('ad_verification_start');
        localStorage.removeItem('ad_verification_status');
        setCooldownSecondsLeft(5);
        setStatus('ready');
      }
    }

    // 2. Check if a verification is currently ongoing or claimable
    const savedStartStr = localStorage.getItem('ad_verification_start');
    const savedStatus = localStorage.getItem('ad_verification_status');

    if (savedStartStr) {
      const start = parseInt(savedStartStr, 10);
      const now = Date.now();
      const elapsed = now - start;

      console.log("Reward Status:", savedStatus || "loading");
      console.log("Verification Elapsed:", elapsed);

      if (elapsed >= AD_REWARD_DELAY) {
        // Verification completes fully, unlock CLAIM button directly
        setStatus('claimable');
        localStorage.setItem('ad_verification_status', 'claimable');
        setLoadSecondsLeft(0);
        if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
        console.log("Claim Button Enabled: true");
      } else {
        // Continue tracking elapsed countdown
        setStatus('loading');
        localStorage.setItem('ad_verification_status', 'loading');
        const left = Math.max(0, Math.ceil((AD_REWARD_DELAY - elapsed) / 1000));
        setLoadSecondsLeft(left);
        console.log("Claim Button Enabled: false");

        // Reactivate timer ticker from the persisted starting timestamp
        startVerificationCountdown(start);
      }
    } else {
      // Clean stale states to ready state
      if (status !== 'rewarded' && status !== 'cooldown' && status !== 'loading' && status !== 'claimable') {
        setStatus('ready');
      }
    }
  };

  // Main lifecycle check: mounting, resuming, and visual synchronization
  useEffect(() => {
    // Synchronize states on mount
    syncStateFromStorage();

    // Tab Visibility Focus Sync - Refreshes timer state dynamically if tab is returned to
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab returned - executing focus recovery logic...");
        syncStateFromStorage();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Explicit state change debugging log
  useEffect(() => {
    console.log("Reward Status Changed:", status);
  }, [status]);

  // Launch transmission stream click event
  const handleLaunchAdStream = () => {
    if (isClickingRef.current || status !== 'ready' || !user) return;

    // Strict validation check of daily limit block before proceeding
    const todayStr = new Date().toISOString().split('T')[0];
    let adsWatchedToday = user.adsWatchedToday || 0;
    const lastAdWatchedAt = user.lastAdWatchedAt || '';
    if (lastAdWatchedAt && lastAdWatchedAt.split('T')[0] !== todayStr) {
      adsWatchedToday = 0;
    }

    if (adsWatchedToday >= 40) {
      setToast({
        type: 'error',
        message: 'Daily Sponsor limit reached! You can watch a maximum of 40 ads per day.'
      });
      return;
    }

    isClickingRef.current = true;
    setToast(null);

    const startTimestamp = Date.now();
    localStorage.setItem('ad_verification_start', startTimestamp.toString());
    localStorage.setItem('ad_verification_status', 'loading');

    // Enter Loading state and initialize 10s timer
    setStatus('loading');
    setLoadSecondsLeft(10);

    // Open Monetag Smartlink Direct Campaign URL in a new sandboxed tab
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
          message: 'Monetag Ad stream started in a new tab! Keep this window open for 10s.'
        });
      }
    } catch (popupErr) {
      console.warn('Popup blocked:', popupErr);
    }

    startVerificationCountdown(startTimestamp);
    isClickingRef.current = false;
  };

  // Securely request coins registration upon video finish checks
  const claimCoinsRewardTransaction = async () => {
    if (status !== 'claimable') {
      console.log("Claim aborted: status is not claimable", status);
      return; // Strict prevent duplicate claims
    }

    if (!user) {
      setToast({
        type: 'error',
        message: 'You must be signed in to claim rewards.'
      });
      return;
    }

    // Strict validation check of daily limit block before proceeding
    const todayStr = new Date().toISOString().split('T')[0];
    let adsWatchedToday = user.adsWatchedToday || 0;
    const lastAdWatchedAt = user.lastAdWatchedAt || '';
    if (lastAdWatchedAt && lastAdWatchedAt.split('T')[0] !== todayStr) {
      adsWatchedToday = 0;
    }

    if (adsWatchedToday >= 40) {
      setToast({
        type: 'error',
        message: 'Daily Sponsor limit reached! You can watch a maximum of 40 ads per day.'
      });
      return;
    }

    try {
      // Execute live cloud / mock reward claim against secure database service layers
      const result = await watchAd('ad_instant');
      
      if (result.success) {
        // Clear verification storage to prevent restore or multi-claims
        localStorage.removeItem('ad_verification_start');
        localStorage.removeItem('ad_verification_status');

        // Enter stateful Reward success state
        setStatus('rewarded');
        playClaimSound();
        triggerConfettiExplosion();
        setToast({
          type: 'success',
          message: `🎉 +10 COINS ADDED TO YOUR WALLET`
        });

        // Trigger cooldown clock after brief success display
        setTimeout(() => {
          const cooldownExpiration = Date.now() + AD_COOLDOWN;
          localStorage.setItem('ad_cooldown_until', cooldownExpiration.toString());
          startCooldownTimer(cooldownExpiration);
        }, 2200); // Celebratory hold
      } else {
        setStatus('claimable'); // Allow retry on transient error
        setToast({
          type: 'error',
          message: result.message || 'Ad verification failure. Try claiming again.'
        });
      }
    } catch (err: any) {
      setStatus('claimable'); // Allow retry on timeout
      setToast({
        type: 'error',
        message: 'Reward verified exception. Transaction timed out. Try claiming again.'
      });
    }
  };

  // Active status color states styling helper maps
  const getButtonStateUI = () => {
    switch (status) {
      case 'ready':
        return {
          bg: 'bg-emerald-500 hover:bg-emerald-400 border-emerald-300 text-white font-black hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.55)] hover:shadow-[0_0_30px_rgba(52,211,153,0.85)] tracking-wider',
          label: `🎁 WATCH AD • GET ${REWARD_VALUE} COINS`,
          icon: <Play className="w-6 h-6 text-white fill-white animate-pulse shrink-0" />
        };
      case 'loading':
        return {
          bg: 'bg-slate-800 border-slate-750 text-slate-500 cursor-not-allowed opacity-[0.85]',
          label: `⏳ VERIFYING... ${loadSecondsLeft}s`,
          icon: <Loader2 className="w-5 h-5 animate-spin text-emerald-400 shrink-0" />
        };
      case 'claimable':
        return {
          bg: 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-[0.70]',
          label: `⏳ VERIFICATION COMPLETE`,
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        };
      case 'rewarded':
        return {
          bg: 'bg-emerald-950 border-emerald-500 text-emerald-300 font-extrabold cursor-default shadow-[0_0_25px_rgba(16,185,129,0.55)]',
          label: `🎉 +10 COINS ADDED`,
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
        };
      case 'cooldown':
        return {
          bg: 'bg-slate-900/90 border-slate-800 text-slate-500 cursor-not-allowed',
          label: `⏱ NEXT AD AVAILABLE IN ${cooldownSecondsLeft}s`,
          icon: <Clock className="w-5 h-5 text-amber-500 animate-[spin_10s_linear_infinite] shrink-0" />
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
          <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">Daily Limit: 40 Ads</span>
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
              <span>{Math.round(((10 - loadSecondsLeft) / 10) * 100)}% Verified</span>
            </div>
            {/* Linear Progress Bar */}
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-[1px]">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 rounded-full"
                animate={{ width: `${((10 - loadSecondsLeft) / 10) * 100}%` }}
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
      <div className="relative flex flex-col gap-3">
        <button
          id="instant_reward_ad_btn"
          onClick={handleLaunchAdStream}
          disabled={status !== 'ready'}
          className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all border outline-none ${currentUI.bg}`}
        >
          {currentUI.icon}
          <span>{currentUI.label}</span>
        </button>

        {/* Claim button displayed permanently, activated only when status is claimable */}
        <button
          id="claim_rewards_ad_btn"
          disabled={status !== 'claimable'}
          onClick={claimCoinsRewardTransaction}
          className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all border outline-none duration-300 ${
            status === 'claimable'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.65)] hover:shadow-[0_0_35px_rgba(251,191,36,0.95)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer animate-pulse'
              : status === 'rewarded'
                ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400 cursor-not-allowed opacity-80'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed select-none'
          }`}
        >
          {status === 'claimable' ? (
            <>
              <Sparkles className="w-6 h-6 text-slate-950 fill-slate-950 animate-spin shrink-0" />
              <span>✅ CLAIM 10 COINS</span>
            </>
          ) : status === 'rewarded' ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>🎉 +10 COINS CLAIMED!</span>
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 text-slate-600 shrink-0" />
              <span>🔒 CLAIM 10 COINS (LOCKED)</span>
            </>
          )}
        </button>

        {/* Cooldown Percentage progress bar overlay */}
        {status === 'cooldown' && (
          <div className="absolute bottom-0 inset-x-4 h-1 rounded-full overflow-hidden z-10 bg-slate-950/65">
            <motion.div 
              className="h-full bg-amber-500"
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
