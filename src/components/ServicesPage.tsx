import React from 'react';
import { 
  Gamepad2, Crown, Trophy, Users, ShieldCheck, 
  Sparkles, Check, ArrowRight, Zap, Mail, 
  HelpCircle, Star, Layers, Laptop, Smartphone
} from 'lucide-react';

interface ServicesPageProps {
  onNavigate?: (tab: string) => void;
  onSelectGame?: (gameId: any) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate, onSelectGame }) => {
  const servicesList = [
    {
      id: 'arcade',
      icon: Gamepad2,
      badge: 'Core Platform',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      title: 'Instant Web Browser Arcade (45+ Games)',
      desc: 'High-speed browser-based gaming across 45+ classic board, retro 8-bit, puzzle, and reflex titles. No 2GB app store downloads, zero device storage footprint, and instant touch-responsive play.',
      features: [
        'Classic Board: Royal Ludo, Grandmaster Chess, Checkers, Connect 4',
        '8-Bit Retro: Snake, Tetris, Pong, Space Shooter, Minesweeper',
        'Reflex & Casual: Slide Puzzle, Wordle, Whack-a-Mole, 2048, Spin Wheel',
        'Responsive layout across mobile, tablet, and desktop displays'
      ],
      actionLabel: 'Explore Games',
      actionTarget: 'lobby'
    },
    {
      id: 'vip',
      icon: Crown,
      badge: 'Premium Tier',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      title: 'VIP Membership & 100% Ad-Free Gaming',
      desc: 'An upgraded premium tier for dedicated arcade enthusiasts. Removes 100% of promotional interruptions, unlocks 8 member-only strategy and card games, and boosts daily rewards with 2x multipliers.',
      features: [
        '100% Ad-Free uninterrupted gameplay with zero promo popups',
        '8 VIP Exclusive Games: Chess, Ludo, Texas Poker, Blackjack 21 & more',
        'Welcome Coin Drops up to +5,000 coins on activation',
        '2x Daily Login Streaks & priority customer concierge'
      ],
      actionLabel: 'Join VIP Membership',
      actionTarget: 'membership'
    },
    {
      id: 'dual-profile',
      icon: ShieldCheck,
      badge: 'Player Economy',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      title: 'Dual-Profile Economy & Guest Pass',
      desc: 'Seamless user account architecture allowing instant anonymous play or full cloud persistence with zero friction. Switch between guest and registered profiles in a single click.',
      features: [
        'Instant Guest Pass with 500 pre-loaded playing coins',
        'One-click profile switcher to test different strategies',
        'Synchronized cloud persistence for registered accounts',
        'Transparent ledger recording every win, loss, and bonus'
      ],
      actionLabel: 'Check Wallet Ledger',
      actionTarget: 'wallet'
    },
    {
      id: 'leaderboard',
      icon: Trophy,
      badge: 'Competitive',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      title: 'Competitive Leaderboards & Tournaments',
      desc: 'Global and game-specific ranking systems updated in real time. Climb weekly leaderboard tiers to win exclusive digital coin reward pools and community badges.',
      features: [
        'Daily, weekly, and all-time global arcade rankings',
        'Anti-cheat score verification and fair-play validation',
        'Top 10 player showcase and performance tracking',
        'Direct links from leaderboards to challenge top scores'
      ],
      actionLabel: 'View Leaderboard',
      actionTarget: 'leaderboard'
    },
    {
      id: 'referrals',
      icon: Users,
      badge: 'Community',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      title: 'Referral & Affiliate Network',
      desc: 'Earn passive digital coins by inviting friends and fellow gamers to REWARDYN. Every verified referral generates instant bonus coins plus lifetime match revenue share.',
      features: [
        'Unique customizable referral links and QR codes',
        '+100 instant bonus coins for every registered invitee',
        '10% lifetime match bonus on all referral arcade wins',
        'Live referral dashboard with active affiliate statistics'
      ],
      actionLabel: 'Invite Referrals',
      actionTarget: 'referrals'
    },
    {
      id: 'partnerships',
      icon: Mail,
      badge: 'B2B & Developers',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      title: 'Game Publishing & Sponsorship Partnerships',
      desc: 'Are you an indie game developer or digital brand? REWARDYN partners with creators to host HTML5 arcade titles and custom tournament sponsorships.',
      features: [
        'Direct revenue-share model for indie game creators',
        'HTML5 / TypeScript standard canvas integration',
        'Dedicated inquiries and custom business solutions',
        'Reach thousands of daily active browser game players'
      ],
      actionLabel: 'Partner with Us',
      actionTarget: 'contact'
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-12 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Comprehensive Web Gaming Suite</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            REWARDYN Services &amp; Platform Capabilities
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            From our 45+ browser arcade games to our premium VIP ad-free membership and affiliate referral ecosystem, discover how REWARDYN provides a complete web entertainment experience.
          </p>
        </div>
      </section>

      {/* Grid of Detailed Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servicesList.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 md:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-full border ${srv.badgeColor}`}>
                    {srv.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-2">{srv.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-5">{srv.desc}</p>

                <div className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                  {srv.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {onNavigate && (
                <button
                  onClick={() => onNavigate(srv.actionTarget)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{srv.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison: Free vs VIP Membership Table */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            Account Comparison
          </span>
          <h2 className="text-2xl font-black text-slate-900">Free Player vs. VIP Member</h2>
          <p className="text-xs text-slate-500">
            Choose the tier that fits your gaming style. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Feature / Perk</th>
                <th className="py-3 px-4">Free Player</th>
                <th className="py-3 px-4 text-amber-700 font-black">VIP Member</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800">Browser Arcade Games</td>
                <td className="py-3.5 px-4 text-slate-600">37 Standard Games</td>
                <td className="py-3.5 px-4 font-black text-emerald-700">All 45+ Games (Full Access)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800">Exclusive VIP Games (Chess, Ludo, Poker, Blackjack)</td>
                <td className="py-3.5 px-4 text-slate-400">Locked (Requires VIP)</td>
                <td className="py-3.5 px-4 font-black text-emerald-700">Unlocked &amp; Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800">Ad-Free Experience</td>
                <td className="py-3.5 px-4 text-slate-600">Standard Platform</td>
                <td className="py-3.5 px-4 font-black text-emerald-700">100% Ad-Free Arcade</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800">Welcome Coin Package</td>
                <td className="py-3.5 px-4 text-slate-600">500 Guest Coins</td>
                <td className="py-3.5 px-4 font-black text-amber-700">Up to +5,000 Coins</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800">Daily Login Multipliers</td>
                <td className="py-3.5 px-4 text-slate-600">1x Base Multiplier</td>
                <td className="py-3.5 px-4 font-black text-amber-700">2x Doubled Multiplier</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800">Support Priority</td>
                <td className="py-3.5 px-4 text-slate-600">12–24 Hours</td>
                <td className="py-3.5 px-4 font-black text-emerald-700">&lt; 6 Hours Concierge</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Direct Inquiries & Partnerships Callout */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Looking for Custom Arcade Solutions?</h4>
          <p className="text-xs text-slate-500 mt-1">
            We offer bespoke game integration, private tournaments, and business partnerships. Email <span className="font-mono font-bold text-emerald-700">rewardyn1@gmail.com</span>.
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('contact')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Contact Partnerships
          </button>
        )}
      </section>
    </div>
  );
};

export default ServicesPage;
