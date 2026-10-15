/**
 * Modèle de Poisson pour les prédictions de matchs de football.
 * Prend en compte : force d'attaque/défense, avantage domicile, forme récente et confrontations directes.
 */

function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

export interface PoissonInput {
  homeAttack: number;
  homeDefense: number;
  awayAttack: number;
  awayDefense: number;
  homeAdvantage?: number;
  formHome?: number;
  formAway?: number;
  h2hHomeBias?: number;
}

export interface PoissonResult {
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
  expectedHomeGoals: number;
  expectedAwayGoals: number;
}

export function computePoisson(input: PoissonInput): PoissonResult {
  const homeAdv = input.homeAdvantage ?? 1.15;
  const formH = input.formHome ?? 1;
  const formA = input.formAway ?? 1;
  const h2h = input.h2hHomeBias ?? 0;

  let lambdaHome =
    input.homeAttack * input.awayDefense * homeAdv * formH * (1 + h2h);
  let lambdaAway =
    input.awayAttack * input.homeDefense * formA * (1 - h2h * 0.5);

  lambdaHome = Math.max(0.4, Math.min(3.5, lambdaHome));
  lambdaAway = Math.max(0.3, Math.min(3.2, lambdaAway));

  const maxGoals = 6;
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let over15 = 0;
  let over25 = 0;
  let over35 = 0;
  let bttsYes = 0;

  const scoreProbs: { score: string; probability: number }[] = [];

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = poissonPmf(h, lambdaHome) * poissonPmf(a, lambdaAway);
      const total = h + a;

      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;

      if (total > 1.5) over15 += p;
      if (total > 2.5) over25 += p;
      if (total > 3.5) over35 += p;
      if (h > 0 && a > 0) bttsYes += p;

      scoreProbs.push({ score: `${h}-${a}`, probability: p });
    }
  }

  const totalProb = homeWin + draw + awayWin;
  if (totalProb > 0) {
    homeWin /= totalProb;
    draw /= totalProb;
    awayWin /= totalProb;
  }

  scoreProbs.sort((a, b) => b.probability - a.probability);
  const topScores = scoreProbs.slice(0, 5).map((s) => ({
    score: s.score,
    probability: Math.round(s.probability * 1000) / 10,
  }));

  return {
    homeWin: Math.round(homeWin * 1000) / 10,
    draw: Math.round(draw * 1000) / 10,
    awayWin: Math.round(awayWin * 1000) / 10,
    over15: Math.round(over15 * 1000) / 10,
    under15: Math.round((1 - over15) * 1000) / 10,
    over25: Math.round(over25 * 1000) / 10,
    under25: Math.round((1 - over25) * 1000) / 10,
    over35: Math.round(over35 * 1000) / 10,
    under35: Math.round((1 - over35) * 1000) / 10,
    bttsYes: Math.round(bttsYes * 1000) / 10,
    bttsNo: Math.round((1 - bttsYes) * 1000) / 10,
    doubleChance1X: Math.round((homeWin + draw) * 1000) / 10,
    doubleChance12: Math.round((homeWin + awayWin) * 1000) / 10,
    doubleChanceX2: Math.round((draw + awayWin) * 1000) / 10,
    exactScores: topScores,
    expectedHomeGoals: Math.round(lambdaHome * 100) / 100,
    expectedAwayGoals: Math.round(lambdaAway * 100) / 100,
  };
}

export function formMultiplier(form: { result: "W" | "D" | "L" }[]): number {
  if (!form || form.length === 0) return 1;
  const points = form.reduce((acc, f) => {
    if (f.result === "W") return acc + 3;
    if (f.result === "D") return acc + 1;
    return acc;
  }, 0);
  const max = form.length * 3;
  const ratio = points / max;
  return 0.85 + ratio * 0.3;
}
