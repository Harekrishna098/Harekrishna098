import { useState, useEffect, useCallback } from 'react';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { getStoredHash, setStoredHash, getSession, setSession } from '../lib/storage';
import type { AppSettings } from '../types';

type AuthState = 'setup' | 'locked' | 'unlocked';

export function useAuth(settings: AppSettings) {
  const [state, setState] = useState<AuthState>(() => {
    const hash = getStoredHash();
    if (!hash) return 'setup';
    return 'locked';
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hash = getStoredHash();
    if (!hash) {
      setState('setup');
      return;
    }
    const session = getSession();
    if (session) {
      const lockedAt = new Date(session.lockedAt);
      const minutesSince = (Date.now() - lockedAt.getTime()) / 60000;
      if (minutesSince < settings.autoLockMinutes) {
        setState('unlocked');
        return;
      }
    }
    setState('locked');
  }, [settings.autoLockMinutes]);

  const setup = useCallback(async (password: string, confirm: string) => {
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return false;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return false;
    }
    setIsLoading(true);
    try {
      const hash = await hashPassword(password);
      setStoredHash(hash);
      setSession({ lockedAt: new Date().toISOString() });
      setState('unlocked');
      setError('');
      return true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unlock = useCallback(async (password: string) => {
    if (!password) {
      setError('Enter your password');
      return false;
    }
    setIsLoading(true);
    try {
      const hash = getStoredHash()!;
      const valid = await verifyPassword(password, hash);
      if (valid) {
        setSession({ lockedAt: new Date().toISOString() });
        setState('unlocked');
        setError('');
        return true;
      } else {
        setError('Incorrect password');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const lock = useCallback(() => {
    setSession(null);
    setState('locked');
    setError('');
  }, []);

  const changePassword = useCallback(
    async (current: string, newPass: string, confirm: string) => {
      if (newPass.length < 4) {
        return 'Password must be at least 4 characters';
      }
      if (newPass !== confirm) {
        return 'Passwords do not match';
      }
      const hash = getStoredHash()!;
      const valid = await verifyPassword(current, hash);
      if (!valid) return 'Current password is incorrect';
      const newHash = await hashPassword(newPass);
      setStoredHash(newHash);
      return null;
    },
    []
  );

  const refreshSession = useCallback(() => {
    setSession({ lockedAt: new Date().toISOString() });
  }, []);

  return { state, error, isLoading, setup, unlock, lock, changePassword, refreshSession, setError };
}
