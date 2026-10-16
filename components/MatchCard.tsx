"use client";

import Link from "next/link";
import Image from "next/image";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Star } from "lucide-react";
import clsx from "clsx";
import { Match } from "@/lib/types";
import { useFavorites } from "@/lib/useFavorites";

interface Props {
  match: Match;
}

function dateLabel(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return "Aujourd'hui · " + format(d, "HH:mm");
  if (isTomorrow(d)) return "Demain · " + format(d, "HH:mm");
  return format(d, "EEE d MMM · HH:mm", { locale: fr });
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
    <div className="card p-4 hover:border-accent/40 transition-all duration-200 relative group">
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(match.id);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 z-10 transition-colors"
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
            {match.league.name}
          </span>
          <span className="text-xs text-gray-500">{dateLabel(match.kickoff)}</span>
        </div>

        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative w-9 h-9 flex-shrink-0">
              <Image
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-sm block truncate">
                {match.homeTeam.shortName}
              </span>
              <FormDots form={match.homeForm} />
            </div>
          </div>

          <span className="text-gray-600 text-xs font-bold px-1">VS</span>

          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <div className="min-w-0 text-right">
              <span className="font-semibold text-sm block truncate">
                {match.awayTeam.shortName}
              </span>
              <FormDots form={match.awayForm} className="justify-end" />
            </div>
            <div className="relative w-9 h-9 flex-shrink-0">
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
          <ProbBox
            label="1"
            value={match.markets.homeWin}
            active={match.prediction === "1"}
          />
          <ProbBox
            label="N"
            value={match.markets.draw}
            active={match.prediction === "X"}
          />
          <ProbBox
            label="2"
            value={match.markets.awayWin}
            active={match.prediction === "2"}
          />
        </div>

        {/* Marchés secondaires */}
        <div className="flex gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-800 text-gray-400">
            O2.5 {match.markets.over25}%
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-800 text-gray-400">
            BTTS {match.markets.bttsYes}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={clsx("badge", predColor)}>
            {predLabel}
          </span>
          <span className="text-xs text-gray-400">
            Conf.{" "}
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

function FormDots({
  form,
  className,
}: {
  form: { result: "W" | "D" | "L" }[];
  className?: string;
}) {
  return (
    <div className={clsx("flex gap-0.5 mt-0.5", className)}>
      {form.slice(0, 5).map((f, i) => (
        <span
          key={i}
          className={clsx(
            "w-1.5 h-1.5 rounded-full",
            f.result === "W"
              ? "bg-emerald-500"
              : f.result === "D"
              ? "bg-amber-500"
              : "bg-red-500"
          )}
        />
      ))}
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
        "text-center py-1.5 rounded-lg text-xs transition-colors",
        active ? "bg-accent/20 border border-accent/40" : "bg-gray-800/60"
      )}
    >
      <div className="text-gray-400 font-medium">{label}</div>
      <div className="font-bold text-sm">{value}%</div>
    </div>
  );
}
