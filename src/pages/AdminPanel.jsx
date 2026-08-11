import { useEffect, useState } from 'react';
import { Shield, Users, Trophy, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchAdminProfiles } from '../services/api';
import GlassCard from '../components/GlassCard';
import Stat from '../components/Stat';

export default function AdminPanel() {
  const { user } = useAuth();
  const toast = useToast();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchAdminProfiles();
        setProfiles(rows);
      } catch (err) {
        toast.error('Failed to load admin data. You may not have admin access.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = profiles.filter((p) =>
    !query || p.username?.toLowerCase().includes(query.toLowerCase()) || p.email?.toLowerCase().includes(query.toLowerCase()),
  );

  const totalXp = profiles.reduce((a, p) => a + (p.xp || 0), 0);
  const totalGames = profiles.reduce((a, p) => a + (p.games_played || 0), 0);
  const totalWins = profiles.reduce((a, p) => a + (p.wins || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <Shield className="text-accent-purple" /> Admin Panel
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Platform overview and user management.</p>
      </div>

      <div className="glass-strong rounded-xl p-4 flex items-start gap-3 text-sm">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <p className="text-slate-600 dark:text-slate-300">
          You're viewing the admin panel. In this demo, admin users can read all profiles and platform stats.
          Promoting a user to admin requires setting their role in the backend (auth metadata).
        </p>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Total Users" value={profiles.length} accent="blue" />
        <Stat icon={Trophy} label="Total Wins" value={totalWins} accent="emerald" />
        <Stat icon={Shield} label="Games Played" value={totalGames} accent="purple" />
        <Stat icon={Trophy} label="Total XP" value={totalXp.toLocaleString()} accent="amber" />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-accent-purple outline-none"
        />
      </div>

      {/* Users table */}
      <GlassCard className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-accent-purple/30 border-t-accent-purple animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-200/40 dark:border-white/10">
                  <th className="py-3 px-2">User</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Level</th>
                  <th className="py-3 px-2">XP</th>
                  <th className="py-3 px-2">Games</th>
                  <th className="py-3 px-2">Wins</th>
                  <th className="py-3 px-2">Streak</th>
                  <th className="py-3 px-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="8" className="py-8 text-center text-slate-400">No users found.</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b border-slate-200/30 dark:border-white/5 hover:bg-white/40 dark:hover:bg-white/5">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center text-xs font-semibold">
                            {(p.username?.[0] || '?').toUpperCase()}
                          </div>
                          <span className="font-medium">{p.username}</span>
                          {p.id === user.id && <span className="text-xs text-accent-purple">(you)</span>}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-500">{p.email}</td>
                      <td className="py-3 px-2">{p.level ?? 1}</td>
                      <td className="py-3 px-2">{p.xp ?? 0}</td>
                      <td className="py-3 px-2">{p.games_played ?? 0}</td>
                      <td className="py-3 px-2">{p.wins ?? 0}</td>
                      <td className="py-3 px-2">{p.streak ?? 0}</td>
                      <td className="py-3 px-2 text-slate-400 text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
