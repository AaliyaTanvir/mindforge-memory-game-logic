import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error('Missing Supabase env vars. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Achievement catalog - definitions used across the app
export const ACHIEVEMENTS = [
  { code: 'first_win', title: 'First Win', description: 'Win your very first game', icon: 'Trophy' },
  { code: 'ten_wins', title: '10 Wins', description: 'Win 10 games in total', icon: 'Medal' },
  { code: 'fifty_wins', title: '50 Wins', description: 'Win 50 games in total', icon: 'Award' },
  { code: 'perfect_memory', title: 'Perfect Memory', description: 'Complete a memory board with zero mistakes', icon: 'Brain' },
  { code: 'speed_master', title: 'Speed Master', description: 'Finish a game in under 30 seconds', icon: 'Zap' },
  { code: 'daily_streak', title: 'Daily Streak', description: 'Play 3 days in a row', icon: 'Flame' },
  { code: 'logic_expert', title: 'Logic Expert', description: 'Reach level 5 in logic puzzles', icon: 'Lightbulb' },
];

// Level curve: every 500 XP = 1 level
export const xpForLevel = (level) => (level - 1) * 500;
export const levelForXp = (xp) => Math.floor(xp / 500) + 1;
export const progressToNext = (xp) => {
  const level = levelForXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return { level, floor, ceil, pct: Math.min(100, ((xp - floor) / (ceil - floor)) * 100) };
};
