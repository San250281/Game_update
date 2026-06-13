/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, WalletTransaction, ReferralRecord, GameSession, AdOffer,
  ProviderType, TransactionType, TransactionSource, GameType,
  WithdrawalRequest, WithdrawalStatus
} from '../types';
import { isFirebaseLive, db, auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

const isMockUid = (uid?: string): boolean => {
  if (!uid) return true;
  return uid.startsWith('google_local_') || uid.startsWith('email_') || uid.startsWith('guest_') || uid === 'anonymous_sandbox_uid';
};

// Validate environment
import '../config/env';

// Mock Data
import { SEED_COMPETITORS, DEFAULT_ADS, AuditLog } from '../mocks/mockData';

// Services Layer
import { 
  getFriendlyNameFromEmail, 
  generateReferralCode, 
  getUserProfile, 
  saveUserProfile, 
  updateUserLastLogin,
  loginUserWithEmail,
  registerUserWithEmail,
  loginUserAnonymously,
  loginUserWithGoogle,
  signOutUser
} from '../services/authService';

import { 
  listWalletTransactions, 
  createWalletTransaction, 
  adminAdjustCoinsInDb 
} from '../services/walletService';

import { 
  listGameSessions, 
  saveGameSession, 
  validateGameScore 
} from '../services/gameService';

import { 
  listAllUsersFromDb, 
  filterAndSortLeaderboard 
} from '../services/leaderboardService';

import { 
  listReferralsFromDb, 
  applyReferralInDb 
} from '../services/referralService';

import { 
  saveAdWatchInDb, 
  checkAdWatchEligibility 
} from '../services/adService';

import {
  listWithdrawalsFromDb,
  createWithdrawalInDb,
  updateWithdrawalInDb
} from '../services/withdrawalService';

export interface RewardEngineState {
  user: UserProfile | null;
  transactions: WalletTransaction[];
  referrals: ReferralRecord[];
  gameSessions: GameSession[];
  withdrawalRequests: WithdrawalRequest[];
  leaderboard: UserProfile[];
  cooldowns: { [key: string]: number };
  allUsers: UserProfile[];
  auditLogs: AuditLog[];
  ads: AdOffer[];
  isFirebaseMode: boolean;
  loading: boolean;
  error: string | null;
  
  // Authentications
  loginWithEmail: (email: string, name: string, password?: string) => Promise<UserProfile>;
  loginAsGuest: () => Promise<UserProfile>;
  loginWithGoogle: (name?: string, email?: string, photoURL?: string, forceSimulate?: boolean) => Promise<UserProfile>;
  logout: () => Promise<void>;
  
  // Wallet & Transactions
  creditCoins: (amount: number, source: TransactionSource, customId?: string) => Promise<void>;
  debitCoins: (amount: number, source: TransactionSource) => Promise<boolean>;
  
  // Withdrawals Workflow
  requestWithdrawal: (amountCoins: number, paymentMethod: string, paymentDetails: string) => Promise<{ success: boolean; message: string }>;
  adminApproveWithdrawal: (requestId: string, adminMessage?: string) => Promise<void>;
  adminRejectWithdrawal: (requestId: string, adminMessage?: string) => Promise<void>;
  
  // Games scoring mechanisms
  submitGameScore: (gameId: GameType, score: number, coinsEarned: number) => Promise<{ success: boolean; message: string }>;
  
  // Referral System
  applyReferralCode: (code: string) => Promise<{ success: boolean; message: string }>;
  
  // Ad System
  watchAd: (adId: string) => Promise<{ success: boolean; reward: number; message: string }>;
  
  // Admin Operations
  adminAdjustCoins: (targetUid: string, amount: number, type: 'credit' | 'debit') => Promise<void>;
  adminToggleUserStatus: (targetUid: string) => Promise<void>;
  adminTriggerMockFraud: (targetUid: string, message: string, details: string) => void;
  adminClearAuditLogs: () => void;
}

export { DEFAULT_ADS };

const RewardEngineContext = createContext<RewardEngineState | undefined>(undefined);

export function RewardEngineProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('rg_user_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [cooldowns, setCooldowns] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('rg_cooldowns');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [ads] = useState<AdOffer[]>(DEFAULT_ADS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync stateful cooldowns to disk
  useEffect(() => {
    localStorage.setItem('rg_cooldowns', JSON.stringify(cooldowns));
  }, [cooldowns]);

  // Load and boot Database State
  useEffect(() => {
    if (!isFirebaseLive) {
      // Sandbox Initialization Mode
      setLoading(true);
      try {
        let localUsersStr = localStorage.getItem('rg_users');
        let localUsers: UserProfile[] = [];
        
        if (!localUsersStr) {
          localUsers = [...SEED_COMPETITORS];
          localStorage.setItem('rg_users', JSON.stringify(localUsers));
        } else {
          localUsers = JSON.parse(localUsersStr);
        }
        setAllUsers(localUsers);

        const storedUserStr = localStorage.getItem('rg_user_session');
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
        if (storedUser) {
          const updatedProfile = localUsers.find(u => u.uid === storedUser.uid);
          const baseProfile = updatedProfile || storedUser;
          ensureLoginCoins(baseProfile, localUsers).then(finalProfile => {
            setUser(finalProfile);
            localStorage.setItem('rg_user_session', JSON.stringify(finalProfile));
          });

          const localTx = localStorage.getItem(`rg_tx_${storedUser.uid}`);
          setTransactions(localTx ? JSON.parse(localTx) : []);

          const localSessions = localStorage.getItem(`rg_sessions_${storedUser.uid}`);
          setGameSessions(localSessions ? JSON.parse(localSessions) : []);

          const localReferrals = localStorage.getItem(`rg_referrals_${storedUser.uid}`);
          setReferrals(localReferrals ? JSON.parse(localReferrals) : []);

          let localWList: WithdrawalRequest[] = [];
          if (baseProfile.isAdmin) {
            const globalW = localStorage.getItem('rg_global_withdrawals');
            localWList = globalW ? JSON.parse(globalW) : [];
          } else {
            const userW = localStorage.getItem(`rg_withdrawals_${storedUser.uid}`);
            localWList = userW ? JSON.parse(userW) : [];
          }
          setWithdrawalRequests(localWList);
        } else {
          setUser(null);
          setTransactions([]);
          setGameSessions([]);
          setReferrals([]);
          setWithdrawalRequests([]);
        }

        const localAudits = localStorage.getItem('rg_fraud_logs');
        setAuditLogs(localAudits ? JSON.parse(localAudits) : []);
      } catch (err) {
        console.error('Local database loading exception: ', err);
        setError('Failure fetching local sandbox cache.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Active Firebase mode synchronization
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      try {
        if (firebaseUser) {
          // Fetch user's profile doc through Service Layer
          let currentUserProfile = await getUserProfile(firebaseUser.uid);
          
          if (currentUserProfile) {
            if (!currentUserProfile.isActive) {
              await firebaseSignOut(auth);
              setError('This account has been disabled by security administrators.');
              setUser(null);
              setLoading(false);
              return;
            }
          } else {
            // Document missing -> Create & Register
            const refCode = generateReferralCode();
            const cleanEmail = firebaseUser.email?.toLowerCase() || `${firebaseUser.uid}@rewardgaming.dev`;
            currentUserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || `Gamer_${firebaseUser.uid.substring(0, 5)}`,
              email: cleanEmail,
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${firebaseUser.uid}`,
              provider: firebaseUser.isAnonymous ? ProviderType.GUEST : ProviderType.GOOGLE,
              coins: 20,
              referralCode: refCode,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              isActive: true,
              isAdmin: cleanEmail === 'game.rewardyn@gmail.com',
              lastLoginCoinClaimedDate: new Date().toISOString().split('T')[0]
            };
            await saveUserProfile(firebaseUser.uid, currentUserProfile);
          }

          // Fetch all user records for leaderboards / admin via Service Layer
          let usersList = await listAllUsersFromDb();
          
          // Seed fallback data if list is low
          if (usersList.length === 0) {
            usersList = [...SEED_COMPETITORS];
          } else {
            const existingUids = new Set(usersList.map((u) => u.uid));
            for (const competitor of SEED_COMPETITORS) {
              if (!existingUids.has(competitor.uid)) {
                usersList.push(competitor);
              }
            }
          }
          setAllUsers(usersList);

          if (currentUserProfile) {
            const finalProfile = await ensureLoginCoins(currentUserProfile, usersList);
            setUser(finalProfile);
            localStorage.setItem('rg_user_session', JSON.stringify(finalProfile));
          }

          // Fetch user's transactions via Service Layer
          let txList = await listWalletTransactions(firebaseUser.uid);
          if (txList.length === 0) {
            const localTx = localStorage.getItem(`rg_tx_${firebaseUser.uid}`);
            txList = localTx ? JSON.parse(localTx) : [];
          }
          setTransactions(txList);

          // Fetch user's game sessions via Service Layer
          let sList = await listGameSessions(firebaseUser.uid);
          if (sList.length === 0) {
            const localSessions = localStorage.getItem(`rg_sessions_${firebaseUser.uid}`);
            sList = localSessions ? JSON.parse(localSessions) : [];
          }
          setGameSessions(sList);

          // Fetch user's referrals via Service Layer
          let rList = await listReferralsFromDb(firebaseUser.uid);
          if (rList.length === 0) {
            const localReferrals = localStorage.getItem(`rg_referrals_${firebaseUser.uid}`);
            rList = localReferrals ? JSON.parse(localReferrals) : [];
          }
          setReferrals(rList);

          // Fetch withdrawal requests via Service Layer
          let wList = await listWithdrawalsFromDb(currentUserProfile?.isAdmin ? undefined : firebaseUser.uid);
          if (wList.length === 0) {
            let localWithdrawalsList: WithdrawalRequest[] = [];
            if (currentUserProfile?.isAdmin) {
              const globalW = localStorage.getItem('rg_global_withdrawals');
              localWithdrawalsList = globalW ? JSON.parse(globalW) : [];
            } else {
              const userW = localStorage.getItem(`rg_withdrawals_${firebaseUser.uid}`);
              localWithdrawalsList = userW ? JSON.parse(userW) : [];
            }
            wList = localWithdrawalsList;
          }
          setWithdrawalRequests(wList);
        } else {
          // Signout clean state
          setUser(null);
          localStorage.removeItem('rg_user_session');
          setTransactions([]);
          setGameSessions([]);
          setReferrals([]);
          setWithdrawalRequests([]);
          setAllUsers([...SEED_COMPETITORS]);
        }
      } catch (err) {
        console.warn('Authentication listener error:', err);
        setUser(null);
        setAllUsers([...SEED_COMPETITORS]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isFirebaseLive]);

  // Standing calculation
  useEffect(() => {
    setLeaderboard(filterAndSortLeaderboard(allUsers));
  }, [allUsers]);

  // Ensure daily passive login coins are credited
  const ensureLoginCoins = async (profile: UserProfile, currentUsers: UserProfile[]): Promise<UserProfile> => {
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastLoginCoinClaimedDate === today) {
      return profile;
    }

    const bonusAmount = 20;
    const txId = 'login_bonus_' + profile.uid + '_' + today;
    
    const newTx: WalletTransaction = {
      transactionId: txId,
      uid: profile.uid,
      type: TransactionType.CREDIT,
      coins: bonusAmount,
      source: TransactionSource.BONUS,
      createdAt: new Date().toISOString()
    };

    const updatedCoins = (profile.coins || 0) + bonusAmount;
    const updatedProfile: UserProfile = {
      ...profile,
      coins: updatedCoins,
      lastLoginCoinClaimedDate: today,
      lastLogin: new Date().toISOString()
    };

    if (isFirebaseLive && !isMockUid(profile.uid)) {
      await createWalletTransaction(newTx, updatedCoins);
      await saveUserProfile(profile.uid, {
        lastLoginCoinClaimedDate: today,
        lastLogin: updatedProfile.lastLogin
      });
    }

    // Sync state and storage
    const localSpecTxKey = `rg_tx_${profile.uid}`;
    const localTxListStr = localStorage.getItem(localSpecTxKey);
    const localTxList = localTxListStr ? JSON.parse(localTxListStr) : [];
    localStorage.setItem(localSpecTxKey, JSON.stringify([newTx, ...localTxList]));

    setTransactions(prev => {
      const exists = prev.some(t => t.transactionId === txId);
      return exists ? prev : [newTx, ...prev];
    });

    const nextUsers = currentUsers.map(u => u.uid === profile.uid ? updatedProfile : u);
    setAllUsers(nextUsers);
    localStorage.setItem('rg_users', JSON.stringify(nextUsers));

    return updatedProfile;
  };

  const registerUserRecord = async (profile: UserProfile, listUsers: UserProfile[]) => {
    if (isFirebaseLive && !isMockUid(profile.uid)) {
      await saveUserProfile(profile.uid, profile);
    }
    const updatedUsers = [...listUsers, profile];
    setAllUsers(updatedUsers);
    localStorage.setItem('rg_users', JSON.stringify(updatedUsers));
    setUser(profile);
    localStorage.setItem('rg_user_session', JSON.stringify(profile));
  };

  // Authentications
  const loginWithEmail = async (email: string, name: string, password?: string) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      
      if (isFirebaseLive) {
        try {
          let firebaseUser;
          try {
            const signup = await loginUserWithEmail(cleanEmail, password);
            firebaseUser = signup.user;
          } catch (signInErr: any) {
            // Attempt Register/Create
            if (
              signInErr.code === 'auth/user-not-found' || 
              signInErr.code === 'auth/invalid-credential' || 
              signInErr.code === 'auth/missing-password' ||
              signInErr.code === 'auth/invalid-email' ||
              String(signInErr).includes('auth/user-not-found') ||
              String(signInErr).includes('auth/invalid-credential')
            ) {
              const res = await registerUserWithEmail(cleanEmail, password);
              firebaseUser = res.user;
            } else {
              throw signInErr;
            }
          }

          // Decentralize creation to onAuthStateChanged: Poll until the new or existing profile gets loaded by listener
          let profile = await getUserProfile(firebaseUser.uid);
          let attempts = 0;
          while (!profile && attempts < 10) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            profile = await getUserProfile(firebaseUser.uid);
            attempts++;
          }

          if (!profile) {
            throw new Error('Timeout while loading user registration profile.');
          }

          if (!profile.isActive) {
            await signOutUser();
            throw new Error('This user account has been disabled by security administrators.');
          }

          // Only update changeable metadata fields to avoid key conflicts or schema creation collisions
          const finalName = name || profile.name;
          if (finalName !== profile.name) {
            await saveUserProfile(firebaseUser.uid, {
              name: finalName,
              lastLogin: new Date().toISOString()
            });
            profile = { ...profile, name: finalName, lastLogin: new Date().toISOString() };
          } else {
            await updateUserLastLogin(firebaseUser.uid, new Date().toISOString());
            profile.lastLogin = new Date().toISOString();
          }
          
          const finalProfile = await ensureLoginCoins(profile, allUsers);
          setUser(finalProfile);
          localStorage.setItem('rg_user_session', JSON.stringify(finalProfile));
          return finalProfile;
        } catch (fbErr: any) {
          console.warn('Firebase login credentials error, using local fallback:', fbErr);
        }
      }

      // Local sandbox login credentials logic fallback
      const existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        if (!existing.isActive) {
          throw new Error('This user account has been disabled by security administrators.');
        }
        const updated = { ...existing, lastLogin: new Date().toISOString() };
        const list = allUsers.map(u => u.uid === existing.uid ? updated : u);
        setAllUsers(list);
        localStorage.setItem('rg_users', JSON.stringify(list));
        const finalProfile = await ensureLoginCoins(updated, list);
        setUser(finalProfile);
        localStorage.setItem('rg_user_session', JSON.stringify(finalProfile));
        return finalProfile;
      } else {
        const newUid = 'email_' + Math.random().toString(36).substring(2, 11);
        const refCode = generateReferralCode();
        const defaultProfile: UserProfile = {
          uid: newUid,
          name: name || email.split('@')[0],
          email: cleanEmail,
          photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${newUid}`,
          provider: ProviderType.EMAIL,
          coins: 20,
          referralCode: refCode,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          isAdmin: cleanEmail === 'game.rewardyn@gmail.com',
          lastLoginCoinClaimedDate: new Date().toISOString().split('T')[0]
        };
        await registerUserRecord(defaultProfile, allUsers);
        return defaultProfile;
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setLoading(true);
    try {
      if (isFirebaseLive) {
        try {
          const res = await loginUserAnonymously();
          const firebaseUser = res.user;
          
          // Poll until registered by our central listener
          let profile = await getUserProfile(firebaseUser.uid);
          let attempts = 0;
          while (!profile && attempts < 10) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            profile = await getUserProfile(firebaseUser.uid);
            attempts++;
          }
          
          if (!profile) {
            throw new Error('Guest profile creation timeout.');
          }

          if (!profile.isActive) {
            await signOutUser();
            throw new Error('This guest session has been blacklisted.');
          }

          await updateUserLastLogin(firebaseUser.uid, new Date().toISOString());
          profile.lastLogin = new Date().toISOString();

          setUser(profile);
          localStorage.setItem('rg_user_session', JSON.stringify(profile));
          return profile;
        } catch (fbErr: any) {
          console.warn('Firebase Guest error, using local fallback:', fbErr);
        }
      }

      // Guest sandbox simulation fallback
      const gId = 'guest_' + Math.random().toString(36).substring(2, 9);
      const randName = `Guest #${Math.floor(1000 + Math.random() * 9000)}`;
      const profile: UserProfile = {
        uid: gId,
        name: randName,
        email: `${gId}@rewardgaming.dev`,
        photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${gId}`,
        provider: ProviderType.GUEST,
        coins: 0,
        referralCode: generateReferralCode(),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      };
      await registerUserRecord(profile, allUsers);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (name?: string, email?: string, photoURL?: string, forceSimulate: boolean = false) => {
    setLoading(true);
    try {
      if (isFirebaseLive && !forceSimulate) {
        const result = await loginUserWithGoogle();
        const firebaseUser = result.user;
        
        // Let onAuthStateChanged handle the authoritative creation and registration
        let profile = await getUserProfile(firebaseUser.uid);
        let attempts = 0;
        while (!profile && attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          profile = await getUserProfile(firebaseUser.uid);
          attempts++;
        }

        if (!profile) {
          throw new Error('Timeout loading google user profile.');
        }

        if (!profile.isActive) {
          await signOutUser();
          throw new Error('This user account is banned.');
        }

        // Safe metadata update
        const finalName = firebaseUser.displayName || name || profile.name;
        const finalPhoto = firebaseUser.photoURL || photoURL || profile.photoURL;

        if (finalName !== profile.name || finalPhoto !== profile.photoURL) {
          const updateObj: Partial<UserProfile> = {};
          if (finalName !== profile.name) updateObj.name = finalName;
          if (finalPhoto !== profile.photoURL) updateObj.photoURL = finalPhoto;
          updateObj.lastLogin = new Date().toISOString();

          await saveUserProfile(firebaseUser.uid, updateObj);
          profile = { ...profile, ...updateObj };
        } else {
          await updateUserLastLogin(firebaseUser.uid, new Date().toISOString());
          profile.lastLogin = new Date().toISOString();
        }
        
        setUser(profile);
        localStorage.setItem('rg_user_session', JSON.stringify(profile));
        return profile;
      }

      // Fallback simulation / force Simulate
      let simUid = '';
      if (isFirebaseLive) {
        try {
          const res = await loginUserAnonymously();
          simUid = res.user.uid;
        } catch (anonErr) {
          console.warn('Simulated anonymous auth failed, using purely local uid:', anonErr);
          simUid = 'google_local_' + Math.random().toString(36).substring(2, 11);
        }
      } else {
        simUid = 'google_local_' + Math.random().toString(36).substring(2, 11);
      }

      const finalEmail = (email || 'game.rewardyn@gmail.com').trim().toLowerCase();
      const finalName = name || 'Game Rewardyn';
      const finalPhoto = photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${finalEmail}`;

      if (isFirebaseLive && !simUid.startsWith('google_local_')) {
        let profile = await getUserProfile(simUid);
        if (profile) {
          if (!profile.isActive) {
            await signOutUser();
            throw new Error('This user account is banned.');
          }
          profile = {
            ...profile,
            photoURL: finalPhoto,
            name: finalName,
            lastLogin: new Date().toISOString()
          };
          await saveUserProfile(simUid, {
            name: profile.name,
            photoURL: profile.photoURL,
            lastLogin: profile.lastLogin
          });
        } else {
          profile = {
            uid: simUid,
            name: finalName,
            email: finalEmail,
            photoURL: finalPhoto,
            provider: ProviderType.GOOGLE,
            coins: 20,
            referralCode: generateReferralCode(),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true,
            isAdmin: finalEmail === 'game.rewardyn@gmail.com'
          };
          await saveUserProfile(simUid, profile);
        }
        setUser(profile);
        localStorage.setItem('rg_user_session', JSON.stringify(profile));
        return profile;
      } else {
        // Local sandbox google fallback
        const existing = allUsers.find(u => u.email.toLowerCase() === finalEmail);
        if (existing) {
          if (!existing.isActive) {
            throw new Error('This user account is banned.');
          }
          const updated = {
            ...existing,
            photoURL: finalPhoto || existing.photoURL,
            name: finalName || existing.name,
            lastLogin: new Date().toISOString()
          };
          const list = allUsers.map(u => u.uid === existing.uid ? updated : u);
          setAllUsers(list);
          localStorage.setItem('rg_users', JSON.stringify(list));
          setUser(updated);
          localStorage.setItem('rg_user_session', JSON.stringify(updated));
          return updated;
        } else {
          const profile: UserProfile = {
            uid: simUid,
            name: finalName,
            email: finalEmail,
            photoURL: finalPhoto,
            provider: ProviderType.GOOGLE,
            coins: 20,
            referralCode: generateReferralCode(),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true,
            isAdmin: finalEmail === 'game.rewardyn@gmail.com'
          };
          await registerUserRecord(profile, allUsers);
          return profile;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('rg_user_session');
    if (isFirebaseLive) {
      await signOutUser();
    }
  };

  // Wallet Actions
  const creditCoins = async (amount: number, source: TransactionSource, customId?: string) => {
    if (!user) return;
    
    const txId = customId || 'tx_' + Math.random().toString(36).substring(2, 15);
    const newTx: WalletTransaction = {
      transactionId: txId,
      uid: user.uid,
      type: TransactionType.CREDIT,
      coins: amount,
      source,
      createdAt: new Date().toISOString()
    };

    const newCoinCount = user.coins + amount;
    const updatedUser = { ...user, coins: newCoinCount };

    if (isFirebaseLive && !isMockUid(user.uid)) {
      await createWalletTransaction(newTx, newCoinCount);
    }

    setUser(updatedUser);
    localStorage.setItem('rg_user_session', JSON.stringify(updatedUser));

    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);

    const updatedUsersList = allUsers.map(u => u.uid === user.uid ? updatedUser : u);
    setAllUsers(updatedUsersList);

    localStorage.setItem(`rg_tx_${user.uid}`, JSON.stringify(updatedTxList));
    localStorage.setItem('rg_users', JSON.stringify(updatedUsersList));
  };

  const debitCoins = async (amount: number, source: TransactionSource) => {
    if (!user || user.coins < amount) return false;

    const txId = 'tx_' + Math.random().toString(36).substring(2, 15);
    const newTx: WalletTransaction = {
      transactionId: txId,
      uid: user.uid,
      type: TransactionType.DEBIT,
      coins: amount,
      source,
      createdAt: new Date().toISOString()
    };

    const newCoinCount = user.coins - amount;
    const updatedUser = { ...user, coins: newCoinCount };

    if (isFirebaseLive && !isMockUid(user.uid)) {
      await createWalletTransaction(newTx, newCoinCount);
    }

    setUser(updatedUser);
    localStorage.setItem('rg_user_session', JSON.stringify(updatedUser));

    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);

    const updatedUsersList = allUsers.map(u => u.uid === user.uid ? updatedUser : u);
    setAllUsers(updatedUsersList);

    localStorage.setItem(`rg_tx_${user.uid}`, JSON.stringify(updatedTxList));
    localStorage.setItem('rg_users', JSON.stringify(updatedUsersList));

    return true;
  };

  // Withdrawals Workflows
  const requestWithdrawal = async (amountCoins: number, paymentMethod: string, paymentDetails: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'You must be logged in.' };
    
    if (amountCoins <= 0) {
      return { success: false, message: 'Withdrawal count must be greater than zero.' };
    }
    
    if (user.coins < amountCoins) {
      return { success: false, message: 'Insufficient balance to request withdrawal.' };
    }

    const pendingRequests = withdrawalRequests.filter(r => r.uid === user.uid && r.status === WithdrawalStatus.PENDING);
    if (pendingRequests.length >= 3) {
      adminTriggerMockFraud(
        user.uid,
        'Withdrawal Request Flooding',
        `User attempted to submit another withdrawal request while already having ${pendingRequests.length} pending cash-outs.`
      );
      return { success: false, message: 'You have exceeded the maximum pending withdrawal limit of 3. Please wait for reviews.' };
    }

    const requestId = 'withdraw_' + Math.random().toString(36).substring(2, 15);
    const newRequest: WithdrawalRequest = {
      requestId,
      uid: user.uid,
      userName: user.name,
      userEmail: user.email,
      amountCoins,
      paymentMethod,
      paymentDetails,
      status: WithdrawalStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseLive && !isMockUid(user.uid)) {
      try {
        await createWithdrawalInDb(newRequest);
      } catch (err: any) {
        return { success: false, message: `Could not save withdrawal request in Live database.` };
      }
    }

    const updatedRequests = [newRequest, ...withdrawalRequests];
    setWithdrawalRequests(updatedRequests);
    
    localStorage.setItem(`rg_withdrawals_${user.uid}`, JSON.stringify(updatedRequests.filter(r => r.uid === user.uid)));
    const globalWStr = localStorage.getItem('rg_global_withdrawals');
    const globalW: WithdrawalRequest[] = globalWStr ? JSON.parse(globalWStr) : [];
    localStorage.setItem('rg_global_withdrawals', JSON.stringify([newRequest, ...globalW]));

    return { success: true, message: 'Withdrawal request registered! Pending review from administrative hub.' };
  };

  const adminApproveWithdrawal = async (requestId: string, adminMessage?: string) => {
    const idx = withdrawalRequests.findIndex(r => r.requestId === requestId);
    if (idx === -1) return;
    const request = withdrawalRequests[idx];
    
    if (request.status !== WithdrawalStatus.PENDING) return;

    const targetUser = allUsers.find(u => u.uid === request.uid);
    if (!targetUser) return;

    if (targetUser.coins < request.amountCoins) {
      adminTriggerMockFraud(
        request.uid,
        'Insufficient Balance upon approval',
        `Admin attempted to approve withdrawal ID: ${requestId} but User has only ${targetUser.coins} coins.`
      );
      return;
    }

    const newCoins = targetUser.coins - request.amountCoins;
    const finalRequest: WithdrawalRequest = {
      ...request,
      status: WithdrawalStatus.APPROVED,
      processedAt: new Date().toISOString(),
      adminMessage: adminMessage || 'Processed successfully by Admin.'
    };

    const debitTx: WalletTransaction = {
      transactionId: 'tx_withdrawal_approved_' + requestId,
      uid: request.uid,
      type: TransactionType.DEBIT,
      coins: request.amountCoins,
      source: TransactionSource.WITHDRAWAL,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseLive && !isMockUid(request.uid)) {
      await updateWithdrawalInDb(requestId, {
        status: WithdrawalStatus.APPROVED,
        processedAt: finalRequest.processedAt,
        adminMessage: finalRequest.adminMessage
      }, request.uid, newCoins, debitTx);
    }

    if (user && user.uid === request.uid) {
      const updatedLoggedInUser = { ...user, coins: newCoins };
      setUser(updatedLoggedInUser);
      localStorage.setItem('rg_user_session', JSON.stringify(updatedLoggedInUser));
      setTransactions([debitTx, ...transactions]);
      localStorage.setItem(`rg_tx_${request.uid}`, JSON.stringify([debitTx, ...transactions]));
    } else {
      const userTxKey = `rg_tx_${request.uid}`;
      const savedTxStr = localStorage.getItem(userTxKey);
      const savedTxList = savedTxStr ? JSON.parse(savedTxStr) : [];
      localStorage.setItem(userTxKey, JSON.stringify([debitTx, ...savedTxList]));
    }

    const updatedList = withdrawalRequests.map(r => r.requestId === requestId ? finalRequest : r);
    setWithdrawalRequests(updatedList);

    const globalWStr = localStorage.getItem('rg_global_withdrawals');
    if (globalWStr) {
      const globalWList: WithdrawalRequest[] = JSON.parse(globalWStr);
      localStorage.setItem('rg_global_withdrawals', JSON.stringify(
        globalWList.map(r => r.requestId === requestId ? finalRequest : r)
      ));
    }
    const userWKey = `rg_withdrawals_${request.uid}`;
    const userWStr = localStorage.getItem(userWKey);
    if (userWStr) {
      const userWList: WithdrawalRequest[] = JSON.parse(userWStr);
      localStorage.setItem(userWKey, JSON.stringify(
        userWList.map(r => r.requestId === requestId ? finalRequest : r)
      ));
    }

    const updatedAllUsers = allUsers.map(u => {
      if (u.uid === request.uid) {
        return { ...u, coins: newCoins };
      }
      return u;
    });
    setAllUsers(updatedAllUsers);
    localStorage.setItem('rg_users', JSON.stringify(updatedAllUsers));
  };

  const adminRejectWithdrawal = async (requestId: string, adminMessage?: string) => {
    const idx = withdrawalRequests.findIndex(r => r.requestId === requestId);
    if (idx === -1) return;
    const request = withdrawalRequests[idx];
    
    if (request.status !== WithdrawalStatus.PENDING) return;

    const finalRequest: WithdrawalRequest = {
      ...request,
      status: WithdrawalStatus.REJECTED,
      processedAt: new Date().toISOString(),
      adminMessage: adminMessage || 'Rejected by administrator review.'
    };

    if (isFirebaseLive && !isMockUid(request.uid)) {
      await updateWithdrawalInDb(requestId, {
        status: WithdrawalStatus.REJECTED,
        processedAt: finalRequest.processedAt,
        adminMessage: finalRequest.adminMessage
      });
    }

    const updatedList = withdrawalRequests.map(r => r.requestId === requestId ? finalRequest : r);
    setWithdrawalRequests(updatedList);

    const globalWStr = localStorage.getItem('rg_global_withdrawals');
    if (globalWStr) {
      const globalWList: WithdrawalRequest[] = JSON.parse(globalWStr);
      localStorage.setItem('rg_global_withdrawals', JSON.stringify(
        globalWList.map(r => r.requestId === requestId ? finalRequest : r)
      ));
    }
    const userWKey = `rg_withdrawals_${request.uid}`;
    const userWStr = localStorage.getItem(userWKey);
    if (userWStr) {
      const userWList: WithdrawalRequest[] = JSON.parse(userWStr);
      localStorage.setItem(userWKey, JSON.stringify(
        userWList.map(r => r.requestId === requestId ? finalRequest : r)
      ));
    }
  };

  // Submit score with timing & anti-cheat checks via Service Layer
  const submitGameScore = async (gameId: GameType, score: number, coinsEarned: number) => {
    if (!user) return { success: false, message: 'You must sign in to submit results.' };

    const now = Date.now();
    const gameCooldownKey = `cooldown_${gameId}`;
    const endCooldownTime = cooldowns[gameCooldownKey] || 0;
    
    if (now < endCooldownTime) {
      const remainSecs = Math.ceil((endCooldownTime - now) / 1000);
      adminTriggerMockFraud(
        user.uid, 
        'Gameplay Cooldown Exploited', 
        `User attempted submitting score for ${gameId} with cooldown of ${remainSecs}s active.`
      );
      return { 
        success: false, 
        message: `Cooldown active. Please wait ${remainSecs} more seconds to submit score.` 
      };
    }

    // Call service layer score and cheating boundary validator
    const { isCheating, cheatReason } = validateGameScore(gameId, score, coinsEarned);

    if (isCheating) {
      adminTriggerMockFraud(user.uid, 'High Probability Payout Spoof', cheatReason);
      return { 
        success: false, 
        message: 'Security Audit: High-frequency coin submission caught. Score flagged for review.'
      };
    }

    const delay = gameId === GameType.SPIN_WHEEL ? 30 : gameId === GameType.TAP_CHALLENGE ? 45 : 60;
    const futureTime = now + (delay * 1000);
    setCooldowns(prev => ({
      ...prev,
      [gameCooldownKey]: futureTime
    }));

    const sId = 'sess_' + Math.random().toString(36).substring(2, 15);
    const newSession: GameSession = {
      sessionId: sId,
      uid: user.uid,
      gameId,
      score,
      coinsEarned,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseLive && !isMockUid(user.uid)) {
      await saveGameSession(newSession);
    }

    const updatedSessions = [newSession, ...gameSessions];
    setGameSessions(updatedSessions);
    localStorage.setItem(`rg_sessions_${user.uid}`, JSON.stringify(updatedSessions));

    if (coinsEarned > 0) {
      await creditCoins(coinsEarned, TransactionSource.GAME);
    }

    return { 
      success: true, 
      message: coinsEarned > 0 
        ? `Victory! Added ${coinsEarned} Coins into your Gaming Wallet.` 
        : `Well played! Played successfully, earning high scores of ${score}.`
    };
  };

  // Referrals
  const applyReferralCode = async (code: string) => {
    if (!user) return { success: false, message: 'You must authorize to enter codes.' };
    if (user.referredBy) return { success: false, message: 'This account has already registered references.' };
    
    const targetCode = code.toUpperCase().trim();
    if (user.referralCode === targetCode) {
      return { success: false, message: 'You cannot use your own referral credentials.' };
    }

    const referrer = allUsers.find(u => u.referralCode === targetCode);
    if (!referrer) {
      return { success: false, message: 'Referral code not found in our directory.' };
    }

    // 1. Anti-referral abuse: prevent same base emails (prevent email salt/sub-address exploits)
    const baseEmail = (email: string) => email.split('@')[0].split('+')[0].toLowerCase();
    if (baseEmail(referrer.email) === baseEmail(user.email)) {
      adminTriggerMockFraud(
        user.uid,
        'Referral Loop Stopped',
        `User ${user.name} attempted applying referral code of referrer ${referrer.name} with identical email base.`
      );
      return { success: false, message: 'Security block: referral address handle collision check failed.' };
    }

    // 2. Anti-referral abuse: cap refers per referrer (max 10 lifetime invites per account to combat bot farms)
    const referrerReferralsCount = referrals.filter(r => r.referrerUid === referrer.uid).length;
    if (referrerReferralsCount >= 10) {
      adminTriggerMockFraud(
        referrer.uid,
        'Referral Threshold Exceeded',
        `User ${referrer.name} has hit the lifetime referral threshold of 10 users.`
      );
      return { success: false, message: 'This invite code is inactive as the owner has completed their max invitation limit of 10.' };
    }

    const refId = 'ref_' + Math.random().toString(36).substring(2, 15);
    const refRecord: ReferralRecord = {
      referralId: refId,
      referrerUid: referrer.uid,
      newUserUid: user.uid,
      rewardGranted: true,
      createdAt: new Date().toISOString()
    };

    const updatedUser = {
      ...user,
      referredBy: referrer.uid
    };

    const finalReferrerCoins = referrer.coins + 500;
    const finalReferrer = {
      ...referrer,
      coins: finalReferrerCoins
    };

    const inviteeCoins = user.coins + 200;
    const inviteeTxId = 'tx_invitee_' + Math.random().toString(36).substring(2, 15);
    const inviteeTx: WalletTransaction = {
      transactionId: inviteeTxId,
      uid: user.uid,
      type: TransactionType.CREDIT,
      coins: 200,
      source: TransactionSource.REFERRAL,
      createdAt: new Date().toISOString()
    };

    const inviterTxId = 'tx_inviter_' + Math.random().toString(36).substring(2, 15);
    const inviterTx: WalletTransaction = {
      transactionId: inviterTxId,
      uid: referrer.uid,
      type: TransactionType.CREDIT,
      coins: 500,
      source: TransactionSource.REFERRAL,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseLive && !isMockUid(user.uid) && !isMockUid(referrer.uid)) {
      await applyReferralInDb(
        refRecord,
        user.uid,
        referrer.uid,
        inviteeCoins,
        finalReferrerCoins,
        inviteeTx,
        inviterTx
      );
    }

    setUser({ ...updatedUser, coins: inviteeCoins });
    localStorage.setItem('rg_user_session', JSON.stringify({ ...updatedUser, coins: inviteeCoins }));

    const updatedRefs = [refRecord, ...referrals];
    setReferrals(updatedRefs);

    if (!isFirebaseLive || isMockUid(user.uid) || isMockUid(referrer.uid)) {
      localStorage.setItem(`rg_referrals_${user.uid}`, JSON.stringify(updatedRefs));
    }

    // Update transactions list locally
    setTransactions(prev => [inviteeTx, ...prev]);

    const updatedUsersList = allUsers.map(u => {
      if (u.uid === user.uid) return { ...updatedUser, coins: inviteeCoins };
      if (u.uid === referrer.uid) return finalReferrer;
      return u;
    });
    setAllUsers(updatedUsersList);

    if (!isFirebaseLive || isMockUid(user.uid) || isMockUid(referrer.uid)) {
      localStorage.setItem('rg_users', JSON.stringify(updatedUsersList));
      const compTxListStr = localStorage.getItem(`rg_tx_${referrer.uid}`);
      const compTxList: WalletTransaction[] = compTxListStr ? JSON.parse(compTxListStr) : [];
      localStorage.setItem(`rg_tx_${referrer.uid}`, JSON.stringify([inviterTx, ...compTxList]));
    }

    return { 
      success: true, 
      message: `Referral unlocked! Added 200 welcome coins. ${referrer.name} received 500 referral bonus.` 
    };
  };

  // Watch monetized ad via Service Layer
  const watchAd = async (adId: string) => {
    if (!user) return { success: false, reward: 0, message: 'Sign in to earn ad rewards.' };

    const todayStr = new Date().toISOString().split('T')[0];
    const { eligible, message, cleanAdsWatchedToday } = checkAdWatchEligibility(user, todayStr);

    if (!eligible) {
      return { success: false, reward: 0, message: message || 'Ad play limit in place.' };
    }

    const offer = ads.find(a => a.id === adId);
    if (!offer) {
      return { success: false, reward: 0, message: 'Invalid ad network campaign target.' };
    }

    // Set cooldown (5 seconds after claim as specified)
    const updatedCooldowns = {
      ...cooldowns,
      [`cooldown_${adId}`]: Date.now() + (5 * 1000)
    };
    setCooldowns(updatedCooldowns);

    const txId = 'tx_ad_' + Math.random().toString(36).substring(2, 15);
    const lastAdWatchedAt = new Date().toISOString();

    // Conform exactly to Transaction Ledger Requirement (Point 6)
    // while keeping compatible backing fields to avoid breaking the local render systems
    const txPayload = {
      transactionId: txId,
      uid: user.uid,
      type: TransactionType.CREDIT, // Credit type as required by standard ledger, compatible with all rule versions
      coins: 10,          // Conforms to 10 Coins Per Ad reward
      reward: 10,         // Conforms to 10 Coins Per Ad reward
      source: 'ad',       // Conforms to Transaction validations
      createdAt: lastAdWatchedAt,
      adId: adId
    };

    const nextCoins = user.coins + 10;
    const nextAdsCount = cleanAdsWatchedToday + 1;

    if (isFirebaseLive && !isMockUid(user.uid)) {
      try {
        await saveAdWatchInDb(user.uid, txId, txPayload, nextCoins, nextAdsCount, lastAdWatchedAt);
      } catch (dbErr: any) {
        console.error("Firestore Ad Watch Save Error: ", dbErr);
        let errMsg = "Failed to update balance on the cloud server. Please try again.";
        if (dbErr && dbErr.message) {
          try {
            const parsed = JSON.parse(dbErr.message);
            if (parsed && parsed.error) {
              errMsg = `Ledger update failed: ${parsed.error}`;
            }
          } catch (_) {
            errMsg = `Ledger update failed: ${dbErr.message}`;
          }
        }
        return {
          success: false,
          reward: 0,
          message: errMsg
        };
      }
    }

    const updatedUser: UserProfile = {
      ...user,
      coins: nextCoins,
      adsWatchedToday: nextAdsCount,
      lastAdWatchedAt
    };

    setUser(updatedUser);
    localStorage.setItem('rg_user_session', JSON.stringify(updatedUser));

    const updatedTxList = [txPayload as WalletTransaction, ...transactions];
    setTransactions(updatedTxList);

    const updatedUsersList = allUsers.map(u => u.uid === user.uid ? updatedUser : u);
    setAllUsers(updatedUsersList);

    localStorage.setItem(`rg_tx_${user.uid}`, JSON.stringify(updatedTxList));
    localStorage.setItem('rg_users', JSON.stringify(updatedUsersList));

    return {
      success: true,
      reward: 10,
      message: `Monetag Ad successfully watched! Claimed 10 Coins. (${nextAdsCount}/40 today)`
    };
  };

  // Secure Admin operations
  const adminAdjustCoins = async (targetUid: string, amount: number, type: 'credit' | 'debit') => {
    if (!user || !user.isAdmin) throw new Error('Unassigned security authorization clearance breach attempt.');

    const targetUser = allUsers.find(u => u.uid === targetUid);
    if (!targetUser) throw new Error('Target user database entity mismatch.');

    const cleanCoins = Math.max(0, type === 'credit' ? targetUser.coins + amount : targetUser.coins - amount);
    
    // Create Audit transaction trail log
    const auditTxId = 'admin_tx_' + Math.random().toString(36).substring(2, 11);
    const adminTx: WalletTransaction = {
      transactionId: auditTxId,
      uid: targetUid,
      type: type === 'credit' ? TransactionType.CREDIT : TransactionType.DEBIT,
      coins: amount,
      source: TransactionSource.ADMIN,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseLive && !isMockUid(targetUid)) {
      await adminAdjustCoinsInDb(targetUid, cleanCoins, adminTx);
    }

    const updatedTargetUser = { ...targetUser, coins: cleanCoins };
    const nextUsers = allUsers.map(u => u.uid === targetUid ? updatedTargetUser : u);
    setAllUsers(nextUsers);
    
    if (!isFirebaseLive || isMockUid(targetUid)) {
      localStorage.setItem('rg_users', JSON.stringify(nextUsers));
      const specTxKey = `rg_tx_${targetUid}`;
      const savedUserTxStr = localStorage.getItem(specTxKey);
      const savedUserTxList: WalletTransaction[] = savedUserTxStr ? JSON.parse(savedUserTxStr) : [];
      localStorage.setItem(specTxKey, JSON.stringify([adminTx, ...savedUserTxList]));
    }

    adminTriggerMockFraud(
      targetUid,
      `Balance manually adjusted by admin`,
      `Admin changed user coins from ${targetUser.coins} to ${cleanCoins}. Type: ${type}, Amount: ${amount}.`
    );
  };

  const adminToggleUserStatus = async (targetUid: string) => {
    if (!user || !user.isAdmin) throw new Error('Required secure keys failed verification.');

    const targetUser = allUsers.find(u => u.uid === targetUid);
    if (!targetUser) throw new Error('User not registered in Firestore profiles.');

    const toggle = !targetUser.isActive;
    const updatedUser = { ...targetUser, isActive: toggle };

    if (isFirebaseLive && !isMockUid(targetUid)) {
      await saveUserProfile(targetUid, { isActive: toggle });
    }

    const nextUsers = allUsers.map(u => u.uid === targetUid ? updatedUser : u);
    setAllUsers(nextUsers);
    if (!isFirebaseLive || isMockUid(targetUid)) {
      localStorage.setItem('rg_users', JSON.stringify(nextUsers));
    }

    adminTriggerMockFraud(
      targetUid,
      `User ${toggle ? 'Activated' : 'Banned'}`,
      `Account lock status changed dynamically by secure Admin controls.`
    );
  };

  const adminTriggerMockFraud = (targetUid: string, message: string, details: string) => {
    const offender = allUsers.find(u => u.uid === targetUid);
    const targetName = offender ? offender.name : 'Unknown User';
    
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (message.includes('Cooldown') || message.includes('Adjust')) {
      severity = 'medium';
    } else if (message.includes('Taps') || message.includes('Cheat') || message.includes('payout') || message.includes('Spoof')) {
      severity = 'high';
    }

    const newLog: AuditLog = {
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      uid: targetUid,
      userName: targetName,
      severity,
      message,
      details,
      createdAt: new Date().toISOString()
    };

    const nextLogs = [newLog, ...auditLogs];
    setAuditLogs(nextLogs);
    localStorage.setItem('rg_fraud_logs', JSON.stringify(nextLogs));
  };

  const adminClearAuditLogs = () => {
    setAuditLogs([]);
    localStorage.removeItem('rg_fraud_logs');
  };

  return (
    <RewardEngineContext.Provider value={{
      user,
      transactions,
      referrals,
      gameSessions,
      withdrawalRequests,
      leaderboard,
      cooldowns,
      allUsers,
      auditLogs,
      ads,
      isFirebaseMode: isFirebaseLive,
      loading,
      error,
      
      loginWithEmail,
      loginAsGuest,
      loginWithGoogle,
      logout,
      
      creditCoins,
      debitCoins,
      requestWithdrawal,
      adminApproveWithdrawal,
      adminRejectWithdrawal,
      submitGameScore,
      applyReferralCode,
      watchAd,
      
      adminAdjustCoins,
      adminToggleUserStatus,
      adminTriggerMockFraud,
      adminClearAuditLogs
    }}>
      {children}
    </RewardEngineContext.Provider>
  );
}

export function useRewardEngine() {
  const context = useContext(RewardEngineContext);
  if (!context) {
    throw new Error('useRewardEngine must be configured within unique RewardEngineProvider scopes.');
  }
  return context;
}
