'use client';

import { useState } from 'react';
import { supabase } from '@/lib/services/supabase';

/**
 * Standalone utility to push a new user profile and default preferences into public tables.
 * @param {string} id - The Supabase auth user UUID
 * @param {string} email - The user's email address
 * @param {string} fullName - The user's full name
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export async function createUser(id, email, fullName) {
  try {
    // 1. Insert user profile into 'users' table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id,
        email,
        full_name: fullName,
      });

    if (profileError) {
      return { success: false, error: profileError };
    }

    // 2. Insert default preferences into 'user_preferences' table
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: id,
        digest_frequency: 'daily',
        digest_time: '08:00:00',
        summary_length: 'medium',
        timezone: 'UTC',
      });

    if (prefsError) {
      console.error('Failed to create default preferences:', prefsError);
      // We still treat profile creation as a success even if default preferences fail
    }

    return { success: true };
  } catch (err) {
    console.error('Error inside createUser utility:', err);
    return { success: false, error: err };
  }
}

/**
 * Custom hook for user profile management.
 */
export function useUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateUser = async (id, email, fullName) => {
    setLoading(true);
    setError(null);
    
    const result = await createUser(id, email, fullName);
    
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  };

  return {
    createUser: handleCreateUser,
    loading,
    error,
  };
}
