import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { fetchProfile, createProfile } from '../services/api';
import {
  localGetSession,
  localSignIn,
  localSignUp,
  localSignOut,
  localResetPassword,
} from '../services/localBackend';

const AuthContext = createContext(null);

function isNetworkOrConfigError(err) {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  return (
    !isSupabaseConfigured ||
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('failed') ||
    msg.includes('resolve') ||
    msg.includes('invalid api key') ||
    msg.includes('jwt') ||
    msg.includes('supabase') ||
    msg.includes('rate limit') ||
    msg.includes('rate_limit') ||
    msg.includes('over_email_send_rate_limit') ||
    msg.includes('too many requests')
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u) => {
    if (!u) {
      setProfile(null);
      return;
    }
    try {
      let p = await fetchProfile(u.id, u);
      if (!p) {
        // First login after signup: create profile from username in user_metadata
        const username =
          (u.user_metadata && u.user_metadata.username) || u.email?.split('@')[0] || 'Player';
        p = await createProfile(u, username);
      }
      const safeProfile = {
        id: u.id,
        username: p?.username || u.user_metadata?.username || u.email?.split('@')[0] || 'Player',
        email: p?.email || u.email || '',
        bio: p?.bio || 'Brain training champion',
        avatar_url: p?.avatar_url || '',
        xp: p?.xp ?? 0,
        level: p?.level ?? 1,
        coins: p?.coins ?? 50,
        streak: p?.streak ?? 1,
        games_played: p?.games_played ?? 0,
        wins: p?.wins ?? 0,
        last_played_date: p?.last_played_date || new Date().toISOString().slice(0, 10),
        created_at: p?.created_at || u.created_at || new Date().toISOString(),
        updated_at: p?.updated_at || new Date().toISOString(),
      };
      setProfile(safeProfile);
      localUpdateProfile(u.id, safeProfile);
    } catch {
      const fallbackProf = {
        id: u.id,
        username: u.user_metadata?.username || u.email?.split('@')[0] || 'Player',
        email: u.email || '',
        bio: 'Brain training champion',
        avatar_url: '',
        xp: 0,
        level: 1,
        coins: 50,
        streak: 1,
        games_played: 0,
        wins: 0,
        last_played_date: new Date().toISOString().slice(0, 10),
        created_at: u.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(fallbackProf);
      localUpdateProfile(u.id, fallbackProf);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initial session check
    (async () => {
      let activeUser = null;

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data?.session?.user) {
            activeUser = data.session.user;
          }
        } catch {
          // Supabase unreachable
        }
      }

      if (!activeUser) {
        const local = localGetSession();
        if (local.session?.user) {
          activeUser = local.session.user;
        }
      }

      if (!mounted) return;

      if (activeUser) {
        setUser(activeUser);
        await loadProfile(activeUser);
      }
      setLoading(false);
    })();

    let sub = null;
    if (isSupabaseConfigured) {
      try {
        const res = supabase.auth.onAuthStateChange((_event, session) => {
          (async () => {
            if (session?.user) {
              setUser(session.user);
              await loadProfile(session.user);
            } else {
              const local = localGetSession();
              if (local.session?.user) {
                setUser(local.session.user);
                await loadProfile(local.session.user);
              } else {
                setUser(null);
                setProfile(null);
              }
            }
          })();
        });
        sub = res.data?.subscription;
      } catch {
        // ignore
      }
    }

    return () => {
      mounted = false;
      if (sub?.unsubscribe) {
        sub.unsubscribe();
      }
    };
  }, [loadProfile]);

  const signUp = useCallback(async (email, password, username) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) {
          if (isNetworkOrConfigError(error)) {
            const localData = localSignUp(email, password, username);
            setUser(localData.user);
            await loadProfile(localData.user);
            return localData;
          }
          throw error;
        }
        if (data?.user) {
          setUser(data.user);
          await loadProfile(data.user);
        }
        return data;
      } catch (err) {
        if (isNetworkOrConfigError(err)) {
          const localData = localSignUp(email, password, username);
          setUser(localData.user);
          await loadProfile(localData.user);
          return localData;
        }
        throw err;
      }
    }

    const localData = localSignUp(email, password, username);
    setUser(localData.user);
    await loadProfile(localData.user);
    return localData;
  }, [loadProfile]);

  const signIn = useCallback(async (email, password) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (isNetworkOrConfigError(error)) {
            const localData = localSignIn(email, password);
            setUser(localData.user);
            await loadProfile(localData.user);
            return localData;
          }
          throw error;
        }
        if (data?.user) {
          setUser(data.user);
          await loadProfile(data.user);
        }
        return data;
      } catch (err) {
        if (isNetworkOrConfigError(err)) {
          const localData = localSignIn(email, password);
          setUser(localData.user);
          await loadProfile(localData.user);
          return localData;
        }
        throw err;
      }
    }

    const localData = localSignIn(email, password);
    setUser(localData.user);
    await loadProfile(localData.user);
    return localData;
  }, [loadProfile]);

  const resetPassword = useCallback(async (email) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) {
          if (isNetworkOrConfigError(error)) {
            return localResetPassword(email);
          }
          throw error;
        }
        return;
      } catch (err) {
        if (isNetworkOrConfigError(err)) {
          return localResetPassword(email);
        }
        throw err;
      }
    }
    return localResetPassword(email);
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    localSignOut();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile,
    isAdmin: (user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

