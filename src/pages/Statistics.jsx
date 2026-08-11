import { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Target, Timer, Trophy, Gamepad2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { fetchUserStats } from '../services/api';
import GlassCard from '../components/GlassCard';
import Stat from '../components/Stat';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const GAME_LABELS = { memory: 'Memory', pattern: 'Pattern', logic: 'Logic' };
const GAME_COLORS = {
  memory: '#3b82f6',
  pattern: '#8b5cf6',
  logic: '#10b981',
};

function buildDaily(history) {
  const days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    days[key] = { played: 0, score: 0, won: 0 };
  }
  history.forEach((h) => {
    const key = h.played_at.slice(0, 10);
    if (days[key]) {
      days[key].played += 1;
      days[key].score += h.score || 0;
      if (h.won) days[key].won += 1;
    }
  });
  return days;
}

function buildMonthly(history) {
  const months = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { played: 0, score: 0 };
  }
  history.forEach((h) => {
    const d = new Date(h.played_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) {
      months[key].played += 1;
      months[key].score += h.score || 0;
    }
  });
  return months;
}

export default function Statistics() {
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const toast = useToast();
  const [stats, setStats] = useState({ history: [], scores: [], achievements: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchUserStats(user.id);
        setStats(s);
      } catch (err) {
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';

  const daily = useMemo(() => buildDaily(stats.history), [stats.history]);
  const monthly = useMemo(() => buildMonthly(stats.history), [stats.history]);

  const dailyLabels = Object.keys(daily).map((k) =>
    new Date(k).toLocaleDateString(undefined, { weekday: 'short' }),
  );
  const dailyPlayed = Object.values(daily).map((d) => d.played);
  const dailyScore = Object.values(daily).map((d) => d.score);

  const monthlyLabels = Object.keys(monthly).map((k) => {
    const [y, m] = k.split('-');
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: 'short' });
  });
  const monthlyPlayed = Object.values(monthly).map((d) => d.played);

  const gameDistribution = useMemo(() => {
    const dist = { memory: 0, pattern: 0, logic: 0 };
    stats.history.forEach((h) => {
      if (dist[h.game] !== undefined) dist[h.game] += 1;
    });
    return dist;
  }, [stats.history]);

  const gamesPlayed = profile?.games_played || 0;
  const wins = profile?.wins || 0;
  const accuracy = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
  const avgTime = useMemo(() => {
    if (!stats.history.length) return 0;
    const sum = stats.history.reduce((a, h) => a + (h.duration_seconds || 0), 0);
    return Math.round(sum / stats.history.length);
  }, [stats.history]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-accent-purple/30 border-t-accent-purple animate-spin" />
      </div>
    );
  }

  if (stats.history.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="text-accent-blue" /> Statistics
        </h1>
        <GlassCard className="p-12 text-center">
          <Gamepad2 className="mx-auto text-slate-400 mb-4" size={48} />
          <h2 className="font-display text-xl font-semibold mb-2">No games played yet</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Play a few games and your stats, charts, and progress will show up here.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="text-accent-blue" /> Statistics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your performance and progress over time.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Gamepad2} label="Games Played" value={gamesPlayed} accent="blue" />
        <Stat icon={Trophy} label="Wins" value={wins} accent="emerald" />
        <Stat icon={Target} label="Accuracy" value={`${accuracy}%`} accent="purple" />
        <Stat icon={Timer} label="Avg Time" value={`${avgTime}s`} accent="amber" />
      </div>

      {/* Daily progress */}
      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-accent-blue" /> Daily Progress (last 7 days)
        </h2>
        <div className="h-64">
          <Line
            data={{
              labels: dailyLabels,
              datasets: [
                {
                  label: 'Games played',
                  data: dailyPlayed,
                  borderColor: GAME_COLORS.memory,
                  backgroundColor: 'rgba(59,130,246,0.15)',
                  fill: true,
                  tension: 0.35,
                },
                {
                  label: 'Score',
                  data: dailyScore,
                  borderColor: GAME_COLORS.pattern,
                  backgroundColor: 'rgba(139,92,246,0.15)',
                  fill: true,
                  tension: 0.35,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: textColor } } },
              scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: true },
              },
            }}
          />
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly progress */}
        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Weekly Progress</h2>
          <div className="h-56">
            <Bar
              data={{
                labels: dailyLabels,
                datasets: [
                  {
                    label: 'Games',
                    data: dailyPlayed,
                    backgroundColor: 'rgba(59,130,246,0.6)',
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor } } },
                scales: {
                  x: { grid: { color: gridColor }, ticks: { color: textColor } },
                  y: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: true },
                },
              }}
            />
          </div>
        </GlassCard>

        {/* Game distribution */}
        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Game Distribution</h2>
          <div className="h-56 flex items-center justify-center">
            <Doughnut
              data={{
                labels: Object.keys(gameDistribution).map((g) => GAME_LABELS[g]),
                datasets: [
                  {
                    data: Object.values(gameDistribution),
                    backgroundColor: [GAME_COLORS.memory, GAME_COLORS.pattern, GAME_COLORS.logic],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor } } },
              }}
            />
          </div>
        </GlassCard>
      </div>

      {/* Monthly progress */}
      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-accent-purple" /> Monthly Progress (6 months)
        </h2>
        <div className="h-64">
          <Bar
            data={{
              labels: monthlyLabels,
              datasets: [
                {
                  label: 'Games played',
                  data: monthlyPlayed,
                  backgroundColor: 'rgba(139,92,246,0.6)',
                  borderRadius: 8,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: textColor } } },
              scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: true },
              },
            }}
          />
        </div>
      </GlassCard>

      {/* Best scores table */}
      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Best Scores</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-200/40 dark:border-white/10">
                <th className="py-2">Game</th>
                <th className="py-2">Difficulty</th>
                <th className="py-2">Best Score</th>
                <th className="py-2">Time</th>
                <th className="py-2">Moves</th>
              </tr>
            </thead>
            <tbody>
              {stats.scores.length === 0 ? (
                <tr><td colSpan="5" className="py-4 text-center text-slate-400">No scores yet.</td></tr>
              ) : (
                stats.scores.map((s) => (
                  <tr key={s.id} className="border-b border-slate-200/30 dark:border-white/5">
                    <td className="py-2 font-medium">{GAME_LABELS[s.game] || s.game}</td>
                    <td className="py-2">{s.difficulty}</td>
                    <td className="py-2 font-display font-semibold">{s.best_score}</td>
                    <td className="py-2">{s.best_time_seconds ? `${s.best_time_seconds}s` : '-'}</td>
                    <td className="py-2">{s.moves ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
