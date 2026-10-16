"use client";

import { FilterState } from "@/lib/types";
import { getLeagues, getCountries } from "@/lib/mock-data";
import { Search } from "lucide-react";

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

export function Filters({ filters, onChange }: Props) {
  const leagues = getLeagues();
  const countries = getCountries();

  const update = (key: keyof FilterState, value: string | number) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="card p-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-300 mb-3">Filtres</h2>

      <div className="relative mb-3">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Rechercher une équipe..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ligue</label>
          <select
            value={filters.league}
            onChange={(e) => update("league", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent"
          >
            <option value="">Toutes</option>
            {leagues.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Pays</label>
          <select
            value={filters.country}
            onChange={(e) => update("country", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent"
          >
            <option value="">Tous</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <select
            value={filters.date}
            onChange={(e) => update("date", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent"
          >
            <option value="">Toutes</option>
            <option value="today">Aujourd&apos;hui</option>
            <option value="tomorrow">Demain</option>
            <option value="weekend">Ce week-end</option>
            <option value="week">Cette semaine</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Trier par</label>
          <select
            value={filters.sort}
            onChange={(e) =>
              update("sort", e.target.value as "date" | "confidence")
            }
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent"
          >
            <option value="date">Date</option>
            <option value="confidence">Confiance</option>
          </select>
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs text-gray-500 mb-1">
            Confiance min. ({filters.confidence}%)
          </label>
          <input
            type="range"
            min={40}
            max={90}
            step={5}
            value={filters.confidence}
            onChange={(e) => update("confidence", Number(e.target.value))}
            className="w-full accent-accent mt-2"
          />
        </div>
      </div>
    </div>
  );
}
