import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import FloatingOrbs from '../components/FloatingOrbs';

export default function Login() {
  const { signIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      const dest = location.state?.from?.pathname || '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-3 sm:p-4 py-8">
      <div className="app-bg" />
      <FloatingOrbs />

      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
        <button
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass flex items-center justify-center text-slate-600 dark:text-slate-300"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-md relative mx-auto"
      >
        <div className="flex justify-center mb-4 sm:mb-6">
          <Logo size="md" />
        </div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-center mb-1">Welcome back</h1>
        <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-6">
          Sign in to continue your training
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-accent-purple outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-accent-purple outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-accent-purple"
              />
              <span className="text-slate-600 dark:text-slate-300">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-accent-blue hover:underline">
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full gradient-btn py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>Sign in <ArrowRight size={16} /></>
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-purple font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
