# FootPredict CI

Application web de **prédiction statistique de matchs de football** basée sur un modèle de Poisson.

**Langue :** Français  
**Stack :** Next.js 14 · TypeScript · Tailwind CSS · Supabase (préparé)

> ⚠️ **Avertissement :** Les prédictions sont statistiques et ne garantissent aucun résultat.  
> Aucune fonctionnalité de pari, de dépôt d’argent ou de lien vers un bookmaker n’est présente.

---

## Fonctionnalités MVP

| Fonctionnalité | Description |
|---|---|
| Page d’accueil | Liste des matchs à venir avec cartes |
| Filtres | Ligue, pays, date, niveau de confiance minimum |
| Cartes de match | Équipes, logos, heure, ligue, probabilités 1X2, prédiction principale, confiance |
| Page détail | 1X2, Over/Under 1.5·2.5·3.5, BTTS, Double chance, 5 scores exacts, forme, H2H, blessures, analyse auto |
| Historique | Taux de réussite par marché (1X2, Over 2.5, BTTS…) |
| Favoris | Enregistrement local des matchs (localStorage) |
| Modèle Poisson | Attaque/défense, avantage domicile, forme, confrontations directes |

**Données :** 5 ligues (Ligue 1, Premier League, La Liga, Serie A, Bundesliga) · 20 matchs fictifs réalistes.

---

## Démarrage rapide

```bash
git clone https://github.com/souhiosylla-coder/footpredict-ci.git
cd footpredict-ci
npm install
cp .env.example .env.local
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

## Structure du projet

```
├── app/
│   ├── page.tsx              # Accueil (matchs + filtres)
│   ├── match/[id]/page.tsx   # Détail d'un match
│   ├── historique/page.tsx   # Taux de réussite
│   ├── favoris/page.tsx      # Favoris
│   ├── layout.tsx
│   └── globals.css
├── components/
├── lib/
│   ├── types.ts
│   ├── mock-data.ts
│   ├── poisson.ts
│   ├── useFavorites.ts
│   ├── supabase.ts
│   └── api-football.ts
├── supabase/schema.sql
├── .env.example
└── README.md
```

---

## Modèle de Poisson

Le modèle calcule les λ (buts attendus) à partir de :

- Force d’attaque et de défense relatives des deux équipes
- Avantage domicile (multiplicateur ~1.10–1.25)
- Forme récente (5 derniers matchs → multiplicateur 0.85–1.15)
- Biais issu des confrontations directes

Les probabilités 1X2, Over/Under, BTTS et scores exacts sont dérivées de la distribution de Poisson.

---

## Intégration future API-Football

1. Obtenez une clé sur [api-football.com](https://www.api-football.com/).
2. Ajoutez dans `.env.local` :
   ```
   FOOTBALL_API_KEY=votre_cle
   ```
3. Créez des routes API Next.js (`app/api/...`) pour récupérer fixtures, stats, blessures, etc.
4. Remplacez progressivement `lib/mock-data.ts` par des appels réels.

---

## Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Exécutez le contenu de `supabase/schema.sql` dans l’éditeur SQL.
3. Renseignez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`.

Pour le MVP les favoris restent en **localStorage**.

---

## Déploiement sur Vercel

1. Allez sur [vercel.com](https://vercel.com) → **Add New Project**.
2. Importez le dépôt `souhiosylla-coder/footpredict-ci`.
3. Framework : **Next.js** (détecté automatiquement).
4. Ajoutez les variables d’environnement si besoin.
5. Cliquez sur **Deploy**.

---

## Licence & Auteur

Projet open source.  
Auteur : **Souhio Sylla** — [GitHub](https://github.com/souhiosylla-coder)

Les prédictions sont statistiques et ne garantissent aucun résultat.
