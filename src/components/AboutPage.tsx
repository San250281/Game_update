import React from 'react';
import { 
  ShieldCheck, Zap, Users, Trophy, Sparkles, 
  Gamepad2, Mail, CheckCircle2, ArrowRight, HeartHandshake,
  Cpu, Award, Compass, Lock
} from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const milestones = [
    { number: '45+', label: 'Browser Arcade & Board Games' },
    { number: '100%', label: 'Ad-Free Play for VIP Members' },
    { number: '500 CP', label: 'Instant Starter Bonus for Guests' },
    { number: '< 200ms', label: 'Fast-Loading Client Route Switching' },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: 'Fair-Play & Integrity First',
      desc: 'All game outcomes are determined by verifiable client algorithms and standard game logic. No deceptive mechanics, rigged AI, or pay-to-win tricks.'
    },
    {
      icon: Zap,
      title: 'Fast-Loading & Zero Bloat',
      desc: 'Built with React 18, Vite, and Tailwind CSS. Clean, responsive interfaces with minimal DOM overhead that load instantly on 3G, 4G, 5G, or Wi-Fi.'
    },
    {
      icon: Lock,
      title: 'Player Privacy & Guest Freedom',
      desc: 'We do not force account registration before playing. Our dual-profile guest pass lets anyone play immediately with 500 pre-loaded coins.'
    },
    {
      icon: HeartHandshake,
      title: 'Direct Human Support',
      desc: 'Dedicated player inquiry desk at rewardyn1@gmail.com with human responses within 12–24 hours, not automated dead-ends.'
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header Banner */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-12 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Our Mission &amp; Vision</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Revitalizing Browser Gaming with Real Digital Rewards
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            REWARDYN was created to bring back the pure joy of classic arcade and board games in a modern, ultra-fast web experience. We believe gaming should be accessible anywhere without 2GB app store downloads, intrusive popups, or deceptive paywalls.
          </p>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {milestones.map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
            <span className="text-2xl md:text-3xl font-black text-slate-900 font-mono block">
              {item.number}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Story & Philosophy */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-xs space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            The Story Behind REWARDYN
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Why We Built REWARDYN</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm text-slate-600 leading-relaxed">
          <div className="space-y-4">
            <p>
              In today's mobile gaming landscape, players are constantly bombarded by forced installs, bloated download sizes, and dozens of unskippable ads. Simple pleasures like playing a quick game of Chess, rolling dice in Ludo, or clearing lines in Retro Snake have been buried under commercial friction.
            </p>
            <p>
              We founded <strong>REWARDYN</strong> to solve this. Every game runs natively in the browser with 60 FPS performance, touch and keyboard controls, and zero storage footprint on your device.
            </p>
          </div>
          <div className="space-y-4">
            <p>
              Through our dual-profile system, anyone can test-drive our platform instantly using a pre-credited Guest Profile (+500 CP). For dedicated players, our <strong>VIP Membership</strong> removes all sponsor promos and unlocks 8 grandmaster-tier games including Poker, Blackjack, and Royal Ludo.
            </p>
            <p>
              Every match session is logged in an encrypted, transparent coin ledger. Whether you play for five minutes on your lunch break or compete on the weekend leaderboards, your progress is always respected.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
            Our Guiding Pillars
          </span>
          <h2 className="text-2xl font-black text-slate-900">Built on Trust &amp; Performance</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{v.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech & Infrastructure Card */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Modern Web Architecture</span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-900">
            Responsive on Mobile, Tablet &amp; Desktop
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            REWARDYN is written in TypeScript and React 18 with responsive Tailwind CSS layout grids, ensuring sub-second route transitions, minimal battery impact on smartphones, and crisp high-DPI scaling across 4K displays.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('services')}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
              >
                Our Services
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Us</span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* Direct Contact Inquiries Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Have questions or ideas?</span>
          <span className="text-xs font-black text-slate-800">
            Reach out to our leadership &amp; dev team at <a href="mailto:rewardyn1@gmail.com" className="text-emerald-700 underline font-mono">rewardyn1@gmail.com</a>
          </span>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('contact')}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            Inquiry Desk
          </button>
        )}
      </div>
    </div>
  );
};

export default AboutPage;
