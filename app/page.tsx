"use client";

import { useMemo, useState } from "react";
import { matches } from "@/lib/mock-data";
import { FilterState } from "@/lib/types";
import { MatchCard } from "@/components/MatchCard";
import { Filters } from "@/components/Filters";
import { isToday, isTomorrow, isThisWeek, isWeekend, parseISO } from "date-fns";

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>({
    league: "",
    country: "",
    date: "",
    confidence: 40,
  });

  const filtered = useMemo(() => {
    return matches
      .filter((m) => {
        if (filters.league && m.league.name !== filters.league) return false;
        if (filters.country && m.league.country !== filters.country)
          return false;
        if (m.confidence < filters.confidence) return false;

        if (filters.date) {
          const d = parseISO(m.kickoff);
          if (filters.date === "today" && !isToday(d)) return false;
          if (filters.date === "tomorrow" && !isTomorrow(d)) return false;
          if (filters.date === "weekend" && !isWeekend(d)) return false;
          if (filters.date === "week" && !isThisWeek(d, { weekStartsOn: 1 }))
            return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
      );
  }, [filters]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          Matchs à venir
        </h1>
        <p className="text-gray-400 text-sm">
          Prédictions statistiques basées sur le modèle de Poisson ·{" "}
          {filtered.length} match{filtered.length > 1 ? "s" : ""}
        </p>
      </div>

      <Filters filters={filters} onChange={setFilters} />

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          Aucun match ne correspond aux filtres sélectionnés.
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
