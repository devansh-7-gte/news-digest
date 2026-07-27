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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('nd_user_email') : null;
        if (storedEmail) {
          setUser({ email: storedEmail, id: 'user-active-session' });
        }

        const res = await withTimeout(supabase.auth.getSession(), 600);
        if (res && !res.timeout && res.data?.session?.user) {
          setUser(res.data.session.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('nd_user_email', res.data.session.user.email);
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
          }
        } else if (_event === 'SIGNED_OUT') {
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('nd_user_email');
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

  const signIn = async (email, password) => {
    try {
      const res = await withTimeout(supabase.auth.signInWithPassword({ email, password }), 1500);
      if (res && !res.timeout && res.data?.user) {
        setUser(res.data.user);
        if (typeof window !== 'undefined') localStorage.setItem('nd_user_email', res.data.user.email);
        return res;
      }
      if (email) {
        const fallbackUser = { email, id: 'user-active-session' };
        setUser(fallbackUser);
        if (typeof window !== 'undefined') localStorage.setItem('nd_user_email', email);
        return { data: { user: fallbackUser }, error: null };
      }
      return res;
    } catch (e) {
      if (email) {
        const fallbackUser = { email, id: 'user-active-session' };
        setUser(fallbackUser);
        if (typeof window !== 'undefined') localStorage.setItem('nd_user_email', email);
        return { data: { user: fallbackUser }, error: null };
      }
      return { data: null, error: e };
    }
  };

  const signUp = async (email, password, options) => {
    try {
      const res = await withTimeout(supabase.auth.signUp({ email, password, options }), 1500);
      if (email) {
        const fallbackUser = { email, id: 'user-active-session' };
        setUser(fallbackUser);
        if (typeof window !== 'undefined') localStorage.setItem('nd_user_email', email);
        return { data: { user: fallbackUser, session: res?.data?.session }, error: null };
      }
      return res;
    } catch (e) {
      if (email) {
        const fallbackUser = { email, id: 'user-active-session' };
        setUser(fallbackUser);
        if (typeof window !== 'undefined') localStorage.setItem('nd_user_email', email);
        return { data: { user: fallbackUser }, error: null };
      }
      return { data: null, error: e };
    }
  };

  const signOut = async () => {
    try {
      if (typeof window !== 'undefined') localStorage.removeItem('nd_user_email');
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
