"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function ConnexionPage() {
  const { signIn, signUp, user, configured, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setSubmitting(false);
      return;
    }

    if (mode === "login") {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
      } else {
        router.push("/");
      }
    } else {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err);
      } else {
        setSuccess(
          "Compte créé ! Vérifiez votre email si la confirmation est activée, puis connectez-vous."
        );
        setMode("login");
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-12">Chargement…</div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          {mode === "login" ? "Connexion" : "Inscription"}
        </h1>
        <p className="text-gray-400 text-sm">
          {mode === "login"
            ? "Accédez à vos favoris synchronisés"
            : "Créez un compte FootPredict CI"}
        </p>
      </div>

      {!configured && (
        <div className="card p-4 mb-6 border-amber-500/40 bg-amber-500/10">
          <p className="text-sm text-amber-200">
            <strong>Supabase non configuré.</strong> Ajoutez{" "}
            <code className="text-xs bg-black/30 px-1 rounded">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            et{" "}
            <code className="text-xs bg-black/30 px-1 rounded">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            dans les variables d&apos;environnement Vercel pour activer la
            connexion.
          </p>
        </div>
      )}

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              placeholder="••••••••"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !configured}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Chargement…"
              : mode === "login"
              ? "Se connecter"
              : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-400">
          {mode === "login" ? (
            <>
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-accent hover:underline font-medium"
              >
                S&apos;inscrire
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-accent hover:underline font-medium"
              >
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        <Link href="/" className="hover:text-gray-300">
          ← Retour aux matchs
        </Link>
      </p>
    </div>
  );
}
