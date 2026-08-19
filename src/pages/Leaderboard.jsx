import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Globe, Calendar, Users, Crown, Medal, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchLeaderboard } from '../services/api';
import GlassCard from '../components/GlassCard';

const SCOPES = [
  { key: 'global', label: 'Global', icon: Globe },
  { key: 'weekly', label: 'Weekly', icon: Calendar },
  { key: 'friends', label: 'Friends', icon: Users },
];

const GAMES = [
  { key: 'all', label: 'All Games' },
  { key: 'memory', label: 'Memory' },
  { key: 'pattern', label: 'Pattern' },
  { key: 'logic', label: 'Logic' },
];

const RANK_ICONS = [Crown, Medal, Award];

export default function Leaderboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [scope, setScope] = useState('global');
  const [game, setGame] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let data = await fetchLeaderboard(game, scope);
        if (scope === 'friends') {
          data = (data || []).slice(0, 20);
        }
        setRows(data || []);
      } catch {
        // Handled gracefully in api layer
      } finally {
        setLoading(false);
      }
    })();
  }, [scope, game]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <Trophy className="text-amber-500" /> Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          See how you stack up against players around the world.
        </p>
      </div>

      {/* Scope tabs */}
      <div className="flex flex-wrap gap-2">
        {SCOPES.map((s) => (
          <button
            key={s.key}
            onClick={() => setScope(s.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              scope === s.key ? 'gradient-btn text-white' : 'glass text-slate-600 dark:text-slate-300'
            }`}
          >
            <s.icon size={16} /> {s.label}
          </button>
        ))}
      </div>

      {/* Game filter */}
      <div className="flex flex-wrap gap-2">
        {GAMES.map((g) => (
          <button
            key={g.key}
            onClick={() => setGame(g.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              game === g.key ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40' : 'glass text-slate-500'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <GlassCard className="p-2 md:p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-accent-purple/30 border-t-accent-purple animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-400 mb-3" size={40} />
            <p className="text-slate-500 dark:text-slate-400">No rankings yet for this filter.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row, i) => {
              const isMe = row.user_id === user.id;
              const RankIcon = RANK_ICONS[i] || null;
              return (
                <motion.div
                  key={row.user_id + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                    isMe
                      ? 'gradient-btn text-white shadow-lg shadow-accent-purple/20'
                      : 'hover:bg-white/40 dark:hover:bg-white/5'
                  } ${i < 3 ? 'glass' : ''}`}
                >
                  <div className="w-10 text-center font-display font-bold text-lg shrink-0">
                    {RankIcon ? <RankIcon size={22} className={i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : 'text-amber-700'} /> : `#${i + 1}`}
                  </div>
                  <div className="w-10 h-10 rounded-full gradient-btn flex items-center justify-center font-semibold text-sm shrink-0">
                    {(row.profiles?.username?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isMe ? 'text-white' : ''}`}>
                      {row.profiles?.username || 'Anonymous'} {isMe && <span className="text-xs opacity-80">(you)</span>}
                    </p>
                    {row.game && <p className={`text-xs ${isMe ? 'text-white/70' : 'text-slate-400'}`}>{row.game}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-display font-bold ${isMe ? 'text-white' : ''}`}>{row.best_score}</p>
                    <p className={`text-xs ${isMe ? 'text-white/70' : 'text-slate-400'}`}>points</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
