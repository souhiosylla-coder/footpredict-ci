/**
 * Préparation de l'intégration API-Football.
 * Ne pas appeler en production tant que FOOTBALL_API_KEY n'est pas défini.
 *
 * Documentation : https://www.api-football.com/documentation-v3
 */

const BASE = "https://v3.football.api-sports.io";

export async function fetchFromApiFootball(endpoint: string) {
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) {
    throw new Error(
      "FOOTBALL_API_KEY manquant. Ajoutez-la dans .env.local pour activer l'API."
    );
  }

  const res = await fetch(`${BASE}${endpoint}`, {
    headers: {
      "x-apisports-key": key,
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`API-Football error: ${res.status}`);
  }

  return res.json();
}

export async function getUpcomingFixtures(leagueId: number, season: number) {
  return fetchFromApiFootball(
    `/fixtures?league=${leagueId}&season=${season}&next=20`
  );
}

export async function getTeamStatistics(
  teamId: number,
  leagueId: number,
  season: number
) {
  return fetchFromApiFootball(
    `/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`
  );
}
