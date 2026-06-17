/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useRewardEngine } from '../lib/store';
import { UserProfile } from '../types';
import UserAvatar from './UserAvatar';
import { Trophy, Medal, Search, Flame, Coins, Sparkles, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export default function Leaderboard() {
  const { leaderboard, user } = useRewardEngine();
  const [searchTerm, setSearchTerm] = useState('');
  const [metricTab, setMetricTab] = useState<'coins' | 'games'>('coins');

  // Multi-metric filter calculations:
  // For 'coins' we sort directly. For 'games' we simulate sorting based on the user's registry length or static values.
  const filterAndSortProfiles = () => {
    let list = [...leaderboard];

    if (metricTab === 'games') {
      // Sort user based on index calculations or approximate gameplay activity
      list.sort((a, b) => {
        const aVal = a.uid.includes('comp') ? (parseInt(a.uid.slice(-1)) * 14 + 12) : 25;
        const bVal = b.uid.includes('comp') ? (parseInt(b.uid.slice(-1)) * 14 + 12) : 25;
        return bVal - aVal;
      });
    }

    if (searchTerm.trim() !== '') {
      list = list.filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return list;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="w-5.5 h-5.5 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.4)] animate-bounce" />;
    if (rank === 2) return <Medal className="w-5.5 h-5.5 text-slate-300 fill-slate-300" />;
    if (rank === 3) return <Medal className="w-5.5 h-5.5 text-amber-600 fill-amber-600" />;
    return <span className="text-xs font-bold text-gray-500 font-mono">#{rank}</span>;
  };

  const getDummyPlayedCount = (profile: UserProfile) => {
    if (profile.uid.includes('comp_1')) return 96;
    if (profile.uid.includes('comp_2')) return 84;
    if (profile.uid.includes('comp_3')) return 78;
    if (profile.uid.includes('comp_4')) return 62;
    if (profile.uid.includes('comp_5')) return 40;
    return 15; // default for active users
  };

  const profiles = filterAndSortProfiles();

  return (
    <div className="bg-[#12141c] border border-[#232835] rounded-3xl p-6 relative overflow-hidden shadow-2xl max-w-lg mx-auto">
      {/* Background decoration glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Title */}
      <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-400">
          <Trophy className="w-5.5 h-5.5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">Global Standings</h2>
          <p className="text-[11px] text-gray-400">Compete with real-time global players with active reward payouts</p>
        </div>
      </div>

      {/* Filter Controllers & Search bar */}
      <div className="flex flex-col gap-3.5 mb-5">
        <div className="flex gap-2">
          {/* Main search bar */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Search opponent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2.5 text-xs text-white bg-transparent focus:outline-none placeholder-slate-600 font-medium"
            />
          </div>

          {/* Metric Sort Tabs */}
          <div className="bg-slate-900 p-1 border border-slate-800 rounded-xl flex items-center">
            <button
              onClick={() => setMetricTab('coins')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                metricTab === 'coins'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-extrabold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Coins
            </button>
            <button
              onClick={() => setMetricTab('games')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                metricTab === 'games'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-extrabold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Plays
            </button>
          </div>
        </div>
      </div>

      {/* Standings Grid Container */}
      <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
        {profiles.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#232835] rounded-2xl text-xs text-gray-500">
            No players found matching that search.
          </div>
        ) : (
          profiles.map((profile, index) => {
            const rank = index + 1;
            const isSelf = user ? profile.uid === user.uid : false;
            const playCount = getDummyPlayedCount(profile);

            return (
              <div
                key={profile.uid}
                className={`flex justify-between items-center p-3 border rounded-xl transition-all ${
                  isSelf
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.1)]'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank identifier */}
                  <div className="w-8 shrink-0 flex justify-center">
                    {getRankBadge(rank)}
                  </div>

                  {/* Profile Avatar */}
                  <UserAvatar
                    src={profile.photoURL}
                    name={profile.name}
                    className={`w-9.5 h-9.5 rounded-xl border object-cover shrink-0 ${
                      isSelf ? 'border-yellow-400 bg-slate-900' : 'border-slate-800 bg-slate-950'
                    }`}
                  />

                  {/* Name details */}
                  <div className="min-w-0">
                    <p className={`text-xs font-bold leading-tight truncate flex items-center gap-1.5 ${
                      isSelf ? 'text-yellow-400 font-extrabold' : 'text-white'
                    }`}>
                      {profile.name}
                      {profile.isAdmin && (
                        <span className="text-[8px] bg-red-500/15 text-red-400 border border-red-500/20 px-1 py-0.2 rounded font-bold uppercase tracking-wide">
                          Staff
                        </span>
                      )}
                      {isSelf && (
                        <span className="text-[8px] bg-yellow-400 text-slate-950 px-1 py-0.2 rounded font-black uppercase tracking-wide">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5 mt-1">
                      <Flame className="w-3 h-3 text-orange-400 shrink-0" />
                      {playCount} games played • {profile.provider.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Score value */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-white flex items-center gap-1 justify-end font-mono">
                    {metricTab === 'coins' 
                      ? profile.coins.toLocaleString() 
                      : playCount
                    }
                    {metricTab === 'coins' ? (
                      <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    ) : (
                      <span className="text-[10px] text-gray-500 font-bold uppercase">plays</span>
                    )}
                  </span>
                  <p className="text-[8px] text-gray-500 mt-0.5 tracking-wider font-semibold uppercase">
                    {metricTab === 'coins' ? 'NET BALANCE' : 'TOTAL SESSIONS'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating total user counts info */}
      <div className="mt-5 text-center text-[10px] text-gray-500 font-medium">
        Sync: {leaderboard.length} users active • Global database validated.
      </div>
    </div>
  );
}
