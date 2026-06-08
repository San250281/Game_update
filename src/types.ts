/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProviderType {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  EMAIL = 'email',
  GUEST = 'guest'
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit'
}

export enum TransactionSource {
  GAME = 'game',
  AD = 'ad',
  REFERRAL = 'referral',
  BONUS = 'bonus',
  ADMIN = 'admin'
}

export enum GameType {
  SPIN_WHEEL = 'spin_wheel',
  SCRATCH_CARD = 'scratch_card',
  QUIZ = 'quiz',
  TAP_CHALLENGE = 'tap_challenge'
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  provider: ProviderType;
  coins: number;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  isAdmin?: boolean;
  lastLoginCoinClaimedDate?: string;
  adsWatchedToday?: number;
  lastAdWatchedAt?: string;
}

export interface WalletTransaction {
  transactionId: string;
  uid: string;
  type: TransactionType;
  coins: number;
  source: TransactionSource;
  createdAt: string;
}

export interface ReferralRecord {
  referralId: string;
  referrerUid: string;
  newUserUid: string;
  rewardGranted: boolean;
  createdAt: string;
}

export interface GameSession {
  sessionId: string;
  uid: string;
  gameId: GameType;
  score: number;
  coinsEarned: number;
  createdAt: string;
}

export interface AdOffer {
  id: string;
  title: string;
  rewardValue: number;
  cooldownSeconds: number;
  type: 'rewarded' | 'interstitial' | 'banner';
}
