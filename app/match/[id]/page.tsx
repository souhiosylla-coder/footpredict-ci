"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Star, MapPin } from "lucide-react";
import clsx from "clsx";
import { Match } from "@/lib/types";
import { ProbabilityBar } from "@/components/ProbabilityBar";
import { useFavorites } from "@/lib/useFavorites";

export default function MatchDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/matches", { cache: "no-store" });
        const json = await res.json();
        const found = (json.matches as Match[] | undefined)?.find(
          (m) => m.id === id
        );
        if (!cancelled) {
          if (!found) setError("Match introuvable ou plus disponible.");
          setMatch(found ?? null);
        }
      } catch {
        if (!cancelled) setError("Impossible de charger le match.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (Number.isFinite(id)) load();
    else {
      setError("Identifiant invalide");
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="card p-8 text-center text-gray-400">Chargement…</div>
    );
  }

  if (!match) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-400 mb-4">{error || "Match introuvable."}</p>
        <Link href="/" className="btn-primary inline-block">
          Retour aux matchs
        </Link>
      </div>
    );
  }

  const fav = isFavorite(match.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
        >
          <ArrowLeft size={18} /> Retour
        </Link>
        <button
          type="button"
          onClick={() => toggleFavorite(match.id)}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl hover:bg-white/10"
        >
          <Star
            size={18}
            className={clsx(fav ? "fill-accent text-accent" : "text-gray-500")}
          />
          {fav ? "Retiré des favoris" : "Ajouter aux favoris"}
        </button>
      </div>

      <div className="card p-5 mb-6">
        <div className="text-center text-xs text-gray-400 mb-4">
          {match.league.name} · {match.league.country} ·{" "}
          {format(new Date(match.kickoff), "EEEE d MMMM yyyy · HH:mm", {
            locale: fr,
          })}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center flex-1">
            <div className="relative w-16 h-16 mb-2">
              <Image
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="font-bold text-center text-sm md:text-base">
              {match.homeTeam.name}
            </span>
          </div>

          <div className="text-center px-2">
            <div className="text-2xl font-bold text-gray-500">VS</div>
            <div
              className={clsx(
                "mt-2 badge text-sm",
                match.prediction === "1"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : match.prediction === "2"
                  ? "bg-sky-500/20 text-sky-400"
                  : "bg-amber-500/20 text-amber-400"
              )}
            >
              {match.prediction === "1"
                ? "1"
                : match.prediction === "2"
                ? "2"
                : "N"}{" "}
              · {match.confidence}%
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="relative w-16 h-16 mb-2">
              <Image
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="font-bold text-center text-sm md:text-base">
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {match.venue && (
          <div className="flex items-center justify-center gap-1 mt-4 text-xs text-gray-500">
            <MapPin size={12} /> {match.venue}
          </div>
        )}
      </div>

      <Section title="Probabilités 1X2">
        <ProbabilityBar
          label={`Victoire ${match.homeTeam.shortName}`}
          value={match.markets.homeWin}
          color="bg-emerald-500"
        />
        <ProbabilityBar label="Match nul" value={match.markets.draw} color="bg-amber-500" />
        <ProbabilityBar
          label={`Victoire ${match.awayTeam.shortName}`}
          value={match.markets.awayWin}
          color="bg-sky-500"
        />
      </Section>

      <Section title="Over / Under buts">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <ProbabilityBar label="Over 1.5" value={match.markets.over15} />
            <ProbabilityBar label="Under 1.5" value={match.markets.under15} color="bg-gray-500" />
          </div>
          <div>
            <ProbabilityBar label="Over 2.5" value={match.markets.over25} />
            <ProbabilityBar label="Under 2.5" value={match.markets.under25} color="bg-gray-500" />
          </div>
        </div>
        <div className="mt-2">
          <ProbabilityBar label="Over 3.5" value={match.markets.over35} />
          <ProbabilityBar label="Under 3.5" value={match.markets.under35} color="bg-gray-500" />
        </div>
      </Section>

      <Section title="BTTS & Double chance">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <ProbabilityBar label="BTTS Oui" value={match.markets.bttsYes} />
          <ProbabilityBar label="BTTS Non" value={match.markets.bttsNo} color="bg-gray-500" />
        </div>
        <ProbabilityBar label="1X (Domicile ou Nul)" value={match.markets.doubleChance1X} />
        <ProbabilityBar label="12 (Pas de nul)" value={match.markets.doubleChance12} />
        <ProbabilityBar label="X2 (Nul ou Extérieur)" value={match.markets.doubleChanceX2} />
      </Section>

      <Section title="Scores exacts les plus probables">
        <div className="grid grid-cols-5 gap-2">
          {match.markets.exactScores.map((s) => (
            <div key={s.score} className="bg-gray-800/60 rounded-xl py-3 text-center">
              <div className="font-bold text-lg">{s.score}</div>
              <div className="text-xs text-gray-400">{s.probability}%</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Forme récente">
        <div className="grid md:grid-cols-2 gap-4">
          <FormBlock team={match.homeTeam.shortName} form={match.homeForm} />
          <FormBlock team={match.awayTeam.shortName} form={match.awayForm} />
        </div>
      </Section>

      <Section title="Confrontations directes">
        {match.h2h.length === 0 ? (
          <p className="text-sm text-gray-500">Données H2H non disponibles.</p>
        ) : (
          <div className="space-y-2">
            {match.h2h.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-800/40 rounded-xl px-4 py-2 text-sm"
              >
                <span className="text-gray-500 text-xs w-24">{h.date}</span>
                <span className="flex-1 text-center">
                  {h.homeTeam}{" "}
                  <span className="font-bold text-accent mx-1">{h.score}</span>{" "}
                  {h.awayTeam}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Blessures & absences">
        <div className="grid md:grid-cols-2 gap-4">
          <InjuryBlock team={match.homeTeam.shortName} injuries={match.injuries.home} />
          <InjuryBlock team={match.awayTeam.shortName} injuries={match.injuries.away} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Les blessures détaillées dépendent de l&apos;abonnement API-Football ;
          non inventées si absentes.
        </p>
      </Section>

      <Section title="Analyse automatique">
        <ul className="space-y-3">
          {match.analysis.map((a, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
              <span className="text-accent font-bold flex-shrink-0">{i + 1}.</span>
              {a}
            </li>
          ))}
        </ul>
      </Section>

      <p className="mt-8 text-center text-xs text-gray-500">
        Les prédictions sont statistiques et ne garantissent aucun résultat.
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5 mb-5">
      <h2 className="text-base font-semibold mb-4 text-accent">{title}</h2>
      {children}
    </div>
  );
}

function FormBlock({
  team,
  form,
}: {
  team: string;
  form: { result: "W" | "D" | "L"; score: string; opponent: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-2">{team}</h3>
      {form.length === 0 ? (
        <p className="text-sm text-gray-500">Forme non disponible</p>
      ) : (
        <>
          <div className="flex gap-1.5 mb-2">
            {form.map((f, i) => (
              <span
                key={i}
                className={clsx(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                  f.result === "W"
                    ? "bg-emerald-500/30 text-emerald-400"
                    : f.result === "D"
                    ? "bg-amber-500/30 text-amber-400"
                    : "bg-red-500/30 text-red-400"
                )}
              >
                {f.result}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500 space-y-0.5">
            {form.map((f, i) => (
              <div key={i}>
                {f.score !== "-" ? `${f.score} vs ${f.opponent || "?"}` : f.result}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function InjuryBlock({
  team,
  injuries,
}: {
  team: string;
  injuries: { player: string; type: string; status: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-2">{team}</h3>
      {injuries.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune donnée disponible</p>
      ) : (
        <ul className="space-y-1.5">
          {injuries.map((inj, i) => (
            <li
              key={i}
              className="text-sm bg-gray-800/40 rounded-lg px-3 py-2 flex justify-between"
            >
              <span>
                {inj.player}{" "}
                <span className="text-gray-500">({inj.type})</span>
              </span>
              <span className="text-xs text-amber-400">{inj.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
