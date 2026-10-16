/**
 * Tests unitaires du modèle Poisson (exécutables via npx tsx lib/poisson.test.ts)
 */
import { computePoisson, formMultiplier } from "./poisson";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function almostEqual(a: number, b: number, tol = 1.5) {
  return Math.abs(a - b) <= tol;
}

export function runPoissonTests() {
  const r = computePoisson({
    homeAttack: 1.2,
    homeDefense: 0.9,
    awayAttack: 1.0,
    awayDefense: 1.1,
    homeAdvantage: 1.15,
    formHome: 1.05,
    formAway: 0.95,
  });

  const sum = r.homeWin + r.draw + r.awayWin;
  assert(almostEqual(sum, 100, 1.5), `1X2 sum ${sum} != ~100`);

  assert(r.over15 + r.under15 >= 99 && r.over15 + r.under15 <= 101, "OU 1.5");
  assert(r.over25 + r.under25 >= 99 && r.over25 + r.under25 <= 101, "OU 2.5");
  assert(r.bttsYes + r.bttsNo >= 99 && r.bttsYes + r.bttsNo <= 101, "BTTS");

  assert(r.exactScores.length === 5, "top 5 scores");
  assert(r.exactScores[0].probability >= r.exactScores[4].probability, "sorted");

  // Extreme: strong home
  const strong = computePoisson({
    homeAttack: 2.0,
    homeDefense: 0.6,
    awayAttack: 0.7,
    awayDefense: 1.5,
    homeAdvantage: 1.25,
  });
  assert(strong.homeWin > strong.awayWin, "strong home should favor 1");

  // form multiplier bounds
  const f1 = formMultiplier([
    { result: "W" },
    { result: "W" },
    { result: "W" },
    { result: "W" },
    { result: "W" },
  ]);
  const f0 = formMultiplier([
    { result: "L" },
    { result: "L" },
    { result: "L" },
    { result: "L" },
    { result: "L" },
  ]);
  assert(f1 > f0, "form W > L");
  assert(f1 <= 1.2 && f0 >= 0.85, "form bounds");

  console.log("poisson tests OK");
  return true;
}

if (typeof require !== "undefined" && require.main === module) {
  runPoissonTests();
}
