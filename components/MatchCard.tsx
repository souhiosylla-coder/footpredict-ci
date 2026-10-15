"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Star } from "lucide-react";
import clsx from "clsx";
import { Match } from "@/lib/types";
import { useFavorites } from "@/lib/useFavorites";

interface Props {
  match: Match;
}

export function MatchCard({ match }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(match.id);

  const predLabel =
    match.prediction === "1"
      ? match.homeTeam.shortName
      : match.prediction === "2"
      ? match.awayTeam.shortName
      : "Nul";

  const predColor =
    match.prediction === "1"
      ? "bg-emerald-500/20 text-emerald-400"
      : match.prediction === "2"
      ? "bg-sky-500/20 text-sky-400"
      : "bg-amber-500/20 text-amber-400";

  return (
    <div className="card p-4 hover:border-accent/40 transition-colors relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(match.id);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 z-10"
        aria-label="Favori"
      >
        <Star
          size={18}
          className={clsx(fav ? "fill-accent text-accent" : "text-gray-500")}
        />
      </button>

      <Link href={`/match/${match.id}`} className="block">
        <div className="flex items-center justify-between mb-3 pr-8">
          <span className="text-xs text-gray-400 font-medium">
            {match.league.name} · {match.league.country}
          </span>
          <span className="text-xs text-gray-500">
            {format(new Date(match.kickoff), "EEE d MMM · HH:mm", {
              locale: fr,
            })}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="font-semibold text-sm truncate">
              {match.homeTeam.shortName}
            </span>
          </div>

          <span className="text-gray-500 text-xs font-medium px-2">VS</span>

          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="font-semibold text-sm truncate text-right">
              {match.awayTeam.shortName}
            </span>
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <ProbBox label="1" value={match.markets.homeWin} active={match.prediction === "1"} />
          <ProbBox label="N" value={match.markets.draw} active={match.prediction === "X"} />
          <ProbBox label="2" value={match.markets.awayWin} active={match.prediction === "2"} />
        </div>

        <div className="flex items-center justify-between">
          <span className={clsx("badge", predColor)}>
            Prédiction : {predLabel}
          </span>
          <span className="text-xs text-gray-400">
            Confiance{" "}
            <span
              className={clsx(
                "font-bold",
                match.confidence >= 70
                  ? "text-emerald-400"
                  : match.confidence >= 55
                  ? "text-amber-400"
                  : "text-gray-400"
              )}
            >
              {match.confidence}%
            </span>
          </span>
        </div>
      </Link>
    </div>
  );
}

function ProbBox({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  return (
    <div
      className={clsx(
        "text-center py-1.5 rounded-lg text-xs",
        active ? "bg-accent/20 border border-accent/40" : "bg-gray-800/60"
      )}
    >
      <div className="text-gray-400 font-medium">{label}</div>
      <div className="font-bold text-sm">{value}%</div>
    </div>
  );
}
