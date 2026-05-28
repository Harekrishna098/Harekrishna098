import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LockScreenProps {
  mode: 'setup' | 'locked';
  onSetup: (password: string, confirm: string) => Promise<boolean>;
  onUnlock: (password: string) => Promise<boolean>;
  error: string;
  isLoading: boolean;
  setError: (e: string) => void;
}

export function LockScreen({ mode, onSetup, onUnlock, error, isLoading, setError }: LockScreenProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<'password' | 'confirm'>('password');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'setup') {
      if (step === 'password') {
        if (password.length < 4) {
          setError('Must be at least 4 characters');
          return;
        }
        setStep('confirm');
        setError('');
        return;
      }
      await onSetup(password, confirm);
    } else {
      await onUnlock(password);
    }
  };

  const handleBack = () => {
    setStep('password');
    setConfirm('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-ink-950 flex items-center justify-center overflow-hidden">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm mx-4"
      >
        {/* Card */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div className="absolute inset-0 backdrop-blur-2xl" />

          <div className="relative z-10 p-10">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 0 32px rgba(99,102,241,0.2)',
                  }}
                >
                  <Lock className="w-6 h-6 text-indigo-300" />
                </div>

                <div className="text-center">
                  <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
                    Nota
                  </h1>
                  <p className="text-sm text-ink-400 mt-1 tracking-wide">
                    {mode === 'setup' ? 'Create your private space' : 'Your private space'}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === 'setup' && step === 'confirm' ? (
                  <motion.div
                    key="confirm-step"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div>
                      <p className="text-xs text-ink-400 mb-3 text-center">Confirm your password</p>
                      <div className="relative">
                        <input
                          ref={inputRef}
                          type={showConfirm ? 'text' : 'password'}
                          value={confirm}
                          onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                          placeholder="Confirm password"
                          className={cn(
                            'w-full px-4 py-3.5 pr-12 rounded-xl text-white text-sm outline-none transition-all duration-200',
                            'placeholder:text-ink-600',
                            error
                              ? 'bg-red-500/10 border border-red-500/40 focus:border-red-400'
                              : 'bg-white/[0.06] border border-white/[0.08] focus:border-indigo-500/60 focus:bg-white/[0.08]'
                          )}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="password-step"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder={mode === 'setup' ? 'Create a password' : 'Enter password'}
                        className={cn(
                          'w-full px-4 py-3.5 pr-12 rounded-xl text-white text-sm outline-none transition-all duration-200',
                          'placeholder:text-ink-600',
                          error
                            ? 'bg-red-500/10 border border-red-500/40 focus:border-red-400'
                            : 'bg-white/[0.06] border border-white/[0.08] focus:border-indigo-500/60 focus:bg-white/[0.08]'
                        )}
                        autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-xs text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                {mode === 'setup' && step === 'confirm' && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3.5 rounded-xl text-sm text-ink-400 hover:text-ink-200 transition-colors border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04]"
                  >
                    Back
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading || (!password && !confirm)}
                  className={cn(
                    'flex-1 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  )}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      {mode === 'setup'
                        ? step === 'password'
                          ? 'Continue'
                          : 'Create Space'
                        : 'Unlock'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Hint */}
            <div className="mt-6 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-ink-600" />
              <p className="text-xs text-ink-600 text-center">
                {mode === 'setup'
                  ? 'Notes stored locally on your device'
                  : 'Only you can access these notes'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
