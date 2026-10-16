export interface Team {
  id: number;
  name: string;
  shortName: string;
  logo: string;
  country: string;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  season: string;
}

export interface FormResult {
  result: "W" | "D" | "L";
  score: string;
  opponent: string;
  date: string;
}

export interface Injury {
  player: string;
  type: string;
  status: string;
}

export interface H2HMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
}

export interface PredictionMarkets {
  homeWin: number;
  draw: number;
  awayWin: number;
  over15: number;
  under15: number;
  over25: number;
  under25: number;
  over35: number;
  under35: number;
  bttsYes: number;
  bttsNo: number;
  doubleChance1X: number;
  doubleChance12: number;
  doubleChanceX2: number;
  exactScores: { score: string; probability: number }[];
}

export interface Match {
  id: number;
  league: League;
  homeTeam: Team;
  awayTeam: Team;
  kickoff: string;
  status: "scheduled" | "live" | "finished";
  venue?: string;
  confidence: number;
  prediction: "1" | "X" | "2";
  markets: PredictionMarkets;
  homeForm: FormResult[];
  awayForm: FormResult[];
  h2h: H2HMatch[];
  injuries: {
    home: Injury[];
    away: Injury[];
  };
  analysis: string[];
  homeGoalsFor: number;
  homeGoalsAgainst: number;
  awayGoalsFor: number;
  awayGoalsAgainst: number;
  homeAttack: number;
  homeDefense: number;
  awayAttack: number;
  awayDefense: number;
}

export interface HistoryStats {
  market: string;
  total: number;
  correct: number;
  rate: number;
}

export type FilterState = {
  league: string;
  country: string;
  date: string;
  confidence: number;
  search: string;
  sort: "date" | "confidence";
};
