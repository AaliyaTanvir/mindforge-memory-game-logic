import { ACHIEVEMENTS, levelForXp } from './supabaseClient';

const STORAGE_KEYS = {
  USERS: 'mindforge_local_users',
  CURRENT_USER: 'mindforge_local_session',
  PROFILES: 'mindforge_local_profiles',
  SCORES: 'mindforge_local_scores',
  HISTORY: 'mindforge_local_history',
  ACHIEVEMENTS: 'mindforge_local_achievements',
  DAILY: 'mindforge_local_daily',
};

function getItem(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// Initial mock leaderboard players
const SEED_PROFILES = [
  {
    id: 'seed-user-1',
    username: 'NovaBrain',
    email: 'nova@mindforge.app',
    bio: 'Memory master & logic enthusiast',
    avatar_url: '',
    xp: 6800,
    level: 14,
    coins: 920,
    streak: 8,
    games_played: 64,
    wins: 58,
    last_played_date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'seed-user-2',
    username: 'QuantumMind',
    email: 'quantum@mindforge.app',
    bio: 'Solving puzzles at the speed of light',
    avatar_url: '',
    xp: 5400,
    level: 11,
    coins: 740,
    streak: 5,
    games_played: 48,
    wins: 41,
    last_played_date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'seed-user-3',
    username: 'LogicWizard',
    email: 'wizard@mindforge.app',
    bio: 'Pattern recognition specialist',
    avatar_url: '',
    xp: 4100,
    level: 9,
    coins: 530,
    streak: 3,
    games_played: 35,
    wins: 29,
    last_played_date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'seed-user-4',
    username: 'SynapsePulse',
    email: 'synapse@mindforge.app',
    bio: 'Daily brain trainee',
    avatar_url: '',
    xp: 3200,
    level: 7,
    coins: 390,
    streak: 4,
    games_played: 28,
    wins: 21,
    last_played_date: new Date().toISOString().slice(0, 10),
  },
  {
    id: 'seed-user-5',
    username: 'CortexKing',
    email: 'cortex@mindforge.app',
    bio: 'Aiming for the #1 rank',
    avatar_url: '',
    xp: 2150,
    level: 5,
    coins: 240,
    streak: 2,
    games_played: 18,
    wins: 14,
    last_played_date: new Date().toISOString().slice(0, 10),
  },
];

const SEED_SCORES = [
  { id: 'sc-1', user_id: 'seed-user-1', game: 'memory', difficulty: 'hard', best_score: 950, best_time_seconds: 42, moves: 36, profiles: { username: 'NovaBrain', avatar_url: '' } },
  { id: 'sc-2', user_id: 'seed-user-2', game: 'memory', difficulty: 'medium', best_score: 820, best_time_seconds: 35, moves: 22, profiles: { username: 'QuantumMind', avatar_url: '' } },
  { id: 'sc-3', user_id: 'seed-user-3', game: 'pattern', difficulty: 'hard', best_score: 880, best_time_seconds: 50, moves: 12, profiles: { username: 'LogicWizard', avatar_url: '' } },
  { id: 'sc-4', user_id: 'seed-user-4', game: 'logic', difficulty: 'hard', best_score: 910, best_time_seconds: 45, moves: 15, profiles: { username: 'SynapsePulse', avatar_url: '' } },
  { id: 'sc-5', user_id: 'seed-user-5', game: 'pattern', difficulty: 'medium', best_score: 750, best_time_seconds: 38, moves: 10, profiles: { username: 'CortexKing', avatar_url: '' } },
];

function initLocalStorage() {
  const existingProfiles = getItem(STORAGE_KEYS.PROFILES, {});
  let updated = false;
  SEED_PROFILES.forEach((p) => {
    if (!existingProfiles[p.id]) {
      existingProfiles[p.id] = p;
      updated = true;
    }
  });
  if (updated) {
    setItem(STORAGE_KEYS.PROFILES, existingProfiles);
  }

  const existingScores = getItem(STORAGE_KEYS.SCORES, []);
  if (existingScores.length === 0) {
    setItem(STORAGE_KEYS.SCORES, SEED_SCORES);
  }
}

// Auth operations
export function localGetSession() {
  const user = getItem(STORAGE_KEYS.CURRENT_USER, null);
  if (!user) return { session: null };
  return {
    session: {
      user,
      access_token: 'local-mock-token',
      token_type: 'bearer',
      expires_in: 3600,
    },
  };
}

export function localSignUp(email, password, username) {
  initLocalStorage();
  const users = getItem(STORAGE_KEYS.USERS, []);
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const name = username || email.split('@')[0];
  const isAdmin = email.toLowerCase().includes('admin');
  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    email,
    password,
    user_metadata: { username: name, role: isAdmin ? 'admin' : 'user' },
    app_metadata: { role: isAdmin ? 'admin' : 'user' },
    created_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
  };

  users.push(newUser);
  setItem(STORAGE_KEYS.USERS, users);

  // Create initial profile
  const profiles = getItem(STORAGE_KEYS.PROFILES, {});
  profiles[newUser.id] = {
    id: newUser.id,
    username: name,
    email,
    bio: 'Brain training champion',
    avatar_url: '',
    xp: 0,
    level: 1,
    coins: 50,
    streak: 1,
    games_played: 0,
    wins: 0,
    last_played_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  setItem(STORAGE_KEYS.PROFILES, profiles);

  // Set session
  setItem(STORAGE_KEYS.CURRENT_USER, newUser);

  return {
    user: newUser,
    session: { user: newUser, access_token: 'local-mock-token' },
  };
}

export function localSignIn(email, password) {
  initLocalStorage();
  const users = getItem(STORAGE_KEYS.USERS, []);
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Graceful auto-creation for quick testing in offline/demo mode
    const name = email.split('@')[0];
    const isAdmin = email.toLowerCase().includes('admin');
    user = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      email,
      password,
      user_metadata: { username: name, role: isAdmin ? 'admin' : 'user' },
      app_metadata: { role: isAdmin ? 'admin' : 'user' },
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    };
    users.push(user);
    setItem(STORAGE_KEYS.USERS, users);

    const profiles = getItem(STORAGE_KEYS.PROFILES, {});
    profiles[user.id] = {
      id: user.id,
      username: name,
      email,
      bio: 'Brain training champion',
      avatar_url: '',
      xp: 0,
      level: 1,
      coins: 50,
      streak: 1,
      games_played: 0,
      wins: 0,
      last_played_date: new Date().toISOString().slice(0, 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PROFILES, profiles);
  }

  user.last_sign_in_at = new Date().toISOString();
  setItem(STORAGE_KEYS.CURRENT_USER, user);

  return {
    user,
    session: { user, access_token: 'local-mock-token' },
  };
}

export function localSignOut() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } catch (e) {
    console.error(e);
  }
}

export function localResetPassword(email) {
  return { message: 'Password reset link simulated for ' + email };
}

// Profile operations
export function localFetchProfile(userId, fallbackUser) {
  initLocalStorage();
  const profiles = getItem(STORAGE_KEYS.PROFILES, {});
  if (profiles[userId]) return profiles[userId];
  if (fallbackUser) {
    const name = fallbackUser.user_metadata?.username || fallbackUser.email?.split('@')[0] || 'Player';
    const profile = {
      id: userId,
      username: name,
      email: fallbackUser.email || '',
      bio: 'Brain training champion',
      avatar_url: '',
      xp: 0,
      level: 1,
      coins: 50,
      streak: 1,
      games_played: 0,
      wins: 0,
      last_played_date: new Date().toISOString().slice(0, 10),
      created_at: fallbackUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    profiles[userId] = profile;
    setItem(STORAGE_KEYS.PROFILES, profiles);
    return profile;
  }
  return null;
}

export function localCreateProfile(user, username) {
  initLocalStorage();
  const profiles = getItem(STORAGE_KEYS.PROFILES, {});
  const name = username || user.user_metadata?.username || user.email?.split('@')[0] || 'Player';
  const profile = {
    id: user.id,
    username: name,
    email: user.email,
    bio: 'Brain training champion',
    avatar_url: '',
    xp: 0,
    level: 1,
    coins: 50,
    streak: 1,
    games_played: 0,
    wins: 0,
    last_played_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  profiles[user.id] = profile;
  setItem(STORAGE_KEYS.PROFILES, profiles);
  return profile;
}

export function localUpdateProfile(userId, patch) {
  initLocalStorage();
  const profiles = getItem(STORAGE_KEYS.PROFILES, {});
  const current = profiles[userId] || { id: userId };
  const updated = {
    ...current,
    ...patch,
    updated_at: new Date().toISOString(),
  };
  profiles[userId] = updated;
  setItem(STORAGE_KEYS.PROFILES, profiles);
  return updated;
}

// Game results & stats
export function localSubmitGameResult({
  game,
  difficulty,
  score,
  durationSeconds,
  moves,
  accuracy,
  won,
}, userId) {
  initLocalStorage();
  const historyList = getItem(STORAGE_KEYS.HISTORY, []);
  const newHistItem = {
    id: 'hist_' + Date.now(),
    user_id: userId,
    game,
    difficulty,
    score,
    duration_seconds: durationSeconds,
    moves,
    accuracy,
    won,
    played_at: new Date().toISOString(),
  };
  historyList.unshift(newHistItem);
  setItem(STORAGE_KEYS.HISTORY, historyList);

  // Scores
  const scoresList = getItem(STORAGE_KEYS.SCORES, []);
  const existingIdx = scoresList.findIndex(
    (s) => s.user_id === userId && s.game === game && s.difficulty === difficulty
  );

  let better = false;
  const profiles = getItem(STORAGE_KEYS.PROFILES, {});
  const profile = profiles[userId];
  const username = profile?.username || 'Player';

  if (existingIdx >= 0) {
    if (score > scoresList[existingIdx].best_score) {
      better = true;
      scoresList[existingIdx] = {
        ...scoresList[existingIdx],
        best_score: score,
        best_time_seconds: durationSeconds,
        moves,
        last_played_at: new Date().toISOString(),
        profiles: { username, avatar_url: profile?.avatar_url || '' },
      };
    }
  } else {
    better = true;
    scoresList.push({
      id: 'sc_' + Date.now(),
      user_id: userId,
      game,
      difficulty,
      best_score: score,
      best_time_seconds: durationSeconds,
      moves,
      last_played_at: new Date().toISOString(),
      profiles: { username, avatar_url: profile?.avatar_url || '' },
    });
  }
  setItem(STORAGE_KEYS.SCORES, scoresList);

  // Bump profile
  if (profile) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let streak = profile.streak || 0;
    if (profile.last_played_date === today) {
      // already counted
    } else if (profile.last_played_date === yesterday) {
      streak = (profile.streak || 0) + 1;
    } else {
      streak = 1;
    }

    const newXp = (profile.xp || 0) + score;
    const newLevel = levelForXp(newXp);
    const newCoins = (profile.coins || 0) + Math.floor(score / 10) + (won ? 20 : 5);

    profiles[userId] = {
      ...profile,
      xp: newXp,
      level: newLevel,
      coins: newCoins,
      games_played: (profile.games_played || 0) + 1,
      wins: (profile.wins || 0) + (won ? 1 : 0),
      streak,
      last_played_date: today,
      updated_at: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PROFILES, profiles);
  }

  // Check achievements
  localCheckAchievements(userId, { game, won, durationSeconds, moves });

  return { better };
}

function localCheckAchievements(userId, result) {
  const achievements = getItem(STORAGE_KEYS.ACHIEVEMENTS, []);
  const userAchievements = achievements.filter((a) => a.user_id === userId);
  const has = (code) => userAchievements.some((a) => a.code === code);

  const unlock = (code) => {
    if (has(code)) return;
    const def = ACHIEVEMENTS.find((d) => d.code === code);
    if (!def) return;
    achievements.push({
      id: 'ach_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      user_id: userId,
      code,
      title: def.title,
      description: def.description,
      icon: def.icon,
      unlocked_at: new Date().toISOString(),
    });
    setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  };

  const profiles = getItem(STORAGE_KEYS.PROFILES, {});
  const profile = profiles[userId] || {};

  if (result.won) {
    unlock('first_win');
    if ((profile.wins || 0) >= 10) unlock('ten_wins');
    if ((profile.wins || 0) >= 50) unlock('fifty_wins');
  }
  if (result.durationSeconds && result.durationSeconds < 30 && result.won) {
    unlock('speed_master');
  }
  if (result.game === 'memory' && result.moves && result.won) {
    if (result.moves === 8) unlock('perfect_memory');
  }
  if ((profile.streak || 0) >= 3) {
    unlock('daily_streak');
  }
  if (result.game === 'logic' && result.won) {
    if ((profile.level || 1) >= 5) unlock('logic_expert');
  }
}

export function localFetchLeaderboard(game, scope = 'global') {
  initLocalStorage();
  const scores = getItem(STORAGE_KEYS.SCORES, []);
  const profiles = getItem(STORAGE_KEYS.PROFILES, {});

  // Augment score rows with profile info
  let rows = scores.map((s) => {
    const prof = profiles[s.user_id] || s.profiles || { username: 'Player', avatar_url: '' };
    return {
      ...s,
      profiles: {
        username: prof.username || 'Player',
        avatar_url: prof.avatar_url || '',
      },
    };
  });

  if (game && game !== 'all') {
    rows = rows.filter((r) => r.game === game);
  }

  rows.sort((a, b) => (b.best_score || 0) - (a.best_score || 0));

  if (scope === 'weekly') {
    return rows.slice(0, 30);
  }

  return rows.slice(0, 50);
}

export function localFetchUserStats(userId) {
  initLocalStorage();
  const history = getItem(STORAGE_KEYS.HISTORY, []).filter((h) => h.user_id === userId);
  const scores = getItem(STORAGE_KEYS.SCORES, []).filter((s) => s.user_id === userId);
  const achievements = getItem(STORAGE_KEYS.ACHIEVEMENTS, []).filter((a) => a.user_id === userId);

  return {
    history,
    scores,
    achievements,
  };
}

export function localFetchDailyChallenge() {
  const today = new Date().toISOString().slice(0, 10);
  const stored = getItem(STORAGE_KEYS.DAILY, null);
  if (stored && stored.challenge_date === today) {
    return stored;
  }

  const challenges = [
    { game: 'memory', difficulty: 'medium', description: 'Match all 18 pairs in medium mode with top focus.', target_score: 600 },
    { game: 'pattern', difficulty: 'easy', description: 'Reach a sequence score of 400 in pattern recognition.', target_score: 400 },
    { game: 'logic', difficulty: 'medium', description: 'Complete the logic challenge with high speed & precision.', target_score: 550 },
  ];

  const dayIndex = new Date().getDate() % challenges.length;
  const challenge = {
    id: 'daily_' + today,
    challenge_date: today,
    ...challenges[dayIndex],
  };

  setItem(STORAGE_KEYS.DAILY, challenge);
  return challenge;
}

export function localFetchAdminProfiles() {
  initLocalStorage();
  const profiles = getItem(STORAGE_KEYS.PROFILES, {});
  return Object.values(profiles).sort((a, b) => (b.xp || 0) - (a.xp || 0));
}
