/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, WalletTransaction, ReferralRecord, GameSession, AdOffer,
  ProviderType, TransactionType, TransactionSource, GameType
} from '../types';
import { isFirebaseLive, db, auth, handleFirestoreError, OperationType } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, orderBy, limit, addDoc, serverTimestamp, writeBatch
} from 'firebase/firestore';

// ----------------------------------------------------
// System Mock Competitors Seed Data
// ----------------------------------------------------
const SEED_COMPETITORS: UserProfile[] = [
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

// Helper to generate a unique 8-character referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ----------------------------------------------------
// Fraud Audit Log Pattern
// ----------------------------------------------------
export interface AuditLog {
  id: string;
  uid: string;
  userName: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  details: string;
  createdAt: string;
}

// ----------------------------------------------------
// UI Ad Configuration Pattern
// ----------------------------------------------------
export const DEFAULT_ADS: AdOffer[] = [
  { id: 'ad_1', title: 'Spinwheel Sponsor Reward Video', rewardValue: 150, cooldownSeconds: 30, type: 'rewarded' },
  { id: 'ad_2', title: 'Casual Gaming App Download Pitch', rewardValue: 200, cooldownSeconds: 45, type: 'rewarded' },
  { id: 'ad_3', title: 'Quick Coin Booster Survey', rewardValue: 250, cooldownSeconds: 60, type: 'rewarded' },
];

export interface RewardEngineState {
  user: UserProfile | null;
  transactions: WalletTransaction[];
  referrals: ReferralRecord[];
  gameSessions: GameSession[];
  leaderboard: UserProfile[];
  cooldowns: { [key: string]: number }; // timestamp when specific games/ads are available
  allUsers: UserProfile[]; // populated for sandbox & admin
  auditLogs: AuditLog[];
  ads: AdOffer[];
  isFirebaseMode: boolean;
  loading: boolean;
  error: string | null;
  
  // Authentications
  loginWithEmail: (email: string, name: string, password?: string) => Promise<UserProfile>;
  loginAsGuest: () => Promise<UserProfile>;
  loginWithGoogleMock: (name: string, email: string, photoURL: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  
  // Wallet & Transactions
  creditCoins: (amount: number, source: TransactionSource, customId?: string) => Promise<void>;
  debitCoins: (amount: number, source: TransactionSource) => Promise<boolean>;
  
  // Games scoring mechanisms
  submitGameScore: (gameId: GameType, score: number, coinsEarned: number) => Promise<{ success: boolean; message: string }>;
  
  // Referral System code application
  applyReferralCode: (code: string) => Promise<{ success: boolean; message: string }>;
  
  // Ad System
  watchAd: (adId: string) => Promise<{ success: boolean; reward: number; message: string }>;
  
  // Admin Operations
  adminAdjustCoins: (targetUid: string, amount: number, type: 'credit' | 'debit') => Promise<void>;
  adminToggleUserStatus: (targetUid: string) => Promise<void>;
  adminTriggerMockFraud: (targetUid: string, message: string, details: string) => void;
  adminClearAuditLogs: () => void;
}

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
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [cooldowns, setCooldowns] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('rg_cooldowns');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [ads, setAds] = useState<AdOffer[]>(DEFAULT_ADS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronize LocalStorage helper for cooldown trackers
  useEffect(() => {
    localStorage.setItem('rg_cooldowns', JSON.stringify(cooldowns));
  }, [cooldowns]);

  // Load and boot Database State (Unified Auth Listener & Fallback Sync)
  useEffect(() => {
    if (!isFirebaseLive) {
      // ----------------------------------------------------
      // Local sandbox initialization logic
      // ----------------------------------------------------
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

        // Find current logged user in localStorage list to keep values in sync
        const storedUserStr = localStorage.getItem('rg_user_session');
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
        if (storedUser) {
          const updatedProfile = localUsers.find(u => u.uid === storedUser.uid);
          const baseProfile = updatedProfile || storedUser;
          ensureLoginCoins(baseProfile, localUsers).then(finalProfile => {
            setUser(finalProfile);
            localStorage.setItem('rg_user_session', JSON.stringify(finalProfile));
          });

          // Sync user specific transaction logs
          const localTx = localStorage.getItem(`rg_tx_${storedUser.uid}`);
          setTransactions(localTx ? JSON.parse(localTx) : []);

          // Sync user game sessions
          const localSessions = localStorage.getItem(`rg_sessions_${storedUser.uid}`);
          setGameSessions(localSessions ? JSON.parse(localSessions) : []);

          // Sync user referrals
          const localReferrals = localStorage.getItem(`rg_referrals_${storedUser.uid}`);
          setReferrals(localReferrals ? JSON.parse(localReferrals) : []);
        } else {
          setUser(null);
          setTransactions([]);
          setGameSessions([]);
          setReferrals([]);
        }

        // Sync static security/cheat logs
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

    // ----------------------------------------------------
    // Live Firebase Auth State & Collection Listener
    // ----------------------------------------------------
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      setLoading(true);
      setError(null);
      try {
        if (firebaseUser) {
          // User is authenticated in Firebase
          // 1. Fetch user's profile doc
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          let userDocSnap = null;
          let fetchFailed = false;
          try {
            userDocSnap = await getDoc(userDocRef);
          } catch (err: any) {
            console.warn("Failed to retrieve user's live document, falling back into sandbox mode:", err);
            fetchFailed = true;
          }
          
          let currentUserProfile: UserProfile | null = null;
          
          if (!fetchFailed && userDocSnap && userDocSnap.exists()) {
            currentUserProfile = userDocSnap.data() as UserProfile;
            if (!currentUserProfile.isActive) {
              await signOut(auth);
              setError('This account has been disabled by security administrators.');
              setUser(null);
              setLoading(false);
              return;
            }
          } else {
            // New user registration or document missing (or read permission denied because of rules)
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
            try {
              if (!fetchFailed) {
                await setDoc(userDocRef, currentUserProfile);
              }
            } catch (err: any) {
              console.warn('Failed to write user profile doc on registration fallback:', err);
            }
          }

          // 2. Fetch all user records for leaderboards / admin console
          let usersList: UserProfile[] = [];
          try {
            const usersSnap = await getDocs(collection(db, 'users'));
            if (usersSnap) {
              usersSnap.forEach((doc) => {
                usersList.push(doc.data() as UserProfile);
              });
            }
          } catch (err: any) {
            console.warn('Failed to list user documents, rendering sandbox leaderboards instead:', err);
          }
          
          if (usersList.length === 0) {
            // Merely populate the local state list to seat the leaderboard
            const batchList = [...SEED_COMPETITORS];
            for (const competitor of batchList) {
              usersList.push(competitor);
            }
          } else {
            // Pad the leaderboard with competitors if the count of real users is small
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

          // 3. Fetch user specific transactions
          let txList: WalletTransaction[] = [];
          try {
            const txQuery = query(
              collection(db, 'transactions'), 
              where('uid', '==', firebaseUser.uid),
              orderBy('createdAt', 'desc')
            );
            const txSnap = await getDocs(txQuery);
            if (txSnap) {
              txSnap.forEach((doc) => {
                txList.push(doc.data() as WalletTransaction);
              });
            }
          } catch (err: any) {
            console.warn('Failed to list live transactions, showing cached local state:', err);
            const localTx = localStorage.getItem(`rg_tx_${firebaseUser.uid}`);
            txList = localTx ? JSON.parse(localTx) : [];
          }
          setTransactions(txList);

          // 4. Fetch user specific game sessions
          let sList: GameSession[] = [];
          try {
            const sessionsQuery = query(
              collection(db, 'game_sessions'),
              where('uid', '==', firebaseUser.uid),
              orderBy('createdAt', 'desc')
            );
            const sessionsSnap = await getDocs(sessionsQuery);
            if (sessionsSnap) {
              sessionsSnap.forEach((doc) => {
                sList.push(doc.data() as GameSession);
              });
            }
          } catch (err: any) {
            console.warn('Failed to list live game sessions, showing cached local state:', err);
            const localSessions = localStorage.getItem(`rg_sessions_${firebaseUser.uid}`);
            sList = localSessions ? JSON.parse(localSessions) : [];
          }
          setGameSessions(sList);

          // 5. Fetch user specific referrals
          let rList: ReferralRecord[] = [];
          try {
            const referralsQuery = query(
              collection(db, 'referrals'),
              where('referrerUid', '==', firebaseUser.uid)
            );
            const referralsSnap = await getDocs(referralsQuery);
            if (referralsSnap) {
              referralsSnap.forEach((doc) => {
                rList.push(doc.data() as ReferralRecord);
              });
            }
          } catch (err: any) {
            console.warn('Failed to list live referrals, showing cached local state:', err);
            const localReferrals = localStorage.getItem(`rg_referrals_${firebaseUser.uid}`);
            rList = localReferrals ? JSON.parse(localReferrals) : [];
          }
          setReferrals(rList);
        } else {
          // Logged out
          setUser(null);
          localStorage.removeItem('rg_user_session');
          setTransactions([]);
          setGameSessions([]);
          setReferrals([]);
          
          // Show default leaderboard competitors
          setAllUsers([...SEED_COMPETITORS]);
        }
      } catch (err: any) {
        console.warn('Resilient session auth loader handled error dynamically:', err);
        // Ensure no terminal lockup
        setUser(null);
        setAllUsers([...SEED_COMPETITORS]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isFirebaseLive]);

  // Compute leaderboards in real time based on active users and competitor data
  useEffect(() => {
    // Sort all available database profiles by overall coin standings
    const sorted = [...allUsers]
      .filter((u) => u.isActive)
      .sort((a, b) => b.coins - a.coins);
    setLeaderboard(sorted);
  }, [allUsers]);

  // ----------------------------------------------------
  // Module: Authentication Handles
  // ----------------------------------------------------

  const ensureLoginCoins = async (profile: UserProfile, currentUsers: UserProfile[]): Promise<UserProfile> => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user has already received the 20 coins for today
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

    if (isFirebaseLive) {
      try {
        const batch = writeBatch(db);
        batch.set(doc(collection(db, 'transactions'), txId), newTx);
        batch.update(doc(db, 'users', profile.uid), {
          coins: updatedCoins,
          lastLoginCoinClaimedDate: today,
          lastLogin: updatedProfile.lastLogin
        });
        await batch.commit();
      } catch (error) {
        console.warn('Failed to commit login coins batch in live mode, utilizing local fallback:', error);
      }
    }

    // Save transaction logs locally
    const localSpecTxKey = `rg_tx_${profile.uid}`;
    const localTxListStr = localStorage.getItem(localSpecTxKey);
    const localTxList = localTxListStr ? JSON.parse(localTxListStr) : [];
    localStorage.setItem(localSpecTxKey, JSON.stringify([newTx, ...localTxList]));

    // Sync state
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
    if (isFirebaseLive) {
      try {
        await setDoc(doc(db, 'users', profile.uid), profile);
      } catch (error) {
        console.warn('Failed to setDoc on user registration, using local state instead:', error);
      }
    }
    const updatedUsers = [...listUsers, profile];
    setAllUsers(updatedUsers);
    
    // Always persist to local cache as fallback
    localStorage.setItem('rg_users', JSON.stringify(updatedUsers));
    setUser(profile);
    localStorage.setItem('rg_user_session', JSON.stringify(profile));
  };

  const loginWithEmail = async (email: string, name: string, password?: string) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      
      if (isFirebaseLive) {
        // Real or Resilient Firebase Auth
        try {
          const { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } = await import('firebase/auth');
          let firebaseUser: any = null;
          const cleanPassword = password || 'defaultSecurePasscode123';
          
          try {
            const res = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
            firebaseUser = res.user;
          } catch (signInErr: any) {
            if (signInErr.code === 'auth/operation-not-allowed' || signInErr.code === 'auth/admin-restricted-operation') {
              // Fallback to anonymous auth if allowed
              const res = await signInAnonymously(auth);
              firebaseUser = res.user;
            } else if (
              signInErr.code === 'auth/user-not-found' || 
              signInErr.code === 'auth/invalid-credential' || 
              signInErr.code === 'auth/missing-password' ||
              signInErr.code === 'auth/invalid-email'
            ) {
              try {
                const res = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
                firebaseUser = res.user;
              } catch (signUpErr: any) {
                if (signUpErr.code === 'auth/operation-not-allowed' || signUpErr.code === 'auth/admin-restricted-operation') {
                  const res = await signInAnonymously(auth);
                  firebaseUser = res.user;
                } else {
                  throw new Error(signUpErr.message || 'Registration failed.');
                }
              }
            } else {
              throw new Error(signInErr.message || 'Verification failed.');
            }
          }

          const userDocRef = doc(db, 'users', firebaseUser.uid);
          let userDocSnap = null;
          try {
            userDocSnap = await getDoc(userDocRef);
          } catch (err: any) {
            console.warn('Failed to fetch user doc under live mode:', err);
          }
          
          let profile: UserProfile;
          if (userDocSnap && userDocSnap.exists()) {
            profile = userDocSnap.data() as UserProfile;
            if (!profile.isActive) {
              await signOut(auth);
              throw new Error('This user account has been disabled by security administrators.');
            }
            profile = {
              ...profile,
              lastLogin: new Date().toISOString()
            };
            try {
              await updateDoc(userDocRef, { lastLogin: profile.lastLogin });
            } catch (err: any) {
              console.warn('Failed to updateDoc lastLogin:', err);
            }
          } else {
            const refCode = generateReferralCode();
            profile = {
              uid: firebaseUser.uid,
              name: name || email.split('@')[0],
              email: cleanEmail,
              photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${firebaseUser.uid}`,
              provider: ProviderType.EMAIL,
              coins: 0,
              referralCode: refCode,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              isActive: true,
              isAdmin: cleanEmail === 'game.rewardyn@gmail.com'
            };
             try {
              await setDoc(userDocRef, profile);
            } catch (err: any) {
              console.warn('Failed to setDoc on creation:', err);
            }
          }
          
          const finalProfile = await ensureLoginCoins(profile, allUsers);
          setUser(finalProfile);
          localStorage.setItem('rg_user_session', JSON.stringify(finalProfile));
          return finalProfile;
        } catch (fbErr: any) {
          console.warn('Live Firebase Email auth has some configuration problems, sliding to local cache sandbox:', fbErr);
          // Look up if user already exists in sandbox cache
          const existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
          
          if (existing) {
            if (!existing.isActive) {
              throw new Error('This user account has been disabled by security administrators.');
            }
            const updated = {
              ...existing,
              lastLogin: new Date().toISOString()
            };
            const list = allUsers.map(u => u.uid === existing.uid ? updated : u);
            setAllUsers(list);
            localStorage.setItem('rg_users', JSON.stringify(list));
            const finalProfile = await ensureLoginCoins(updated, list);
            setUser(finalProfile);
            localStorage.setItem('rg_user_session', JSON.stringify(finalProfile));
            return finalProfile;
          } else {
            // Create new email user locally
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
        }
      } else {
        // Look up if user already exists in sandbox cache
        const existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
        
        if (existing) {
          if (!existing.isActive) {
            throw new Error('This user account has been disabled by security administrators.');
          }
          const updated = {
            ...existing,
            lastLogin: new Date().toISOString()
          };
          const list = allUsers.map(u => u.uid === existing.uid ? updated : u);
          setAllUsers(list);
          localStorage.setItem('rg_users', JSON.stringify(list));
          const finalProfile = await ensureLoginCoins(updated, list);
          setUser(finalProfile);
          localStorage.setItem('rg_user_session', JSON.stringify(finalProfile));
          return finalProfile;
        } else {
          // Create new email user
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
          const { signInAnonymously } = await import('firebase/auth');
          const res = await signInAnonymously(auth);
          const firebaseUser = res.user;
          
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          let userDocSnap = null;
          try {
            userDocSnap = await getDoc(userDocRef);
          } catch (err: any) {
            console.warn('Failed to retrieve guest doc under live mode:', err);
          }
          
          let profile: UserProfile;
          if (userDocSnap && userDocSnap.exists()) {
            profile = userDocSnap.data() as UserProfile;
            if (!profile.isActive) {
              await signOut(auth);
              throw new Error('This guest session has been blacklisted.');
            }
            profile = {
              ...profile,
              lastLogin: new Date().toISOString()
            };
            try {
              await updateDoc(userDocRef, { lastLogin: profile.lastLogin });
            } catch (err: any) {
              console.warn('Failed to updateDoc guest lastLogin:', err);
            }
          } else {
            const gId = firebaseUser.uid;
            const randName = `Guest #${Math.floor(1000 + Math.random() * 9000)}`;
            profile = {
              uid: gId,
              name: randName,
              email: `${gId.substring(0, 8)}@rewardgaming.dev`,
              photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${gId}`,
              provider: ProviderType.GUEST,
              coins: 0,
              referralCode: generateReferralCode(),
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              isActive: true,
            };
            try {
              await setDoc(userDocRef, profile);
            } catch (err: any) {
              console.warn('Failed to setDoc on guest creation:', err);
            }
          }
          
          setUser(profile);
          localStorage.setItem('rg_user_session', JSON.stringify(profile));
          return profile;
        } catch (fbErr: any) {
          console.warn('Live Firebase Guest auth has configuration problems, sliding into sandbox simulation:', fbErr);
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
        }
      } else {
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
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleMock = async (name: string, email: string, photoURL: string) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      
      if (isFirebaseLive) {
        try {
          const { signInWithPopup, GoogleAuthProvider, signInAnonymously } = await import('firebase/auth');
          let firebaseUser: any = null;
          let displayName = name;
          let pURL = photoURL;
          
          try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            firebaseUser = result.user;
            displayName = firebaseUser.displayName || displayName;
            pURL = firebaseUser.photoURL || pURL;
          } catch (popupErr: any) {
            console.warn('signInWithPopup failed, falling back to authenticated anonymous user:', popupErr);
            const result = await signInAnonymously(auth);
            firebaseUser = result.user;
          }
          
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          let userDocSnap = null;
          try {
            userDocSnap = await getDoc(userDocRef);
          } catch (err: any) {
            console.warn('Failed to retrieve Google user doc under live mode:', err);
          }
          
          let profile: UserProfile;
          if (userDocSnap && userDocSnap.exists()) {
            profile = userDocSnap.data() as UserProfile;
            if (!profile.isActive) {
              await signOut(auth);
              throw new Error('This user account is banned.');
            }
            profile = {
              ...profile,
              photoURL: pURL || profile.photoURL,
              name: displayName || profile.name,
              lastLogin: new Date().toISOString()
            };
            try {
              await updateDoc(userDocRef, { 
                name: profile.name, 
                photoURL: profile.photoURL,
                lastLogin: profile.lastLogin 
              });
            } catch (err: any) {
              console.warn('Failed to updateDoc under Google login:', err);
            }
          } else {
            const newUid = firebaseUser.uid;
            profile = {
              uid: newUid,
              name: displayName || 'Google Player',
              email: firebaseUser.email?.toLowerCase() || cleanEmail,
              photoURL: pURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${newUid}`,
              provider: ProviderType.GOOGLE,
              coins: 0,
              referralCode: generateReferralCode(),
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              isActive: true,
              isAdmin: (firebaseUser.email?.toLowerCase() || cleanEmail) === 'game.rewardyn@gmail.com'
            };
            try {
              await setDoc(userDocRef, profile);
            } catch (err: any) {
              console.warn('Failed to setDoc on Google user creation:', err);
            }
          }
          
          setUser(profile);
          localStorage.setItem('rg_user_session', JSON.stringify(profile));
          return profile;
        } catch (fbErr: any) {
          console.warn('Live Google Popup auth had trouble compiling or executing, sliding into local sandbox Google mode:', fbErr);
          const existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
          if (existing) {
            if (!existing.isActive) {
              throw new Error('This user account is banned.');
            }
            const updated = {
              ...existing,
              photoURL: photoURL || existing.photoURL,
              name: name || existing.name,
              lastLogin: new Date().toISOString()
            };
            const list = allUsers.map(u => u.uid === existing.uid ? updated : u);
            setAllUsers(list);
            localStorage.setItem('rg_users', JSON.stringify(list));
            setUser(updated);
            localStorage.setItem('rg_user_session', JSON.stringify(updated));
            return updated;
          } else {
            const newUid = 'google_local_' + Math.random().toString(36).substring(2, 11);
            const profile: UserProfile = {
              uid: newUid,
              name: name || 'Google Player',
              email: cleanEmail,
              photoURL: photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${newUid}`,
              provider: ProviderType.GOOGLE,
              coins: 0,
              referralCode: generateReferralCode(),
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              isActive: true,
              isAdmin: cleanEmail === 'game.rewardyn@gmail.com'
            };
            await registerUserRecord(profile, allUsers);
            return profile;
          }
        }
      } else {
        const existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
        if (existing) {
          if (!existing.isActive) {
            throw new Error('This user account is banned.');
          }
          const updated = {
            ...existing,
            photoURL: photoURL || existing.photoURL,
            name: name || existing.name,
            lastLogin: new Date().toISOString()
          };
          const list = allUsers.map(u => u.uid === existing.uid ? updated : u);
          setAllUsers(list);
          localStorage.setItem('rg_users', JSON.stringify(list));
          setUser(updated);
          localStorage.setItem('rg_user_session', JSON.stringify(updated));
          return updated;
        } else {
          const newUid = 'google_' + Math.random().toString(36).substring(2, 11);
          const profile: UserProfile = {
            uid: newUid,
            name: name || 'Google Player',
            email: cleanEmail,
            photoURL: photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${newUid}`,
            provider: ProviderType.GOOGLE,
            coins: 0,
            referralCode: generateReferralCode(),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true,
            isAdmin: cleanEmail === 'game.rewardyn@gmail.com'
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
      await signOut(auth);
    }
  };

  // ----------------------------------------------------
  // Module: Wallet Operations (Double-entry coin ledger validation)
  // ----------------------------------------------------

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

    if (isFirebaseLive) {
      try {
        const batch = writeBatch(db);
        batch.set(doc(collection(db, 'transactions'), txId), newTx);
        batch.update(doc(db, 'users', user.uid), { coins: newCoinCount });
        await batch.commit();
      } catch (error) {
        console.warn('Failed to commit transaction batch in live mode, utilizing local sandbox state:', error);
      }
    }

    // React state update
    setUser(updatedUser);
    localStorage.setItem('rg_user_session', JSON.stringify(updatedUser));

    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);

    const updatedUsersList = allUsers.map(u => u.uid === user.uid ? updatedUser : u);
    setAllUsers(updatedUsersList);

    // Always keep cache in sync
    localStorage.setItem(`rg_tx_${user.uid}`, JSON.stringify(updatedTxList));
    localStorage.setItem('rg_users', JSON.stringify(updatedUsersList));
  };

  const debitCoins = async (amount: number, source: TransactionSource) => {
    if (!user) return false;
    if (user.coins < amount) return false;

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

    if (isFirebaseLive) {
      try {
        const batch = writeBatch(db);
        batch.set(doc(collection(db, 'transactions'), txId), newTx);
        batch.update(doc(db, 'users', user.uid), { coins: newCoinCount });
        await batch.commit();
      } catch (error) {
        console.warn('Failed to commit transaction batch in live mode, utilizing local sandbox state:', error);
      }
    }

    setUser(updatedUser);
    localStorage.setItem('rg_user_session', JSON.stringify(updatedUser));

    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);

    const updatedUsersList = allUsers.map(u => u.uid === user.uid ? updatedUser : u);
    setAllUsers(updatedUsersList);

    // Always keep cache in sync
    localStorage.setItem(`rg_tx_${user.uid}`, JSON.stringify(updatedTxList));
    localStorage.setItem('rg_users', JSON.stringify(updatedUsersList));

    return true;
  };

  // ----------------------------------------------------
  // Module: Games System score & cheat engine validation
  // ----------------------------------------------------

  const submitGameScore = async (gameId: GameType, score: number, coinsEarned: number) => {
    if (!user) return { success: false, message: 'You must sign in to submit results.' };

    // 1. Anti-Cheat: Timing Validation
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

    // 2. Anti-Cheat: Maximum Reward Boundaries
    let isCheating = false;
    let cheatReason = '';

    if (gameId === GameType.TAP_CHALLENGE) {
      // Tap Challenge Score Check (Max logical score is ~150 taps in 10s)
      if (score > 150) {
        isCheating = true;
        cheatReason = `Anomalous tapping frequency of ${score} taps in 10 seconds. Device autoclicker suspected.`;
      }
    } else if (gameId === GameType.QUIZ) {
      // Quiz limit matches max question scoring 
      if (coinsEarned > 300) {
        isCheating = true;
        cheatReason = `Quiz payout maximum of 300 coins breached. Payout attempted: ${coinsEarned}.`;
      }
    } else if (gameId === GameType.SPIN_WHEEL) {
      if (coinsEarned > 500) {
        isCheating = true;
        cheatReason = `Spin Wheel reward ceiling bypassed. Score returned coins: ${coinsEarned}.`;
      }
    }

    if (isCheating) {
      adminTriggerMockFraud(user.uid, 'High Probability Payout Spoof', cheatReason);
      return { 
        success: false, 
        message: 'Security Audit: High-frequency coin submission caught. Score flagged for review.'
      };
    }

    // Cooldown allocation:
    // Spinwheel/Tap Challenge get quick cooling periods for gameplay (30 and 45s represent high responsive sandbox UI)
    const delay = gameId === GameType.SPIN_WHEEL ? 30 : gameId === GameType.TAP_CHALLENGE ? 45 : 60;
    const futureTime = now + (delay * 1000);
    setCooldowns(prev => ({
      ...prev,
      [gameCooldownKey]: futureTime
    }));

    // Record verified game plays
    const sId = 'sess_' + Math.random().toString(36).substring(2, 15);
    const newSession: GameSession = {
      sessionId: sId,
      uid: user.uid,
      gameId,
      score,
      coinsEarned,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseLive) {
      try {
        await setDoc(doc(collection(db, 'game_sessions'), sId), newSession);
      } catch (error) {
        console.warn('Failed to persist live game session, using local cache backup:', error);
      }
    }

    const updatedSessions = [newSession, ...gameSessions];
    setGameSessions(updatedSessions);
    // Always persist to local cache as fallback
    localStorage.setItem(`rg_sessions_${user.uid}`, JSON.stringify(updatedSessions));

    // Credit coins immediately
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

  // ----------------------------------------------------
  // Module: Referral System Engine logic
  // ----------------------------------------------------

  const applyReferralCode = async (code: string) => {
    if (!user) return { success: false, message: 'You must authorize to enter codes.' };
    if (user.referredBy) return { success: false, message: 'This account has already registered references.' };
    
    const targetCode = code.toUpperCase().trim();
    if (user.referralCode === targetCode) {
      return { success: false, message: 'You cannot use your own referral credentials.' };
    }

    // Find custom code owner in database
    const referrer = allUsers.find(u => u.referralCode === targetCode);
    if (!referrer) {
      return { success: false, message: 'Referral code not found in our directory.' };
    }

    // Save logs and transact rewards
    const refId = 'ref_' + Math.random().toString(36).substring(2, 15);
    const refRecord: ReferralRecord = {
      referralId: refId,
      referrerUid: referrer.uid,
      newUserUid: user.uid,
      rewardGranted: true,
      createdAt: new Date().toISOString()
    };

    // Referrer gets 500, New User gets 200
    const updatedUser = {
      ...user,
      referredBy: referrer.uid
    };

    if (isFirebaseLive) {
      try {
        const batch = writeBatch(db);
        batch.set(doc(collection(db, 'referrals'), refId), refRecord);
        batch.update(doc(db, 'users', user.uid), { referredBy: referrer.uid });
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `referrals/${refId}`);
        return { success: false, message: 'Database query errors occurred posting referral references.' };
      }
    }

    setUser(updatedUser);
    localStorage.setItem('rg_user_session', JSON.stringify(updatedUser));

    const updatedRefs = [refRecord, ...referrals];
    setReferrals(updatedRefs);

    if (!isFirebaseLive) {
      localStorage.setItem(`rg_referrals_${user.uid}`, JSON.stringify(updatedRefs));
    }

    // Appoint coins: credit caller with 200
    await creditCoins(200, TransactionSource.REFERRAL);

    // Credit referrer with 500
    const originalReferrerCoins = referrer.coins;
    const finalReferrerCoins = originalReferrerCoins + 500;
    const finalReferrer = {
      ...referrer,
      coins: finalReferrerCoins
    };

    const updatedUsersList = allUsers.map(u => {
      if (u.uid === user.uid) return updatedUser;
      if (u.uid === referrer.uid) return finalReferrer;
      return u;
    });
    setAllUsers(updatedUsersList);

    if (isFirebaseLive) {
      try {
        // Send companion credits to the inviter
        const inviterTxId = 'tx_inviter_' + Math.random().toString(36).substring(2, 15);
        const inviterTx: WalletTransaction = {
          transactionId: inviterTxId,
          uid: referrer.uid,
          type: TransactionType.CREDIT,
          coins: 500,
          source: TransactionSource.REFERRAL,
          createdAt: new Date().toISOString()
        };
        const batch = writeBatch(db);
        batch.set(doc(collection(db, 'transactions'), inviterTxId), inviterTx);
        batch.update(doc(db, 'users', referrer.uid), { coins: finalReferrerCoins });
        await batch.commit();
      } catch (err) {
        console.warn('Silent issue giving coins to inviter:', err);
      }
    } else {
      localStorage.setItem('rg_users', JSON.stringify(updatedUsersList));
      // Save transaction ledger entries directly in companion's folder
      const compTxListStr = localStorage.getItem(`rg_tx_${referrer.uid}`);
      const compTxList: WalletTransaction[] = compTxListStr ? JSON.parse(compTxListStr) : [];
      const parentTx: WalletTransaction = {
        transactionId: 'tx_inviter_' + Math.random().toString(36).substring(2, 15),
        uid: referrer.uid,
        type: TransactionType.CREDIT,
        coins: 500,
        source: TransactionSource.REFERRAL,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(`rg_tx_${referrer.uid}`, JSON.stringify([parentTx, ...compTxList]));
    }

    return { 
      success: true, 
      message: `Referral unlocked! Added 200 welcome coins. ${referrer.name} received 500 referral bonus.` 
    };
  };

  // ----------------------------------------------------
  // Module: Simulated Interactive Ad Monetization
  // ----------------------------------------------------

  const watchAd = async (adId: string) => {
    if (!user) return { success: false, reward: 0, message: 'Sign in to earn ad rewards.' };

    const today = new Date().toISOString().split('T')[0];

    // 1. Mandatory 5-second delay check
    if (user.lastAdWatchedAt) {
      const elapsed = Date.now() - new Date(user.lastAdWatchedAt).getTime();
      if (elapsed < 5000) {
        const remainingDelay = Math.ceil((5000 - elapsed) / 1000);
        return {
          success: false,
          reward: 0,
          message: `Please wait ${remainingDelay} second(s) between ads as required by Monetag.`
        };
      }
    }

    // 2. Daily limits check (max 20 ads per day)
    let adsWatchedToday = user.adsWatchedToday || 0;
    const lastAdWatchedAt = user.lastAdWatchedAt || '';

    if (lastAdWatchedAt && lastAdWatchedAt.split('T')[0] !== today) {
      adsWatchedToday = 0;
    }

    if (adsWatchedToday >= 20) {
      return {
        success: false,
        reward: 0,
        message: 'Daily Monetag limit reached! You can watch a maximum of 20 ads per day.'
      };
    }

    // 3. Cooldown check for specific ad
    const adKey = `cooldown_${adId}`;
    const now = Date.now();
    const endAdTime = cooldowns[adKey] || 0;

    if (now < endAdTime) {
      const secs = Math.ceil((endAdTime - now) / 1000);
      return { success: false, reward: 0, message: `Ad network buffering. Refreshing slots in ${secs}s.` };
    }

    const offer = ads.find(a => a.id === adId);
    if (!offer) {
      return { success: false, reward: 0, message: 'Invalid ad network campaign target.' };
    }

    // Set cooldown period
    const updatedCooldowns = {
      ...cooldowns,
      [adKey]: now + (offer.cooldownSeconds * 1000)
    };
    setCooldowns(updatedCooldowns);

    // Credit coins via custom batch/state flow that increments watch count
    const txId = 'tx_ad_' + Math.random().toString(36).substring(2, 15);
    const newTx: WalletTransaction = {
      transactionId: txId,
      uid: user.uid,
      type: TransactionType.CREDIT,
      coins: offer.rewardValue,
      source: TransactionSource.AD,
      createdAt: new Date().toISOString()
    };

    const nextCoins = (user.coins || 0) + offer.rewardValue;
    const nextAdsCount = adsWatchedToday + 1;
    const updatedUser: UserProfile = {
      ...user,
      coins: nextCoins,
      adsWatchedToday: nextAdsCount,
      lastAdWatchedAt: new Date().toISOString()
    };

    if (isFirebaseLive) {
      try {
        const batch = writeBatch(db);
        batch.set(doc(collection(db, 'transactions'), txId), newTx);
        batch.update(doc(db, 'users', user.uid), {
          coins: nextCoins,
          adsWatchedToday: nextAdsCount,
          lastAdWatchedAt: updatedUser.lastAdWatchedAt
        });
        await batch.commit();
      } catch (error) {
        console.warn('Failed to commit transaction batch in live mode, utilizing local sandbox state:', error);
      }
    }

    setUser(updatedUser);
    localStorage.setItem('rg_user_session', JSON.stringify(updatedUser));

    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);

    const updatedUsersList = allUsers.map(u => u.uid === user.uid ? updatedUser : u);
    setAllUsers(updatedUsersList);

    localStorage.setItem(`rg_tx_${user.uid}`, JSON.stringify(updatedTxList));
    localStorage.setItem('rg_users', JSON.stringify(updatedUsersList));

    return {
      success: true,
      reward: offer.rewardValue,
      message: `Monetag Ad successfully watched! Claimed ${offer.rewardValue} Coins. (${nextAdsCount}/20 today)`
    };
  };

  // ----------------------------------------------------
  // Module: Secure Admin Actions
  // ----------------------------------------------------

  const adminAdjustCoins = async (targetUid: string, amount: number, type: 'credit' | 'debit') => {
    if (!user || !user.isAdmin) throw new Error('Unassigned security authorization clearance breach attempt.');

    const targetUser = allUsers.find(u => u.uid === targetUid);
    if (!targetUser) throw new Error('Target user database entity mismatch.');

    const cleanCoins = Math.max(0, type === 'credit' ? targetUser.coins + amount : targetUser.coins - amount);
    const updatedUser = {
      ...targetUser,
      coins: cleanCoins
    };

    if (isFirebaseLive) {
      try {
        await updateDoc(doc(db, 'users', targetUid), { coins: cleanCoins });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
      }
    }

    const nextUsers = allUsers.map(u => u.uid === targetUid ? updatedUser : u);
    setAllUsers(nextUsers);
    if (!isFirebaseLive) {
      localStorage.setItem('rg_users', JSON.stringify(nextUsers));
    }

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

    if (isFirebaseLive) {
      try {
        await setDoc(doc(collection(db, 'transactions'), auditTxId), adminTx);
      } catch (error) {
        console.warn('System transaction logs error:', error);
      }
    } else {
      const specTxKey = `rg_tx_${targetUid}`;
      const savedUserTxStr = localStorage.getItem(specTxKey);
      const savedUserTxList: WalletTransaction[] = savedUserTxStr ? JSON.parse(savedUserTxStr) : [];
      localStorage.setItem(specTxKey, JSON.stringify([adminTx, ...savedUserTxList]));
    }

    // Save system fraud logger event
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
    const updatedUser = {
      ...targetUser,
      isActive: toggle
    };

    if (isFirebaseLive) {
      try {
        await updateDoc(doc(db, 'users', targetUid), { isActive: toggle });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
      }
    }

    const nextUsers = allUsers.map(u => u.uid === targetUid ? updatedUser : u);
    setAllUsers(nextUsers);
    if (!isFirebaseLive) {
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
    
    // Determine severity
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
      loginWithGoogleMock,
      logout,
      
      creditCoins,
      debitCoins,
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
