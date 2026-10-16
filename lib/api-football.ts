/**
 * Client serveur API-Football v3
 * Documentation : https://www.api-football.com/documentation-v3
 * Clé uniquement via process.env.FOOTBALL_API_KEY (jamais exposée au client)
 */

const BASE = "https://v3.football.api-sports.io";

export class ApiFootballError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiFootballError";
  }
}

export function hasFootballApiKey(): boolean {
  return Boolean(process.env.FOOTBALL_API_KEY?.trim());
}

export async function fetchFromApiFootball(
  endpoint: string,
  options?: { revalidate?: number }
): Promise<unknown> {
  const key = process.env.FOOTBALL_API_KEY?.trim();
  if (!key) {
    throw new ApiFootballError(
      "FOOTBALL_API_KEY manquant. Configurez la variable d'environnement serveur.",
      500,
      "MISSING_KEY"
    );
  }

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "x-apisports-key": key,
    },
    next: { revalidate: options?.revalidate ?? 1800 },
  });

  if (res.status === 429) {
    throw new ApiFootballError(
      "Limite de requêtes API-Football atteinte. Réessayez plus tard.",
      429,
      "RATE_LIMIT"
    );
  }

  if (!res.ok) {
    throw new ApiFootballError(
      `Erreur API-Football HTTP ${res.status}`,
      res.status,
      "HTTP_ERROR"
    );
  }

  const json = (await res.json()) as {
    errors?: Record<string, string> | string[];
    response?: unknown;
    results?: number;
  };

  if (json.errors && (Array.isArray(json.errors) ? json.errors.length : Object.keys(json.errors).length)) {
    const msg = Array.isArray(json.errors)
      ? json.errors.join(", ")
      : Object.values(json.errors).join(", ");
    throw new ApiFootballError(msg || "Erreur API-Football", 400, "API_ERROR");
  }

  return json;
}

/** Ligues prioritaires (ids API-Football) */
export const PRIORITY_LEAGUES = [
  { id: 61, name: "Ligue 1", country: "France" },
  { id: 39, name: "Premier League", country: "Angleterre" },
  { id: 140, name: "La Liga", country: "Espagne" },
  { id: 135, name: "Serie A", country: "Italie" },
  { id: 78, name: "Bundesliga", country: "Allemagne" },
] as const;

/** Saison API-Football = année de début (oct 2026 -> 2026) */
export function currentSeasonYear(): number {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0-11
  // Avant juillet : saison démarrée l'année précédente
  return m < 6 ? y - 1 : y;
}

export interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
    venue?: { name?: string | null };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo?: string;
    season: number;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

export interface ApiTeamStatistics {
  team: { id: number; name: string };
  form?: string;
  fixtures?: {
    played?: { home?: number; away?: number; total?: number };
    wins?: { home?: number; away?: number; total?: number };
    draws?: { home?: number; away?: number; total?: number };
    loses?: { home?: number; away?: number; total?: number };
  };
  goals?: {
    for?: {
      total?: { home?: number; away?: number; total?: number };
      average?: { home?: string; away?: string; total?: string };
    };
    against?: {
      total?: { home?: number; away?: number; total?: number };
      average?: { home?: string; away?: string; total?: string };
    };
  };
}

export async function getUpcomingFixtures(
  leagueId: number,
  season: number,
  next = 10
): Promise<ApiFixture[]> {
  const data = (await fetchFromApiFootball(
    `/fixtures?league=${leagueId}&season=${season}&next=${next}`,
    { revalidate: 900 }
  )) as { response?: ApiFixture[] };
  return data.response ?? [];
}

export async function getFixturesByDate(
  date: string // YYYY-MM-DD
): Promise<ApiFixture[]> {
  const data = (await fetchFromApiFootball(`/fixtures?date=${date}`, {
    revalidate: 900,
  })) as { response?: ApiFixture[] };
  return data.response ?? [];
}

export async function getTeamStatistics(
  teamId: number,
  leagueId: number,
  season: number
): Promise<ApiTeamStatistics | null> {
  try {
    const data = (await fetchFromApiFootball(
      `/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`,
      { revalidate: 3600 }
    )) as { response?: ApiTeamStatistics };
    return data.response ?? null;
  } catch {
    return null;
  }
}

export async function getHeadToHead(
  team1: number,
  team2: number,
  last = 5
): Promise<
  {
    fixture: { date: string };
    teams: { home: { name: string }; away: { name: string } };
    goals: { home: number | null; away: number | null };
  }[]
> {
  try {
    const data = (await fetchFromApiFootball(
      `/fixtures/headtohead?h2h=${team1}-${team2}&last=${last}`,
      { revalidate: 3600 }
    )) as {
      response?: {
        fixture: { date: string };
        teams: { home: { name: string }; away: { name: string } };
        goals: { home: number | null; away: number | null };
      }[];
    };
    return data.response ?? [];
  } catch {
    return [];
  }
}
