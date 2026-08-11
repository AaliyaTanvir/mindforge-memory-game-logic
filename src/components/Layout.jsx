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
      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-5 mb-2" onClick={() => setMobileOpen(false)}>
        <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center">
          <Brain size={20} />
        </div>
        <span className="font-display text-xl font-bold gradient-text">MindForge</span>
      </Link>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
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
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200/50 dark:border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-9 h-9 rounded-full gradient-btn flex items-center justify-center font-semibold text-sm">
            {(profile?.username?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{profile?.username || 'Player'}</p>
            <p className="text-xs text-slate-400 truncate">Level {profile?.level ?? 1}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <div className="app-bg" />

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 glass border-r border-white/30 dark:border-white/10 flex-col fixed h-screen">
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
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed top-0 left-0 z-50 w-64 h-screen glass-strong border-r border-white/30 dark:border-white/10 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass border-b border-white/30 dark:border-white/10">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3">
            <button
              className="lg:hidden text-slate-600 dark:text-slate-300"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Sparkles size={16} className="text-accent-purple" />
              <span>Train your brain, level up your mind</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full gradient-btn flex items-center justify-center font-semibold text-sm"
              >
                {(profile?.username?.[0] || user?.email?.[0] || '?').toUpperCase()}
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile close button when drawer open */}
      {mobileOpen && (
        <button
          className="fixed top-4 right-4 z-50 lg:hidden text-white"
          onClick={() => setMobileOpen(false)}
        >
          <X size={24} />
        </button>
      )}
    </div>
  );
}
