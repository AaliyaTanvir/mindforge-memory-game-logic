import { supabase, levelForXp, ACHIEVEMENTS } from './supabaseClient';

// Profile helpers
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProfile(user, username) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email,
      username,
    })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, patch) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Game result submission - writes history, updates best score, bumps profile stats
export async function submitGameResult({
  game,
  difficulty,
  score,
  durationSeconds,
  moves,
  accuracy,
  won,
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Insert history row
  const { error: histErr } = await supabase.from('game_history').insert({
    user_id: user.id,
    game,
    difficulty,
    score,
    duration_seconds: durationSeconds,
    moves,
    accuracy,
    won,
  });
  if (histErr) throw histErr;

  // Upsert best score
  const { data: existing } = await supabase
    .from('scores')
    .select('id, best_score, best_time_seconds, moves')
    .eq('user_id', user.id)
    .eq('game', game)
    .eq('difficulty', difficulty)
    .maybeSingle();

  const better = !existing || score > existing.best_score;
  if (better) {
    if (existing) {
      await supabase
        .from('scores')
        .update({
          best_score: score,
          best_time_seconds: durationSeconds,
          moves,
          last_played_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('scores').insert({
        user_id: user.id,
        game,
        difficulty,
        best_score: score,
        best_time_seconds: durationSeconds,
        moves,
      });
    }
  }

  // Bump profile stats + XP
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, coins, games_played, wins, streak, last_played_date, level')
    .eq('id', user.id)
    .maybeSingle();
  if (profile) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let streak = profile.streak;
    if (profile.last_played_date === today) {
      // already counted today
    } else if (profile.last_played_date === yesterday) {
      streak = profile.streak + 1;
    } else {
      streak = 1;
    }
    const newXp = profile.xp + score;
    const newLevel = levelForXp(newXp);
    const newCoins = profile.coins + Math.floor(score / 10) + (won ? 20 : 5);
    await supabase.from('profiles').update({
      xp: newXp,
      level: newLevel,
      coins: newCoins,
      games_played: profile.games_played + 1,
      wins: profile.wins + (won ? 1 : 0),
      streak,
      last_played_date: today,
    }).eq('id', user.id);
  }

  // Achievement checks
  await checkAchievements(user.id, { game, won, durationSeconds, moves });

  return { better };
}

async function unlockAchievement(userId, code) {
  const def = ACHIEVEMENTS.find((a) => a.code === code);
  if (!def) return;
  const { data: existing } = await supabase
    .from('achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('code', code)
    .maybeSingle();
  if (existing) return;
  await supabase.from('achievements').insert({
    user_id: userId,
    code,
    title: def.title,
    description: def.description,
    icon: def.icon,
  });
}

async function checkAchievements(userId, result) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('wins, streak')
    .eq('id', userId)
    .maybeSingle();
  if (!profile) return;

  if (result.won) {
    await unlockAchievement(userId, 'first_win');
    if (profile.wins >= 10) await unlockAchievement(userId, 'ten_wins');
    if (profile.wins >= 50) await unlockAchievement(userId, 'fifty_wins');
  }
  if (result.durationSeconds && result.durationSeconds < 30 && result.won) {
    await unlockAchievement(userId, 'speed_master');
  }
  if (result.game === 'memory' && result.moves && result.won) {
    // Perfect memory: 4x4 in exactly 8 moves (8 pairs)
    if (result.moves === 8) await unlockAchievement(userId, 'perfect_memory');
  }
  if (profile.streak >= 3) await unlockAchievement(userId, 'daily_streak');
  if (result.game === 'logic' && result.won) {
    const { data: prof2 } = await supabase
      .from('profiles')
      .select('level')
      .eq('id', userId)
      .maybeSingle();
    if (prof2 && prof2.level >= 5) await unlockAchievement(userId, 'logic_expert');
  }
}

// Scores / leaderboard
export async function fetchLeaderboard(game, scope = 'global') {
  let query = supabase
    .from('scores')
    .select('user_id, best_score, best_time_seconds, moves, game, difficulty, profiles(username, avatar_url)')
    .order('best_score', { ascending: false })
    .limit(50);
  if (game !== 'all') query = query.eq('game', game);
  const { data, error } = await query;
  if (error) throw error;
  let rows = data || [];
  if (scope === 'weekly') {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    // best_time_seconds isn't a date; use game_history for weekly instead
    const { data: hist } = await supabase
      .from('game_history')
      .select('user_id, score, profiles(username, avatar_url)')
      .gte('played_at', weekAgo)
      .order('score', { ascending: false })
      .limit(50);
    rows = (hist || []).map((r) => ({
      user_id: r.user_id,
      best_score: r.score,
      profiles: r.profiles,
    }));
  }
  return rows;
}

export async function fetchUserStats(userId) {
  const [history, scores, achievements] = await Promise.all([
    supabase.from('game_history').select('*').eq('user_id', userId).order('played_at', { ascending: false }),
    supabase.from('scores').select('*').eq('user_id', userId),
    supabase.from('achievements').select('*').eq('user_id', userId),
  ]);
  return {
    history: history.data || [],
    scores: scores.data || [],
    achievements: achievements.data || [],
  };
}

export async function fetchDailyChallenge() {
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .order('challenge_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAdminProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
