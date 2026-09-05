/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Megaphone, LayoutList, BarChart3, PlusCircle, ArrowRight, CheckCircle, ExternalLink, RefreshCw, Star, Coins, HelpCircle, Image } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdvertisePortal: React.FC = () => {
  const { campaigns, clickAdvertiserCampaign, adminCreateCampaign, currentUser } = useApp();
  const [showCreator, setShowCreator] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [promoUrl, setPromoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [type, setType] = useState<'YouTube Promotion' | 'Website Promotion' | 'Telegram Promotion' | 'App Promotion' | 'Course Promotion'>('YouTube Promotion');
  const [targetClicks, setTargetClicks] = useState(500);
  const [budgetINR, setBudgetINR] = useState(1000);

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promoUrl.trim()) return;

    const defaultBanner = bannerUrl.trim() || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';

    adminCreateCampaign({
      advertiserId: currentUser?.uid || 'adv_partner',
      type,
      title,
      promotionUrl: promoUrl,
      promoBannerUrl: defaultBanner,
      targetClicks: Number(targetClicks),
      budgetINR: Number(budgetINR),
      isActive: true,
    });

    // Reset
    setTitle('');
    setPromoUrl('');
    setBannerUrl('');
    setType('YouTube Promotion');
    setShowCreator(false);
  };

  return (
    <div className="space-y-8 pb-16 select-none relative animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-8 h-8 text-[#6C63FF]" />
            Advertiser Portal & Sponsored Offerwall
          </h1>
          <p className="text-sm text-gray-400 mt-1">Visit advertiser links to earn instant Coin drops, or launch your own advertising panels.</p>
        </div>

        <button
          id="btn-toggle-create-campaign"
          onClick={() => setShowCreator(!showCreator)}
          className="px-4 py-2.5 bg-[#6C63FF] hover:bg-[#5b54e0] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#6C63FF]/20"
          style={{ minHeight: '44px' }}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showCreator ? 'Back to Offers' : 'Launch New Campaign'}</span>
        </button>
      </div>

      {showCreator ? (
        /* CAMPAIGN CREATION FORM WRAPPER */
        <div className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-2xl space-y-6">
          <div className="border-b border-slate-850 pb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Create Advertising Campaign</h2>
            <p className="text-xs text-gray-400 mt-1">Specify click parameters, targeting links and allocate budget. Launches instantly to users.</p>
          </div>

          <form onSubmit={handleLaunchCampaign} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Campaign Promo Title</label>
                <input
                  type="text"
                  placeholder="e.g. Subscribe to Tech Gaming Channel..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#6C63FF]"
                  style={{ minHeight: '44px' }}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Promotion Channel type</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#6C63FF]"
                  style={{ minHeight: '44px' }}
                >
                  <option value="YouTube Promotion">YouTube Promotion</option>
                  <option value="Website Promotion">Website Promotion</option>
                  <option value="Telegram Promotion">Telegram Promotion</option>
                  <option value="App Promotion">App Promotion</option>
                  <option value="Course Promotion">Course Promotion</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Target Promotion URL (Destination Link)</label>
              <input
                type="url"
                placeholder="https://youtube.com/c/yourchannel or play store URL..."
                value={promoUrl}
                onChange={(e) => setPromoUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#6C63FF]"
                style={{ minHeight: '44px' }}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Promo Banner Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or keep blank for generic gaming wallpaper"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#6C63FF]"
                style={{ minHeight: '44px' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Target click deliveries goals</label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  value={targetClicks}
                  onChange={(e) => setTargetClicks(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#6C63FF]"
                  style={{ minHeight: '44px' }}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Total Budget INR allocation (INR)</label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={budgetINR}
                  onChange={(e) => setBudgetINR(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#6C63FF]"
                  style={{ minHeight: '44px' }}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-850">
              <button
                id="btn-cancel-campaign-creation"
                type="button"
                onClick={() => setShowCreator(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-gray-300 font-bold rounded-xl text-xs"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                id="btn-submit-campaign-creation"
                type="submit"
                className="flex-1 py-3 bg-[#6C63FF] hover:bg-[#5b54e0] text-white font-bold rounded-xl text-xs shadow-md shadow-[#6C63FF]/20"
                style={{ minHeight: '44px' }}
              >
                Launch sponsored campaign
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          {/* USER SATE SPONSORED PROMOTIONS (OFFERWALL) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                <LayoutList className="w-5 h-5 text-[#6C63FF]" />
                Sponsored Tasks (Earn +25 Coins peer click visit)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {campaigns.map((camp) => {
                const percent = Math.min(100, Math.round((camp.currentClicks / camp.targetClicks) * 100));
                return (
                  <div
                    id={`sponsored-offer-${camp.id}`}
                    key={camp.id}
                    className="bg-[#18181A] rounded-2xl border border-slate-800/40 p-4 shadow-lg flex flex-col justify-between hover:border-[#6C63FF]/30 transition-all space-y-4"
                  >
                    <div className="relative h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-850">
                      <img 
                        src={camp.promoBannerUrl} 
                        alt={`${camp.title} - Sponsored Campaign Banner`} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover" 
                      />
                      <span className="absolute top-2 left-2 text-[8px] bg-slate-950/80 px-2 py-0.5 rounded text-white font-mono uppercase tracking-widest leading-none">
                        {camp.type}
                      </span>
                    </div>

                    <div className="space-y-1 flex-1">
                      <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">{camp.title}</h3>
                      <span className="text-[10px] text-[#00C896] block font-semibold">+25 Coins Reward</span>
                    </div>

                    {/* Progress Click meter */}
                    <div className="space-y-1.5 font-mono text-[10px] text-gray-500 border-t border-slate-850 pt-3">
                      <div className="flex items-center justify-between">
                        <span>Click Deliveries Progress:</span>
                        <span className="font-bold text-gray-300">{camp.currentClicks} / {camp.targetClicks}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                        <div className="bg-[#6C63FF] h-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <button
                      id={`btn-visit-campaign-${camp.id}`}
                      onClick={() => {
                        // Open external URL redirect sim, payout coins
                        clickAdvertiserCampaign(camp.id);
                        window.open(camp.promotionUrl, '_blank');
                      }}
                      className="w-full py-2.5 bg-[#6C63FF]/15 hover:bg-[#6C63FF] text-[#6C63FF] hover:text-white transition-all font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      style={{ minHeight: '40px' }}
                    >
                      <span>Visit & Earn Rewards</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl p-5 bg-[#18181A] border border-slate-800/40 text-xs text-gray-400 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-[#6C63FF] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Are you an influencer, developer or project creator? Promote your YouTube streams, Telegram communities, Android apps, or custom courses right here using our simple advertiser toolkit. Budget and delivery parameters sync dynamically with our PCI secure gateways.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
