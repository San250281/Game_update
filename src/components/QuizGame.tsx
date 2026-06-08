/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useRewardEngine } from '../lib/store';
import { GameType } from '../types';
import { Lightbulb, CheckCircle2, XCircle, AlertCircle, Coins, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Question {
  question: string;
  options: string[];
  answerIndex: number;
  funFact: string;
}

const TRIVIA_DATABASE: Question[] = [
  {
    question: "Which cryptocurrency introduced the world's first smart-contract blockchain virtualization layer?",
    options: ["Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)", "Ripple (XRP)"],
    answerIndex: 1,
    funFact: "Vitalik Buterin proposed Ethereum in late 2013, seeking to create a decentralized internet computer."
  },
  {
    question: "What is the highest-level mathematical model size category for Google's Gemini family?",
    options: ["Gemini Nano", "Gemini Flash", "Gemini Ultra", "Gemini Pro"],
    answerIndex: 2,
    funFact: "Gemini Ultra is Google's most powerful AI model, designed for highly complex agentic tasks."
  },
  {
    question: "Which of these video games became the best-selling game of all time, exceeding 300 million copy sales?",
    options: ["Grand Theft Auto V", "Minecraft", "Tetris", "Wii Sports"],
    answerIndex: 1,
    funFact: "Minecraft launched publicly in 2009 and reached over 300 million copies sold across dozens of platforms."
  },
  {
    question: "In vintage gaming history, what iconic pixel character was originally named 'Jumpman'?",
    options: ["Sonic the Hedgehog", "Pac-Man", "Mario", "Mega Man"],
    answerIndex: 2,
    funFact: "Mario first appeared as Jumpman in the 1981 arcade legendary cabinet game 'Donkey Kong'."
  },
  {
    question: "Which internet routing protocol is famous for being the 'glue' that binds global web service servers together?",
    options: ["TCP/IP", "DNS", "Border Gateway Protocol (BGP)", "SSL/TLS"],
    answerIndex: 2,
    funFact: "BGP handles routing decisions between major Autonomous Systems across the global backbone fiber networks."
  }
];

export default function QuizGame() {
  const { cooldowns, submitGameScore } = useRewardEngine();
  const [stage, setStage] = useState<'intro' | 'active' | 'complete'>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizTimer, setQuizTimer] = useState(20);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const cooldownKey = `cooldown_${GameType.QUIZ}`;

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

  // Quiz active countdown timer
  useEffect(() => {
    if (stage !== 'active' || hasAnswered) return;

    setQuizTimer(15);
    const count = setInterval(() => {
      setQuizTimer((prev) => {
        if (prev <= 1) {
          // Time expired! Deem as answered incorrectly
          clearInterval(count);
          handleAnswerSelect(-1); // special trigger for timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(count);
  }, [qIndex, stage, hasAnswered]);

  const startQuiz = () => {
    if (cooldownLeft > 0) return;
    setStage('active');
    setQIndex(0);
    setCorrectCount(0);
    setSelectedOpt(null);
    setHasAnswered(false);
    setResultMessage(null);
  };

  const handleAnswerSelect = (optIndex: number) => {
    if (hasAnswered) return;
    setSelectedOpt(optIndex);
    setHasAnswered(true);

    const currentQ = TRIVIA_DATABASE[qIndex];
    if (optIndex === currentQ.answerIndex) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (qIndex + 1 < TRIVIA_DATABASE.length) {
      setQIndex((prev) => prev + 1);
      setSelectedOpt(null);
      setHasAnswered(false);
    } else {
      // Quiz complete! Submit score
      setStage('complete');
      setSubmitting(true);

      // Reward formula: 40 coins for every correct answer (Max 200)
      const potentialCoins = correctCount * 40;
      const res = await submitGameScore(GameType.QUIZ, correctCount, potentialCoins);
      setSubmitting(false);
      setResultMessage(res.message);
    }
  };

  const currentQ = TRIVIA_DATABASE[qIndex];

  return (
    <div className="bg-[#1a1c24] border border-[#2b303d] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl max-w-md mx-auto">
      <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

      {/* 1. Intro Screen */}
      {stage === 'intro' && (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
            <Lightbulb className="w-9 h-9 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Knowledge Arena Quiz</h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mb-6">
            Test your gaming and blockchain tech lore. Earn <span className="text-yellow-400 font-bold">40 coins</span> per correct answer!
          </p>

          {cooldownLeft > 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold">
              <Clock className="w-4 h-4 animate-pulse" />
              Sponsor buffer active: quiz reopens in {cooldownLeft}s
            </div>
          ) : (
            <button
              onClick={startQuiz}
              className="w-full py-3 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-[1.02] shadow-lg transition-all rounded-xl text-white font-extrabold text-sm uppercase tracking-wider"
            >
              Start Fast Trivia!
            </button>
          )}
        </div>
      )}

      {/* 2. Active Quiz Screen */}
      {stage === 'active' && currentQ && (
        <div>
          {/* Header Indicators */}
          <div className="flex justify-between items-center mb-5 text-xs text-gray-400">
            <span className="font-semibold bg-slate-800/60 text-blue-400 border border-slate-700/50 rounded-md px-2 py-1">
              Question {qIndex + 1} of {TRIVIA_DATABASE.length}
            </span>
            
            <div className={`flex items-center gap-1.5 font-bold px-2 py-1 rounded-md border ${
              quizTimer <= 5 
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse' 
                : 'bg-slate-800/60 border-slate-700/50 text-gray-300'
            }`}>
              <Clock className="w-4.5 h-4.5" />
              <span>{quizTimer}s</span>
            </div>
          </div>

          {/* Question Text */}
          <h3 className="text-sm font-semibold text-white leading-relaxed mb-6">
            {currentQ.question}
          </h3>

          {/* Answer Options Grid */}
          <div className="flex flex-col gap-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOpt === idx;
              const isCorrectAnswer = idx === currentQ.answerIndex;
              
              let optionStyle = "bg-slate-800/40 border border-[#2b303d] text-gray-300 hover:bg-slate-800/80";
              let iconElement = null;

              if (hasAnswered) {
                if (isCorrectAnswer) {
                  optionStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold";
                  iconElement = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
                } else if (isSelected) {
                  optionStyle = "bg-rose-500/10 border-rose-500 text-rose-400 font-semibold";
                  iconElement = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
                } else {
                  optionStyle = "bg-slate-800/20 border-slate-700/30 text-gray-500 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={hasAnswered}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full p-3.5 rounded-xl text-left text-xs transition-all duration-200 flex items-center justify-between gap-3 ${optionStyle}`}
                >
                  <span>{option}</span>
                  {iconElement}
                </button>
              );
            })}
          </div>

          {/* Fun Fact / Feedback Area */}
          <AnimatePresence>
            {hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-3.5 bg-slate-800/80 border border-slate-700/30 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-gray-300 uppercase tracking-wide">Did You Know?</h5>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      {currentQ.funFact}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="mt-4 w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 3. Finished Screen */}
      {stage === 'complete' && (
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Coins className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Quiz Complete!</h2>
          
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 max-w-xs mx-auto mb-6">
            <div className="flex justify-between items-center mb-2.5 text-xs">
              <span className="text-gray-400">Score Rating:</span>
              <span className="font-bold text-white">{correctCount} / {TRIVIA_DATABASE.length} Correct</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Gold Earnings:</span>
              <span className="font-bold text-yellow-400 flex items-center gap-1">
                +{correctCount * 40} Coins
              </span>
            </div>
            
            {/* Completion Rating Bar */}
            <div className="w-full h-1.5 bg-slate-700/30 rounded-full overflow-hidden mt-3.5">
              <div 
                style={{ width: `${(correctCount / TRIVIA_DATABASE.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
              />
            </div>
          </div>

          {submitting ? (
            <p className="text-xs text-gray-400 animate-pulse mb-4">Securing payouts with anti-cheat ledgers...</p>
          ) : (
            resultMessage && (
              <p className="text-xs text-emerald-400 font-medium mb-5">{resultMessage}</p>
            )
          )}

          <button
            onClick={() => setStage('intro')}
            className="w-full py-2.5 px-4 bg-slate-800 text-gray-300 hover:text-white border border-slate-700/60 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
          >
            Lobby Hub
          </button>
        </div>
      )}
    </div>
  );
}
