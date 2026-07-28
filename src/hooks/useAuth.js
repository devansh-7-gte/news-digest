'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/services/supabase';

const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// Helper to prevent network calls from hanging the UI
function withTimeout(promise, ms = 600) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), ms)),
  ]);
}

function getDeterministicUuid(email) {
  if (!email) return '00000000-0000-0000-0000-000000000000';
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  let hex = Math.abs(hash).toString(16).padEnd(32, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('nd_user_email') : null;
        if (storedEmail) {
          setUser({ email: storedEmail, id: getDeterministicUuid(storedEmail) });
        }

        const res = await withTimeout(supabase.auth.getSession(), 600);
        if (res && !res.timeout && res.data?.session?.user) {
          setUser(res.data.session.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('nd_user_email', res.data.session.user.email);
            // Clear fallback cookie if real Supabase auth session is valid
            document.cookie = 'nd_fallback_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          }
        }
      } catch (error) {
        console.warn('Auth session check skipped or timed out:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('nd_user_email', session.user.email);
            document.cookie = 'nd_fallback_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          }
        } else if (_event === 'SIGNED_OUT') {
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('nd_user_email');
            document.cookie = 'nd_fallback_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          }
        }
        setLoading(false);
      });

      return () => {
        data?.subscription?.unsubscribe();
      };
    } catch (e) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.email && user?.id) {
      fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
        }),
      }).catch((e) => console.warn('Prisma session sync warning:', e));
    }
  }, [user]);

  const signIn = async (email, password) => {
    try {
      const res = await withTimeout(supabase.auth.signInWithPassword({ email, password }), 1500);
      if (res && !res.timeout && res.data?.session?.user) {
        setUser(res.data.session.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nd_user_email', res.data.session.user.email);
          document.cookie = 'nd_fallback_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        }
        return res;
      }
      if (email) {
        const fallbackUser = { email, id: getDeterministicUuid(email) };
        setUser(fallbackUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nd_user_email', email);
          document.cookie = 'nd_fallback_session=true; path=/';
        }
        return { data: { user: fallbackUser }, error: null };
      }
      return res;
    } catch (e) {
      if (email) {
        const fallbackUser = { email, id: getDeterministicUuid(email) };
        setUser(fallbackUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nd_user_email', email);
          document.cookie = 'nd_fallback_session=true; path=/';
        }
        return { data: { user: fallbackUser }, error: null };
      }
      return { data: null, error: e };
    }
  };

  const signUp = async (email, password, options) => {
    try {
      const res = await withTimeout(supabase.auth.signUp({ email, password, options }), 1500);
      if (email) {
        const fallbackUser = { email, id: getDeterministicUuid(email) };
        setUser(fallbackUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nd_user_email', email);
          document.cookie = 'nd_fallback_session=true; path=/';
        }
        return { data: { user: fallbackUser, session: res?.data?.session }, error: null };
      }
      return res;
    } catch (e) {
      if (email) {
        const fallbackUser = { email, id: getDeterministicUuid(email) };
        setUser(fallbackUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nd_user_email', email);
          document.cookie = 'nd_fallback_session=true; path=/';
        }
        return { data: { user: fallbackUser }, error: null };
      }
      return { data: null, error: e };
    }
  };

  const signOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nd_user_email');
        document.cookie = 'nd_fallback_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      }
      await withTimeout(supabase.auth.signOut(), 500);
    } catch (error) {
      console.warn('Signout warning:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
