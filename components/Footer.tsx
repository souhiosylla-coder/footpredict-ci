export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-anthracite-dark mt-auto">
      <div className="container mx-auto max-w-6xl px-4 py-6 text-center text-sm text-gray-400">
        <p className="mb-2">
          <strong className="text-accent">Avertissement :</strong> Les
          prédictions sont statistiques et ne garantissent aucun résultat.
        </p>
        <p>
          © {new Date().getFullYear()} FootPredict CI — Données fictives pour
          démonstration. Aucun pari, aucun dépôt d&apos;argent.
        </p>
      </div>
    </footer>
  );
}
