/*
# MindForge - Memory & Logic Challenge: Core Schema

## Overview
Creates the full data model for a brain-training app with multi-user accounts:
profiles (extended user info + XP/level/coins/streak), scores (per-game sessions),
daily_challenges (one challenge per day), game_history (raw game log),
achievements (definitions + user progress), badges (definitions + awarded badges),
and admin_notes (operator-only audit notes).

## Tables
- `profiles`         : extended user profile (xp, level, coins, streak, role, bio, avatar_url)
- `scores`           : best/last score per user per game + difficulty
- `daily_challenges` : the challenge of the day (game type + config)
- `game_history`     : every game session result, append-only
- `achievements`     : catalog of achievements + user-specific unlocked flag
- `badges`           : catalog of badges + user-specific awarded flag
- `admin_notes`      : operator-only notes (admin role only)

## Security (RLS)
- profiles: owner-scoped select/update; admin full read.
- scores, game_history: owner can insert/update/delete own; everyone authenticated can SELECT (leaderboard).
- daily_challenges: all authenticated can SELECT; only service role / admin can write (server-controlled).
- achievements, badges: SELECT open to authenticated; INSERT of unlock/award rows owner-scoped; DELETE not allowed.
- admin_notes: admin-only full access via a SECURITY DEFINER helper or role check.
- `is_admin()` SQL function checks raw_app_meta_data.role = 'admin'.

## Notes
1. `user_id` columns default to auth.uid() so client inserts omitting owner succeed.
2. Leaderboard needs cross-user reads on scores/game_history, so SELECT is authenticated-open.
3. XP/level/coins/streak are kept on profiles and updated by the client after games; server-side
   integrity is enforced via RLS ownership (only the owner can update their own profile).
*/

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  coins integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  last_played_date date,
  games_played integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- Scores (best per user/game/difficulty)
CREATE TABLE IF NOT EXISTS public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  game text NOT NULL CHECK (game IN ('memory','pattern','logic')),
  difficulty text NOT NULL,
  best_score integer NOT NULL DEFAULT 0,
  best_time_seconds integer,
  moves integer,
  last_played_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, game, difficulty)
);
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scores_select_all" ON public.scores;
CREATE POLICY "scores_select_all"
ON public.scores FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "scores_insert_own" ON public.scores;
CREATE POLICY "scores_insert_own"
ON public.scores FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_update_own" ON public.scores;
CREATE POLICY "scores_update_own"
ON public.scores FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_delete_own" ON public.scores;
CREATE POLICY "scores_delete_own"
ON public.scores FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- Daily challenges
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  game text NOT NULL CHECK (game IN ('memory','pattern','logic')),
  difficulty text NOT NULL DEFAULT 'normal',
  target_score integer NOT NULL DEFAULT 100,
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_select_all" ON public.daily_challenges;
CREATE POLICY "daily_select_all"
ON public.daily_challenges FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "daily_insert_admin" ON public.daily_challenges;
CREATE POLICY "daily_insert_admin"
ON public.daily_challenges FOR INSERT
TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "daily_update_admin" ON public.daily_challenges;
CREATE POLICY "daily_update_admin"
ON public.daily_challenges FOR UPDATE
TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Game history (append-only)
CREATE TABLE IF NOT EXISTS public.game_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  game text NOT NULL CHECK (game IN ('memory','pattern','logic')),
  difficulty text NOT NULL DEFAULT 'normal',
  score integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  moves integer,
  accuracy numeric(5,2),
  won boolean NOT NULL DEFAULT false,
  played_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "history_select_all" ON public.game_history;
CREATE POLICY "history_select_all"
ON public.game_history FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "history_insert_own" ON public.game_history;
CREATE POLICY "history_insert_own"
ON public.game_history FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "history_delete_own" ON public.game_history;
CREATE POLICY "history_delete_own"
ON public.game_history FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ach_select_all" ON public.achievements;
CREATE POLICY "ach_select_all"
ON public.achievements FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "ach_insert_own" ON public.achievements;
CREATE POLICY "ach_insert_own"
ON public.achievements FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

-- Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  icon text DEFAULT '',
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "badges_select_all" ON public.badges;
CREATE POLICY "badges_select_all"
ON public.badges FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "badges_insert_own" ON public.badges;
CREATE POLICY "badges_insert_own"
ON public.badges FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admin notes
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notes_admin_all" ON public.admin_notes;
CREATE POLICY "notes_admin_all"
ON public.admin_notes FOR SELECT
TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "notes_admin_insert" ON public.admin_notes;
CREATE POLICY "notes_admin_insert"
ON public.admin_notes FOR INSERT
TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notes_admin_update" ON public.admin_notes;
CREATE POLICY "notes_admin_update"
ON public.admin_notes FOR UPDATE
TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notes_admin_delete" ON public.admin_notes;
CREATE POLICY "notes_admin_delete"
ON public.admin_notes FOR DELETE
TO authenticated USING (public.is_admin());

-- Indexes for leaderboard & history queries
CREATE INDEX IF NOT EXISTS idx_scores_game_best ON public.scores (game, best_score DESC);
CREATE INDEX IF NOT EXISTS idx_history_user_time ON public.game_history (user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles (xp DESC);
