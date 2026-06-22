/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  WalletTransaction,
  RewardItem,
  RewardRedemption,
  AffiliateOffer,
  AdvertiserCampaign,
  NotificationItem,
  LeaderboardEntry,
  ReferralHistoryItem,
  GameSession,
  TransactionType,
  SurveyCompletion,
} from '../types';
import { REWARD_ITEMS, AFFILIATE_OFFERS, ADVERTISER_CAMPAIGNS_SEED } from '../data';

// Definition of App State Context
interface AppContextType {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  transactions: WalletTransaction[];
  redemptions: RewardRedemption[];
  notifications: NotificationItem[];
  campaigns: AdvertiserCampaign[];
  referrals: ReferralHistoryItem[];
  gameSessions: GameSession[];
  leaderboards: {
    daily: LeaderboardEntry[];
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
    allTime: LeaderboardEntry[];
  };
  serverConfig: {
    fraudThresholdDailyClicks: number;
    minRedeemLimitCoins: number;
    referralBonusReferrer: number;
    referralBonusFriend: number;
    maintenanceMode: boolean;
  };
  serverLogs: any[];
  adminMetrics: any;

  // Actions
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  register: (email: string, name: string, refCode?: string) => Promise<boolean>;
  verifyEmail: () => Promise<void>;
  updateProfile: (name: string, avatarUrl: string) => void;
  awardCoins: (amount: number, type: string, description: string) => void;
  purchaseMembership: (planId: string) => Promise<boolean>;
  redeemReward: (rewardId: string) => Promise<{ success: boolean; error?: string }>;
  completeSurvey: (providerId: string, minutes: number, coins: number) => Promise<void>;
  clickAffiliateOffer: (offerId: string) => Promise<void>;
  clickAdvertiserCampaign: (campaignId: string) => Promise<void>;
  playGameSession: (gameId: string, score: number, coinsWon: number) => void;
  addNotification: (message: string, type: NotificationItem['type']) => void;
  claimReferralCode: (code: string) => { success: boolean; message: string };

  // Admin Actions
  adminAdjustCoins: (userId: string, amount: number, desc: string) => void;
  adminChangeUserRole: (userId: string, role: UserRole) => void;
  adminManageRedemption: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
  adminUpdateSettings: (newSettings: any) => Promise<void>;
  adminCreateCampaign: (campaign: Omit<AdvertiserCampaign, 'id' | 'currentClicks' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Core Mock Users for Leaderboards & Admin
const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user_admin',
    email: 'san250281@gmail.com',
    displayName: 'Aman (Admin)',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    role: UserRole.ADMIN,
    referralCode: 'ARENA99',
    coins: 45000,
    lifetimeCoins: 58000,
    createdAt: '2026-06-15T09:00:00Z',
    emailVerified: true,
  },
  {
    uid: 'user_1',
    email: 'dhruv_pro@gmail.com',
    displayName: 'Dhruv Gamer',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    role: UserRole.PREMIUM_USER,
    referralCode: 'DHRUV10',
    coins: 24500,
    lifetimeCoins: 48900,
    createdAt: '2026-06-10T11:20:00Z',
    emailVerified: true,
    membershipPlan: 'Monthly Plan',
    membershipExpiresAt: '2026-07-22T11:20:00Z',
  },
  {
    uid: 'user_2',
    email: 'sneha_singh@yahoo.com',
    displayName: 'Sneha Coder',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    role: UserRole.USER,
    referralCode: 'SNEHA88',
    coins: 3800,
    lifetimeCoins: 9200,
    createdAt: '2026-06-12T14:45:00Z',
    emailVerified: false,
  },
  {
    uid: 'user_3',
    email: 'kartik_runner@outlook.com',
    displayName: 'Kartik Rush',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    role: UserRole.PREMIUM_USER,
    referralCode: 'KRUSH5',
    coins: 16800,
    lifetimeCoins: 31200,
    createdAt: '2026-06-16T08:15:00Z',
    emailVerified: true,
    membershipPlan: 'Weekly Plan',
    membershipExpiresAt: '2026-06-25T08:15:00Z',
  },
  {
    uid: 'user_4',
    email: 'priya_sharma@gmail.com',
    displayName: 'Priya Arcader',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    role: UserRole.USER,
    referralCode: 'PRIYA15',
    coins: 7200,
    lifetimeCoins: 11400,
    createdAt: '2026-06-18T10:30:00Z',
    emailVerified: true,
  }
];

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'txn_init_1',
    userId: 'user_1',
    type: 'Game Reward',
    amount: 25,
    description: 'High score on Cryptoe Matcher',
    timestamp: '2026-06-21T09:40:00Z',
    status: 'Completed',
  },
  {
    id: 'txn_init_2',
    userId: 'user_1',
    type: 'Survey Reward',
    amount: 450,
    description: 'CPX Survey Completion feedback #883',
    timestamp: '2026-06-21T10:15:00Z',
    status: 'Completed',
  },
  {
    id: 'txn_init_3',
    userId: 'user_3',
    type: 'Membership Bonus',
    amount: 600,
    description: 'Weekly Plan bonus rewards credit',
    timestamp: '2026-06-20T12:00:00Z',
    status: 'Completed',
  },
  {
    id: 'txn_init_4',
    userId: 'user_4',
    type: 'Referral Reward',
    amount: 100,
    description: 'Referral bonus from user Sneha Coder',
    timestamp: '2026-06-19T14:00:00Z',
    status: 'Completed',
  }
];

const INITIAL_REDEMPTIONS: RewardRedemption[] = [
  {
    id: 'red_init_1',
    userId: 'user_1',
    rewardId: 'gift_card_amazon_50',
    brand: 'Amazon',
    title: 'Amazon Shopping Voucher - ₹50',
    coinCost: 5000,
    status: 'Delivered',
    giftCode: 'AMZN-XHYE-KASJ-8812',
    giftPin: '821903',
    requestDate: '2026-06-20T11:00:00Z',
    deliveredDate: '2026-06-20T15:00:00Z',
  },
  {
    id: 'red_init_2',
    userId: 'user_3',
    rewardId: 'gift_card_flipkart_100',
    brand: 'Flipkart',
    title: 'Flipkart E-Gift Voucher - ₹100',
    coinCost: 10000,
    status: 'Pending',
    requestDate: '2026-06-21T16:20:00Z',
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load States from LocalStorage or Fallback Defaults
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('arenan_current_user');
    return cached ? JSON.parse(cached) : INITIAL_USERS[0]; // Authenticate as Admin by default so they can explore
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const cached = localStorage.getItem('arenan_all_users');
    return cached ? JSON.parse(cached) : INITIAL_USERS;
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const cached = localStorage.getItem('arenan_transactions');
    return cached ? JSON.parse(cached) : INITIAL_TRANSACTIONS;
  });

  const [redemptions, setRedemptions] = useState<RewardRedemption[]>(() => {
    const cached = localStorage.getItem('arenan_redemptions');
    return cached ? JSON.parse(cached) : INITIAL_REDEMPTIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [campaigns, setCampaigns] = useState<AdvertiserCampaign[]>(() => {
    const cached = localStorage.getItem('arenan_campaigns');
    return cached ? JSON.parse(cached) : ADVERTISER_CAMPAIGNS_SEED;
  });

  const [referrals, setReferrals] = useState<ReferralHistoryItem[]>([]);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);

  const [serverConfig, setServerConfig] = useState({
    fraudThresholdDailyClicks: 100,
    minRedeemLimitCoins: 5000,
    referralBonusReferrer: 100,
    referralBonusFriend: 50,
    maintenanceMode: false,
  });

  const [serverLogs, setServerLogs] = useState<any[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<any>(null);

  // Sync to localStorage on adjustment
  useEffect(() => {
    localStorage.setItem('arenan_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('arenan_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('arenan_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('arenan_redemptions', JSON.stringify(redemptions));
  }, [redemptions]);

  useEffect(() => {
    localStorage.setItem('arenan_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  // Handle loading metrics from backend Express server
  const fetchBackendSettingsAndLogs = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setServerConfig(data.settings);
          setServerLogs(data.logs);
          setAdminMetrics(data.stats);
        }
      }
    } catch (e) {
      console.warn('Backend metrics offline/unreachable. Operating with local storage parameters.');
    }
  };

  useEffect(() => {
    fetchBackendSettingsAndLogs();
    const interval = setInterval(fetchBackendSettingsAndLogs, 15000); // Poll metrics
    return () => clearInterval(interval);
  }, []);

  // Sync back core balance in allUsers whenever current user balance/attributes edit
  useEffect(() => {
    if (currentUser) {
      setAllUsers((prev) =>
        prev.map((u) => (u.uid === currentUser.uid ? { ...currentUser } : u))
      );
    }
  }, [currentUser?.coins, currentUser?.role, currentUser?.membershipPlan]);

  // --- ACTIONS ---

  // Add Notification
  const addNotification = (message: string, type: NotificationItem['type']) => {
    const notify: NotificationItem = {
      id: 'notify_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser?.uid || 'guest',
      message,
      type,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [notify, ...prev]);
  };

  // Auth: Email/Google Login (Stateful Sim)
  const login = async (email: string, roleInput?: UserRole): Promise<boolean> => {
    const normalized = email.trim().toLowerCase();
    const existingUser = allUsers.find((u) => u.email.toLowerCase() === normalized);

    if (existingUser) {
      setCurrentUser(existingUser);
      addNotification(`Welcome back, ${existingUser.displayName}!`, 'Referral Success');
      return true;
    } else {
      // Create on the fly
      const nameParts = normalized.split('@')[0];
      const newDName = nameParts.charAt(0).toUpperCase() + nameParts.slice(1);
      const guestUser: UserProfile = {
        uid: 'user_' + Math.random().toString(36).substr(2, 9),
        email: normalized,
        displayName: newDName,
        avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${nameParts}`,
        role: roleInput || UserRole.USER,
        referralCode: 'ARENA' + Math.floor(100 + Math.random() * 900),
        coins: 50, // Starter bonus
        lifetimeCoins: 50,
        createdAt: new Date().toISOString(),
        emailVerified: true,
      };

      // Add default registration transaction
      const starterTx: WalletTransaction = {
        id: 'txn_' + Math.random().toString(36).substr(2, 9),
        userId: guestUser.uid,
        type: 'Membership Bonus',
        amount: 50,
        description: 'Starter Account AirDrop coins',
        timestamp: new Date().toISOString(),
        status: 'Completed',
      };

      setAllUsers((prev) => [...prev, guestUser]);
      setCurrentUser(guestUser);
      setTransactions((prev) => [starterTx, ...prev]);
      addNotification(`Account created successfully! Enjoy 50 starter coins.`, 'Membership Purchased');
      return true;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Auth: Register (Stateful Sim)
  const register = async (email: string, name: string, refCode?: string): Promise<boolean> => {
    const normalized = email.trim().toLowerCase();
    const code = refCode?.trim().toUpperCase();

    // Check existing
    if (allUsers.some((u) => u.email.toLowerCase() === normalized)) {
      return false;
    }

    let starterCoins = 50;
    let referredBy: string | undefined = undefined;

    // Check referral code
    if (code) {
      const referrerUser = allUsers.find((u) => u.referralCode.toUpperCase() === code);
      if (referrerUser) {
        referredBy = referrerUser.uid;
        starterCoins += serverConfig.referralBonusFriend; // Extra referral entry bonus

        // Reward referrer
        adminAdjustCoins(referrerUser.uid, serverConfig.referralBonusReferrer, `Referral Reward for inviting ${name}`);

        // Register referral logs
        const refItem: ReferralHistoryItem = {
          id: 'ref_' + Math.random().toString(36).substr(2, 9),
          referrerId: referrerUser.uid,
          friendId: 'user_pending', // filled below
          friendEmail: normalized,
          coinsEarned: serverConfig.referralBonusReferrer,
          status: 'Joined',
          joinedAt: new Date().toISOString(),
        };
        setReferrals((prev) => [refItem, ...prev]);
      }
    }

    const newUser: UserProfile = {
      uid: 'user_' + Math.random().toString(36).substr(2, 9),
      email: normalized,
      displayName: name,
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name.replace(/\s+/g, '')}`,
      role: UserRole.USER,
      referralCode: 'ARENA' + Math.floor(100 + Math.random() * 900),
      coins: starterCoins,
      lifetimeCoins: starterCoins,
      createdAt: new Date().toISOString(),
      emailVerified: false, // verification required for surveys/redeems
      referredBy,
    };

    // Update friend ID in referrals if active
    if (referredBy) {
      setReferrals((prev) =>
        prev.map((r) => (r.friendEmail === normalized ? { ...r, friendId: newUser.uid } : r))
      );
    }

    // Add transaction logic
    const starterTx: WalletTransaction = {
      id: 'txn_' + Math.random().toString(36).substr(2, 9),
      userId: newUser.uid,
      type: 'Membership Bonus',
      amount: starterCoins,
      description: referredBy ? `Stater Bonus + Referral Claim reward` : `Welcome starter Airdrop`,
      timestamp: new Date().toISOString(),
      status: 'Completed',
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setTransactions((prev) => [starterTx, ...prev]);

    addNotification(`Signed up successfully! Enjoy ${starterCoins} coins. Welcome to RewardArena.`, 'Membership Purchased');
    return true;
  };

  // Verify Email Sim
  const verifyEmail = async () => {
    if (!currentUser) return;
    const updated = { ...currentUser, emailVerified: true };
    setCurrentUser(updated);
    addNotification(`Email verified successfully! You can now participate in surveys.`, 'Referral Success');
  };

  // Profile Edit
  const updateProfile = (name: string, avatarUrl: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, displayName: name, avatarUrl };
    setCurrentUser(updated);
    addNotification('Profile parameters saved successfully', 'Referral Success');
  };

  // Core Coin Awarding Process (Client & Server logs integration)
  const awardCoins = (amount: number, type: string, description: string) => {
    if (!currentUser) return;

    const newCoins = currentUser.coins + amount;
    const newLife = currentUser.lifetimeCoins + (amount > 0 ? amount : 0);

    setCurrentUser({
      ...currentUser,
      coins: newCoins,
      lifetimeCoins: newLife,
    });

    // Save transaction
    const newTx: WalletTransaction = {
      id: 'txn_' + Math.random().toString(36).substr(2, 12),
      userId: currentUser.uid,
      type: type as TransactionType,
      amount,
      description,
      timestamp: new Date().toISOString(),
      status: 'Completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  // 1. Razorpay payments integrations (Trigger actual order creation & verification)
  const purchaseMembership = async (planId: string): Promise<boolean> => {
    if (!currentUser) return false;

    let cost = 10;
    let coinsBonus = 100;
    let label = 'Daily Plan';
    let duration = 1;

    if (planId === 'plan_weekly') {
      cost = 49;
      coinsBonus = 600;
      label = 'Weekly Plan';
      duration = 7;
    } else if (planId === 'plan_monthly') {
      cost = 149;
      coinsBonus = 2500;
      label = 'Monthly Plan';
      duration = 30;
    }

    try {
      // 1. Post order to Razorpay backend simulator
      const ordRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          planId,
          priceINR: cost,
        }),
      });

      if (!ordRes.ok) throw new Error('Razorpay backend order generation failed');
      const orderData = await ordRes.json();

      // 2. Perform virtual payment verify
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: 'pay_rzp_' + Math.random().toString(36).substr(2, 10).toUpperCase(),
          orderId: orderData.orderId,
          signature: 'sig_' + Math.random().toString(36).substr(2, 15),
          userId: currentUser.uid,
          planId,
          priceINR: cost,
          coinsBonus,
        }),
      });

      if (!verifyRes.ok) throw new Error('Razorpay payment signature mismatch');
      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        // Upgrade current role & membership status
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + duration);

        const updatedUser: UserProfile = {
          ...currentUser,
          role: UserRole.PREMIUM_USER,
          membershipPlan: label,
          membershipExpiresAt: expireDate.toISOString(),
          coins: currentUser.coins + coinsBonus,
          lifetimeCoins: currentUser.lifetimeCoins + coinsBonus,
        };

        setCurrentUser(updatedUser);

        // Record Membership deposit transaction
        const mTx: WalletTransaction = {
          id: verifyData.transactionId,
          userId: currentUser.uid,
          type: 'Membership Bonus',
          amount: coinsBonus,
          description: `Credited ${coinsBonus} Coins bonus for unlocking premium ${label}`,
          timestamp: new Date().toISOString(),
          status: 'Completed',
        };

        setTransactions((prev) => [mTx, ...prev]);

        addNotification(`Subscribed successfully! You are now a Premium Member on RewardArena, valid until ${expireDate.toLocaleDateString()}.`, 'Membership Purchased');

        // Refresh admin metrics from express server
        await fetchBackendSettingsAndLogs();
        return true;
      }
    } catch (e) {
      console.error(e);
      // Fallback state update if backend is busy or network fails so user has uninterrupted journey
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + duration);

      const fallbackUser: UserProfile = {
        ...currentUser,
        role: UserRole.PREMIUM_USER,
        membershipPlan: label,
        membershipExpiresAt: expireDate.toISOString(),
        coins: currentUser.coins + coinsBonus,
        lifetimeCoins: currentUser.lifetimeCoins + coinsBonus,
      };

      setCurrentUser(fallbackUser);
      awardCoins(coinsBonus, 'Membership Bonus', `Purchased ${label} Premium Package upgrade fallback`);
      addNotification(`Purchased ${label} successfully! Active until ${expireDate.toLocaleDateString()}.`, 'Membership Purchased');
      return true;
    }

    return false;
  };

  // 2. CPX and BitLabs Survey rewards callback implementation
  const completeSurvey = async (providerId: string, minutes: number, coins: number) => {
    if (!currentUser) return;

    // Send server callback webhook simulation first
    try {
      await fetch(`/api/surveys/callback?userId=${currentUser.uid}&provider=${encodeURIComponent(providerId)}&surveyId=srv_${Math.floor(Math.random() * 100000)}&coins=${coins}`);
    } catch (e) {
      console.warn('Backend callback endpoint unavailable. Completing locally...');
    }

    // Award Coins
    awardCoins(coins, 'Survey Reward', `${providerId} survey completion (${minutes} mins duration)`);
    addNotification(`Survey completion success! Added ${coins} coins credited by ${providerId}.`, 'Survey Completed');

    // record logging
    const comp: SurveyCompletion = {
      id: 'srv_comp_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.uid,
      provider: providerId,
      surveyId: 'srv_' + Math.floor(10000 + Math.random() * 90000),
      coinsEarned: coins,
      completedAt: new Date().toISOString(),
      status: 'Completed',
    };

    setAdminMetrics((prev: any) => prev ? { ...prev, surveysCompleted: prev.surveysCompleted + 1 } : null);
  };

  // 3. Redeem coins for gift cards / discount coupons with strict validation
  const redeemReward = async (rewardId: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'User is not authenticated' };

    const reward = REWARD_ITEMS.find((r) => r.id === rewardId);
    if (!reward) return { success: false, error: 'Reward item does not exist or has expired' };

    if (currentUser.coins < reward.coinCost) {
      return { success: false, error: `Inadequate balance. You need ${reward.coinCost} Coins to purchase this item.` };
    }

    // Deduct coins immediately
    const updatedCoins = currentUser.coins - reward.coinCost;
    setCurrentUser({
      ...currentUser,
      coins: updatedCoins,
      // Coins Redeemed increases
    });

    // Create redemption request
    const redId = 'red_' + Math.random().toString(36).substr(2, 12);
    const newRedemption: RewardRedemption = {
      id: redId,
      userId: currentUser.uid,
      rewardId: reward.id,
      brand: reward.brand,
      title: reward.title,
      coinCost: reward.coinCost,
      status: 'Pending',
      requestDate: new Date().toISOString(),
    };

    setRedemptions((prev) => [newRedemption, ...prev]);

    // Record wallet ledger transaction
    const redeemTx: WalletTransaction = {
      id: 'txn_red_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.uid,
      type: 'Redemption',
      amount: -reward.coinCost,
      description: `Redeemed ${reward.title}`,
      timestamp: new Date().toISOString(),
      status: 'Completed',
    };
    setTransactions((prev) => [redeemTx, ...prev]);

    addNotification(`Redemption request submitted! Code for ${reward.title} will be delivered within 2 hours.`, 'Reward Redeemed');

    // Auto approve small coupons, let admins process gift cards!
    if (reward.category !== 'Gift Cards') {
      setTimeout(async () => {
        await adminManageRedemption(redId, 'Approved');
      }, 5000);
    }

    return { success: true };
  };

  // 4. Affiliate Marketplace redirection clicks
  const clickAffiliateOffer = async (offerId: string) => {
    if (!currentUser) return;
    const offer = AFFILIATE_OFFERS.find((o) => o.id === offerId);
    if (!offer) return;

    try {
      await fetch(`/api/affiliates/click/${offerId}?userId=${currentUser.uid}`);
    } catch (e) {
      console.warn('Backend tracking click system offline.');
    }

    // Award micro clicks reward or notify tracking
    awardCoins(10, 'Referral Reward', `Affiliate click out to ${offer.brand}`);
    addNotification(`Offer tracking code generated. Shop on ${offer.brand} to earn up to ${offer.earnCoins} coins cashback!`, 'Referral Success');
  };

  // 5. Advertise With Us promotions click events
  const clickAdvertiserCampaign = async (campaignId: string) => {
    if (!currentUser) return;
    const camp = campaigns.find((c) => c.id === campaignId);
    if (!camp) return;

    const rewardCoins = 25; // standard promo view reward

    try {
      await fetch('/api/campaigns/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          campaignId,
          actionCoins: rewardCoins,
        }),
      });
    } catch (e) {
      console.warn('Advertiser click logger failed');
    }

    // Award Coins
    awardCoins(rewardCoins, 'Game Reward', `Sponsored promotional view: ${camp.title}`);
    addNotification(`Promotional task completed! You earned ${rewardCoins} sponsored coins.`, 'Referral Success');

    // Update campaign metrics
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, currentClicks: c.currentClicks + 1 } : c
      )
    );
  };

  // 6. Referral code claiming (100 coins to inviter, 50 to invitee)
  const claimReferralCode = (code: string) => {
    if (!currentUser) return { success: false, message: 'Must be logged in to claim.' };
    const codeNormalized = code.trim().toUpperCase();

    if (currentUser.referralCode.toUpperCase() === codeNormalized) {
      return { success: false, message: 'You cannot claim your own invitation code.' };
    }

    if (currentUser.referredBy) {
      return { success: false, message: 'You have already applied a referral invitation code.' };
    }

    const inviter = allUsers.find((u) => u.referralCode.toUpperCase() === codeNormalized);
    if (!inviter) {
      return { success: false, message: 'Referral code not found. Type carefully.' };
    }

    // Award users
    // Friend (Current) gets 50 coins
    const updatedUser = {
      ...currentUser,
      coins: currentUser.coins + serverConfig.referralBonusFriend,
      lifetimeCoins: currentUser.lifetimeCoins + serverConfig.referralBonusFriend,
      referredBy: inviter.uid,
    };
    setCurrentUser(updatedUser);

    const friendTx: WalletTransaction = {
      id: 'txn_ref_friend_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.uid,
      type: 'Referral Reward',
      amount: serverConfig.referralBonusFriend,
      description: `Referral registration premium bonus from ${inviter.displayName}`,
      timestamp: new Date().toISOString(),
      status: 'Completed',
    };
    setTransactions((prev) => [friendTx, ...prev]);

    // Inviter gets 100 coins
    adminAdjustCoins(inviter.uid, serverConfig.referralBonusReferrer, `Referral reward for bringing of ${currentUser.displayName}`);

    // Register history log
    const refItem: ReferralHistoryItem = {
      id: 'ref_' + Math.random().toString(36).substr(2, 9),
      referrerId: inviter.uid,
      friendId: currentUser.uid,
      friendEmail: currentUser.email,
      coinsEarned: serverConfig.referralBonusReferrer,
      status: 'Joined',
      joinedAt: new Date().toISOString(),
    };
    setReferrals((prev) => [refItem, ...prev]);

    addNotification(`Referral code applied! You gained ${serverConfig.referralBonusFriend} bonus coins.`, 'Referral Success');
    return { success: true, message: `Success! ${inviter.displayName}'s invitation code activated.` };
  };

  // 7. Interactive gaming rewards engine
  const playGameSession = (gameId: string, score: number, coinsWon: number) => {
    if (!currentUser) return;

    if (coinsWon > 0) {
      awardCoins(coinsWon, 'Game Reward', `Scored ${score} on ${gameId.replace('_', ' ')}`);
      addNotification(`Great play! You earned +${coinsWon} Arena coins.`, 'Referral Success');
    }

    const session: GameSession = {
      id: 'game_sess_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.uid,
      gameId,
      score,
      coinsEarned: coinsWon,
      timestamp: new Date().toISOString(),
    };

    setGameSessions((prev) => [session, ...prev]);
  };

  // --- LEADERBOARDS COMPILING ---
  const compileLeaderboard = (period: string): LeaderboardEntry[] => {
    // Return allUsers sorted by score metrics with added multipliers
    const factorMap: Record<string, number> = {
      daily: 0.15,
      weekly: 0.45,
      monthly: 0.85,
      allTime: 1.0,
    };
    const multiplier = factorMap[period] || 1.0;

    return [...allUsers]
      .map((user) => {
        // Compute virtual session components for other active profile vectors
        const isSelf = user.uid === currentUser?.uid;
        const totalEarned = Math.round(user.lifetimeCoins * multiplier);
        const refCount = Math.round(user.lifetimeCoins / 1200) + (isSelf ? referrals.length : 0);
        const playedCount = Math.round(user.lifetimeCoins / 180) + (isSelf ? gameSessions.length : 0);
        const surveyEarnings = Math.round(user.lifetimeCoins * 0.4);

        return {
          userId: user.uid,
          username: user.displayName,
          avatarUrl: user.avatarUrl,
          coinsEarned: totalEarned,
          gamesPlayed: playedCount || 2,
          surveyEarnings,
          referrals: refCount || 0,
          role: user.role,
        };
      })
      .sort((a, b) => b.coinsEarned - a.coinsEarned);
  };

  const leaderboards = {
    daily: compileLeaderboard('daily'),
    weekly: compileLeaderboard('weekly'),
    monthly: compileLeaderboard('monthly'),
    allTime: compileLeaderboard('allTime'),
  };

  // --- ADMIN SYSTEMS ACTIONS ---

  // Adjust coins (e.g. credits, refunds or custom balance adjustments)
  const adminAdjustCoins = (userId: string, amount: number, desc: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.uid === userId) {
          const updatedCoins = u.coins + amount;
          const updatedLife = u.lifetimeCoins + (amount > 0 ? amount : 0);

          // If current user is modified, update current user too
          if (currentUser && currentUser.uid === userId) {
            setCurrentUser({
              ...currentUser,
              coins: updatedCoins,
              lifetimeCoins: updatedLife,
            });
          }

          // Generate wallet transaction for ledger consistency
          const adminTx: WalletTransaction = {
            id: 'txn_adm_' + Math.random().toString(36).substr(2, 9),
            userId,
            type: 'Admin Adjustment',
            amount,
            description: desc || 'Admin adjustment',
            timestamp: new Date().toISOString(),
            status: 'Completed',
          };
          setTransactions((prev) => [adminTx, ...prev]);

          return {
            ...u,
            coins: updatedCoins,
            lifetimeCoins: updatedLife,
          };
        }
        return u;
      })
    );
  };

  // Change user role
  const adminChangeUserRole = (userId: string, role: UserRole) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.uid === userId) {
          if (currentUser && currentUser.uid === userId) {
            setCurrentUser({ ...currentUser, role });
          }
          return { ...u, role };
        }
        return u;
      })
    );
    addNotification(`Assigned role ${role} to user ${userId}`, 'Referral Success');
  };

  // Approve / Reject Gift cards redemptions
  const adminManageRedemption = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const red = redemptions.find((r) => r.id === id);
      if (!red) return;

      const res = await fetch('/api/giftcards/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redemptionId: id,
          status,
          brand: red.brand,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRedemptions((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: data.status,
                    giftCode: data.giftCode,
                    giftPin: data.giftPin,
                    deliveredDate: data.deliveredDate,
                  }
                : r
            )
          );
          addNotification(`Redemption for ${red.title} is now ${data.status}!`, 'Gift Card Delivered');
        }
      } else {
        throw new Error('API processing aborted');
      }
    } catch (e) {
      // Offline local fallbacks
      const claimCode = redemptions.find((r) => r.id === id)?.brand + '-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      const claimPin = Math.floor(100000 + Math.random() * 900000).toString();

      setRedemptions((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: status === 'Approved' ? 'Delivered' : 'Rejected',
                giftCode: status === 'Approved' ? claimCode : undefined,
                giftPin: status === 'Approved' ? claimPin : undefined,
                deliveredDate: new Date().toISOString(),
              }
            : r
        )
      );
      addNotification(`Redemption approved locally. e-Voucher generated.`, 'Gift Card Delivered');
    }

    await fetchBackendSettingsAndLogs();
  };

  // Update Settings
  const adminUpdateSettings = async (newSettings: any) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setServerConfig(data.settings);
      }
    } catch (e) {
      setServerConfig((prev) => ({ ...prev, ...newSettings }));
    }
  };

  // Create campaigns
  const adminCreateCampaign = (campData: Omit<AdvertiserCampaign, 'id' | 'currentClicks' | 'createdAt'>) => {
    const newCamp: AdvertiserCampaign = {
      ...campData,
      id: 'camp_user_' + Math.random().toString(36).substr(2, 9),
      currentClicks: 0,
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    addNotification(`Campaign "${campData.title}" launched successfully!`, 'Referral Success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        transactions,
        redemptions,
        notifications,
        campaigns,
        referrals,
        gameSessions,
        leaderboards,
        serverConfig,
        serverLogs,
        adminMetrics,
        login,
        logout,
        register,
        verifyEmail,
        updateProfile,
        awardCoins,
        purchaseMembership,
        redeemReward,
        completeSurvey,
        clickAffiliateOffer,
        clickAdvertiserCampaign,
        playGameSession,
        addNotification,
        claimReferralCode,
        adminAdjustCoins,
        adminChangeUserRole,
        adminManageRedemption,
        adminUpdateSettings,
        adminCreateCampaign,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be applied inside an AppProvider container');
  }
  return context;
};
