/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useRewardEngine, DEFAULT_ADS } from '../lib/store';
import { AdOffer } from '../types';
import { Play, Sparkles, Clock, MonitorPlay, AlertCircle, CheckCircle, ShieldCheck, Video, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RewardButton from './RewardButton';

export default function AdCenter() {
  const { watchAd, cooldowns, user } = useRewardEngine();
  const [activeAd, setActiveAd] = useState<AdOffer | null>(null);
  const [adTimer, setAdTimer] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);
  const [adStage, setAdStage] = useState<'video' | 'complete'>('video');
  const [cooldownTimers, setCooldownTimers] = useState<{ [key: string]: number }>({});
  const [toast, setToast] = useState<string | null>(null);
  const [selectedSurveyOption, setSelectedSurveyOption] = useState<string | null>(null);

  // Dynamically load Monetag scripts ONLY when on this tab, and clean them up on unmount
  useEffect(() => {
    const scriptsToLoad = [
      { src: 'https://n6wxm.com/vignette.min.js', zone: '11126645' },
      { src: 'https://n6wxm.com/vignette.min.js', zone: '11126633' },
      { src: 'https://nap5k.com/tag.min.js', zone: '11126625' },
      { src: 'https://quge5.com/88/tag.min.js', zone: '248180', async: true, cfasync: 'false' },
    ];

    const loadedScripts: HTMLScriptElement[] = [];

    scriptsToLoad.forEach((item) => {
      // Avoid duplicating the script if it was somehow already loaded
      const querySelector = `script[src="${item.src}"][data-zone="${item.zone}"]`;
      if (document.querySelector(querySelector)) return;

      const script = document.createElement('script');
      script.src = item.src;
      script.dataset.zone = item.zone;
      if (item.async) {
        script.async = true;
      }
      if (item.cfasync) {
        script.setAttribute('data-cfasync', item.cfasync);
      }
      script.className = 'monetag-dynamic-ad-script';
      
      document.body.appendChild(script);
      loadedScripts.push(script);
    });

    return () => {
      // Clean up the scripts on component unmount
      loadedScripts.forEach((script) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);

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

    // Direct Lazy Loading of Monetag Ads on WATCH click (Point 2 & 9)
    try {
      const monetagDomains = ['https://n6wxm.com/vignette.min.js', 'https://quge5.com/88/tag.min.js'];
      monetagDomains.forEach((src) => {
        if (!document.querySelector(`script[src="${src}"]`)) {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.dataset.zone = src.includes('vignette') ? '11126645' : '248180';
          script.className = 'monetag-lazy-ad-script';
          document.head.appendChild(script);
        }
      });
    } catch (e) {
      console.error('Lazy loading Monetag script failed:', e);
    }

    setActiveAd(offer);
    setAdTimer(20); // 20 Second Countdown Starts (Point 3 Expected Flow)
    setAdStage('video');
    setCountdownActive(true);
    setToast(null);
    setSelectedSurveyOption(null);
  };

  const handleClaimReward = async () => {
    if (!activeAd) return;

    try {
      const result = await watchAd(activeAd.id);
      if (result.success) {
        setToast(result.message);
      } else {
        setToast(result.message || 'Claim Error: Ad connection timed out.');
      }
    } catch (err: any) {
      console.error(err);
      setToast('Error claiming coins from ledger.');
    }

    setCountdownActive(false);
    setActiveAd(null);
    setSelectedSurveyOption(null);
  };

  const renderAdGraphicContent = () => {
    if (!activeAd) return null;

    switch (activeAd.id) {
      case 'ad_instant':
        return (
          <div className="text-center w-full h-full flex flex-col justify-between p-2">
            <div>
              <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest animate-pulse">
                Monetag Premium Smartlink Stream
              </p>
            </div>
            <div className="my-auto flex flex-col items-center justify-center">
              <motion.div
                animate={{ 
                  rotateY: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-500 flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.5)] border-2 border-yellow-200 mb-3"
              >
                <Coins className="w-9 h-9 text-yellow-950 stroke-[2.5]" />
              </motion.div>
              <p className="text-[11px] font-black text-white px-2 mt-1 drop-shadow">
                DIRECT MONETAG CPM BOOST ACTIVE
              </p>
              <p className="text-[9px] text-slate-400 mt-1 max-w-xs leading-normal">
                Redirecting secure smartlink traffic to target campaigns.
              </p>
            </div>
            <div className="text-[8px] text-slate-500 font-mono tracking-wider">
              CONN: SECURE_MONETAG_STREAM || CPM: +$4.85
            </div>
          </div>
        );
      case 'ad_1':
        return (
          <div className="text-center w-full h-full flex flex-col justify-between p-2">
            <div>
              <p className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest animate-pulse">
                Arcade Slot Casino Sponsor
              </p>
            </div>
            <div className="my-auto flex flex-col items-center justify-center relative">
              <div className="relative w-16 h-16 flex items-center justify-center mb-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-dashed border-purple-500 opacity-60"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute w-12 h-12 rounded-full border-4 border-dotted border-amber-400 opacity-80"
                />
                <span className="text-2xl z-10 filter drop-shadow">🎡</span>
              </div>
              <p className="text-[11px] font-black text-white px-2 uppercase">
                Spin to double your coin payouts
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                Watch spin combinations resolve in background.
              </p>
            </div>
            <div className="text-[8px] text-slate-500 font-mono tracking-wider">
              JACKPOT_MULTIPLIER: x100 || SYSTEM: SEEDED
            </div>
          </div>
        );
      case 'ad_2':
        return (
          <div className="text-center w-full h-full flex flex-col justify-between p-2">
            <div>
              <p className="text-[10px] text-rose-400 font-extrabold uppercase tracking-widest animate-pulse">
                Casual Gaming Play Store Pitch
              </p>
            </div>
            <div className="my-auto flex flex-col items-center justify-center">
              <div className="w-24 h-11 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center mb-2.5">
                <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500" />
                <motion.div
                  animate={{ x: [-80, 100] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-1 w-2.5 h-2.5 bg-rose-500 rounded"
                />
                <motion.div
                  animate={{ y: [0, -18, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-1 left-8 w-3 h-3 text-lg"
                >
                  ⚔️
                </motion.div>
              </div>
              <p className="text-[11px] font-black text-white px-2">
                INSTALL PIXELKNIGHT & CLAIM COINS
              </p>
              <button className="mt-1 px-3 py-0.5 text-[8px] bg-sky-500 text-slate-950 font-black rounded-full uppercase tracking-wider scale-95 animate-pulse">
                GET IT ON GOOGLE PLAY
              </button>
            </div>
            <div className="text-[8px] text-slate-500 font-mono tracking-wider">
              SPONSOR_ID: CELL_PLAY_A1 || STATE: READY
            </div>
          </div>
        );
      case 'ad_3':
        return (
          <div className="w-full h-full flex flex-col justify-between p-2 text-left">
            <div className="text-center">
              <p className="text-[10px] text-yellow-500 font-extrabold uppercase tracking-widest animate-pulse">
                Smart Booster Poll & Survey
              </p>
            </div>
            <div className="my-auto flex flex-col items-center justify-center w-full px-2">
              <p className="text-[10px] font-black text-slate-200 text-center uppercase mb-1.5 leading-relaxed tracking-wide">
                How often do you play games on Rewardyn?
              </p>
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-[240px]">
                {['Everyday!', 'Few times/wk'].map((option) => {
                  const isSelected = selectedSurveyOption === option;
                  return (
                    <button
                      key={option}
                      onClick={() => setSelectedSurveyOption(option)}
                      className={`p-1.5 rounded-lg border text-[9px] font-bold text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 font-extrabold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-705'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {selectedSurveyOption && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[8px] text-yellow-450 font-bold mt-1.5 uppercase tracking-wider bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-900/30"
                >
                  ✓ Premium Answer Logged
                </motion.p>
              )}
            </div>
            <div className="text-[8px] text-center text-slate-500 font-mono tracking-wider">
              SURVEY_POLL_CHANNEL: SECURE_BOOSTER || HASH: SW_3
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center">
            <p className="text-[11px] text-gray-500 font-bold uppercase animate-pulse">
              SPONSOR PROMOTIONAL CLIP
            </p>
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 via-orange-400 to-yellow-300 mx-auto my-3 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white animate-spin" />
            </div>
            <p className="text-xs text-gray-300 font-medium px-4 truncate">
              {activeAd.title}
            </p>
          </div>
        );
    }
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

      {/* Daily Progress Tracker Card */}
      <div className="mb-5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1.5 font-bold text-white mb-1">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-500" />
            Daily Sponsor Rewards Left
          </div>
          <p className="text-[11px] text-zinc-400">
            Earn up to <strong className="text-emerald-400">400 Coins</strong> daily by watching sponsor streams.
          </p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-[10px] uppercase text-zinc-500 font-extrabold">Completed Today</div>
            <div className="text-sm font-black text-emerald-400">
              {user ? user.adsWatchedToday || 0 : 0} / 40 <span className="text-[10px] text-zinc-400 font-normal">Ads</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800 shrink-0" />
          <div>
            <div className="text-[10px] uppercase text-zinc-500 font-extrabold">Coins Earned</div>
            <div className="text-sm font-black text-amber-500">
              {Math.min(400, (user ? user.adsWatchedToday || 0 : 0) * 10)} / 400 <span className="text-[10px] text-zinc-400 font-normal">Coins</span>
            </div>
          </div>
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
              <div className="w-full aspect-video rounded-2xl bg-[#0d1017] border-2 border-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner my-3">
                {/* Simulated game play screen visuals in loops */}
                {adStage === 'video' ? (
                  renderAdGraphicContent()
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
