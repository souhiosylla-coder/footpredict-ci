"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "footpredict-ci-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const persist = useCallback((ids: number[]) => {
    setFavorites(ids);
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = useCallback(
    (id: number) => {
      setFavorites((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, setFavorites: persist };
}
