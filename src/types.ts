/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  GUEST = 'Guest',
  USER = 'User',
  PREMIUM_USER = 'Premium User',
  ADMIN = 'Admin',
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  referralCode: string;
  referredBy?: string;
  coins: number;
  lifetimeCoins: number;
  createdAt: string;
  emailVerified: boolean;
  membershipPlan?: string; // 'none' | 'Daily' | 'Weekly' | 'Monthly'
  membershipExpiresAt?: string;
}

export interface WalletState {
  uid: string;
  balance: number;
  lifetimeCoins: number;
  coinsEarned: number;
  coinsRedeemed: number;
  lastUpdatedAt: string;
}

export type TransactionType =
  | 'Game Reward'
  | 'Survey Reward'
  | 'Referral Reward'
  | 'Membership Bonus'
  | 'Redemption'
  | 'Admin Adjustment';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // positive for earn, negative for redeem
  description: string;
  timestamp: string;
  status: 'Pending' | 'Completed' | 'Failed';
}

export interface MembershipPlan {
  id: string;
  name: string;
  priceINR: number;
  coins: number;
  durationDays: number;
}

export interface GameDefinition {
  id: string;
  name: string;
  category: 'Arcade' | 'Casual' | 'Puzzle' | 'Action';
  imageUrl: string;
  description: string;
  activePlayers: number;
}

export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  score: number;
  coinsEarned: number;
  timestamp: string;
}

export interface SurveyProvider {
  id: string;
  name: 'CPX Research' | 'BitLabs' | 'OfferToro' | 'AdGate Media';
  logoUrl: string;
  description: string;
  avgMinutes: number;
  rewardCoins: number;
}

export interface SurveyCompletion {
  id: string;
  userId: string;
  provider: string;
  surveyId: string;
  coinsEarned: number;
  completedAt: string;
  status: 'Completed' | 'Pending' | 'Rejected';
}

export type RewardCategory =
  | 'Gift Cards'
  | 'Shopping'
  | 'Travel'
  | 'OTT'
  | 'Learning'
  | 'Finance'
  | 'Health';

export type RewardType = 'Gift Cards' | 'Coupons' | 'Affiliate Offers' | 'Digital Products';

export interface RewardItem {
  id: string;
  category: RewardCategory;
  type: RewardType;
  brand: string;
  title: string;
  description: string;
  imageUrl: string;
  coinCost: number;
  valueINR: number;
  stock: number;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  brand: string;
  title: string;
  coinCost: number;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Rejected';
  giftCode?: string;
  giftPin?: string;
  requestDate: string;
  deliveredDate?: string;
}

export interface AffiliateOffer {
  id: string;
  network: 'Cuelinks' | 'EarnKaro' | 'Admitad' | 'vCommission';
  brand: string;
  title: string;
  category: string;
  discountText: string;
  directLink: string;
  earnCoins: number;
  iconUrl: string;
  totalClicks: number;
}

export interface AffiliateClick {
  id: string;
  userId: string;
  offerId: string;
  clickedAt: string;
  earningsStatus: 'Tracked' | 'Paid' | 'Rejected';
}

export interface AdvertiserCampaign {
  id: string;
  advertiserId: string;
  type: 'YouTube Promotion' | 'Website Promotion' | 'Telegram Promotion' | 'App Promotion' | 'Course Promotion';
  title: string;
  promotionUrl: string;
  promoBannerUrl: string;
  targetClicks: number;
  currentClicks: number;
  budgetINR: number;
  isActive: boolean;
  createdAt: string;
}

export interface CampaignClick {
  id: string;
  userId: string;
  campaignId: string;
  earnedCoins: number;
  clickedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  message: string;
  type:
    | 'Membership Purchased'
    | 'Survey Completed'
    | 'Reward Redeemed'
    | 'Gift Card Delivered'
    | 'Referral Success'
    | 'Membership Expiring';
  createdAt: string;
  isRead: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl: string;
  coinsEarned: number;
  gamesPlayed: number;
  surveyEarnings: number;
  referrals: number;
  role: UserRole;
}

export interface ReferralHistoryItem {
  id: string;
  referrerId: string;
  friendId: string;
  friendEmail: string;
  coinsEarned: number;
  status: 'Joined' | 'Subscribed';
  joinedAt: string;
}
