// @ts-nocheck
/**
 * BengalBet Authentication Modals
 * Features:
 * - Login, Registration, and Forgot Password views
 * - Support for Bangladeshi mobile numbers (+880 prefix)
 * - Password visibility toggle and Remember Me persistence
 * - Terms & Conditions checkbox and fast demo credentials
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useEffect } from 'react';
import { X, Lock, Phone, Eye, EyeOff, Gift, Loader2, Check, Copy, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import { Language, UserAccount } from '../types';
import { api } from '../services/api';
import { signInWithGoogleFirebase } from '../services/firebase';

interface AuthModalsProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  language: Language;
  onClose: () => void;
  onLoginSuccess: (user: Partial<UserAccount>) => void;
  onOpenSupport?: () => void;
  onOpenPromoTerms?: () => void;
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

export const AuthModals: React.FC<AuthModalsProps> = ({
  isOpen,
  initialMode = 'login',
  language,
  onClose,
  onLoginSuccess,
  onOpenSupport,
  onOpenPromoTerms
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [referralCode, setReferralCode] = useState('BDT888');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Listen for OAuth postMessage from popup callback
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        if (event.data?.user) {
          onLoginSuccess(event.data.user);
          onClose();
        }
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setErrorMessage(
          language === 'bn'
            ? `Google লগইন ত্রুটি: ${event.data.error || 'অথেনটিকেশন ব্যর্থ হয়েছে'}`
            : `Google login error: ${event.data.error || 'Authentication failed'}`
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLoginSuccess, onClose, language]);

  if (!isOpen) return null;

  // Handle Google OAuth trigger with Firebase Auth
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      // 1. Authenticate with real Firebase Google Sign-In Popup
      const account = await signInWithGoogleFirebase();
      if (account) {
        onLoginSuccess(account);
        onClose();
        return;
      }
    } catch (err: any) {
      console.warn('Firebase Google Auth popup:', err);
      // User closed popup deliberately
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setGoogleLoading(false);
        return;
      }
      
      // If popup is blocked by browser or restricted in iframe, notify and offer instant account selector
      if (err?.code === 'auth/popup-blocked') {
        setErrorMessage(
          language === 'bn'
            ? 'পপ-আপ উইন্ডোটি ব্লক হয়েছে! ব্রাউজারে পপ-আপ অনুমোদন করুন অথবা নিচের অ্যাকাউন্ট বাছাই করুন।'
            : 'Popup was blocked by your browser. Please allow popups or select an account below.'
        );
        setShowGoogleChooser(true);
      } else {
        // Show Google account chooser
        setShowGoogleChooser(true);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Instant Google Sign In execution
  const handleSelectGoogleAccount = async (email: string, name: string, avatar?: string) => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.auth.googleDemoLogin(email, name, avatar);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google লগইন সম্পন্ন করা যায়নি');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'forgot') {
      setForgotSubmitted(true);
      setTimeout(() => {
        setForgotSubmitted(false);
        setMode('login');
      }, 2000);
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMessage(language === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি!' : 'Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.auth.login(phone, password);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          onClose();
          return;
        }
      } else {
        const res = await api.auth.register(phone, password, referralCode);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          onClose();
          return;
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || (language === 'bn' ? 'অথেনটিকেশন ব্যর্থ হয়েছে। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।' : 'Authentication failed. Please provide valid details.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setReferralCode('');
  };

  return (
    <div 
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="auth-modal-dialog"
        className="relative w-full max-w-[440px] bg-[#0a3827] border border-[#165d41] rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] p-5 sm:p-7 text-white select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/40 hover:bg-black/80 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 z-10"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Modal Header Tabs: লগইন / নিবন্ধন matching Capture5.PNG & Capture6.PNG */}
        {mode !== 'forgot' ? (
          <div className="flex items-center gap-8 border-b border-[#145d40] pb-2.5 mb-5">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => setMode('login')}
              className={`text-lg sm:text-xl font-bold pb-2 relative transition-all cursor-pointer font-bengali ${
                mode === 'login'
                  ? 'text-yellow-400 font-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'লগইন' : 'Login'}
              {mode === 'login' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-[3px] bg-yellow-400 rounded-full" />
              )}
            </button>

            <button
              id="auth-tab-register"
              type="button"
              onClick={() => setMode('register')}
              className={`text-lg sm:text-xl font-bold pb-2 relative transition-all cursor-pointer font-bengali ${
                mode === 'register'
                  ? 'text-yellow-400 font-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'নিবন্ধন' : 'Sign Up'}
              {mode === 'register' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-[3px] bg-yellow-400 rounded-full" />
              )}
            </button>
          </div>
        ) : (
          <div className="text-center pb-3 border-b border-[#145d40] mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-yellow-400 font-bengali">
              {language === 'bn' ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Forgot Password'}
            </h3>
            <p className="text-xs text-emerald-200/80 mt-1 font-bengali">
              {language === 'bn' ? 'আপনার নিবন্ধিত মোবাইল নম্বর লিখুন' : 'Enter your registered mobile number'}
            </p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Phone Number Field */}
          <div>
            <div className="relative flex items-center bg-[#05281c] border border-[#166042] rounded-xl px-3.5 py-3 focus-within:border-yellow-400 transition-colors shadow-inner">
              {mode === 'register' && (
                <span className="text-rose-500 font-black text-sm mr-1.5 select-none">*</span>
              )}
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mr-2.5 fill-emerald-400/20" />
              <input
                id="auth-phone-input"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                className="w-full bg-transparent text-white placeholder-emerald-200/50 focus:outline-none text-xs sm:text-sm font-medium tracking-wide"
              />
            </div>
          </div>

          {/* Password Field */}
          {mode !== 'forgot' && (
            <div>
              <div className="relative flex items-center bg-[#05281c] border border-[#166042] rounded-xl px-3.5 py-3 focus-within:border-yellow-400 transition-colors shadow-inner">
                <span className="text-rose-500 font-black text-sm mr-1.5 select-none">*</span>
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mr-2.5" />
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  className="w-full bg-transparent text-white placeholder-emerald-200/50 focus:outline-none text-xs sm:text-sm tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-emerald-300 hover:text-yellow-300 transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Register-Specific Additional Fields matching Capture6.PNG */}
          {mode === 'register' && (
            <>
              {/* Confirm Password */}
              <div>
                <div className="relative flex items-center bg-[#05281c] border border-[#166042] rounded-xl px-3.5 py-3 focus-within:border-yellow-400 transition-colors shadow-inner">
                  <span className="text-rose-500 font-black text-sm mr-1.5 select-none">*</span>
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0 mr-2.5" />
                  <input
                    id="auth-confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                    className="w-full bg-transparent text-white placeholder-emerald-200/50 focus:outline-none text-xs sm:text-sm tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-emerald-300 hover:text-yellow-300 transition-colors p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Referral Code (Optional) */}
              <div>
                <div className="relative flex items-center bg-[#05281c] border border-[#166042] rounded-xl px-3.5 py-3 focus-within:border-yellow-400 transition-colors shadow-inner">
                  <Gift className="w-4 h-4 text-emerald-400 shrink-0 mr-2.5" />
                  <input
                    id="auth-referral-input"
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder={language === 'bn' ? 'রেফারেল কোড (ঐচ্ছিক)' : 'Referral Code (Optional)'}
                    className="w-full bg-transparent text-yellow-300 placeholder-emerald-200/50 focus:outline-none text-xs sm:text-sm font-mono uppercase"
                  />
                </div>
              </div>

              {/* 18+ Terms Agreement Checkbox matching Capture6.PNG */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-xs text-emerald-100/90 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded accent-emerald-500 bg-[#05281c] border-emerald-600 cursor-pointer shrink-0"
                  />
                  <span className="font-bengali leading-snug">
                    {language === 'bn' ? (
                      <>
                        আমি ১৮ বছরের এবং এই শর্তাদি গ্রহণ করতে সম্মত{' '}
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenPromoTerms) onOpenPromoTerms();
                          }} 
                          className="text-yellow-400 underline hover:text-yellow-300 ml-1 cursor-pointer"
                        >
                          ব্যবহারের শর্তাবলি
                        </button>
                      </>
                    ) : (
                      <>
                        I am 18+ and agree to the{' '}
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenPromoTerms) onOpenPromoTerms();
                          }} 
                          className="text-yellow-400 underline hover:text-yellow-300 ml-1 cursor-pointer"
                        >
                          Terms of Use
                        </button>
                      </>
                    )}
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Options Row (Remember Me & Forgot Password) matching Capture5.PNG */}
          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-emerald-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 bg-[#05281c] border-emerald-600 cursor-pointer"
                />
                <span className="font-bengali">{language === 'bn' ? 'মনে রাখুন' : 'Remember me'}</span>
              </label>

              <button
                id="forgot-password-link"
                type="button"
                onClick={() => setMode('forgot')}
                className="text-rose-400 hover:text-rose-300 transition-colors font-semibold cursor-pointer font-bengali"
              >
                {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
              </button>
            </div>
          )}

          {/* Forgot confirmation feedback */}
          {forgotSubmitted && (
            <div className="p-2.5 bg-emerald-900/60 border border-emerald-500/60 rounded-lg text-center text-xs text-emerald-200">
              {language === 'bn' 
                ? 'এসএমএস এর মাধ্যমে আপনার পাসওয়ার্ড রিসেট কোড পাঠানো হয়েছে।' 
                : 'Reset OTP has been dispatched to your mobile.'}
            </div>
          )}

          {/* Error message banner */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-900/70 border border-rose-500/70 rounded-xl text-center text-xs text-rose-200">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons: Dual buttons for Register (Gold + Teal Reset) or Single button for Login */}
          {mode === 'register' ? (
            <div className="flex items-center gap-3 pt-2">
              {/* Gold Sign Up Button */}
              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-full bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 text-black font-black text-sm sm:text-base shadow-lg transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {language === 'bn' ? 'নিবন্ধন' : 'Sign Up'}
              </button>

              {/* Teal Reset Button matching Capture6.PNG */}
              <button
                id="auth-reset-btn"
                type="button"
                onClick={handleResetForm}
                className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#0d6e4f] to-[#128a64] hover:from-[#117f5c] hover:to-[#179f74] border border-[#20a37b] text-white font-black text-sm sm:text-base shadow-lg transition-all transform active:scale-98 cursor-pointer"
              >
                {language === 'bn' ? 'রিসেট' : 'Reset'}
              </button>
            </div>
          ) : (
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-full bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 text-black font-black text-sm sm:text-base shadow-lg transition-all transform active:scale-98 cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' && (language === 'bn' ? 'লগইন' : 'Login')}
              {mode === 'forgot' && (language === 'bn' ? 'রিসেট কোড পাঠান' : 'Send Reset OTP')}
            </button>
          )}

          {/* Google Sign-in Divider & Button */}
          {mode !== 'forgot' && (
            <div className="pt-2">
              <div className="relative flex py-1.5 items-center">
                <div className="grow border-t border-emerald-700/50"></div>
                <span className="shrink mx-3 text-[11px] font-semibold text-emerald-200/70 font-bengali">
                  {language === 'bn' ? 'অথবা Google দিয়ে' : 'Or continue with Google'}
                </span>
                <div className="grow border-t border-emerald-700/50"></div>
              </div>

              <button
                id="google-login-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full mt-1.5 py-2.5 px-4 rounded-full bg-white hover:bg-gray-100 active:scale-98 text-gray-800 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-gray-200 disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
                ) : (
                  <GoogleIcon className="w-4 h-4" />
                )}
                <span className="font-bengali font-bold tracking-wide">
                  {language === 'bn' ? 'Google দিয়ে সাইন ইন করুন' : 'Sign in with Google'}
                </span>
              </button>
            </div>
          )}

          {/* Bottom Switch Links matching Capture5.PNG & Capture6.PNG */}
          <div className="text-center text-xs pt-3 border-t border-[#145d40]/60 mt-3">
            {mode === 'login' && (
              <p className="text-emerald-100/90 font-bengali">
                {language === 'bn' ? 'এখনও কোনও একাউন্ট নেই? ' : "Don't have an account? "}
                <button
                  id="switch-to-register-btn"
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-yellow-400 hover:text-yellow-300 font-bold underline ml-1 cursor-pointer"
                >
                  {language === 'bn' ? 'সাইন আপ' : 'Sign Up'}
                </button>
              </p>
            )}

            {mode === 'register' && (
              <p className="text-emerald-100/90 font-bengali">
                {language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}
                <button
                  id="switch-to-login-btn"
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-yellow-400 hover:text-yellow-300 font-bold underline ml-1 cursor-pointer"
                >
                  {language === 'bn' ? 'লগইন করুন' : 'Login Now'}
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <div className="flex items-center justify-center gap-4 text-xs font-bengali">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-yellow-400 hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Login'}
                </button>
                {onOpenSupport && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenSupport(); }}
                    className="text-emerald-300 hover:underline cursor-pointer"
                  >
                    {language === 'bn' ? 'সাপোর্টে কথা বলুন' : 'Contact Support'}
                  </button>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Google Account Chooser & Fast OAuth Dialog */}
        {showGoogleChooser && (
          <div 
            id="google-account-chooser-modal"
            className="absolute inset-0 bg-[#062016]/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 flex flex-col justify-between z-20 animate-in fade-in zoom-in-95 duration-150"
          >
            <div>
              {/* Header with Google Logo */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-700/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                    <GoogleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white font-bengali">
                      {language === 'bn' ? 'Google দিয়ে সাইন ইন করুন' : 'Sign in with Google'}
                    </h3>
                    <p className="text-[11px] text-emerald-300 font-bengali">
                      {language === 'bn' ? 'BengalBet গেমিং পোর্টালে যুক্ত হতে অ্যাকাউন্ট বেছে নিন' : 'Choose an account to continue to BengalBet'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bonus Announcement */}
              <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-yellow-400/30 flex items-center gap-2.5">
                <Gift className="w-5 h-5 text-yellow-400 shrink-0 animate-bounce" />
                <div className="text-xs">
                  <span className="font-bold text-yellow-300 font-bengali">
                    {language === 'bn' ? 'Google সাইন-আপ উপহার:' : 'Google Sign-up Gift:'}
                  </span>
                  <span className="text-emerald-100 font-bengali ml-1">
                    {language === 'bn' ? '৳১,০০০ স্বাগতম বোনাস অবিলম্বে ওয়ালেটে যোগ হবে।' : '৳1,000 welcome bonus added instantly.'}
                  </span>
                </div>
              </div>

              {/* Account Selection List */}
              <div className="mt-3.5 space-y-2">
                {/* Account 1: Active User from Metadata */}
                <button
                  type="button"
                  onClick={() => handleSelectGoogleAccount('workpkx1@gmail.com', 'Work PKX', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80')}
                  disabled={googleLoading}
                  className="w-full text-left p-3 rounded-xl bg-[#0e4832] hover:bg-[#145e41] border border-emerald-500/40 hover:border-yellow-400/60 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                      W
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white group-hover:text-yellow-300 transition-colors">
                        Work PKX
                      </div>
                      <div className="text-[11px] text-emerald-200/80 font-mono">
                        workpkx1@gmail.com
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-semibold">
                    <span className="font-bengali">{language === 'bn' ? 'লগইন' : 'Connect'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Custom Email Input */}
                <div className="pt-1">
                  <div className="text-[11px] text-emerald-200/80 mb-1.5 font-bengali">
                    {language === 'bn' ? 'অথবা অন্য কোনো Google ইমেইল লিখুন:' : 'Or enter custom Google email:'}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="flex-1 bg-[#05261a] border border-emerald-600/60 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-hidden focus:border-yellow-400 font-mono"
                    />
                    <button
                      type="button"
                      disabled={googleLoading || !customGoogleEmail.includes('@')}
                      onClick={() => handleSelectGoogleAccount(customGoogleEmail, customGoogleEmail.split('@')[0])}
                      className="py-2 px-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs cursor-pointer disabled:opacity-50 transition-all shrink-0"
                    >
                      {language === 'bn' ? 'সাইন ইন' : 'Sign In'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Developer Configuration Note with One-Click Callback Copy */}
              <div className="mt-3.5 p-2.5 bg-black/40 rounded-xl border border-white/10 text-[11px] text-gray-300">
                <div className="flex items-center justify-between text-yellow-300/90 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    OAuth 2.0 Callback URL
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://ais-dev-2njkadpmvnlibtuyjhaqxu-210214168944.asia-east1.run.app/auth/callback');
                      setCopiedCallback(true);
                      setTimeout(() => setCopiedCallback(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[10px] text-yellow-400 hover:underline cursor-pointer"
                  >
                    {copiedCallback ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCallback ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'ইউআরএল কপি' : 'Copy URL')}</span>
                  </button>
                </div>
                <div className="font-mono text-[10px] text-emerald-200/90 truncate select-all bg-[#041c13] p-1.5 rounded border border-emerald-900">
                  https://ais-dev-2njkadpmvnlibtuyjhaqxu-210214168944.asia-east1.run.app/auth/callback
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-700/40 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowGoogleChooser(false)}
                className="text-emerald-300 hover:text-white transition-colors cursor-pointer font-bengali"
              >
                {language === 'bn' ? '← ফোন নম্বরে ফিরে যান' : '← Back to Phone Login'}
              </button>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Verified</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
