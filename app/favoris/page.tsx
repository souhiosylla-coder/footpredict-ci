"use client";

import { useEffect, useState } from "react";
import { Match } from "@/lib/types";
import { MatchCard } from "@/components/MatchCard";
import { useFavorites } from "@/lib/useFavorites";
import Link from "next/link";

export default function FavorisPage() {
  const { favorites } = useFavorites();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setMatches(json.matches || []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  const favMatches = matches.filter((m) => favorites.includes(m.id));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Mes favoris</h1>
        <p className="text-gray-400 text-sm">
          {favMatches.length} match
          {favMatches.length > 1 ? "s" : ""} enregistré
          {favMatches.length > 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400">Chargement…</div>
      ) : favMatches.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-400 mb-4">
            Vous n&apos;avez encore aucun match en favori (ou les matchs favoris
            ne sont plus dans le calendrier à venir).
          </p>
          <Link href="/" className="btn-primary inline-block">
            Voir les matchs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favMatches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-gray-500">
        Les favoris sont stockés localement sur votre appareil.
      </p>
    </div>
  );
}
