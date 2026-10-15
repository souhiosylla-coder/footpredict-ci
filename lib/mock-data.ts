import { Match, League, Team, HistoryStats } from "./types";
import { computePoisson, formMultiplier } from "./poisson";

const leagues: League[] = [
  { id: 61, name: "Ligue 1", country: "France", logo: "/leagues/ligue1.png", season: "2025-26" },
  { id: 39, name: "Premier League", country: "Angleterre", logo: "/leagues/pl.png", season: "2025-26" },
  { id: 140, name: "La Liga", country: "Espagne", logo: "/leagues/laliga.png", season: "2025-26" },
  { id: 135, name: "Serie A", country: "Italie", logo: "/leagues/seriea.png", season: "2025-26" },
  { id: 78, name: "Bundesliga", country: "Allemagne", logo: "/leagues/bundesliga.png", season: "2025-26" },
];

const teams: Record<string, Team> = {
  psg: { id: 85, name: "Paris Saint-Germain", shortName: "PSG", logo: "https://media.api-sports.io/football/teams/85.png", country: "France" },
  om: { id: 81, name: "Olympique de Marseille", shortName: "OM", logo: "https://media.api-sports.io/football/teams/81.png", country: "France" },
  ol: { id: 80, name: "Olympique Lyonnais", shortName: "OL", logo: "https://media.api-sports.io/football/teams/80.png", country: "France" },
  mon: { id: 91, name: "AS Monaco", shortName: "Monaco", logo: "https://media.api-sports.io/football/teams/91.png", country: "France" },
  lil: { id: 79, name: "LOSC Lille", shortName: "Lille", logo: "https://media.api-sports.io/football/teams/79.png", country: "France" },
  rma: { id: 541, name: "Real Madrid", shortName: "Real", logo: "https://media.api-sports.io/football/teams/541.png", country: "Espagne" },
  bar: { id: 529, name: "FC Barcelona", shortName: "Barça", logo: "https://media.api-sports.io/football/teams/529.png", country: "Espagne" },
  atm: { id: 530, name: "Atlético Madrid", shortName: "Atlético", logo: "https://media.api-sports.io/football/teams/530.png", country: "Espagne" },
  sev: { id: 536, name: "Sevilla", shortName: "Sevilla", logo: "https://media.api-sports.io/football/teams/536.png", country: "Espagne" },
  liv: { id: 40, name: "Liverpool", shortName: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png", country: "Angleterre" },
  mci: { id: 50, name: "Manchester City", shortName: "Man City", logo: "https://media.api-sports.io/football/teams/50.png", country: "Angleterre" },
  ars: { id: 42, name: "Arsenal", shortName: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png", country: "Angleterre" },
  che: { id: 49, name: "Chelsea", shortName: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png", country: "Angleterre" },
  tot: { id: 47, name: "Tottenham", shortName: "Spurs", logo: "https://media.api-sports.io/football/teams/47.png", country: "Angleterre" },
  int: { id: 505, name: "Inter Milan", shortName: "Inter", logo: "https://media.api-sports.io/football/teams/505.png", country: "Italie" },
  mil: { id: 489, name: "AC Milan", shortName: "Milan", logo: "https://media.api-sports.io/football/teams/489.png", country: "Italie" },
  juv: { id: 496, name: "Juventus", shortName: "Juve", logo: "https://media.api-sports.io/football/teams/496.png", country: "Italie" },
  nap: { id: 492, name: "Napoli", shortName: "Napoli", logo: "https://media.api-sports.io/football/teams/492.png", country: "Italie" },
  bay: { id: 157, name: "Bayern Munich", shortName: "Bayern", logo: "https://media.api-sports.io/football/teams/157.png", country: "Allemagne" },
  bvb: { id: 165, name: "Borussia Dortmund", shortName: "Dortmund", logo: "https://media.api-sports.io/football/teams/165.png", country: "Allemagne" },
  rbl: { id: 173, name: "RB Leipzig", shortName: "Leipzig", logo: "https://media.api-sports.io/football/teams/173.png", country: "Allemagne" },
  lev: { id: 168, name: "Bayer Leverkusen", shortName: "Leverkusen", logo: "https://media.api-sports.io/football/teams/168.png", country: "Allemagne" },
};

function makeForm(results: ("W" | "D" | "L")[], scores: string[], opponents: string[]) {
  return results.map((r, i) => ({
    result: r,
    score: scores[i],
    opponent: opponents[i],
    date: new Date(Date.now() - (i + 1) * 7 * 86400000).toISOString().slice(0, 10),
  }));
}

const rawMatches = [
  { id: 1, league: leagues[0], home: "psg", away: "om", kickoff: "2026-10-18T20:00:00Z", venue: "Parc des Princes",
    homeGF: 2.4, homeGA: 0.9, awayGF: 1.8, awayGA: 1.2, ha: 1.25, h2h: 0.1,
    homeForm: makeForm(["W","W","D","W","W"], ["3-1","2-0","1-1","4-0","2-1"], ["Lille","Monaco","Lyon","Nantes","Rennes"]),
    awayForm: makeForm(["W","L","W","D","W"], ["2-0","1-2","3-1","0-0","2-1"], ["Lyon","PSG","Nice","Lens","Reims"]),
    injuries: { home: [{ player: "Marquinhos", type: "Cuisse", status: "Incertain" }], away: [{ player: "Harit", type: "Genou", status: "Absent" }] },
    analysis: ["Le PSG domine largement les confrontations récentes face à l'OM et conserve une défense très solide à domicile.", "L'avantage du Parc des Princes et la forme offensive parisienne favorisent nettement une victoire du club de la capitale.", "Attention toutefois aux transitions rapides marseillaises qui peuvent créer le danger sur coup de pied arrêté."] },
  { id: 2, league: leagues[0], home: "ol", away: "mon", kickoff: "2026-10-19T14:00:00Z", venue: "Groupama Stadium",
    homeGF: 1.7, homeGA: 1.4, awayGF: 2.1, awayGA: 1.3, ha: 1.12, h2h: -0.05,
    homeForm: makeForm(["D","W","L","W","D"], ["1-1","2-0","0-2","3-1","2-2"], ["Nice","Strasbourg","PSG","Metz","Toulouse"]),
    awayForm: makeForm(["W","W","W","L","W"], ["3-0","2-1","4-2","1-2","2-0"], ["Nantes","Reims","Lorient","Lille","Clermont"]),
    injuries: { home: [], away: [{ player: "Ben Yedder", type: "Musculaire", status: "Absent" }] },
    analysis: ["Monaco affiche une dynamique offensive impressionnante et une meilleure forme récente que Lyon.", "L'OL reste solide à domicile mais peut souffrir face à la vitesse des attaquants monégasques.", "Un match ouvert avec de nombreuses occasions est attendu."] },
  { id: 3, league: leagues[0], home: "lil", away: "psg", kickoff: "2026-10-25T17:00:00Z", venue: "Decathlon Arena",
    homeGF: 1.6, homeGA: 1.1, awayGF: 2.4, awayGA: 0.9, ha: 1.1, h2h: -0.15,
    homeForm: makeForm(["W","D","W","L","W"], ["2-0","1-1","1-0","0-1","3-1"], ["Lens","Rennes","Nantes","Monaco","Metz"]),
    awayForm: makeForm(["W","W","W","D","W"], ["3-1","2-0","4-0","1-1","2-1"], ["OM","Lille","Nantes","Lyon","Rennes"]),
    injuries: { home: [{ player: "David", type: "Ankle", status: "Incertain" }], away: [] },
    analysis: ["Lille reste très compétitif à domicile et a déjà posé des problèmes au PSG cette saison.", "Le PSG conserve toutefois un statut de favori grâce à sa qualité individuelle et son efficacité.", "Le match pourrait se jouer sur les détails et les transitions."] },
  { id: 4, league: leagues[0], home: "om", away: "lil", kickoff: "2026-10-26T20:00:00Z", venue: "Orange Vélodrome",
    homeGF: 1.8, homeGA: 1.2, awayGF: 1.6, awayGA: 1.1, ha: 1.18, h2h: 0.05,
    homeForm: makeForm(["W","L","W","D","W"], ["2-0","1-2","3-1","0-0","2-1"], ["Lyon","PSG","Nice","Lens","Reims"]),
    awayForm: makeForm(["W","D","W","L","W"], ["2-0","1-1","1-0","0-1","3-1"], ["Lens","Rennes","Nantes","Monaco","Metz"]),
    injuries: { home: [{ player: "Harit", type: "Genou", status: "Absent" }], away: [] },
    analysis: ["Deux équipes solides qui aiment contrôler le milieu de terrain.", "L'OM à domicile conserve un léger avantage psychologique et statistique.", "Un match serré avec peu de buts reste le scénario le plus probable."] },
  { id: 5, league: leagues[1], home: "liv", away: "mci", kickoff: "2026-10-18T16:30:00Z", venue: "Anfield",
    homeGF: 2.3, homeGA: 1.0, awayGF: 2.5, awayGA: 0.9, ha: 1.2, h2h: 0.02,
    homeForm: makeForm(["W","W","W","D","W"], ["3-0","2-1","4-1","1-1","2-0"], ["Wolves","Brighton","Aston Villa","Arsenal","West Ham"]),
    awayForm: makeForm(["W","W","D","W","W"], ["2-0","3-1","1-1","4-0","2-1"], ["Chelsea","Tottenham","Arsenal","Burnley","Everton"]),
    injuries: { home: [], away: [{ player: "De Bruyne", type: "Cuisse", status: "Incertain" }] },
    analysis: ["Choc au sommet entre deux des meilleures attaques d'Europe.", "Anfield reste un terrain très difficile même pour Manchester City.", "Attendez-vous à un match intense et riche en buts."] },
  { id: 6, league: leagues[1], home: "ars", away: "che", kickoff: "2026-10-19T15:00:00Z", venue: "Emirates Stadium",
    homeGF: 2.1, homeGA: 1.0, awayGF: 1.9, awayGA: 1.3, ha: 1.18, h2h: 0.08,
    homeForm: makeForm(["W","W","D","W","W"], ["2-0","3-1","1-1","4-0","2-1"], ["Brentford","Bournemouth","Liverpool","Sheffield","Fulham"]),
    awayForm: makeForm(["D","W","L","W","D"], ["1-1","2-0","1-2","3-1","2-2"], ["Aston Villa","Ipswich","Man City","Crystal Palace","Newcastle"]),
    injuries: { home: [{ player: "Saka", type: "Genou", status: "Absent" }], away: [] },
    analysis: ["Arsenal reste très solide à domicile malgré l'absence de Saka.", "Chelsea progresse mais manque encore de régularité défensive.", "Les Gunners sont favoris pour s'imposer."] },
  { id: 7, league: leagues[1], home: "tot", away: "liv", kickoff: "2026-10-26T14:00:00Z", venue: "Tottenham Hotspur Stadium",
    homeGF: 1.9, homeGA: 1.5, awayGF: 2.3, awayGA: 1.0, ha: 1.1, h2h: -0.12,
    homeForm: makeForm(["W","L","W","D","L"], ["3-1","1-2","2-0","1-1","0-2"], ["Everton","Arsenal","Brighton","Wolves","Man City"]),
    awayForm: makeForm(["W","W","W","D","W"], ["3-0","2-1","4-1","1-1","2-0"], ["Wolves","Brighton","Aston Villa","Arsenal","West Ham"]),
    injuries: { home: [], away: [] },
    analysis: ["Liverpool affiche une forme exceptionnelle et une défense très difficile à percer.", "Tottenham peut être dangereux en transition mais reste fragile défensivement.", "Les Reds partent largement favoris."] },
  { id: 8, league: leagues[1], home: "mci", away: "ars", kickoff: "2026-10-25T16:30:00Z", venue: "Etihad Stadium",
    homeGF: 2.5, homeGA: 0.9, awayGF: 2.1, awayGA: 1.0, ha: 1.22, h2h: 0.05,
    homeForm: makeForm(["W","W","D","W","W"], ["2-0","3-1","1-1","4-0","2-1"], ["Chelsea","Tottenham","Arsenal","Burnley","Everton"]),
    awayForm: makeForm(["W","W","D","W","W"], ["2-0","3-1","1-1","4-0","2-1"], ["Brentford","Bournemouth","Liverpool","Sheffield","Fulham"]),
    injuries: { home: [], away: [{ player: "Saka", type: "Genou", status: "Absent" }] },
    analysis: ["Manchester City à domicile reste l'une des forces les plus dominantes du football européen.", "Arsenal sans Saka perd une part importante de sa créativité offensive.", "City est clairement favori, même si Arsenal peut rendre le match difficile."] },
  { id: 9, league: leagues[2], home: "rma", away: "bar", kickoff: "2026-10-19T20:00:00Z", venue: "Santiago Bernabéu",
    homeGF: 2.4, homeGA: 1.0, awayGF: 2.3, awayGA: 1.1, ha: 1.2, h2h: 0.03,
    homeForm: makeForm(["W","W","W","D","W"], ["3-0","2-1","4-1","1-1","2-0"], ["Getafe","Sevilla","Osasuna","Atlético","Villarreal"]),
    awayForm: makeForm(["W","W","D","W","W"], ["2-0","3-1","1-1","4-0","2-1"], ["Valencia","Athletic","Girona","Alavés","Mallorca"]),
    injuries: { home: [], away: [{ player: "Pedri", type: "Cuisse", status: "Incertain" }] },
    analysis: ["El Clásico : deux géants en très grande forme.", "Le Real à domicile conserve un léger avantage historique et statistique.", "Match à très fort potentiel de buts et de spectacle."] },
  { id: 10, league: leagues[2], home: "atm", away: "sev", kickoff: "2026-10-18T18:00:00Z", venue: "Cívitas Metropolitano",
    homeGF: 1.8, homeGA: 0.9, awayGF: 1.4, awayGA: 1.5, ha: 1.25, h2h: 0.15,
    homeForm: makeForm(["W","D","W","W","D"], ["1-0","1-1","2-0","3-1","0-0"], ["Betis","Real Madrid","Celta","Rayo","Girona"]),
    awayForm: makeForm(["L","D","W","L","D"], ["0-2","1-1","2-1","1-2","1-1"], ["Barcelona","Villarreal","Osasuna","Athletic","Getafe"]),
    injuries: { home: [], away: [{ player: "En-Nesyri", type: "Genou", status: "Absent" }] },
    analysis: ["L'Atlético à domicile est extrêmement difficile à battre.", "Séville traverse une période délicate et manque de tranchant offensif.", "Une victoire de l'Atlético apparaît comme le scénario le plus probable."] },
  { id: 11, league: leagues[2], home: "bar", away: "atm", kickoff: "2026-10-26T20:00:00Z", venue: "Spotify Camp Nou",
    homeGF: 2.3, homeGA: 1.1, awayGF: 1.8, awayGA: 0.9, ha: 1.15, h2h: 0.02,
    homeForm: makeForm(["W","W","D","W","W"], ["2-0","3-1","1-1","4-0","2-1"], ["Valencia","Athletic","Girona","Alavés","Mallorca"]),
    awayForm: makeForm(["W","D","W","W","D"], ["1-0","1-1","2-0","3-1","0-0"], ["Betis","Real Madrid","Celta","Rayo","Girona"]),
    injuries: { home: [{ player: "Pedri", type: "Cuisse", status: "Incertain" }], away: [] },
    analysis: ["Barcelone à domicile conserve une très forte capacité offensive.", "L'Atlético saura rendre le match très physique et fermé.", "Un match équilibré avec un léger avantage catalan."] },
  { id: 12, league: leagues[2], home: "sev", away: "rma", kickoff: "2026-10-25T15:15:00Z", venue: "Ramón Sánchez-Pizjuán",
    homeGF: 1.4, homeGA: 1.5, awayGF: 2.4, awayGA: 1.0, ha: 1.1, h2h: -0.2,
    homeForm: makeForm(["L","D","W","L","D"], ["0-2","1-1","2-1","1-2","1-1"], ["Barcelona","Villarreal","Osasuna","Athletic","Getafe"]),
    awayForm: makeForm(["W","W","W","D","W"], ["3-0","2-1","4-1","1-1","2-0"], ["Getafe","Sevilla","Osasuna","Atlético","Villarreal"]),
    injuries: { home: [{ player: "En-Nesyri", type: "Genou", status: "Absent" }], away: [] },
    analysis: ["Le Real Madrid reste largement favori même à l'extérieur.", "Séville manque de confiance et de réalisme devant le but.", "Une victoire madrilène est le scénario le plus probable."] },
  { id: 13, league: leagues[3], home: "int", away: "mil", kickoff: "2026-10-19T19:45:00Z", venue: "San Siro",
    homeGF: 2.2, homeGA: 0.8, awayGF: 2.0, awayGA: 1.1, ha: 1.15, h2h: 0.08,
    homeForm: makeForm(["W","W","W","D","W"], ["2-0","3-0","1-0","1-1","4-1"], ["Torino","Lazio","Fiorentina","Juventus","Cagliari"]),
    awayForm: makeForm(["W","D","W","W","L"], ["2-1","1-1","3-0","2-0","1-2"], ["Napoli","Roma","Genoa","Monza","Atalanta"]),
    injuries: { home: [], away: [{ player: "Leão", type: "Cuisse", status: "Incertain" }] },
    analysis: ["Derby della Madonnina : l'Inter affiche actuellement la meilleure défense d'Italie.", "Le Milan sans Leão perd une part importante de sa dangerosité offensive.", "L'Inter part favori dans un match qui promet d'être intense."] },
  { id: 14, league: leagues[3], home: "juv", away: "nap", kickoff: "2026-10-18T17:00:00Z", venue: "Allianz Stadium",
    homeGF: 1.7, homeGA: 1.0, awayGF: 1.9, awayGA: 1.2, ha: 1.18, h2h: 0.05,
    homeForm: makeForm(["W","D","W","W","D"], ["1-0","1-1","2-0","3-1","0-0"], ["Bologna","Inter","Empoli","Lecce","Verona"]),
    awayForm: makeForm(["W","W","L","W","D"], ["2-0","3-1","0-1","2-1","1-1"], ["Udinese","Sassuolo","Milan","Torino","Roma"]),
    injuries: { home: [], away: [] },
    analysis: ["La Juventus reste très solide à domicile et difficile à battre.", "Napoli possède plus de talent offensif mais peut souffrir défensivement.", "Un match serré avec un léger avantage pour les Bianconeri."] },
  { id: 15, league: leagues[3], home: "mil", away: "juv", kickoff: "2026-10-26T19:45:00Z", venue: "San Siro",
    homeGF: 2.0, homeGA: 1.1, awayGF: 1.7, awayGA: 1.0, ha: 1.12, h2h: -0.03,
    homeForm: makeForm(["W","D","W","W","L"], ["2-1","1-1","3-0","2-0","1-2"], ["Napoli","Roma","Genoa","Monza","Atalanta"]),
    awayForm: makeForm(["W","D","W","W","D"], ["1-0","1-1","2-0","3-1","0-0"], ["Bologna","Inter","Empoli","Lecce","Verona"]),
    injuries: { home: [{ player: "Leão", type: "Cuisse", status: "Incertain" }], away: [] },
    analysis: ["Match au sommet entre deux prétendants au Scudetto.", "Le Milan à domicile conserve un avantage, même sans Leão.", "La Juventus saura rendre le match très tactique."] },
  { id: 16, league: leagues[3], home: "nap", away: "int", kickoff: "2026-10-25T14:00:00Z", venue: "Diego Armando Maradona",
    homeGF: 1.9, homeGA: 1.2, awayGF: 2.2, awayGA: 0.8, ha: 1.15, h2h: -0.1,
    homeForm: makeForm(["W","W","L","W","D"], ["2-0","3-1","0-1","2-1","1-1"], ["Udinese","Sassuolo","Milan","Torino","Roma"]),
    awayForm: makeForm(["W","W","W","D","W"], ["2-0","3-0","1-0","1-1","4-1"], ["Torino","Lazio","Fiorentina","Juventus","Cagliari"]),
    injuries: { home: [], away: [] },
    analysis: ["L'Inter reste la meilleure équipe d'Italie en ce moment.", "Napoli à domicile peut créer la surprise grâce à son public et son intensité.", "L'Inter conserve toutefois le statut de favori."] },
  { id: 17, league: leagues[4], home: "bay", away: "bvb", kickoff: "2026-10-18T16:30:00Z", venue: "Allianz Arena",
    homeGF: 2.8, homeGA: 1.1, awayGF: 2.2, awayGA: 1.4, ha: 1.25, h2h: 0.12,
    homeForm: makeForm(["W","W","W","W","D"], ["4-0","3-1","2-0","5-1","2-2"], ["Augsburg","Stuttgart","Hoffenheim","Bochum","Leipzig"]),
    awayForm: makeForm(["W","L","W","W","D"], ["3-1","1-2","2-0","4-2","1-1"], ["Frankfurt","Bayern","Wolfsburg","Mainz","Gladbach"]),
    injuries: { home: [], away: [] },
    analysis: ["Le Bayern à domicile reste une machine à buts extrêmement difficile à arrêter.", "Dortmund peut être dangereux en contre mais souffre souvent défensivement face au Bayern.", "Une victoire bayeroise large reste le scénario le plus probable."] },
  { id: 18, league: leagues[4], home: "rbl", away: "lev", kickoff: "2026-10-19T14:30:00Z", venue: "Red Bull Arena",
    homeGF: 2.1, homeGA: 1.3, awayGF: 2.3, awayGA: 1.2, ha: 1.12, h2h: -0.02,
    homeForm: makeForm(["W","D","W","L","W"], ["2-0","1-1","3-1","1-2","2-1"], ["Union Berlin","Bayern","Freiburg","Dortmund","Köln"]),
    awayForm: makeForm(["W","W","D","W","W"], ["3-0","2-1","1-1","4-1","2-0"], ["Stuttgart","Augsburg","Frankfurt","Bochum","Hoffenheim"]),
    injuries: { home: [], away: [] },
    analysis: ["Deux équipes offensives qui aiment dicter le tempo.", "Leverkusen conserve une légère supériorité technique et une meilleure forme.", "Match ouvert avec de nombreuses occasions attendues."] },
  { id: 19, league: leagues[4], home: "bvb", away: "bay", kickoff: "2026-10-26T16:30:00Z", venue: "Signal Iduna Park",
    homeGF: 2.2, homeGA: 1.4, awayGF: 2.8, awayGA: 1.1, ha: 1.18, h2h: -0.1,
    homeForm: makeForm(["W","L","W","W","D"], ["3-1","1-2","2-0","4-2","1-1"], ["Frankfurt","Bayern","Wolfsburg","Mainz","Gladbach"]),
    awayForm: makeForm(["W","W","W","W","D"], ["4-0","3-1","2-0","5-1","2-2"], ["Augsburg","Stuttgart","Hoffenheim","Bochum","Leipzig"]),
    injuries: { home: [], away: [] },
    analysis: ["Dortmund à domicile peut faire trembler n'importe qui.", "Le Bayern reste néanmoins le grand favori grâce à sa qualité individuelle.", "Un match spectaculaire et riche en buts est à prévoir."] },
  { id: 20, league: leagues[4], home: "lev", away: "rbl", kickoff: "2026-10-25T14:30:00Z", venue: "BayArena",
    homeGF: 2.3, homeGA: 1.2, awayGF: 2.1, awayGA: 1.3, ha: 1.15, h2h: 0.05,
    homeForm: makeForm(["W","W","D","W","W"], ["3-0","2-1","1-1","4-1","2-0"], ["Stuttgart","Augsburg","Frankfurt","Bochum","Hoffenheim"]),
    awayForm: makeForm(["W","D","W","L","W"], ["2-0","1-1","3-1","1-2","2-1"], ["Union Berlin","Bayern","Freiburg","Dortmund","Köln"]),
    injuries: { home: [], away: [] },
    analysis: ["Leverkusen continue sur sa lancée impressionnante.", "Leipzig reste capable de créer des surprises grâce à son intensité.", "Les locaux partent favoris dans un match offensif."] },
];

function buildMatch(raw: (typeof rawMatches)[0]): Match {
  const homeTeam = teams[raw.home];
  const awayTeam = teams[raw.away];
  const formH = formMultiplier(raw.homeForm);
  const formA = formMultiplier(raw.awayForm);
  const avgGF = 1.5;
  const homeAttack = raw.homeGF / avgGF;
  const homeDefense = avgGF / Math.max(0.6, raw.homeGA);
  const awayAttack = raw.awayGF / avgGF;
  const awayDefense = avgGF / Math.max(0.6, raw.awayGA);
  const poisson = computePoisson({
    homeAttack, homeDefense, awayAttack, awayDefense,
    homeAdvantage: raw.ha, formHome: formH, formAway: formA, h2hHomeBias: raw.h2h,
  });
  let prediction: "1" | "X" | "2" = "1";
  let maxP = poisson.homeWin;
  if (poisson.draw > maxP) { prediction = "X"; maxP = poisson.draw; }
  if (poisson.awayWin > maxP) { prediction = "2"; maxP = poisson.awayWin; }
  const sorted = [poisson.homeWin, poisson.draw, poisson.awayWin].sort((a, b) => b - a);
  const confidence = Math.min(95, Math.round(50 + (sorted[0] - sorted[1]) * 1.8));
  return {
    id: raw.id, league: raw.league, homeTeam, awayTeam, kickoff: raw.kickoff, status: "scheduled",
    venue: raw.venue, confidence, prediction,
    markets: {
      homeWin: poisson.homeWin, draw: poisson.draw, awayWin: poisson.awayWin,
      over15: poisson.over15, under15: poisson.under15, over25: poisson.over25, under25: poisson.under25,
      over35: poisson.over35, under35: poisson.under35, bttsYes: poisson.bttsYes, bttsNo: poisson.bttsNo,
      doubleChance1X: poisson.doubleChance1X, doubleChance12: poisson.doubleChance12, doubleChanceX2: poisson.doubleChanceX2,
      exactScores: poisson.exactScores,
    },
    homeForm: raw.homeForm, awayForm: raw.awayForm,
    h2h: [
      { date: "2025-03-15", homeTeam: homeTeam.shortName, awayTeam: awayTeam.shortName, score: "2-1" },
      { date: "2024-10-20", homeTeam: awayTeam.shortName, awayTeam: homeTeam.shortName, score: "1-1" },
      { date: "2024-04-05", homeTeam: homeTeam.shortName, awayTeam: awayTeam.shortName, score: "3-0" },
      { date: "2023-11-12", homeTeam: awayTeam.shortName, awayTeam: homeTeam.shortName, score: "2-2" },
      { date: "2023-05-28", homeTeam: homeTeam.shortName, awayTeam: awayTeam.shortName, score: "1-0" },
    ],
    injuries: raw.injuries, analysis: raw.analysis,
    homeGoalsFor: raw.homeGF, homeGoalsAgainst: raw.homeGA,
    awayGoalsFor: raw.awayGF, awayGoalsAgainst: raw.awayGA,
    homeAttack, homeDefense, awayAttack, awayDefense,
  };
}

export const matches: Match[] = rawMatches.map(buildMatch);

export const historyStats: HistoryStats[] = [
  { market: "1X2", total: 248, correct: 142, rate: 57.3 },
  { market: "Over 2.5", total: 248, correct: 138, rate: 55.6 },
  { market: "BTTS", total: 248, correct: 131, rate: 52.8 },
  { market: "Double chance 1X", total: 180, correct: 128, rate: 71.1 },
  { market: "Over 1.5", total: 248, correct: 186, rate: 75.0 },
];

export function getMatchById(id: number): Match | undefined {
  return matches.find((m) => m.id === id);
}

export function getLeagues(): League[] {
  return leagues;
}

export function getCountries(): string[] {
  return [...new Set(leagues.map((l) => l.country))];
}
