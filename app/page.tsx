"use client";

import { useMemo, useState } from "react";
import { matches } from "@/lib/mock-data";
import { FilterState } from "@/lib/types";
import { MatchCard } from "@/components/MatchCard";
import { Filters } from "@/components/Filters";
import {
  isToday,
  isTomorrow,
  isThisWeek,
  isWeekend,
  parseISO,
} from "date-fns";
import { TrendingUp, Shield, Calendar } from "lucide-react";

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>({
    league: "",
    country: "",
    date: "",
    confidence: 40,
    search: "",
    sort: "date",
  });

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
      list = list.sort((a, b) => b.confidence - a.confidence);
    } else {
      list = list.sort(
        (a, b) =>
          new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
      );
    }

    return list;
  }, [filters]);

  const highConfidence = matches.filter((m) => m.confidence >= 70).length;
  const avgConfidence = Math.round(
    matches.reduce((s, m) => s + m.confidence, 0) / matches.length
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Matchs à venir</h1>
        <p className="text-gray-400 text-sm">
          Prédictions statistiques basées sur le modèle de Poisson
        </p>
      </div>

      {/* Stats rapides */}
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

      <Filters filters={filters} onChange={setFilters} />

      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-400 mb-2 text-lg">Aucun match trouvé</p>
          <p className="text-gray-500 text-sm">
            Essayez d&apos;élargir les filtres ou d&apos;effacer la recherche.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-gray-500">
        Les prédictions sont statistiques et ne garantissent aucun résultat.
      </p>
    </div>
  );
}
