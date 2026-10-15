import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "FootPredict CI – Prédictions football statistiques",
  description:
    "Prédictions de matchs de football basées sur un modèle de Poisson. Ligue 1, Premier League, La Liga, Serie A, Bundesliga.",
  keywords: "prédiction football, statistiques, poisson, ligue 1, premier league",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
