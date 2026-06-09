/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useRewardEngine, DEFAULT_ADS } from '../lib/store';
import { AdOffer } from '../types';
import { Play, Sparkles, Clock, MonitorPlay, AlertCircle, CheckCircle, ShieldCheck, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RewardButton from './RewardButton';

export default function AdCenter() {
  const { watchAd, cooldowns } = useRewardEngine();
  const [activeAd, setActiveAd] = useState<AdOffer | null>(null);
  const [adTimer, setAdTimer] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);
  const [adStage, setAdStage] = useState<'video' | 'complete'>('video');
  const [cooldownTimers, setCooldownTimers] = useState<{ [key: string]: number }>({});
  const [toast, setToast] = useState<string | null>(null);

  // Monitor cooldown remaining times in real time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const nextTimers: { [key: string]: number } = {};

      DEFAULT_ADS.forEach((offer) => {
        const endTime = cooldowns[`cooldown_${offer.id}`] || 0;
        if (endTime > now) {
          nextTimers[offer.id] = Math.ceil((endTime - now) / 1000);
        } else {
          nextTimers[offer.id] = 0;
        }
      });

      setCooldownTimers(nextTimers);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldowns]);

  // Handle countdown during ad viewing state
  useEffect(() => {
    if (!countdownActive || adTimer <= 0) return;

    const count = setInterval(() => {
      setAdTimer((prev) => {
        if (prev <= 1) {
          clearInterval(count);
          setAdStage('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(count);
  }, [countdownActive, adTimer]);

  const handleLaunchAd = (offer: AdOffer) => {
    const cd = cooldownTimers[offer.id] || 0;
    if (cd > 0) return;

    setActiveAd(offer);
    setAdTimer(10); // 10 seconds of high-fidelity simulated interstitial preview
    setAdStage('video');
    setCountdownActive(true);
    setToast(null);
  };

  const handleClaimReward = async () => {
    if (!activeAd) return;

    const result = await watchAd(activeAd.id);
    if (result.success) {
      setToast(result.message);
    } else {
      setToast('Claim Error: Ad connection timed out.');
    }

    setCountdownActive(false);
    setActiveAd(null);
  };

  return (
    <div className="bg-[#12141c] border border-[#232835] rounded-3xl p-6 relative overflow-hidden shadow-2xl max-w-xl mx-auto">
      {/* Background decoration blur overlay */}
      <div className="absolute top-0 left-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Banner info */}
      <div className="flex items-center gap-3.5 mb-5 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
          <MonitorPlay className="w-5.5 h-5.5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">Sponsor Ad Hub</h2>
          <p className="text-[11px] text-gray-400">Boost your balance by completing quick sponsor activities and videos</p>
        </div>
      </div>

      {/* Primary Mandatory Cooldown Instant Reward Button */}
      <div className="mb-6">
        <RewardButton />
      </div>

      {/* Campaign offer grids */}
      <div className="mt-4 border-t border-slate-800/80 pt-5">
        <h4 className="text-xs font-black text-slate-400 mb-3.5 uppercase tracking-wider flex items-center gap-1.5">
          <Video className="w-4 h-4 text-emerald-400" /> Additional Sponsor Campaigns
        </h4>
      </div>
      <div className="flex flex-col gap-3.5">
        {DEFAULT_ADS.map((offer) => {
          const isCooldown = (cooldownTimers[offer.id] || 0) > 0;
          const coolTime = cooldownTimers[offer.id] || 0;

          return (
            <div
              key={offer.id}
              className={`p-4 border rounded-2xl flex justify-between items-center transition-all ${
                isCooldown
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                  : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/30'
              }`}
            >
              <div className="min-w-0 pr-3">
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {offer.type === 'rewarded' ? 'Rewarded Video' : 'Survey Booster'}
                </span>
                <h3 className="text-xs font-bold text-white mt-2 truncate">{offer.title}</h3>
                <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  Cooldown: {offer.cooldownSeconds}s after claim
                </p>
              </div>

              <div className="text-right shrink-0 flex flex-col items-end gap-2">
                <span className="text-sm font-black text-yellow-400 font-mono flex items-center gap-0.5">
                  +{offer.rewardValue}
                  <span className="text-[10px] text-gray-400 font-bold">COINS</span>
                </span>

                {isCooldown ? (
                  <div className="px-3 py-1.5 bg-slate-800 text-[10px] text-slate-400 font-bold rounded-lg flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500 animate-spin" />
                    {coolTime}s left
                  </div>
                ) : (
                  <button
                    id={`launch_ad_btn_${offer.id}`}
                    onClick={() => handleLaunchAd(offer)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.02] cursor-pointer text-slate-950 font-black text-[10px] uppercase rounded-lg tracking-wider flex items-center gap-1 shadow transition-transform"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Watch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual reward claim confirmation toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-5 p-3 font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center justify-center gap-1.5 text-center"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Full Interstitial Ad Simulator Screen Overlay Modal */}
      <AnimatePresence>
        {activeAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <div className="bg-[#12141c] border border-slate-850 rounded-3xl p-6 max-w-sm w-full relative overflow-hidden shadow-2xl flex flex-col items-center">
              {/* Background scanning light laser sweep animation */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 animate-pulse" />

              {/* Title Header */}
              <div className="flex items-center gap-2 mb-3.5 text-xs text-gray-400">
                <Video className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold tracking-wider uppercase">Sponsor Transmission Stream</span>
              </div>

              {/* Central Video Graphic Frame Block */}
              <div className="w-full aspect-video rounded-2xl bg-gradient-to-tr from-slate-950 via-[#181a24] to-slate-900 border-2 border-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner my-3">
                {/* Simulated game play screen visuals in loops */}
                {adStage === 'video' ? (
                  <div className="text-center">
                    <p className="text-[11px] text-gray-500 font-bold uppercase animate-pulse">
                      SPONSOR PROMOTIONAL CLIP
                    </p>
                    {/* Pulsing gradient orb */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 via-orange-400 to-yellow-300 mx-auto my-3 animate-ping opacity-60 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <p className="text-xs text-gray-300 font-medium px-4 truncate">
                      {activeAd.title}
                    </p>
                  </div>
                ) : (
                  <div className="text-center animate-bounce">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-400">
                      <CheckCircle className="w-6 h-6 stroke-[3px]" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Activity Finished!</h4>
                    <p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> SECURE LEDGER APPROVED
                    </p>
                  </div>
                )}
              </div>

              {/* Action instructions under video */}
              <div className="text-center mt-3 w-full">
                {adStage === 'video' ? (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400">
                      Rewards unlocked in <span className="text-amber-400 font-bold text-sm font-mono">{adTimer}</span> seconds...
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1">Please do not exit or refresh the window.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full animate-fade-in">
                    <p className="text-xs text-gray-300 font-semibold mb-2">
                      Watch confirmed! Claim reward of <span className="text-yellow-400 font-bold">+{activeAd.rewardValue} Coins</span> immediately.
                    </p>
                    <button
                      id="claim_ad_coins_btn"
                      onClick={handleClaimReward}
                      className="w-full py-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 hover:brightness-110 shadow-lg text-slate-950 font-black text-xs uppercase rounded-xl tracking-widest cursor-pointer"
                    >
                      CLAIM REWARD COINS!
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
