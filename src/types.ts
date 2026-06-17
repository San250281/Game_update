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
  // New Games requested:
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
