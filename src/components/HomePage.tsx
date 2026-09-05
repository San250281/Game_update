import React from 'react';
import { 
  Gamepad2, Crown, Zap, ShieldCheck, Trophy, 
  ArrowRight, Sparkles, Users, Coins, Flame, 
  CheckCircle2, Laptop, Smartphone, Mail, ChevronRight, Play
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onSelectGame?: (gameId: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectGame }) => {
  const featuredGames = [
    {
      id: 'ludo',
      title: 'Royal Ludo Masters',
      category: 'Board Classic',
      icon: '🎲',
      desc: 'Roll the dice, race tokens home, and strategically capture opponent pawns on the royal board.',
      cost: 25,
      maxReward: 80,
      badge: 'VIP Favorite',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'chess',
      title: 'Grandmaster Chess',
      category: 'Strategy & Tactics',
      icon: '♟️',
      desc: 'Play chess against calibrated AI engine levels. Complete tactical checkmates to earn digital coins.',
      cost: 25,
      maxReward: 100,
      badge: 'VIP Exclusive',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'retro_snake',
      title: 'Retro Snake 8-Bit',
      category: 'Arcade Classic',
      icon: '🐍',
      desc: 'Classic Nokia-inspired arcade action. Slither, gobble golden apples, and survive without crashing!',
      cost: 15,
      maxReward: 50,
      badge: 'Popular',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'spin_wheel',
      title: 'Lucky Fortune Wheel',
      category: 'Instant Win',
      icon: '🎡',
      desc: 'Spin the high-multiplier wheel once every 30 seconds for instant balance multipliers and jackpot drops.',
      cost: 20,
      maxReward: 120,
      badge: 'Instant Rewards',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    },
  ];

  const corePillars = [
    {
      icon: Zap,
      color: 'text-amber-500 bg-amber-50 border-amber-200',
      title: 'Fast-Loading Architecture',
      desc: 'Engineered with lightweight Vite, TypeScript, and modern client caching. Instant 0-second loading across mobile, tablet, and desktop browsers with zero app installation.'
    },
    {
      icon: Crown,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      title: 'VIP Ad-Free Experience',
      desc: 'Upgrade to VIP membership for a 100% ad-free experience, access to 8 exclusive strategic board & card games, and 2x daily multipliers.'
    },
    {
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      title: 'Dual-Profile Economy',
      desc: 'Jump in immediately with an instant 500-coin Guest Pass or connect a persistent cloud account with real-time balance tracking.'
    },
    {
      icon: Trophy,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      title: 'Competitive Leaderboards',
      desc: 'Compete in daily and weekly arcade challenges. Scale the global ranks and earn recognition across thousands of active players.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Choose Any Game',
      desc: 'Pick from 45+ browser games: strategic board games, 8-bit retro arcade, puzzles, or quick reflex challenges.'
    },
    {
      num: '02',
      title: 'Play & Score High',
      desc: 'Outmaneuver the AI, clear puzzle grids, or hit your targets with responsive touch or keyboard controls.'
    },
    {
      num: '03',
      title: 'Earn & Level Up',
      desc: 'Receive digital coin drops directly to your wallet ledger. Chain daily login streaks for bonus multipliers.'
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 text-white p-6 md:p-12 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 animate-pulse" />
            <span>45+ Browser Arcade Games • Zero Downloads</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-white">
            Play Classic Games. <br />
            Earn Digital Coins. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">
              Zero Ads with VIP.
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Welcome to <strong>REWARDYN</strong> — the fast-loading play-and-earn browser arcade.
            Enjoy board game classics like Ludo &amp; Chess, retro arcade favorites like Snake &amp; Tetris,
            and competitive leaderboards on any smartphone, tablet, or PC.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('lobby')}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Gamepad2 className="w-4.5 h-4.5" />
              <span>Enter Play Arena</span>
            </button>

            <button
              onClick={() => onNavigate('membership')}
              className="px-6 py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/30 active:scale-95 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Explore VIP Membership</span>
            </button>

            <button
              onClick={() => onNavigate('about')}
              className="px-4 py-3.5 text-slate-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
            >
              About Platform →
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">45+</span>
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Arcade Games</p>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">100%</span>
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Ad-Free (VIP)</p>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">+500</span>
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Guest Starter</p>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono">&lt; 0.2s</span>
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Load Speed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS 3-STEP SECTION */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            Simple 3-Step Flow
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">How REWARDYN Works</h2>
          <p className="text-xs md:text-sm text-slate-500">
            No long registrations or forced mobile downloads. Instant play right in your web browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {steps.map((step) => (
            <div 
              key={step.num}
              className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 relative hover:border-emerald-300 transition-all group"
            >
              <span className="text-3xl font-black text-slate-200 font-mono group-hover:text-emerald-200 transition-colors block mb-2">
                {step.num}
              </span>
              <h3 className="text-base font-black text-slate-900 mb-1.5">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED GAMES SHOWCASE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
              Community Favorites
            </span>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Featured Games on REWARDYN
            </h2>
          </div>
          <button
            onClick={() => onNavigate('lobby')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All 45+ Games</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredGames.map((game) => (
            <div
              key={game.id}
              className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => {
                if (onSelectGame) {
                  onSelectGame(game.id);
                } else {
                  onNavigate('lobby');
                }
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>
                  <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md border ${game.badgeColor}`}>
                    {game.badge}
                  </span>
                </div>

                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  {game.category}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-0.5 group-hover:text-emerald-700 transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {game.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  Cost: {game.cost} • Max: +{game.maxReward}
                </span>
                <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Play <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CORE PLATFORM PILLARS */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
            Architectural Excellence
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Why Players Choose REWARDYN</h2>
          <p className="text-xs md:text-sm text-slate-500">
            Built from the ground up for responsiveness, speed, and transparent rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-start gap-4 hover:border-slate-300 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${pillar.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{pillar.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. RESPONSIVE DEVICES BANNER */}
      <section className="bg-gradient-to-br from-emerald-900 to-slate-900 border border-emerald-800/40 rounded-3xl p-6 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] uppercase font-bold tracking-wider border border-emerald-500/30">
            Multi-Device Compatibility
          </div>
          <h2 className="text-xl md:text-2xl font-black">
            Seamless Experience on Mobile, Tablet &amp; Desktop
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Whether you are on a smartphone on the go, playing on an iPad or tablet, or running full screen on a desktop computer, REWARDYN scales effortlessly with touch-responsive controls and ultra-fast frame rates.
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-emerald-300 pt-1">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> Mobile Touch
            </span>
            <span className="flex items-center gap-1.5">
              <Laptop className="w-4 h-4" /> Desktop Keyboard
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> No App Store Required
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('lobby')}
            className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
          >
            Start Playing
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-3 bg-emerald-700/60 hover:bg-emerald-700 text-white border border-emerald-500/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Support</span>
          </button>
        </div>
      </section>

      {/* 6. SUPPORT & DIRECT EMAIL BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Player Support &amp; Direct Inquiries</h4>
            <p className="text-xs text-slate-500">Directly contact our team anytime at <span className="font-mono font-bold text-emerald-700">rewardyn1@gmail.com</span></p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('contact')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shrink-0"
        >
          Open Contact Desk
        </button>
      </div>
    </div>
  );
};

export default HomePage;
