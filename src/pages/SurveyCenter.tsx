/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClipboardList, Lock, Sparkles, CheckCircle2, ArrowRight, Star, RefreshCw, Zap, Clock, Coins, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { SURVEY_PROVIDERS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

export const SurveyCenter: React.FC<{ onNavigate: (tabId: string) => void }> = ({ onNavigate }) => {
  const { currentUser, completeSurvey, transactions } = useApp();
  const [activeProvider, setActiveProvider] = useState<string>('All');

  // Simulated active survey state
  const [activeSurvey, setActiveSurvey] = useState<{ id: string; provider: string; questionIdx: number; answers: string[] } | null>(null);

  const mockQuestions = [
    'How many hours per week do you spend playing browser/arcade games?',
    'Which device do you primarily play online mobile games on?',
    'What is your preferred payment gateway for buying gift cards?',
    'Which retail gift cards are you most interested in redeeming?',
  ];

  const mockOptions = [
    ['0-5 Hours', '5-15 Hours', '15-30 Hours', '30+ Hours'],
    ['Android Smartphone', 'Apple iPhone', 'PC / Laptop Desktop', 'Nintendo Switch / Console'],
    ['UPI / GPay / PhonePe', 'Razorpay Credit Card', 'Net Banking', 'Cash on Delivery Options'],
    ['Amazon Pay Gift Cards', 'Flipkart Shopping Vouchers', 'Steam Wallet / Google Play', 'Hotstar / Netflix Codes'],
  ];

  const hasAccess = currentUser?.role === UserRole.PREMIUM_USER || currentUser?.role === UserRole.ADMIN;

  // Filter providers
  const filteredProviders = activeProvider === 'All'
    ? SURVEY_PROVIDERS
    : SURVEY_PROVIDERS.filter((p) => p.name === activeProvider);

  // Stats
  const surveyTx = transactions.filter((tx) => tx.type === 'Survey Reward' && tx.userId === currentUser?.uid);
  const totalSurveyEarnings = surveyTx.reduce((acc, curr) => acc + curr.amount, 0);

  const startSurveyCycle = (providerId: string) => {
    setActiveSurvey({
      id: 'srv_' + Math.floor(10000 + Math.random() * 90000),
      provider: providerId,
      questionIdx: 0,
      answers: [],
    });
  };

  const handleAnswerSubmit = (optionValue: string) => {
    if (!activeSurvey) return;

    const updatedAnswers = [...activeSurvey.answers, optionValue];
    const nextIdx = activeSurvey.questionIdx + 1;

    if (nextIdx < mockQuestions.length) {
      setActiveSurvey({
        ...activeSurvey,
        questionIdx: nextIdx,
        answers: updatedAnswers,
      });
    } else {
      // Completed! Payout reward
      const provider = SURVEY_PROVIDERS.find((p) => p.id === activeSurvey.provider);
      const coinsReward = provider?.rewardCoins || 300;

      completeSurvey(activeSurvey.provider, 10, coinsReward);
      setActiveSurvey(null);
    }
  };

  return (
    <div className="space-y-8 pb-16 select-none relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-8 h-8 text-[#00C896]" />
            Premium Survey Center
          </h1>
          <p className="text-sm text-gray-400 mt-1">Provide your valuable opinion and feedback to earn automated high-tier coins credits.</p>
        </div>

        {hasAccess && (
          <div className="flex items-center gap-3">
            <div className="bg-[#18181A] px-4 py-2 border border-[#00C896]/20 rounded-xl">
              <span className="text-[10px] text-gray-500 font-mono block">SURVEY EARNINGS</span>
              <span className="text-base font-mono font-bold text-[#00C896]">{totalSurveyEarnings} Coins</span>
            </div>
          </div>
        )}
      </div>

      {/* ACCESS VALIDATOR GATES (PAYWALL) */}
      {!hasAccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-b from-[#18181C] to-[#121215] border border-[#2D2D33] rounded-2xl p-6 md:p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/20">
            <Lock className="w-8 h-8 text-[#FFD700] animate-pulse" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <h2 className="text-2xl font-sans font-extrabold text-white tracking-tight">PREMIUM MEMBERS ONLY ACCESS</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              We restrict executive survey access strictly to premium membership pass holders to preserve data integrity and prevent fraud bot networks patterns.
            </p>
          </div>

          {/* Upgrade Cards call out */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#00C896] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-white">Full Bitlabs & CPX unlocked</span>
                <p className="text-[10px] text-gray-500 mt-0.5">High payouts, minimal screenouts.</p>
              </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#00C896] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-white">AdGate Video Rewards</span>
                <p className="text-[10px] text-gray-500 mt-0.5">Automated callback credits instantly.</p>
              </div>
            </div>
          </div>

          <button
            id="btn-unlock-survey-paywall"
            onClick={() => onNavigate('membership')}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-sans font-bold text-sm rounded-xl cursor-pointer hover:shadow-lg hover:shadow-amber-500/20 transition-all uppercase tracking-wide flex items-center gap-2 mx-auto"
            style={{ minHeight: '44px' }}
          >
            <Zap className="w-4.5 h-4.5 fill-slate-950" />
            <span>Unlock Premium Access</span>
          </button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Main selection panels */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/30">
            {['All', 'CPX Research', 'BitLabs', 'OfferToro', 'AdGate Media'].map((prov) => (
              <button
                key={prov}
                onClick={() => setActiveProvider(prov)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  (activeProvider === prov)
                    ? 'bg-[#00C896] text-white'
                    : 'bg-[#18181A] text-gray-400 hover:text-white border border-slate-800'
                }`}
                style={{ minHeight: '38px' }}
              >
                {prov}
              </button>
            ))}
          </div>

          {/* ACTIVE SURVEY SANDBOX MODAL OVERLAY */}
          <AnimatePresence>
            {activeSurvey && (
              <div id="survey-modal-overlay" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#18181A] rounded-2xl border border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/40 pb-4">
                    <span className="text-xs font-mono text-[#00C896] font-bold uppercase tracking-wider">
                      {(SURVEY_PROVIDERS.find((p) => p.id === activeSurvey.provider)?.name) || 'Opinion Panel'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Question {activeSurvey.questionIdx + 1} of {mockQuestions.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white leading-relaxed">
                      {mockQuestions[activeSurvey.questionIdx]}
                    </h3>
                    <p className="text-[11px] text-gray-500 italic">Select one response to proceed to the next research vector.</p>

                    <div className="space-y-3 pt-2">
                      {mockOptions[activeSurvey.questionIdx].map((option, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleAnswerSubmit(option)}
                          className="w-full text-left p-3.5 rounded-xl border border-slate-800 hover:border-[#00C896]/50 bg-slate-900/60 hover:bg-slate-900 transition-all text-xs font-medium text-gray-300 hover:text-white"
                          style={{ minHeight: '48px' }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono border-t border-slate-800/30 pt-4">
                    <span>Survey Session: {activeSurvey.id}</span>
                    <button
                      id="btn-cancel-survey-session"
                      onClick={() => setActiveSurvey(null)}
                      className="text-rose-400 hover:underline"
                    >
                      Abandons Panel
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Gird list of available survey campaigns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProviders.map((prov) => (
              <div
                id={`survey-prov-card-${prov.id}`}
                key={prov.id}
                className="bg-[#18181A] rounded-2xl border border-slate-800/40 p-5 shadow-lg flex flex-col justify-between space-y-6 hover:border-[#00C896]/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <img src={prov.logoUrl} alt={prov.name} className="w-12 h-12 rounded-full object-cover border border-slate-800 p-0.5 bg-slate-900" />
                  <div>
                    <h3 className="text-base font-semibold text-white tracking-tight">{prov.name} Surveys</h3>
                    <p className="text-xs text-gray-400 leading-normal mt-0.5">{prov.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-800/30 py-4 font-mono text-center">
                  <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/40">
                    <span className="text-[9px] text-gray-500 uppercase block">AVERAGE LENGTH</span>
                    <span className="text-sm font-bold text-gray-200 mt-1 flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {prov.avgMinutes} mins
                    </span>
                  </div>
                  <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/40">
                    <span className="text-[9px] text-gray-500 uppercase block">REWARDS AMOUNT</span>
                    <span className="text-sm font-mono font-bold text-[#FFD700] mt-1 flex items-center justify-center gap-1">
                      <Coins className="w-4 h-4 text-[#FFD700]" />
                      +{prov.rewardCoins} Coins
                    </span>
                  </div>
                </div>

                <button
                  id={`btn-open-survey-${prov.id}`}
                  onClick={() => startSurveyCycle(prov.id)}
                  className="w-full py-3 bg-[#00C896]/10 text-[#00C896] hover:bg-[#00C896] hover:text-white font-sans font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  style={{ minHeight: '44px' }}
                >
                  <span>Start Survey Panel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Survey Logs History segment */}
          <div className="rounded-xl p-5 bg-[#18181A] border border-slate-800/40 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/40 pb-3">
              <RefreshCw className="w-4 h-4 text-[#00C896] animate-spin-slow" />
              Postback Webhook callback Logs
            </h3>

            {surveyTx.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No surveys logged in this session yet. Complete panels above to credit coins.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {surveyTx.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-xs bg-slate-900/40 p-3 rounded-lg border border-slate-850">
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-300">{tx.description}</span>
                      <span className="text-[9px] text-gray-500 block font-mono">Callback received at: {new Date(tx.timestamp).toLocaleString()}</span>
                    </div>
                    <span className="font-mono font-bold text-[#00C896]">+{tx.amount} Coins</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
