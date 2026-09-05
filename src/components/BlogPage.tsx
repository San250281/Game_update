import React, { useState } from 'react';
import { 
  BookOpen, Search, Clock, User, Tag, 
  ArrowRight, X, Sparkles, ChevronRight, Share2, 
  CheckCircle2, Flame, Trophy, Mail 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlogPageProps {
  onNavigate?: (tab: string) => void;
  onSelectGame?: (gameId: any) => void;
}

interface BlogPost {
  id: string;
  title: string;
  category: 'Game Strategy' | 'VIP Perks' | 'Coin Economy' | 'Platform Updates';
  readTime: string;
  date: string;
  author: string;
  summary: string;
  content: {
    intro: string;
    sections: { heading: string; body: string }[];
    takeaways: string[];
  };
  gameTarget?: string;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate, onSelectGame }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  const blogPosts: BlogPost[] = [
    {
      id: 'chess-mastery-openings',
      title: 'Mastering Grandmaster Chess: 5 Core Opening Principles for Web Players',
      category: 'Game Strategy',
      readTime: '4 min read',
      date: 'September 2026',
      author: 'Marcus Vance, Chief Game Master',
      summary: 'Struggling against calibrated AI engines in Grandmaster Chess? Here are five foundational opening principles that protect your king and seize the center early.',
      gameTarget: 'chess',
      content: {
        intro: 'Chess is one of the most rewarding strategy games on the REWARDYN platform. However, many players lose positional advantage within the first six moves by neglecting opening fundamentals. By following these five time-tested guidelines, you will instantly improve your win rate and earn maximum digital coins.',
        sections: [
          {
            heading: '1. Control the Central Squares (e4, d4, e5, d5)',
            body: 'Every strong opening fight starts in the center. Moving your King or Queen pawn two squares ahead on move 1 allows your bishops and queen natural diagonal mobility while denying enemy knights comfortable outposts.'
          },
          {
            heading: '2. Develop Minor Pieces Before Major Pieces',
            body: 'Bring your knights out toward the center (e.g. Nf3, Nc3) and develop your bishops to active diagonals before launching attacks with your queen or rooks. Premature queen attacks are easily punished by calculated AI moves.'
          },
          {
            heading: '3. Castle Early to Shield Your King',
            body: 'Kingside castling (O-O) by move 6 to 9 achieves two goals in one motion: it moves your vulnerable king safely behind a pawn shield and brings a rook directly to an active central or semi-open file.'
          },
          {
            heading: '4. Avoid Moving the Same Piece Twice in the Opening',
            body: 'Tempo is critical. Unless a piece is directly threatened with capture, prioritize activating new pieces rather than repositioning a developed knight or bishop.'
          },
          {
            heading: '5. Maintain Pawn Structure Integrity',
            body: 'Avoid creating isolated or doubled pawns without clear compensation. A solid pawn structure provides natural defense against end-game AI breakthroughs.'
          }
        ],
        takeaways: [
          'Stake your claim in the center on move 1 or 2.',
          'Castle before launching aggressive offensives.',
          'Knights before bishops, minor pieces before queen.',
          'Respect tempo: each move must advance piece development.'
        ]
      }
    },
    {
      id: 'maximizing-coin-economy',
      title: 'How to Maximize Your REWARDYN Coin Earnings: Daily Quests, Streaks & Multipliers',
      category: 'Coin Economy',
      readTime: '3 min read',
      date: 'September 2026',
      author: 'REWARDYN Economics Team',
      summary: 'Unlock the secret to compounding your balance. Learn how combining consecutive daily login streaks with quick quest milestones generates up to 5x more rewards.',
      content: {
        intro: 'REWARDYN features a transparent dual-profile economy. While playing arcade games earns coins per match, active players who understand our quest chains and multiplier mechanics grow their balances significantly faster.',
        sections: [
          {
            heading: '1. The Power of the 7-Day Login Streak',
            body: 'Checking in consecutively escalates your daily bonus from +100 CP on Day 1 all the way to high-tier rewards on Day 7. Breaking your streak resets your progression, so make it a habit to claim your daily check-in each morning.'
          },
          {
            heading: '2. Complete the Daily Quad Quests',
            body: 'Our wallet tracks 4 daily objectives: Lucky Wheel Spin, Tap Challenge, Strategy / Brain Arena play, and Login Streak. Completing all four unlocks an extra milestone reward.'
          },
          {
            heading: '3. Leverage VIP 2x Multipliers',
            body: 'VIP Members receive an automatic 2x multiplier on daily check-in coins and claim pools. Over a 30-day period, this accounts for thousands of extra bonus coins.'
          },
          {
            heading: '4. The Referral Compound Effect',
            body: 'Sharing your unique invite code yields an immediate +100 coins per friend, plus a 10% revenue share on all their lifetime game winnings.'
          }
        ],
        takeaways: [
          'Never miss a daily streak check-in to preserve your multiplier.',
          'Clear all 4 wallet quest tasks in under 3 minutes every day.',
          'VIP tiers double your baseline daily coin accumulation.',
          'Invite active gamer friends to build passive referral income.'
        ]
      }
    },
    {
      id: 'royal-ludo-tactics',
      title: 'The Royal Ludo Winning Strategy: Safe Zones, Token Timing & Probability',
      category: 'Game Strategy',
      readTime: '5 min read',
      date: 'August 2026',
      author: 'Sophia Chen, Community Champion',
      summary: 'Ludo is not just luck! Discover the mathematical safe-zone tactics, token spacing principles, and cut strategies used by top leaderboard players.',
      gameTarget: 'ludo',
      content: {
        intro: 'While dice rolls determine the numbers, your decisions on which token to move separate casual rollers from Royal Ludo masters. High-ranking players on REWARDYN understand token spacing and probability.',
        sections: [
          {
            heading: '1. Never Cluster All Tokens on One Square',
            body: 'Spacing your active tokens 4 to 8 squares apart maximizes your chances of capturing opposing pawns while minimizing the risk of having multiple tokens sent home simultaneously.'
          },
          {
            heading: '2. Anchor on Star Safe Zones',
            body: 'The colored star squares on the board protect your tokens from being captured. If an opponent token is within 6 squares behind you, park your token on a safe star until the danger passes.'
          },
          {
            heading: '3. Prioritize Releasing Tokens from Base',
            body: 'Rolling a 6 gives you a choice: bring a new pawn into play or advance an existing one. In the early game, having at least three tokens active gives you flexible moves regardless of the dice roll.'
          },
          {
            heading: '4. The Endgame Approach',
            body: 'When your tokens enter the home column, they are 100% safe. Focus on moving threatened open-board tokens first before finessing pawns into the final home triangle.'
          }
        ],
        takeaways: [
          'Keep 2 to 3 tokens active on the board for maximum move flexibility.',
          'Rest in safe star zones when threats are within 6 squares.',
          'Capture opponent tokens whenever safe to send them back to base.',
          'Protect trailing tokens before advancing isolated leaders.'
        ]
      }
    },
    {
      id: 'why-vip-changes-the-game',
      title: 'Why VIP Membership Changes the Game: The Economics of Zero Ads and Exclusive Arenas',
      category: 'VIP Perks',
      readTime: '4 min read',
      date: 'August 2026',
      author: 'Elena Rostova, Product Lead',
      summary: 'A deep dive into the player experience upgrade delivered by REWARDYN VIP. Explore the benefits of 100% ad-free play, 8 member-only games, and concierge support.',
      content: {
        intro: 'In an internet saturated with disruptive advertisements and forced video buffers, REWARDYN VIP was engineered to provide an oasis of pure, uninterrupted arcade gaming. Here is an overview of what member status unlocks.',
        sections: [
          {
            heading: '1. Zero Commercial Friction',
            body: 'VIP members enjoy clean, instant gameplay across all titles. No sponsor ad popups, no interstitial video delays, and no promo offerwalls between rounds.'
          },
          {
            heading: '2. Access to 8 Member-Exclusive Titles',
            body: 'Exclusive access to our premier board and card game titles: Grandmaster Chess, Royal Ludo Masters, Texas Hold\'em Poker, Vegas Blackjack 21, Mahjong Solitaire, and more.'
          },
          {
            heading: '3. Welcome Coin Drop & Boosted Limits',
            body: 'Upon upgrading, VIP members receive up to +5,000 instant welcome coins and enjoy doubled daily reward streak allowances.'
          },
          {
            heading: '4. Dedicated Concierge Support',
            body: 'VIP inquiries sent to rewardyn1@gmail.com enter an expedited priority triage queue answered by our senior support team within 6 hours.'
          }
        ],
        takeaways: [
          'Completely eliminates video promo interruptions.',
          'Full access to all 8 member-only strategy and card games.',
          'Accelerated daily streak coin accumulation with 2x multipliers.',
          'Guaranteed priority support queue via email.'
        ]
      }
    },
    {
      id: 'retro-arcade-enduring-appeal',
      title: 'Retro Arcade Renaissance: The Enduring Appeal of Snake, Tetris & Pong in 2026',
      category: 'Platform Updates',
      readTime: '3 min read',
      date: 'July 2026',
      author: 'REWARDYN Editorial Staff',
      summary: 'Why do simple 8-bit games from the 1980s and 90s continue to outperform multi-gigabyte modern titles in player engagement? We break down the magic of instant arcade play.',
      content: {
        intro: 'With modern video games demanding 100GB hard drive space and hours of narrative tutorials, casual players are rediscovering the timeless genius of retro arcade titles. On REWARDYN, Retro Snake and Block Fall remain in the top 5 most played games daily.',
        sections: [
          {
            heading: '1. Zero Learning Curve, Infinite Mastery',
            body: 'You do not need a 20-minute tutorial to understand Snake or Pong. Anyone can pick up the controls in 5 seconds, yet achieving high scores requires intense reflex focus.'
          },
          {
            heading: '2. The 3-Minute Micro-Session',
            body: 'Modern life is fast. Players want quick, satisfying entertainment during a commute, between work meetings, or while waiting in line. Browser games provide instant gratification.'
          },
          {
            heading: '3. Clean Visuals and Nostalgia',
            body: 'Pixel art and bold 8-bit color palettes trigger comfort and nostalgia without draining phone battery or causing device overheating.'
          }
        ],
        takeaways: [
          'Simple mechanics allow instant enjoyment across all age demographics.',
          'Fast-loading browser games require zero storage and minimal battery.',
          'Reflex arcade games offer competitive, skill-based reward loops.'
        ]
      }
    },
    {
      id: 'fair-play-safe-rng',
      title: 'Fair-Play & Provably Safe RNG: How REWARDYN Keeps Every Match Honest',
      category: 'Platform Updates',
      readTime: '4 min read',
      date: 'July 2026',
      author: 'DevOps & Security Team',
      summary: 'Understanding the client-side physics, cryptographically sound random number generation, and ledger audits that guarantee an honest gaming ecosystem.',
      content: {
        intro: 'Trust is the foundation of any digital reward platform. We believe players have a right to know how game odds, dice rolls, and wheel outcomes are calculated behind the scenes.',
        sections: [
          {
            heading: '1. Standard Cryptographic RNG',
            body: 'All dice rolls in Royal Ludo and card draws in Blackjack utilize standard browser cryptography and pseudo-random seed algorithms, ensuring impossible-to-predict, unbiased outcomes.'
          },
          {
            heading: '2. Transparent Ledger Recording',
            body: 'Every coin won or spent is recorded with a unique transaction ID, timestamp, and source tag in your local and cloud wallet history.'
          },
          {
            heading: '3. Client Anti-Tamper Verification',
            body: 'Our game loop validates move sequences and score thresholds to protect competitive leaderboards against automated bot spam and illegitimate score injections.'
          }
        ],
        takeaways: [
          'Unbiased, cryptographically sound random number generation.',
          'Zero hidden house fees or unrecorded coin subtractions.',
          'Anti-cheat systems protect real player leaderboard achievements.'
        ]
      }
    }
  ];

  const categories = ['All', 'Game Strategy', 'VIP Perks', 'Coin Economy', 'Platform Updates'];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header Banner */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-12 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Articles, Guides &amp; News</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            REWARDYN Gaming &amp; Strategy Blog
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Level up your browser gaming skills. Discover pro tactics for Chess and Ludo, learn how to maximize your daily coin streaks, and stay up-to-date on new platform releases.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides &amp; news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white border border-slate-200 hover:border-purple-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => setActiveArticle(post)}
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-extrabold">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition-colors leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  {post.date}
                </span>
                <span className="text-purple-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read Guide <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No articles matched your filter</h4>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting "All" categories.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Suggested Topic & Editorial Contact Banner */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Have a Game Guide or Strategy to Submit?</h4>
            <p className="text-xs text-slate-500">Contact our editorial team directly at <span className="font-mono font-bold text-emerald-700">rewardyn1@gmail.com</span></p>
          </div>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('contact')}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            Contact Editorial
          </button>
        )}
      </section>

      {/* FULL ARTICLE READER MODAL */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 md:p-10 max-w-2xl w-full shadow-2xl border border-slate-200 relative my-8 max-h-[85vh] overflow-y-auto space-y-6"
            >
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
                aria-label="Close article modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-extrabold">
                    {activeArticle.category}
                  </span>
                  <span>•</span>
                  <span>{activeArticle.readTime}</span>
                  <span>•</span>
                  <span>{activeArticle.date}</span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  {activeArticle.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>By {activeArticle.author}</span>
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-sm text-slate-700 max-w-none space-y-5 text-xs md:text-sm leading-relaxed border-t border-slate-100 pt-5">
                <p className="text-slate-600 font-medium italic bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  "{activeArticle.content.intro}"
                </p>

                {activeArticle.content.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h3 className="text-sm md:text-base font-black text-slate-900">{sec.heading}</h3>
                    <p className="text-slate-600 leading-relaxed">{sec.body}</p>
                  </div>
                ))}

                {/* Key Takeaways Box */}
                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 space-y-3 not-prose">
                  <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    Key Strategy Takeaways
                  </h4>
                  <ul className="space-y-2 text-xs text-purple-950 font-medium">
                    {activeArticle.content.takeaways.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                {activeArticle.gameTarget && onSelectGame ? (
                  <button
                    onClick={() => {
                      const tgt = activeArticle.gameTarget;
                      setActiveArticle(null);
                      onSelectGame(tgt);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Play {activeArticle.title.split(':')[0]} Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveArticle(null);
                      if (onNavigate) onNavigate('lobby');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Explore Arcade Arena</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setActiveArticle(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPage;
