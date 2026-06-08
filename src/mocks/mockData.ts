/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, AdOffer, ProviderType } from '../types';

export const SEED_COMPETITORS: UserProfile[] = [
  {
    uid: 'comp_1',
    name: 'AlphaGamer ⚡',
    email: 'alpha.play@gmail.com',
    photoURL: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
    provider: ProviderType.GOOGLE,
    coins: 7420,
    referralCode: 'ALPHA77',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isActive: true,
  },
  {
    uid: 'comp_2',
    name: 'LuckySpinX 🎡',
    email: 'lucky.spin@yahoo.com',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    provider: ProviderType.GOOGLE,
    coins: 5200,
    referralCode: 'GOLDSPIN',
    referredBy: 'ALPHA77',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    lastLogin: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isActive: true,
  },
  {
    uid: 'comp_3',
    name: 'RetroTapQueen 👑',
    email: 'tapqueen.cyber@outlook.com',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    provider: ProviderType.FACEBOOK,
    coins: 4950,
    referralCode: 'CYBERTAP',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
  {
    uid: 'comp_4',
    name: 'BonusHunter 🎯',
    email: 'bh.gamers@protonmail.com',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    provider: ProviderType.EMAIL,
    coins: 3800,
    referralCode: 'COINHUNT',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    lastLogin: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    isActive: true,
  },
  {
    uid: 'comp_5',
    name: 'PixelKnight ⚔️',
    email: 'knight_pixel@gmail.com',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    provider: ProviderType.GOOGLE,
    coins: 2150,
    referralCode: 'PIXEL888',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
];

export const DEFAULT_ADS: AdOffer[] = [
  { id: 'ad_1', title: 'Spinwheel Sponsor Reward Video', rewardValue: 150, cooldownSeconds: 30, type: 'rewarded' },
  { id: 'ad_2', title: 'Casual Gaming App Download Pitch', rewardValue: 200, cooldownSeconds: 45, type: 'rewarded' },
  { id: 'ad_3', title: 'Quick Coin Booster Survey', rewardValue: 250, cooldownSeconds: 60, type: 'rewarded' },
];

export interface AuditLog {
  id: string;
  uid: string;
  userName: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  details: string;
  createdAt: string;
}
