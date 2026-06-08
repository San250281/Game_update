/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, setDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { GameSession, GameType } from '../types';

export const listGameSessions = async (uid: string): Promise<GameSession[]> => {
  try {
    const sQuery = query(
      collection(db, 'game_sessions'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(sQuery);
    const results: GameSession[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as GameSession);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `game_sessions?uid=${uid}`);
    return [];
  }
};

export const saveGameSession = async (session: GameSession): Promise<void> => {
  try {
    const sessionRef = doc(collection(db, 'game_sessions'), session.sessionId);
    await setDoc(sessionRef, session);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `game_sessions/${session.sessionId}`);
  }
};

/**
 * Validates the core metrics of a game submit request for fraud.
 * Move reward/cheat calculations to backend logic representation.
 */
export const validateGameScore = (gameId: GameType, score: number, coinsEarned: number): { isCheating: boolean; cheatReason: string } => {
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

  return { isCheating, cheatReason };
};
