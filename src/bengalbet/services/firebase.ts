// @ts-nocheck
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount } from '../types';
import { api } from './api';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Convert Firebase User into standard UserAccount
 */
export const formatUserData = (firebaseUser: FirebaseUser, extra?: any): UserAccount => {
  const defaultBalance = 888.00;
  const username = extra?.username || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
  const avatar = extra?.avatar || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces';
  const phone = extra?.phone || firebaseUser.phoneNumber || '01712345678';
  
  return {
    id: firebaseUser.uid,
    isLoggedIn: true,
    username,
    phone,
    email: firebaseUser.email || undefined,
    balance: extra?.balance !== undefined ? extra.balance : defaultBalance,
    vipLevel: extra?.vipLevel ?? 1,
    vipExp: extra?.vipExp ?? 120,
    vipMaxExp: extra?.vipMaxExp ?? 1000,
    freeSpins: extra?.freeSpins ?? 5,
    redPacketsAvailable: extra?.redPacketsAvailable ?? 3,
    goldenEggsAvailable: extra?.goldenEggsAvailable ?? 1,
    unreadNotifications: extra?.unreadNotifications ?? 2,
    avatar,
    referralCode: extra?.referralCode || 'BDT' + firebaseUser.uid.substring(0, 6).toUpperCase(),
    totalEarnings: extra?.totalEarnings ?? 0,
    referredFriendsCount: extra?.referredFriendsCount ?? 0,
  };
};

/**
 * Sign in using Firebase Google Auth popup.
 * Automatically synchronizes profile with REST API backend.
 */
export const signInWithGoogleFirebase = async (): Promise<UserAccount> => {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;
  
  try {
    const res = await api.auth.googleDemoLogin(
      fbUser.email || undefined,
      fbUser.displayName || undefined,
      fbUser.photoURL || undefined
    );
    if (res.success && res.user) {
      return res.user;
    }
  } catch (err) {
    console.warn('REST API Google sync error:', err);
  }

  return formatUserData(fbUser);
};

/**
 * Update user via REST API
 */
export const updateFirestoreUser = async (userId: string, data: Partial<UserAccount>): Promise<void> => {
  try {
    await api.admin.updateUserFull(userId, data);
  } catch (err) {
    console.warn('Could not update user via REST API', err);
  }
};

/**
 * Fetch all users via REST API
 */
export const getAllFirestoreUsers = async (): Promise<any[]> => {
  try {
    const res = await api.admin.getUsers();
    return res.success ? res.users : [];
  } catch (err) {
    console.warn('Could not load users via REST API', err);
    return [];
  }
};

/**
 * Delete a user via REST API
 */
export const deleteFirestoreUser = async (userId: string): Promise<boolean> => {
  try {
    const res = await api.admin.deleteUser(userId);
    return res.success;
  } catch (err) {
    console.warn('Could not delete user via REST API', err);
    return false;
  }
};

/**
 * Log out from Firebase Auth
 */
export const signOutFirebase = async (): Promise<void> => {
  await signOut(auth);
};

export { onAuthStateChanged };

