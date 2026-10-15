import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Client Supabase (optionnel pour le MVP).
 * Les favoris sont stockés en localStorage côté client pour le moment.
 * Préparé pour une migration future vers Supabase Auth + table favorites.
 */
