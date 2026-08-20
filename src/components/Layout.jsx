import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Brain,
  LayoutDashboard,
  Grid3x3,
  Spline,
  Puzzle,
  BarChart3,
  Trophy,
  User,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/games/memory', label: 'Memory Game', icon: Grid3x3 },
  { to: '/games/pattern', label: 'Pattern Recognition', icon: Spline },
  { to: '/games/logic', label: 'Logic Challenge', icon: Puzzle },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [...NAV];
  if (isAdmin) navItems.push({ to: '/admin', label: 'Admin Panel', icon: Shield });

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 sm:py-5 mb-1 flex items-center justify-between">
        <div onClick={() => setMobileOpen(false)}>
          <Logo size="sm" to="/dashboard" />
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'gradient-btn text-white shadow-lg shadow-accent-purple/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10'
              }`
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200/50 dark:border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-9 h-9 rounded-full gradient-btn flex items-center justify-center font-semibold text-sm shrink-0">
            {(profile?.username?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{profile?.username || 'Player'}</p>
            <p className="text-xs text-slate-400 truncate">Level {profile?.level ?? 1}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full">
      <div className="app-bg" />

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 glass border-r border-white/30 dark:border-white/10 flex-col fixed h-screen z-20">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed top-0 left-0 z-50 w-72 max-w-[85vw] h-screen glass-strong border-r border-white/30 dark:border-white/10 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass border-b border-white/30 dark:border-white/10">
          <div className="flex items-center justify-between px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3">
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu size={22} />
              </button>
              <div className="lg:hidden">
                <Logo size="sm" to="/dashboard" withText={false} />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Sparkles size={16} className="text-accent-purple" />
              <span>Train your brain, level up your mind</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleTheme}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <Link
                to="/profile"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full gradient-btn flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0"
              >
                {(profile?.username?.[0] || user?.email?.[0] || '?').toUpperCase()}
              </Link>
            </div>
          </div>
        </header>

        <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl w-full mx-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
