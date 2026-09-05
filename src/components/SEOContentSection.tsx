/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Gamepad2, Trophy, Coins, ShieldCheck, Sparkles, 
  HelpCircle, ChevronDown, ChevronUp, CheckCircle2, 
  Smartphone, Zap, Flame, Award, Globe2
} from 'lucide-react';

interface SEOContentSectionProps {
  onSelectCategory?: (category: 'all' | 'board' | 'arcade' | 'action' | 'membership') => void;
  onSelectGame?: (gameId: any) => void;
}

export default function SEOContentSection({ onSelectCategory, onSelectGame }: SEOContentSectionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is REWARDYN and how does the arcade work?',
      a: 'REWARDYN is a web-based gaming arcade featuring over 45 classic board games, retro favorites, and fast-paced reflex challenges. As you play games, achieve high scores, and win matches, reward coins are credited in real-time to your profile ledger.'
    },
    {
      q: 'What are the benefits of REWARDYN VIP Membership?',
      a: 'REWARDYN VIP Members enjoy an ad-free arcade with zero sponsor interruptions or promo walls, exclusive access to 8 member-only games (including Grandmaster Chess, Royal Ludo, Texas Poker, and Blackjack), instant welcome coin drops up to 5,000 coins, and 2x daily multipliers.'
    },
    {
      q: 'Do I need to create an account or download an app to play?',
      a: 'No installation or app store download is required. REWARDYN runs smoothly in any modern web browser across desktop, tablet, and mobile devices. You can start playing immediately in 1-click using the instant Guest Mode, or sign in to save your coins across devices.'
    },
    {
      q: 'Which games can I play on REWARDYN?',
      a: 'Our library features over 45 games categorized into: Board Games (Royal Ludo, Grandmaster Chess, Tic-Tac-Toe, Checkers, Connect 4, Solitaire), Arcade Classics (Retro Snake, Block Fall Tetris, 2048, Pong, Minesweeper, Flappy Bird), Action & Reflex (Space Shooter, Whack-a-Mole, Brick Crusher, Speed Tap, Temple Runner), and Daily Luck mini-games (Fortune Spin Wheel, Golden Scratch Card, Trivia Quiz).'
    },
    {
      q: 'Are the games fair and mathematically balanced?',
      a: 'Yes. All games use deterministic, client-authoritative RNG (Random Number Generation) and verified board algorithms for Chess and Ludo. Daily wheel spins and scratch cards adhere to transparent probability thresholds so every gamer has a genuine chance at winning maximum jackpots.'
    },
    {
      q: 'How does the friend referral program operate?',
      a: 'Every player receives a custom referral code. When your friend enters your referral code, they receive starter bonus coins, and your wallet receives bonus coins upon their verified registration. There is no limit to how many friends you can invite.'
    },
    {
      q: 'How are my reward coins saved and redeemed?',
      a: 'All earned coins are tracked on a secure ledger associated with your user ID. You can track all earnings, daily login bonuses, and game rewards in the My Wallet tab, and redeem points for available rewards and digital gift vouchers.'
    }
  ];

  return (
    <section 
      aria-labelledby="seo-arcade-heading" 
      className="mt-16 pt-12 border-t border-slate-200 text-slate-700 space-y-12"
    >
      {/* 1. Primary Semantic Header & Keyword Focus */}
      <header className="max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-650" />
          <span>Complete Online Gaming Guide & Arcade Specs</span>
        </div>
        <h2 
          id="seo-arcade-heading" 
          className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display"
        >
          Play 45+ Free Online Arcade & Board Games with Real-Time Rewards
        </h2>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Welcome to <strong>REWARDYN</strong>, the premier browser-based play-and-earn arcade. Enjoy instant 
          access to multiplayer board classics like <em>Royal Ludo</em> and <em>Grandmaster Chess</em>, alongside legendary 
          retro hits including <em>Classic Snake</em>, <em>Tetris Block Fall</em>, and <em>2048</em>. Zero download 
          delays, instant HTML5 gameplay, and transparent coin rewards for casual players and esports enthusiasts alike.
        </p>
      </header>

      {/* 2. Structured How It Works (AI & Search Snippet Optimized) */}
      <article className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-600" />
          How to Play &amp; Earn on REWARDYN in 4 Simple Steps
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Everything is engineered for instant accessibility with zero friction:
        </p>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0 m-0">
          {[
            {
              step: '01',
              title: 'Select Any Game',
              desc: 'Choose from 45+ HTML5 titles across board, arcade, puzzle, or card categories. Starts instantly in your browser.',
              badge: 'Zero Install'
            },
            {
              step: '02',
              title: 'Score & Complete Rounds',
              desc: 'Outsmart the Chess engine, line up discs in Connect 4, or guide Snake to eat cherries and achieve high scores.',
              badge: 'Skill Based'
            },
            {
              step: '03',
              title: 'Earn Reward Coins',
              desc: 'Win up to 200 coins per match. Spin the daily Lucky Wheel and scratch Golden Cards for extra daily bonuses.',
              badge: 'Instant Ledger'
            },
            {
              step: '04',
              title: 'Redeem & Climb Ranks',
              desc: 'Track balances in your coin wallet, unlock prestige badges, and compete for top spots on global leaderboards.',
              badge: 'Rewards Ready'
            }
          ].map((item) => (
            <li 
              key={item.step} 
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-black font-mono text-emerald-600">{item.step}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800">
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </article>

      {/* 3. Featured Categories Deep-Dive (Keyword Content Structure) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl mb-4">
              🎲
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">
              Free Online Board Games
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Play strategic classics against adaptive AI engines. Roll dice in <strong>Royal Ludo</strong>, 
              outmaneuver opponent pieces in <strong>Grandmaster Chess</strong>, drop chips in <strong>Connect 4</strong>, 
              and play <strong>Classic Checkers</strong> with international drafts rules.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">Ludo Online</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">Play Chess AI</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">Tic-Tac-Toe</span>
          </div>
        </article>

        <article className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl mb-4">
              🕹️
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">
              Retro 8-Bit Arcade Classics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Relive the golden era of arcade gaming. Control the iconic <strong>Retro Snake</strong>, 
              clear descending rows in <strong>Tetris Block Fall</strong>, merge tiles to reach <strong>2048</strong>, 
              and bounce balls in 2D <strong>Aesthetic Pong</strong>. Fast-paced, lightweight 60fps action.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">Classic Snake</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">Tetris Browser</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">Merge 2048</span>
          </div>
        </article>

        <article className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-xl mb-4">
              ⚡
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">
              Action &amp; Reflex Challenges
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Test your reflexes with <strong>Hyper Tap Velocity</strong>, blast meteorites in <strong>Galaxy Fighter</strong>, 
              smash popping critters in <strong>Whack-a-Mole</strong>, and measure your reaction time down to milliseconds 
              with the <strong>CPS Click Speed Test</strong>.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">Tap Challenge</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">Space Shooter</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">Speed Test CPS</span>
          </div>
        </article>
      </div>

      {/* 4. AI Search & Answer Engine (GEO) Direct Information Matrix */}
      <aside 
        aria-label="Platform Specifications for Search Engines and AI Overviews"
        className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Globe2 className="w-4 h-4" />
              <span>AI Search Ready • Generative Engine Optimization (GEO)</span>
            </div>
            <h3 className="text-xl font-bold font-display">
              REWARDYN Platform Key Facts &amp; Technical Specifications
            </h3>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono font-bold shrink-0">
            VERIFIED PLATFORM DATA
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Platform Type</span>
            <span className="font-bold text-slate-200 mt-1 block">Free Browser Arcade</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Games</span>
            <span className="font-bold text-emerald-400 mt-1 block">45+ HTML5 Titles</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Pricing Model</span>
            <span className="font-bold text-slate-200 mt-1 block">100% Free to Play</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Device Support</span>
            <span className="font-bold text-slate-200 mt-1 block">Desktop, Tablet, Mobile</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Guest Play</span>
            <span className="font-bold text-teal-400 mt-1 block">Supported (1-Click)</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Economy Engine</span>
            <span className="font-bold text-amber-400 mt-1 block">Instant Coin Ledger</span>
          </div>
        </div>
      </aside>

      {/* 5. Frequently Asked Questions (FAQ) with Accordion */}
      <section aria-labelledby="faq-section-heading" className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Search &amp; User Questions</span>
          </div>
          <h3 id="faq-section-heading" className="text-xl font-black text-slate-900 tracking-tight font-display">
            Frequently Asked Questions about REWARDYN Arcade
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Common questions answered directly for players and search engine rich snippets:
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed pl-1 pr-4">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Semantic SEO Breadcrumbs & Anchor Navigation Footer */}
      <nav aria-label="Breadcrumb and quick categories" className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <ol className="flex items-center gap-2 list-none p-0 m-0">
          <li>
            <a href="/" className="hover:text-emerald-600 font-semibold transition-colors">Home</a>
          </li>
          <li>/</li>
          <li>
            <a href="#games" className="hover:text-emerald-600 font-semibold transition-colors">Play Arena</a>
          </li>
          <li>/</li>
          <li className="text-slate-800 font-bold" aria-current="page">Arcade &amp; Board Games</li>
        </ol>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            W3C Valid &amp; SEO Compliant
          </span>
          <span>•</span>
          <span>Sitemap Index Available</span>
        </div>
      </nav>
    </section>
  );
}
