"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface HistoryRow {
  id: string;
  match_id: number;
  league_name: string | null;
  home_team: string | null;
  away_team: string | null;
  prediction: string | null;
  confidence: number | null;
  actual_result: string | null;
  kickoff: string | null;
  created_at: string;
  evaluation: string | null;
}

export default function HistoriquePage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setError(
          "Supabase non configuré. L'historique réel nécessite NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY, ainsi que le schéma SQL."
        );
        setLoading(false);
        return;
      }

      const { data, error: qErr } = await supabase
        .from("prediction_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (qErr) {
        setError(
          qErr.message.includes("relation") || qErr.code === "42P01"
            ? "Table prediction_history absente. Exécutez supabase/schema.sql dans l'éditeur SQL Supabase."
            : qErr.message
        );
        setLoading(false);
        return;
      }

      setRows((data as HistoryRow[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const resolved = rows.filter((r) => r.actual_result && r.evaluation);
  const correct = resolved.filter((r) => r.evaluation === "correct").length;
  const rate =
    resolved.length > 0 ? Math.round((correct / resolved.length) * 1000) / 10 : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Historique</h1>
        <p className="text-gray-400 text-sm">
          Prédictions enregistrées et évaluées a posteriori (jamais recalculées)
        </p>
      </div>

      {loading && (
        <div className="card p-8 text-center text-gray-400">Chargement…</div>
      )}

      {error && (
        <div className="card p-6 border-amber-500/30 bg-amber-500/5">
          <p className="text-amber-200 text-sm mb-2 font-medium">
            Données insuffisantes pour évaluer le modèle
          </p>
          <p className="text-gray-400 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-3">
            Aucun taux de réussite fictif n&apos;est affiché. Les performances ne
            seront calculées qu&apos;après enregistrement de prédictions réelles
            et résolution des matchs.
          </p>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-300 mb-2">Aucun historique pour le moment</p>
          <p className="text-gray-500 text-sm">
            Les prédictions seront archivées au fur et à mesure. Données
            insuffisantes pour évaluer le modèle.
          </p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold">{rows.length}</div>
              <div className="text-xs text-gray-500">Prédictions</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold">{resolved.length}</div>
              <div className="text-xs text-gray-500">Résolues</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold">
                {rate !== null ? `${rate}%` : "—"}
              </div>
              <div className="text-xs text-gray-500">Réussite 1X2</div>
            </div>
          </div>

          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex justify-between gap-2 text-xs text-gray-500 mb-1">
                  <span>{r.league_name || "—"}</span>
                  <span>
                    {r.kickoff
                      ? new Date(r.kickoff).toLocaleString("fr-FR")
                      : ""}
                  </span>
                </div>
                <div className="font-semibold text-sm mb-1">
                  {r.home_team} vs {r.away_team}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="badge bg-accent/20 text-accent">
                    Préd. {r.prediction} ({r.confidence}%)
                  </span>
                  {r.actual_result && (
                    <span className="badge bg-gray-700 text-gray-300">
                      Résultat {r.actual_result}
                    </span>
                  )}
                  {r.evaluation && (
                    <span
                      className={
                        r.evaluation === "correct"
                          ? "badge bg-emerald-500/20 text-emerald-400"
                          : "badge bg-red-500/20 text-red-400"
                      }
                    >
                      {r.evaluation === "correct" ? "Correct" : "Incorrect"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="card p-5 mt-6">
        <h2 className="font-semibold mb-2 text-accent">Méthodologie</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Chaque prédiction est figée au moment de sa création (probabilités,
          score prédit, confiance). Elle n&apos;est jamais recalculée avec des
          données postérieures. L&apos;évaluation compare uniquement le résultat
          1X2 final à la prédiction principale. Les taux affichés ne sont basés
          que sur des matchs résolus réels.
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-gray-500">
        Les prédictions sont statistiques et ne garantissent aucun résultat.
      </p>
    </div>
  );
}
