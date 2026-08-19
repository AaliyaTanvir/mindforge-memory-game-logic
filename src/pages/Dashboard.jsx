import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Coins,
  Flame,
  Trophy,
  Grid3x3,
  Spline,
  Puzzle,
  ArrowRight,
  Target,
  Star,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import Stat from '../components/Stat';
import { progressToNext } from '../services/supabaseClient';
import { fetchDailyChallenge, fetchUserStats } from '../services/api';
import * as LucideIcons from 'lucide-react';

const GAMES = [
  { to: '/games/memory', label: 'Memory Game', icon: Grid3x3, desc: 'Match the pairs', color: 'from-accent-blue to-cyan-400' },
  { to: '/games/pattern', label: 'Pattern Recognition', icon: Spline, desc: 'Spot the sequence', color: 'from-accent-purple to-fuchsia-400' },
  { to: '/games/logic', label: 'Logic Challenge', icon: Puzzle, desc: 'Solve the puzzle', color: 'from-emerald-500 to-teal-400' },
];

export default function Dashboard() {
  const { profile, refreshProfile, user } = useAuth();
  const toast = useToast();
  const [daily, setDaily] = useState(null);
  const [stats, setStats] = useState({ history: [], scores: [], achievements: [] });
  const [loading, setLoading] = useState(true);

  // First-time login: account has never been signed into before, so the
  // last sign-in timestamp matches (or is absent relative to) creation time.
  const isFirstLogin = (() => {
    if (!user) return false;
    const created = user.created_at ? new Date(user.created_at).getTime() : 0;
    const last = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
    if (!last) return true; // never signed in yet
    // Treat as first login if last sign-in happened within 60s of account creation
    return Math.abs(last - created) < 60_000;
  })();

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const [d, s] = await Promise.all([fetchDailyChallenge(), fetchUserStats(user.id)]);
        setDaily(d);
        setStats(s || { history: [], scores: [], achievements: [] });
      } catch {
        // Handled gracefully in api layer
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const prog = useMemo(() => progressToNext(profile?.xp || 0), [profile?.xp]);

  const recentAchievements = (stats.achievements || [])
    .slice(-4)
    .reverse();

  const totalGames = profile?.games_played || 0;
  const wins = profile?.wins || 0;
  const accuracy = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const avgTime = useMemo(() => {
    const h = stats.history || [];
    if (!h.length) return 0;
    const sum = h.reduce((acc, r) => acc + (r.duration_seconds || 0), 0);
    return Math.round(sum / h.length);
  }, [stats.history]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {isFirstLogin ? 'Welcome' : 'Welcome back'}, <span className="gradient-text">{profile?.username || 'Player'}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isFirstLogin
              ? 'Ready to start training your brain? Pick a game below.'
              : profile?.streak > 0
                ? `You're on a ${profile.streak}-day streak. Keep it up!`
                : 'Play a game today to start a streak.'}
          </p>
        </div>
        <Button onClick={() => refreshProfile()}>
          <TrendingUp size={16} /> Refresh stats
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Zap} label="Total XP" value={(profile?.xp || 0).toLocaleString()} accent="blue" />
        <Stat icon={Star} label="Current Level" value={profile?.level || 1} accent="purple" subtitle={`${prog.pct.toFixed(0)}% to next`} />
        <Stat icon={Coins} label="Coins" value={(profile?.coins || 0).toLocaleString()} accent="amber" />
        <Stat icon={Flame} label="Day Streak" value={profile?.streak || 0} accent="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* XP / Level progress */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Zap size={18} className="text-accent-blue" /> Level Progress
            </h2>
            <span className="text-sm text-slate-400">Level {prog.level}</span>
          </div>
          <div className="relative h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${prog.pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full gradient-btn rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>{prog.floor} XP</span>
            <span>{prog.ceil} XP</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <Stat icon={Target} label="Games" value={totalGames} accent="blue" />
            <Stat icon={Trophy} label="Wins" value={wins} accent="emerald" />
            <Stat icon={TrendingUp} label="Accuracy" value={`${accuracy}%`} accent="purple" />
          </div>
        </GlassCard>

        {/* Daily Challenge */}
        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-accent-purple" /> Daily Challenge
          </h2>
          {loading ? (
            <div className="h-32 animate-pulse rounded-xl bg-slate-200/50 dark:bg-slate-700/40" />
          ) : daily ? (
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wide gradient-text mb-2">
                {daily.game} - {daily.difficulty}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{daily.description}</p>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-slate-400">Target</span>
                <span className="font-semibold">{daily.target_score} XP</span>
              </div>
              <Link to={`/games/${daily.game}`}>
                <Button className="w-full">
                  Start Challenge <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No challenge today. Check back soon!</p>
          )}
        </GlassCard>
      </div>

      {/* Continue playing */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Continue playing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {GAMES.map((g, i) => (
            <motion.div
              key={g.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={g.to}>
                <GlassCard hover className="p-6 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center mb-4`}>
                    <g.icon className="text-white" size={22} />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{g.label}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{g.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-accent-purple font-medium">
                    Play now <ArrowRight size={14} />
                  </span>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent achievements */}
        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> Recent Achievements
          </h2>
          {recentAchievements.length === 0 ? (
            <p className="text-sm text-slate-400">No achievements yet. Play a game to earn your first!</p>
          ) : (
            <div className="space-y-3">
              {recentAchievements.map((a) => {
                const Icon = LucideIcons[a.icon] || Trophy;
                return (
                  <div key={a.id} className="flex items-center gap-3 glass rounded-xl p-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-accent-purple flex items-center justify-center text-white">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{a.title}</p>
                      <p className="text-xs text-slate-400">{a.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Mini stats summary */}
        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-accent-blue" /> Performance
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Avg time</p>
              <p className="font-display text-2xl font-semibold">{avgTime}s</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Best games</p>
              <p className="font-display text-2xl font-semibold">{stats.scores.length}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Achievements</p>
              <p className="font-display text-2xl font-semibold">{stats.achievements.length}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Last played</p>
              <p className="font-display text-2xl font-semibold">
                {profile?.last_played_date
                  ? new Date(profile.last_played_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  : '-'}
              </p>
            </div>
          </div>
          <Link to="/statistics" className="block mt-4">
            <Button variant="secondary" className="w-full">
              View full statistics <ArrowRight size={16} />
            </Button>
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
