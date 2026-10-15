-- Schéma Supabase pour FootPredict CI
-- Exécuter dans l'éditeur SQL de votre projet Supabase

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  match_id integer not null,
  created_at timestamptz default now(),
  unique(user_id, match_id)
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

create table if not exists public.prediction_history (
  id uuid primary key default gen_random_uuid(),
  match_id integer not null,
  league_name text,
  home_team text,
  away_team text,
  prediction text,
  confidence numeric,
  actual_result text,
  markets jsonb,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create index if not exists prediction_history_match_id_idx
  on public.prediction_history(match_id);
