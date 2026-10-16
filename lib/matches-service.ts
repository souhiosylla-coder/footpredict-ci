/**
 * Couche données matchs : API-Football réelle + Poisson.
 * Les mock ne sont utilisés que si USE_DEMO_DATA=true explicitement.
 */

import {
  hasFootballApiKey,
  PRIORITY_LEAGUES,
  currentSeasonYear,
  getUpcomingFixtures,
  getTeamStatistics,
  getHeadToHead,
  ApiFootballError,
  type ApiFixture,
  type ApiTeamStatistics,
} from "./api-football";
import { computePoisson, formMultiplier, type PoissonResult } from "./poisson";
import type { Match, FormResult, H2HMatch, League, Team } from "./types";

export type DataSource = "api" | "demo" | "none";

export interface MatchesResponse {
  matches: Match[];
  source: DataSource;
  lastUpdated: string;
  error?: string;
  warning?: string;
}

function shortName(name: string): string {
  if (name.length <= 12) return name;
  const parts = name.split(" ");
  if (parts.length >= 2) return parts[parts.length - 1].slice(0, 12);
  return name.slice(0, 12);
}

function parseAvg(v?: string | number | null): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function formFromString(form?: string): FormResult[] {
  if (!form) return [];
  return form
    .slice(0, 5)
    .split("")
    .map((c) => {
      const result = c === "W" || c === "D" || c === "L" ? c : "D";
      return {
        result: result as "W" | "D" | "L",
        score: "-",
        opponent: "",
        date: "",
      };
    });
}

function strengthFromStats(
  stats: ApiTeamStatistics | null,
  side: "home" | "away"
): {
  attack: number;
  defense: number;
  gf: number;
  ga: number;
  quality: "high" | "medium" | "insufficient";
} {
  if (!stats?.goals) {
    return { attack: 1, defense: 1, gf: 1.2, ga: 1.2, quality: "insufficient" };
  }

  const gfAvg =
    parseAvg(stats.goals.for?.average?.[side]) ??
    parseAvg(stats.goals.for?.average?.total);
  const gaAvg =
    parseAvg(stats.goals.against?.average?.[side]) ??
    parseAvg(stats.goals.against?.average?.total);

  if (gfAvg === null || gaAvg === null) {
    return { attack: 1, defense: 1, gf: 1.2, ga: 1.2, quality: "insufficient" };
  }

  // Normalisation autour de ~1.3 buts / match
  const leagueAvg = 1.35;
  const attack = Math.max(0.5, Math.min(2.2, gfAvg / leagueAvg));
  const defense = Math.max(0.5, Math.min(2.2, gaAvg / leagueAvg));

  const played =
    stats.fixtures?.played?.[side] ?? stats.fixtures?.played?.total ?? 0;
  const quality =
    played >= 8 ? "high" : played >= 3 ? "medium" : "insufficient";

  return { attack, defense, gf: gfAvg, ga: gaAvg, quality };
}

function buildAnalysis(
  home: string,
  away: string,
  p: PoissonResult,
  quality: string
): string[] {
  const lines: string[] = [];
  if (quality === "insufficient") {
    lines.push(
      "Données statistiques insuffisantes pour une prédiction fiable. Les probabilités sont indicatives."
    );
  }
  const fav =
    p.homeWin >= p.awayWin && p.homeWin >= p.draw
      ? home
      : p.awayWin >= p.homeWin && p.awayWin >= p.draw
      ? away
      : "un match nul";
  lines.push(
    `Le modèle de Poisson estime une issue favorable à ${fav} (1 ${p.homeWin}% · N ${p.draw}% · 2 ${p.awayWin}%).`
  );
  lines.push(
    `Buts attendus : ${p.expectedHomeGoals} – ${p.expectedAwayGoals}. Over 2.5 : ${p.over25}%, BTTS : ${p.bttsYes}%.`
  );
  lines.push(
    "Les prédictions sont statistiques et ne garantissent aucun résultat."
  );
  return lines;
}

function mapStatus(short: string): Match["status"] {
  if (["1H", "2H", "HT", "ET", "BT", "P", "LIVE"].includes(short)) return "live";
  if (["FT", "AET", "PEN"].includes(short)) return "finished";
  return "scheduled";
}

async function fixtureToMatch(f: ApiFixture, season: number): Promise<Match> {
  const league: League = {
    id: f.league.id,
    name: f.league.name,
    country: f.league.country,
    logo: f.league.logo || "",
    season: String(f.league.season),
  };

  const homeTeam: Team = {
    id: f.teams.home.id,
    name: f.teams.home.name,
    shortName: shortName(f.teams.home.name),
    logo: f.teams.home.logo,
    country: f.league.country,
  };

  const awayTeam: Team = {
    id: f.teams.away.id,
    name: f.teams.away.name,
    shortName: shortName(f.teams.away.name),
    logo: f.teams.away.logo,
    country: f.league.country,
  };

  const [homeStats, awayStats, h2hRaw] = await Promise.all([
    getTeamStatistics(f.teams.home.id, f.league.id, season),
    getTeamStatistics(f.teams.away.id, f.league.id, season),
    getHeadToHead(f.teams.home.id, f.teams.away.id, 5),
  ]);

  const homeS = strengthFromStats(homeStats, "home");
  const awayS = strengthFromStats(awayStats, "away");

  const homeForm = formFromString(homeStats?.form);
  const awayForm = formFromString(awayStats?.form);

  const h2h: H2HMatch[] = h2hRaw.map((h) => ({
    date: h.fixture.date.slice(0, 10),
    homeTeam: h.teams.home.name,
    awayTeam: h.teams.away.name,
    score:
      h.goals.home !== null && h.goals.away !== null
        ? `${h.goals.home}-${h.goals.away}`
        : "-",
  }));

  let h2hBias = 0;
  if (h2h.length >= 3) {
    let homePts = 0;
    h2h.forEach((m) => {
      const [a, b] = m.score.split("-").map(Number);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return;
      if (m.homeTeam === homeTeam.name) {
        if (a > b) homePts += 1;
        else if (a < b) homePts -= 1;
      } else {
        if (b > a) homePts += 1;
        else if (b < a) homePts -= 1;
      }
    });
    h2hBias = Math.max(-0.15, Math.min(0.15, homePts * 0.03));
  }

  const poisson = computePoisson({
    homeAttack: homeS.attack,
    homeDefense: homeS.defense,
    awayAttack: awayS.attack,
    awayDefense: awayS.defense,
    homeAdvantage: 1.15,
    formHome: formMultiplier(homeForm),
    formAway: formMultiplier(awayForm),
    h2hHomeBias: h2hBias,
  });

  const quality =
    homeS.quality === "insufficient" || awayS.quality === "insufficient"
      ? "insufficient"
      : homeS.quality === "high" && awayS.quality === "high"
      ? "high"
      : "medium";

  const maxP = Math.max(poisson.homeWin, poisson.draw, poisson.awayWin);
  let prediction: "1" | "X" | "2" = "X";
  if (poisson.homeWin === maxP) prediction = "1";
  else if (poisson.awayWin === maxP) prediction = "2";

  // Confiance : écart + qualité des données
  const spread = maxP - (poisson.homeWin + poisson.draw + poisson.awayWin - maxP) / 2;
  let confidence = Math.round(40 + spread * 0.5);
  if (quality === "high") confidence += 10;
  if (quality === "insufficient") confidence = Math.min(confidence, 48);
  confidence = Math.max(35, Math.min(92, confidence));

  return {
    id: f.fixture.id,
    league,
    homeTeam,
    awayTeam,
    kickoff: f.fixture.date,
    status: mapStatus(f.fixture.status.short),
    venue: f.fixture.venue?.name || undefined,
    confidence,
    prediction,
    markets: {
      homeWin: poisson.homeWin,
      draw: poisson.draw,
      awayWin: poisson.awayWin,
      over15: poisson.over15,
      under15: poisson.under15,
      over25: poisson.over25,
      under25: poisson.under25,
      over35: poisson.over35,
      under35: poisson.under35,
      bttsYes: poisson.bttsYes,
      bttsNo: poisson.bttsNo,
      doubleChance1X: poisson.doubleChance1X,
      doubleChance12: poisson.doubleChance12,
      doubleChanceX2: poisson.doubleChanceX2,
      exactScores: poisson.exactScores,
    },
    homeForm,
    awayForm,
    h2h,
    injuries: { home: [], away: [] },
    analysis: buildAnalysis(homeTeam.shortName, awayTeam.shortName, poisson, quality),
    homeGoalsFor: homeS.gf,
    homeGoalsAgainst: homeS.ga,
    awayGoalsFor: awayS.gf,
    awayGoalsAgainst: awayS.ga,
    homeAttack: homeS.attack,
    homeDefense: homeS.defense,
    awayAttack: awayS.attack,
    awayDefense: awayS.defense,
  };
}

export async function getMatchesForProduction(): Promise<MatchesResponse> {
  const lastUpdated = new Date().toISOString();

  // Mode démo explicite uniquement
  if (process.env.USE_DEMO_DATA === "true") {
    const { matches } = await import("./mock-data");
    return {
      matches,
      source: "demo",
      lastUpdated,
      warning:
        "Mode démonstration activé (USE_DEMO_DATA=true). Données fictives.",
    };
  }

  if (!hasFootballApiKey()) {
    return {
      matches: [],
      source: "none",
      lastUpdated,
      error:
        "FOOTBALL_API_KEY non configurée. Ajoutez la clé dans les variables d'environnement Vercel (côté serveur) puis redéployez.",
    };
  }

  const season = currentSeasonYear();
  const all: ApiFixture[] = [];
  const errors: string[] = [];

  for (const league of PRIORITY_LEAGUES) {
    try {
      const fixtures = await getUpcomingFixtures(league.id, season, 8);
      all.push(...fixtures);
    } catch (e) {
      const msg =
        e instanceof ApiFootballError ? e.message : "Erreur inconnue";
      errors.push(`${league.name}: ${msg}`);
    }
  }

  // Dédupliquer
  const byId = new Map<number, ApiFixture>();
  all.forEach((f) => byId.set(f.fixture.id, f));
  const unique = Array.from(byId.values()).slice(0, 30);

  if (unique.length === 0) {
    return {
      matches: [],
      source: "api",
      lastUpdated,
      error:
        errors.length > 0
          ? errors.join(" | ")
          : "Aucun match à venir trouvé pour les ligues prioritaires.",
    };
  }

  // Limiter les appels stats pour le quota : max 12 matchs enrichis
  const toEnrich = unique.slice(0, 12);
  const matches: Match[] = [];

  for (const f of toEnrich) {
    try {
      matches.push(await fixtureToMatch(f, season));
    } catch {
      // ignorer un match défaillant
    }
  }

  matches.sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  );

  return {
    matches,
    source: "api",
    lastUpdated,
    warning: errors.length > 0 ? errors.join(" | ") : undefined,
  };
}
