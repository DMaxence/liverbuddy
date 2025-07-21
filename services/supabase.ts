import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

import { Database } from "../types/database";

// Replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

// Database table names
export const TABLES = {
  PROFILES: "profiles",
  BADGES: "badges",
  USER_BADGES: "user_badges",
} as const;

// Auth helpers
export const signInAnonymously = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();
  return { data, error };
};

// export const signInWithEmail = async (email: string, password: string) => {
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });
//   return { data, error };
// };

// export const signUpWithEmail = async (
//   email: string,
//   password: string,
//   userData: { username: string; full_name?: string }
// ) => {
//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       data: userData,
//     },
//   });
//   return { data, error };
// };

// export const signInWithApple = async (credential: string) => {
//   const { data, error } = await supabase.auth.signInWithIdToken({
//     provider: "apple",
//     token: credential,
//   });
//   return { data, error };
// };

// export const cleanAnonymousUserProfile = async (userId: string) => {
//   const { data, error } = await supabase
//     .from(TABLES.PROFILES)
//     .delete()
//     .eq("id", userId);
//   return { data, error };
// };

// export const checkUsernameAvailability = async (username: string, excludeUserId?: string) => {
//   let query = supabase
//     .from(TABLES.PROFILES)
//     .select("id, username")
//     .eq("username", username.toLowerCase());

//   // If we're checking for an update, exclude the current user
//   if (excludeUserId) {
//     query = query.neq("id", excludeUserId);
//   }

//   const { data, error } = await query;

//   return {
//     available: !data || data.length === 0,
//     error,
//   };
// };

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return { session, error };
};

// Profile helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>
) => {
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();
  return { data, error };
};

// Auth state listener
export const onAuthStateChange = (
  callback: (event: string, session: any) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};
