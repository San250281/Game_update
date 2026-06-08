/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  loginUserWithEmail, 
  registerUserWithEmail, 
  loginUserAnonymously, 
  loginUserWithGoogle, 
  signOutUser 
} from '../services/authService';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanLogin = async (email: string, name: string, password?: string) => {
    setLoading(true);
    setError(null);
    try {
      try {
        const result = await loginUserWithEmail(email, password);
        return result.user;
      } catch (err: any) {
        // If not found, attempt signup
        if (
          err.code === 'auth/user-not-found' || 
          err.code === 'auth/invalid-credential' || 
          err.code === 'auth/missing-password' ||
          err.code === 'auth/invalid-email'
        ) {
          const result = await registerUserWithEmail(email, password);
          return result.user;
        }
        throw err;
      }
    } catch (err: any) {
      setError(err.message || 'Login credentials error.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cleanGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginUserAnonymously();
      return result.user;
    } catch (err: any) {
      setError(err.message || 'Guest session error.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cleanGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginUserWithGoogle();
      return result.user;
    } catch (err: any) {
      setError(err.message || 'Google Authentication error.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cleanLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOutUser();
    } catch (err: any) {
      setError(err.message || 'Logout error.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    loginWithEmail: cleanLogin,
    loginAsGuest: cleanGuestLogin,
    loginWithGoogle: cleanGoogleLogin,
    logout: cleanLogout,
  };
};
