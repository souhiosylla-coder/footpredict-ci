-- Schéma Supabase FootPredict CI
-- À exécuter dans SQL Editor du projet Supabase

-- Favoris utilisateur
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  match_id integer not null,
  created_at timestamptz default now(),
  unique(user_id, match_id)
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);

alter table public.favorites enable row level security;

drop policy if exists "Users can view their own favorites" on public.favorites;
create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own favorites" on public.favorites;
create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own favorites" on public.favorites;
create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Historique des prédictions (immuable une fois créé)
create table if not exists public.prediction_history (
  id uuid primary key default gen_random_uuid(),
  match_id integer not null,
  league_name text,
  home_team text,
  away_team text,
  kickoff timestamptz,
  prediction text not null,
  confidence numeric,
  predicted_score text,
  markets jsonb,
  actual_result text,
  evaluation text check (evaluation is null or evaluation in ('correct', 'incorrect')),
  status text default 'pending',
  created_at timestamptz default now() not null,
  resolved_at timestamptz,
  unique(match_id, created_at)
);

create index if not exists prediction_history_match_id_idx
  on public.prediction_history(match_id);
create index if not exists prediction_history_created_at_idx
  on public.prediction_history(created_at desc);

alter table public.prediction_history enable row level security;

-- Lecture publique des stats agrégées / historique (pas de données personnelles)
drop policy if exists "Public can read prediction history" on public.prediction_history;
create policy "Public can read prediction history"
  on public.prediction_history for select
  using (true);

-- Insertion uniquement via service role / backend (pas depuis le client anon)
-- Pas de policy INSERT pour anon/authenticated => refusé par défaut avec RLS

-- Table optionnelle cache matchs (serveur)
create table if not exists public.matches_cache (
  id integer primary key,
  payload jsonb not null,
  source text not null default 'api',
  updated_at timestamptz default now() not null
);

alter table public.matches_cache enable row level security;
drop policy if exists "Public read matches cache" on public.matches_cache;
create policy "Public read matches cache"
  on public.matches_cache for select
  using (true);
