"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterState, Match } from "@/lib/types";
import { MatchCard } from "@/components/MatchCard";
import { Filters } from "@/components/Filters";
import {
  isToday,
  isTomorrow,
  isThisWeek,
  isWeekend,
  parseISO,
  format,
} from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, Shield, Calendar, AlertTriangle, RefreshCw } from "lucide-react";

interface ApiPayload {
  matches: Match[];
  source: "api" | "demo" | "none";
  lastUpdated: string;
  error?: string;
  warning?: string;
}

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>({
    league: "",
    country: "",
    date: "",
    confidence: 40,
    search: "",
    sort: "date",
  });
  const [data, setData] = useState<ApiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      const json = (await res.json()) as ApiPayload;
      setData(json);
      if (json.error && json.matches.length === 0) {
        setFetchError(json.error);
      }
    } catch {
      setFetchError("Impossible de charger les matchs. Vérifiez votre connexion.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const matches = data?.matches ?? [];

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    let list = matches.filter((m) => {
      if (filters.league && m.league.name !== filters.league) return false;
      if (filters.country && m.league.country !== filters.country) return false;
      if (m.confidence < filters.confidence) return false;

      if (q) {
        const hay = (
          m.homeTeam.name +
          " " +
          m.homeTeam.shortName +
          " " +
          m.awayTeam.name +
          " " +
          m.awayTeam.shortName
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (filters.date) {
        const d = parseISO(m.kickoff);
        if (filters.date === "today" && !isToday(d)) return false;
        if (filters.date === "tomorrow" && !isTomorrow(d)) return false;
        if (filters.date === "weekend" && !isWeekend(d)) return false;
        if (filters.date === "week" && !isThisWeek(d, { weekStartsOn: 1 }))
          return false;
      }
      return true;
    });

    if (filters.sort === "confidence") {
      list = [...list].sort((a, b) => b.confidence - a.confidence);
    } else {
      list = [...list].sort(
        (a, b) =>
          new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
      );
    }
    return list;
  }, [filters, matches]);

  const highConfidence = matches.filter((m) => m.confidence >= 70).length;
  const avgConfidence =
    matches.length > 0
      ? Math.round(
          matches.reduce((s, m) => s + m.confidence, 0) / matches.length
        )
      : 0;

  const leagues = Array.from(new Set(matches.map((m) => m.league.name))).sort();
  const countries = Array.from(
    new Set(matches.map((m) => m.league.country))
  ).sort();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Matchs à venir</h1>
        <p className="text-gray-400 text-sm">
          Prédictions statistiques basées sur le modèle de Poisson
          {data?.source === "api" && " · données API-Football"}
          {data?.source === "demo" && " · mode démo"}
        </p>
        {data?.lastUpdated && (
          <p className="text-xs text-gray-500 mt-1">
            Dernière actualisation :{" "}
            {format(parseISO(data.lastUpdated), "d MMM yyyy HH:mm", {
              locale: fr,
            })}
          </p>
        )}
      </div>

      {data?.source === "demo" && (
        <div className="card p-3 mb-4 border-amber-500/40 bg-amber-500/10 text-amber-200 text-sm">
          Mode démonstration : les matchs affichés sont fictifs.
        </div>
      )}

      {data?.warning && (
        <div className="card p-3 mb-4 border-amber-500/30 bg-amber-500/5 text-amber-200/90 text-xs">
          {data.warning}
        </div>
      )}

      {(fetchError || (data?.error && matches.length === 0)) && (
        <div className="card p-6 mb-6 border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-red-300 mb-1">Données indisponibles</p>
              <p className="text-sm text-gray-400 mb-3">
                {fetchError || data?.error}
              </p>
              <button
                type="button"
                onClick={load}
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <RefreshCw size={14} />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Calendar size={18} className="text-accent" />
          </div>
          <div>
            <div className="text-lg font-bold">{matches.length}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">
              Matchs
            </div>
          </div>
        </div>
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Shield size={18} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-lg font-bold">{highConfidence}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">
              Haute conf.
            </div>
          </div>
        </div>
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-sky-400" />
          </div>
          <div>
            <div className="text-lg font-bold">{avgConfidence}%</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">
              Conf. moy.
            </div>
          </div>
        </div>
      </div>

      <Filters
        filters={filters}
        onChange={setFilters}
        leagueOptions={leagues}
        countryOptions={countries}
      />

      {loading ? (
        <div className="card p-10 text-center text-gray-400">
          Chargement des matchs…
        </div>
      ) : filtered.length === 0 && !fetchError ? (
        <div className="card p-10 text-center">
          <p className="text-gray-400 mb-2 text-lg">Aucun match trouvé</p>
          <p className="text-gray-500 text-sm">
            Élargissez les filtres ou réessayez plus tard.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </>
      )}

      <p className="mt-8 text-center text-xs text-gray-500">
        Les prédictions sont statistiques et ne garantissent aucun résultat.
      </p>
    </div>
  );
}
