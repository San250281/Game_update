/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trophy, Clock, Search, Star, HelpCircle, Flame, Target, MessageSquare, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LeaderboardEntry } from '../types';

export const LeaderboardPage: React.FC = () => {
  const { leaderboards } = useApp();
  const [activeSegment, setActiveSegment] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('allTime');
  const [queryName, setQueryName] = useState('');

  const currentLeaderboard: LeaderboardEntry[] = leaderboards[activeSegment] || leaderboards.allTime;

  const filteredLeaderboard = currentLeaderboard.filter((entry) =>
    entry.username.toLowerCase().includes(queryName.toLowerCase())
  );

  const activeTop3 = filteredLeaderboard.slice(0, 3);
  const activeRemaining = filteredLeaderboard.slice(3);

  const getPodiumStyling = (idx: number) => {
    switch (idx) {
      case 0:
        return {
          card: 'bg-gradient-to-b from-amber-500/10 via-[#FFD700]/5 to-slate-900 border-[#FFD700]/40 scale-105 shadow-amber-500/5',
          glow: 'text-[#FFD700] drop-shadow-[0_4px_12px_rgba(255,215,0,0.4)]',
          badge: 'bg-[#FFD700] text-slate-950 font-black',
          title: 'Arena Champion',
        };
      case 1:
        return {
          card: 'bg-gradient-to-b from-slate-400/10 to-slate-900 border-slate-500/30 scale-100',
          glow: 'text-slate-300 drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]',
          badge: 'bg-slate-400 text-slate-950 font-bold',
          title: 'Arena Challenger',
        };
      case 2:
      default:
        return {
          card: 'bg-gradient-to-b from-orange-400/10 to-slate-900 border-orange-500/30 scale-95',
          glow: 'text-orange-400 drop-shadow-[0_4px_12px_rgba(251,146,60,0.2)]',
          badge: 'bg-orange-400 text-slate-950 font-bold',
          title: 'Arena Elite',
        };
    }
  };

  return (
    <div className="space-y-8 pb-16 select-none relative animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-[#FFD700] animate-pulse" />
            Platform Leaderboard Standings
          </h1>
          <p className="text-sm text-gray-400 mt-1">Real-time competitive standings. Gain ranking by completing gaming matches and earning coins.</p>
        </div>

        {/* Categories toggler */}
        <div className="flex items-center gap-1.5 bg-[#18181A] p-1 rounded-xl border border-slate-800">
          {[
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'allTime', label: 'All-Time' },
          ].map((seg) => (
            <button
              key={seg.id}
              onClick={() => setActiveSegment(seg.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSegment === seg.id
                  ? 'bg-[#6C63FF] text-white font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{ minHeight: '34px' }}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH ROW */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search contenders by username..."
          value={queryName}
          onChange={(e) => setQueryName(e.target.value)}
          className="w-full bg-[#18181A] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#6C63FF]/50"
          style={{ minHeight: '38px' }}
        />
      </div>

      {/* THE PODIUM TRIANGLE (TOP 3) */}
      {queryName === '' && activeTop3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 pb-8 max-w-4xl mx-auto">
          {/* Order rendering: Second place (Left), First Place (Center), Third Place (Right) */}
          {[
            activeTop3[1], // Index 1
            activeTop3[0], // Index 0
            activeTop3[2]  // Index 2
          ]
            .filter(Boolean)
            .map((player, renderIdx) => {
              // Retrieve original rank
              const originalRank = player === activeTop3[0] ? 0 : player === activeTop3[1] ? 1 : 2;
              const styling = getPodiumStyling(originalRank);
              return (
                <div
                  id={`podium-champ-${originalRank}`}
                  key={player.userId}
                  className={`border rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xl relative ${styling.card}`}
                >
                  {/* Rank circle */}
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black absolute -top-4 shadow-lg border border-slate-950/20 ${styling.badge}`}>
                    {originalRank + 1}
                  </span>

                  <div className="relative mb-4 mt-2">
                    <img
                      src={player.avatarUrl}
                      alt={player.username}
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-800 border-2 border-slate-700 p-0.5"
                    />
                    <Award className={`w-6 h-6 absolute -bottom-2 -right-2 ${styling.glow}`} />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-gray-500">{styling.title}</span>
                    <h3 className="text-base font-bold text-white tracking-tight truncate max-w-[160px]">{player.username}</h3>
                    <p className="text-lg font-mono font-black text-[#FFD700]">{player.coinsEarned} <span className="text-xs text-gray-400 font-normal">Coins</span></p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full border-t border-slate-850 pt-4 mt-4 text-[10px] text-gray-500 font-mono">
                    <div>
                      <span>Matches</span>
                      <span className="block font-bold text-gray-300 mt-0.5">{player.gamesPlayed}</span>
                    </div>
                    <div>
                      <span>Surveys</span>
                      <span className="block font-bold text-[#00C896] mt-0.5">+{player.surveyEarnings}</span>
                    </div>
                    <div>
                      <span>Referrals</span>
                      <span className="block font-bold text-gray-300 mt-0.5">{player.referrals}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* FULL LEADERBOARD SPREADSHEET LEDGER */}
      <section id="full-leaderboard-ledger" className="bg-[#18181A] border border-slate-800/40 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/40 pb-3">
          <Award className="w-5 h-5 text-[#6C63FF]" />
          <h2 className="text-base font-sans font-bold text-white tracking-tight">Full Arena Arena Contenders ({filteredLeaderboard.length})</h2>
        </div>

        {filteredLeaderboard.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6">No matching contenders found inside this roster.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Placement Rank</th>
                  <th className="py-3 px-4">Contender Username</th>
                  <th className="py-3 px-4 text-center">Matches won</th>
                  <th className="py-3 px-4 text-center">Opinion surveys</th>
                  <th className="py-3 px-4 text-center">Referred invites</th>
                  <th className="py-3 px-4 text-right">Coins earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredLeaderboard.map((player, idx) => {
                  return (
                    <tr key={player.userId} className="hover:bg-slate-900/45 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-400">
                        {idx + 1 === 1 ? '🥇 Rank 1' : idx + 1 === 2 ? '🥈 Rank 2' : idx + 1 === 3 ? '🥉 Rank 3' : `#${idx + 1}`}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={player.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-lg bg-slate-800 object-cover"
                          />
                          <span className="font-semibold text-gray-200">{player.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-300 font-mono">{player.gamesPlayed} wins</td>
                      <td className="py-4 px-4 text-center text-[#00C896] font-mono">+{player.surveyEarnings} Coins</td>
                      <td className="py-4 px-4 text-center text-gray-300 font-mono">{player.referrals} friends</td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-bold text-sm text-[#FFD700]">{player.coinsEarned}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
