import { historyStats } from "@/lib/mock-data";

export default function HistoriquePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Historique</h1>
        <p className="text-gray-400 text-sm">
          Taux de réussite du modèle sur les matchs passés (données de
          démonstration)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {historyStats.map((stat) => (
          <div key={stat.market} className="card p-5">
            <h2 className="text-lg font-semibold mb-3 text-accent">
              {stat.market}
            </h2>
            <div className="text-4xl font-bold mb-2">
              {stat.rate}
              <span className="text-lg text-gray-400">%</span>
            </div>
            <div className="text-sm text-gray-400">
              {stat.correct} / {stat.total} prédictions correctes
            </div>
            <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{ width: `${stat.rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5 mt-6">
        <h2 className="font-semibold mb-2 text-accent">Méthodologie</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Les taux de réussite sont calculés a posteriori sur un échantillon de
          matchs historiques. Le modèle de Poisson intègre la force d&apos;attaque
          et de défense, l&apos;avantage domicile, la forme récente (5 derniers
          matchs) et un biais issu des confrontations directes. Ces chiffres
          sont indicatifs et basés sur des données fictives pour le MVP.
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-gray-500">
        Les prédictions sont statistiques et ne garantissent aucun résultat.
      </p>
    </div>
  );
}
