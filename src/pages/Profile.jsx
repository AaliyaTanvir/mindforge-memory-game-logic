import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Zap, Star, Coins, Flame, Edit2, Save, X, History, Trophy } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchUserStats, updateProfile } from '../services/api';
import { ACHIEVEMENTS, progressToNext } from '../services/supabaseClient';
import GlassCard from '../components/GlassCard';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState({ history: [], scores: [], achievements: [] });
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatar, setAvatar] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const s = await fetchUserStats(user.id);
        setStats(s || { history: [], scores: [], achievements: [] });
      } catch {
        // Handled in api layer
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const prog = progressToNext(profile?.xp || 0);
  const unlockedCodes = new Set((stats.achievements || []).map((a) => a.code));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(user.id, { bio, avatar_url: avatar });
      await refreshProfile();
      setEditOpen(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header card */}
      <GlassCard className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl gradient-btn flex items-center justify-center text-3xl sm:text-4xl font-display font-bold text-white shrink-0">
            {avatar || (profile?.username?.[0] || '?').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-bold">{profile?.username || 'Player'}</h1>
              <span className="text-[11px] sm:text-xs glass px-2 py-0.5 rounded-full text-accent-purple">Level {profile?.level || 1}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1 truncate">{profile?.email}</p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 sm:mt-3 max-w-2xl">
              {profile?.bio || 'No bio yet. Click edit to add one.'}
            </p>
            <div className="mt-3 sm:mt-4 relative h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden max-w-md mx-auto sm:mx-0">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${prog.pct}%` }}
                className="h-full gradient-btn rounded-full"
              />
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">{profile?.xp || 0} XP - {prog.ceil - (profile?.xp || 0)} to level {prog.level + 1}</p>
          </div>
          <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => { setBio(profile?.bio || ''); setAvatar(profile?.avatar_url || ''); setEditOpen(true); }}>
            <Edit2 size={15} /> Edit Profile
          </Button>
        </div>
      </GlassCard>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="glass rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
          <Zap className="text-accent-blue shrink-0" size={18} />
          <div className="min-w-0"><p className="text-[10px] sm:text-xs text-slate-400 truncate">XP</p><p className="font-display font-semibold text-base sm:text-lg truncate">{profile?.xp || 0}</p></div>
        </div>
        <div className="glass rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
          <Star className="text-accent-purple shrink-0" size={18} />
          <div className="min-w-0"><p className="text-[10px] sm:text-xs text-slate-400 truncate">Level</p><p className="font-display font-semibold text-base sm:text-lg truncate">{profile?.level || 1}</p></div>
        </div>
        <div className="glass rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
          <Coins className="text-amber-500 shrink-0" size={18} />
          <div className="min-w-0"><p className="text-[10px] sm:text-xs text-slate-400 truncate">Coins</p><p className="font-display font-semibold text-base sm:text-lg truncate">{profile?.coins || 0}</p></div>
        </div>
        <div className="glass rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
          <Flame className="text-rose-500 shrink-0" size={18} />
          <div className="min-w-0"><p className="text-[10px] sm:text-xs text-slate-400 truncate">Streak</p><p className="font-display font-semibold text-base sm:text-lg truncate">{profile?.streak || 0}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Achievements */}
        <GlassCard className="p-4 sm:p-6">
          <h2 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500 shrink-0" /> Achievements
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3">
            {ACHIEVEMENTS.map((a) => {
              const Icon = LucideIcons[a.icon] || Trophy;
              return <Badge key={a.code} icon={Icon} label={a.title} earned={unlockedCodes.has(a.code)} />;
            })}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-3 sm:mt-4">
            {unlockedCodes.size} of {ACHIEVEMENTS.length} unlocked
          </p>
        </GlassCard>

        {/* Game history */}
        <GlassCard className="p-4 sm:p-6">
          <h2 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <History size={18} className="text-accent-blue shrink-0" /> Recent History
          </h2>
          {loading ? (
            <div className="h-32 animate-pulse rounded-xl bg-slate-200/40" />
          ) : stats.history.length === 0 ? (
            <p className="text-xs sm:text-sm text-slate-400">No games played yet.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {stats.history.slice(0, 15).map((h) => (
                <div key={h.id} className="flex items-center justify-between glass rounded-xl p-2.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${h.won ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="font-medium capitalize truncate">{h.game}</span>
                    <span className="text-[11px] sm:text-xs text-slate-400 truncate">{h.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-400 shrink-0">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{h.score} pts</span>
                    <span>{h.duration_seconds}s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(false)} className="w-full sm:w-auto"><X size={15} /> Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="w-full sm:w-auto"><Save size={15} /> {saving ? 'Saving...' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Avatar (emoji or letter)</label>
            <input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value.slice(0, 2))}
              placeholder="e.g. 🦊 or M"
              className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-accent-purple outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-accent-purple outline-none resize-none text-sm"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
