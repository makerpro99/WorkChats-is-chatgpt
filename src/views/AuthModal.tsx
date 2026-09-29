import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, KeyRound, ArrowRight, Loader2, AlertCircle, CheckCircle2, Sparkles, Shield, Zap } from 'lucide-react';
import { Logo } from '../components/Logo';
import { api, setToken } from '../api';
import { User } from '../types';
import { AgeVerificationStep } from '../components/AgeVerificationStep';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { signInWithGoogle } from '../services/googleAuth';

export type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

interface AuthModalProps {
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'LOGIN',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('last_free_account_username') || '';
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  // Forgot password flow states
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [codePreview, setCodePreview] = useState<string | null>(null);

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleQuickFreeAccount = async () => {
    resetMessages();
    setQuickLoading(true);
    try {
      const res = await api.quickRegister();
      if (res && res.token && res.user) {
        if (res.freeAccountToken) {
          localStorage.setItem(`free_account_token_${res.user.username.toLowerCase()}`, res.freeAccountToken);
          localStorage.setItem('last_free_account_username', res.user.username);
        }
        setToken(res.token);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de créer un compte gratuit instantané.');
    } finally {
      setQuickLoading(false);
    }
  };

  const handleFreeAccountQuickLogin = async () => {
    if (!identifier.trim()) {
      setError('Veuillez entrer votre nom d’utilisateur Free Account.');
      return;
    }

    resetMessages();
    setQuickLoginLoading(true);
    try {
      const cleanUsername = identifier.trim().toLowerCase();
      const storedToken = localStorage.getItem(`free_account_token_${cleanUsername}`) || undefined;
      const res = await api.freeQuickLogin({
        username: identifier.trim(),
        freeAccountToken: storedToken,
      });

      if (res.freeAccountToken) {
        localStorage.setItem(`free_account_token_${cleanUsername}`, res.freeAccountToken);
        localStorage.setItem('last_free_account_username', res.user.username);
      }
      setToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Session de compte gratuit invalide ou expirée.');
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    resetMessages();
    setGoogleLoading(true);
    try {
      const { firebaseUser } = await signInWithGoogle();
      const res = await api.googleLogin({
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoUrl: firebaseUser.photoURL || '',
        googleId: firebaseUser.uid,
      });

      if (res && res.token && res.user) {
        setToken(res.token);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion avec Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    resetMessages();
    setMode(newMode);
    setRegisterStep(1);
    if (newMode === 'FORGOT_PASSWORD') {
      setForgotStep(1);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await api.login({ identifier, password });
      setToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Incorrect username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Advance to Step 2: Camera Face-Based Age Verification
    setRegisterStep(2);
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await api.forgotPassword(resetEmail);
      if (res.verificationCodePreview) {
        setCodePreview(res.verificationCodePreview);
      }
      setSuccessMsg('Verification code sent to your email.');
      setForgotStep(2);
    } catch (err: any) {
      setError(err.message || 'User not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword({
        email: resetEmail,
        code: verificationCode,
        newPassword,
        confirmNewPassword,
      });

      setSuccessMsg('Password reset successfully. You can now log in.');
      setForgotStep(5);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="auth-modal"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden relative animate-in zoom-in-95 duration-200"
      >
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7">
          <div className="flex flex-col items-center text-center mb-6">
            <Logo size="lg" className="mb-2" />
            <h2 className="text-xl font-bold text-zinc-900">
              {mode === 'LOGIN' && 'Sign in to WorkChat'}
              {mode === 'REGISTER' && 'Create your WorkChat account'}
              {mode === 'FORGOT_PASSWORD' && 'Recover your account'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              {mode === 'LOGIN' && 'Enter your credentials to access your collaborative workspace.'}
              {mode === 'REGISTER' && 'Join your team and get work done together. Assigned default Member privileges.'}
              {mode === 'FORGOT_PASSWORD' && 'Follow the steps to reset your password securely.'}
            </p>
          </div>

          {error && (
            <div
              id="auth-error-banner"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              id="auth-success-banner"
              className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span>{successMsg}</span>
                {codePreview && (
                  <div className="mt-1 font-mono font-bold text-teal-800 text-sm">
                    Verification Code: {codePreview}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    id="input-login-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. farouk123 or alex"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">Password</label>
                  <button
                    type="button"
                    id="btn-link-forgot-password"
                    onClick={() => handleSwitchMode('FORGOT_PASSWORD')}
                    className="text-xs text-teal-700 hover:text-teal-800 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-login-submit"
                disabled={loading || quickLoading || googleLoading || quickLoginLoading}
                className="w-full mt-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In with Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Free Account Quick Login Button (Bypasses password for verified Free Accounts) */}
              <button
                type="button"
                id="btn-free-account-quick-login"
                onClick={handleFreeAccountQuickLogin}
                disabled={quickLoginLoading || loading || googleLoading}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                title="Connexion rapide avec votre nom d'utilisateur sans mot de passe"
              >
                {quickLoginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Vérification du compte...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Quick Login (Free Account sans mot de passe)</span>
                  </>
                )}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-400">
                  <span className="bg-white px-2">ou connexion instantanée</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading || quickLoginLoading}
                label={googleLoading ? 'Connexion Google...' : 'Continue with Google'}
              />

              {/* Instant Auto Free Account Button */}
              <button
                type="button"
                id="btn-modal-quick-free-account"
                onClick={handleQuickFreeAccount}
                disabled={quickLoading || loading || googleLoading}
                className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                title="Créer et vous connecter immédiatement à un compte membre sans rien saisir"
              >
                {quickLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>Connexion automatique...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Créer un Free Account (Sans mot de passe)</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-zinc-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  id="btn-switch-to-register"
                  onClick={() => handleSwitchMode('REGISTER')}
                  className="text-zinc-900 font-bold hover:underline"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTRATION FORM & AGE VERIFICATION */}
          {mode === 'REGISTER' && registerStep === 2 && (
            <AgeVerificationStep
              pendingCredentials={{
                username: username.trim(),
                password,
                confirmPassword,
              }}
              onVerified={(user) => {
                onSuccess(user);
                onClose();
              }}
              onCancel={() => setRegisterStep(1)}
            />
          )}

          {mode === 'REGISTER' && registerStep === 1 && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    id="input-register-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose unique username (e.g. farouk123)"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                  />
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Case-insensitive, globally unique identifier.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    id="input-register-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    id="input-register-confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-teal-50/70 rounded-xl border border-teal-200 text-[11px] text-teal-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Step 1 of 2: Camera age assurance is required on the next step for safety assignment.</span>
              </div>

              <button
                type="submit"
                id="btn-register-submit"
                disabled={loading || quickLoading}
                className="w-full mt-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>Continue to Age Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-400">
                  <span className="bg-white px-2">ou inscription instantanée</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading || quickLoading}
                label={googleLoading ? 'Connexion Google...' : 'Continue with Google'}
              />

              {/* Instant Auto Free Account Button */}
              <button
                type="button"
                id="btn-modal-register-quick-free-account"
                onClick={handleQuickFreeAccount}
                disabled={quickLoading || loading || googleLoading}
                className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                title="Créer et vous connecter immédiatement à un compte membre sans rien saisir"
              >
                {quickLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>Connexion automatique...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Free Account (Sans mot de passe)</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-zinc-500">
                Already registered?{' '}
                <button
                  type="button"
                  id="btn-switch-to-login"
                  onClick={() => handleSwitchMode('LOGIN')}
                  className="text-zinc-900 font-bold hover:underline"
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FLOW */}
          {mode === 'FORGOT_PASSWORD' && (
            <div className="space-y-4">
              {forgotStep === 1 && (
                <form onSubmit={handleSendResetCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Account Username
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input
                        id="input-forgot-username"
                        type="text"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your registered username"
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-send-verification-code"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Verification Code'}
                  </button>
                </form>
              )}

              {(forgotStep === 2 || forgotStep === 3 || forgotStep === 4) && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Enter Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input
                        id="input-reset-verification-code"
                        type="text"
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="6-digit verification code"
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input
                        id="input-reset-new-password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 6 chars)"
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input
                        id="input-reset-confirm-new-password"
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-reset-password-submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password & Save'}
                  </button>
                </form>
              )}

              {forgotStep === 5 && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900">Password Reset Complete</h4>
                  <p className="text-xs text-zinc-500">
                    Your password has been securely updated. You may now sign in with your new password.
                  </p>
                  <button
                    id="btn-back-to-login"
                    onClick={() => handleSwitchMode('LOGIN')}
                    className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Back to Log In
                  </button>
                </div>
              )}

              {forgotStep !== 5 && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    id="btn-cancel-forgot-password"
                    onClick={() => handleSwitchMode('LOGIN')}
                    className="text-xs text-zinc-500 hover:text-zinc-900 hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
