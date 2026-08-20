import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Grid3x3,
  Spline,
  Puzzle,
  BarChart3,
  Trophy,
  Zap,
  Flame,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import FloatingOrbs from '../components/FloatingOrbs';

const FEATURES = [
  { icon: Grid3x3, title: 'Memory Game', desc: 'Train recall with 4x4, 6x6, and 8x8 card grids.' },
  { icon: Spline, title: 'Pattern Recognition', desc: 'Spot the sequence with combo multipliers.' },
  { icon: Puzzle, title: 'Logic Challenge', desc: 'Solve number, shape, and missing-object puzzles.' },
  { icon: BarChart3, title: 'Deep Statistics', desc: 'Track accuracy, times, and progress over time.' },
  { icon: Trophy, title: 'Leaderboards', desc: 'Climb the global, weekly, and friend rankings.' },
  { icon: Flame, title: 'Daily Streaks', desc: 'Keep your streak alive with daily challenges.' },
];

const STATS = [
  { icon: Zap, label: 'XP & Levels', value: 'Progress' },
  { icon: Sparkles, label: 'Achievements', value: '7 Badges' },
  { icon: Brain, label: 'Brain Training', value: '3 Games' },
];

export default function Landing() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <div className="app-bg" />
      <FloatingOrbs />

      {/* Nav */}
      <header className="sticky top-0 z-30 glass border-b border-white/30 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass flex items-center justify-center text-slate-600 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {user ? (
              <Link
                to="/dashboard"
                className="gradient-btn px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 px-2 sm:px-3 py-1.5 sm:py-2">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="gradient-btn px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 glass px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-medium text-accent-purple mb-4 sm:mb-6">
            <Sparkles size={14} /> Memory & Logic Challenge
          </span>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] sm:leading-tight mb-4 sm:mb-6">
            Forge a <span className="gradient-text">sharper mind</span>
            <br />one game at a time
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            Train memory, spot patterns, and crack logic puzzles. Earn XP, climb leaderboards,
            and unlock achievements on your journey to mental mastery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="w-full sm:w-auto gradient-btn px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-white shadow-xl shadow-accent-purple/30 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Start Playing Free <ArrowRight size={18} />
            </motion.button>
            <Link
              to="/login"
              className="w-full sm:w-auto glass px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 text-center text-sm sm:text-base"
            >
              I already have an account
            </Link>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mt-10 sm:mt-16"
        >
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 sm:p-5">
              <s.icon className="mx-auto text-accent-blue mb-1.5 sm:mb-2" size={22} />
              <p className="font-display font-semibold text-sm sm:text-base">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4">
          Everything you need to <span className="gradient-text">level up</span>
        </h2>
        <p className="text-center text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mb-8 sm:mb-12 max-w-xl mx-auto">
          Three brain-training games, deep analytics, and a competitive leaderboard.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass rounded-2xl p-5 sm:p-6 card-hover"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center mb-3 sm:mb-4">
                <f.icon className="text-accent-purple" size={20} />
              </div>
              <h3 className="font-display text-base sm:text-lg font-semibold mb-1">{f.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-6 sm:p-10 md:p-16 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-purple/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-blue/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Ready to forge your mind?
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">
            Free to play. No credit card. Just your brain and a few minutes a day.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 gradient-btn px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-white shadow-xl shadow-accent-purple/30 text-sm sm:text-base"
          >
            Create your account <ArrowRight size={18} />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-slate-400">
            <span className="flex items-center gap-1"><Check size={14} className="text-emerald-500" /> Free forever</span>
            <span className="flex items-center gap-1"><Check size={14} className="text-emerald-500" /> No ads</span>
            <span className="flex items-center gap-1"><Check size={14} className="text-emerald-500" /> Privacy-first</span>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/20 dark:border-white/10 py-6 sm:py-8 text-center text-xs sm:text-sm text-slate-400 px-4">
        MindForge - Memory & Logic Challenge. Train daily, level up forever.
      </footer>
    </div>
  );
}
