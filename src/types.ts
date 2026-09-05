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

export enum UserRole {
  GUEST = 'Guest',
  USER = 'User',
  PREMIUM_USER = 'Premium User',
  ADMIN = 'Admin',
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  GAME_REWARD = 'Game Reward',
  SURVEY_REWARD = 'Survey Reward',
  REFERRAL_REWARD = 'Referral Reward',
  MEMBERSHIP_BONUS = 'Membership Bonus',
  REDEMPTION = 'Redemption',
  ADMIN_ADJUSTMENT = 'Admin Adjustment',
}

export enum TransactionSource {
  GAME = 'game',
  AD = 'ad',
  REFERRAL = 'referral',
  BONUS = 'bonus',
  ADMIN = 'admin',
  WITHDRAWAL = 'withdrawal'
}

export enum GameType {
  SPIN_WHEEL = 'spin_wheel',
  SCRATCH_CARD = 'scratch_card',
  QUIZ = 'quiz',
  TAP_CHALLENGE = 'tap_challenge',
  PUZZLE = 'puzzle',
  LUDO = 'ludo',
  CHESS = 'chess',
  TIC_TAC_TOE = 'tic_tac_toe',
  SNAKE = 'snake',
  TETRIS = 'tetris',
  PONG = 'pong',
  FLAPPY_BIRD = 'flappy_bird',
  MEMORY_MATCH = 'memory_match',
  GAME_2048 = 'game_2048',
  MINESWEEPER = 'minesweeper',
  WORD_GUESSER = 'word_guesser',
  SPACE_SHOOTER = 'space_shooter',
  WHACK_A_MOLE = 'whack_a_mole',
  BALLOON_POPPER = 'balloon_popper',
  BRICK_BREAKER = 'brick_breaker',
  COLOR_MATCHER = 'color_matcher',
  ROCK_PAPER_SESSORS = 'rock_paper_scissors',
  SUDOKU = 'sudoku',
  COIN_FLIP = 'coin_flip',
  DODGE_OBSTACLES = 'dodge_obstacles',
  // Additional Games
  LUCKY_DRAW = 'lucky_draw',
  DAILY_CHECKIN = 'daily_checkin',
  COIN_COLLECTOR = 'coin_collector',
  TREASURE_HUNT = 'treasure_hunt',
  MATCH_3 = 'match_3',
  WORD_SEARCH = 'word_search',
  CROSSWORD = 'crossword',
  CHECKERS = 'checkers',
  CONNECT_4 = 'connect_4',
  REACTION_TIME = 'reaction_time',
  CLICK_SPEED = 'click_speed',
  RUNNER_TEMPLE = 'runner_temple',
  RUNNER_SUBWAY = 'runner_subway',
  DINO_RUNNER = 'dino_runner',
  ENDLESS_JUMP = 'endless_jump',
  SOLITAIRE = 'solitaire',
  POKER = 'poker',
  BLACKJACK = 'blackjack',
  RUMMY = 'rummy',
  UNO = 'uno'
}

export interface UserProfile {
  uid: string;
  name?: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  avatarUrl?: string;
  provider?: ProviderType;
  role?: UserRole;
  coins: number;
  lifetimeCoins?: number;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  lastLogin?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  emailVerified?: boolean;
  membershipPlan?: string;
  membershipExpiresAt?: string;
  lastLoginCoinClaimedDate?: string;
  adsWatchedToday?: number;
  lastAdWatchedAt?: string;
}

export interface WalletState {
  uid: string;
  balance: number;
  lifetimeCoins: number;
  coinsEarned: number;
  coinsRedeemed: number;
  lastUpdatedAt: string;
}

export interface WalletTransaction {
  id?: string;
  transactionId?: string;
  uid?: string;
  userId?: string;
  type: TransactionType | string;
  coins?: number;
  amount?: number;
  source?: TransactionSource;
  description?: string;
  timestamp?: string;
  status?: 'Pending' | 'Completed' | 'Failed';
  createdAt?: string;
}

export interface ReferralRecord {
  referralId: string;
  referrerUid: string;
  newUserUid: string;
  rewardGranted: boolean;
  createdAt: string;
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

export interface GameSession {
  sessionId?: string;
  id?: string;
  uid?: string;
  userId?: string;
  gameId: GameType | string;
  score: number;
  coinsEarned: number;
  createdAt?: string;
  timestamp?: string;
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

export interface AdOffer {
  id: string;
  title: string;
  rewardValue: number;
  cooldownSeconds: number;
  type: 'rewarded' | 'interstitial' | 'banner';
}

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface WithdrawalRequest {
  requestId: string;
  uid: string;
  userName: string;
  userEmail: string;
  amountCoins: number;
  paymentMethod: string;
  paymentDetails: string;
  status: WithdrawalStatus;
  createdAt: string;
  processedAt?: string;
  adminMessage?: string;
}
