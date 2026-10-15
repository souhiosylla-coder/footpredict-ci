"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, History, Star, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/", label: "Matchs", icon: Home },
  { href: "/historique", label: "Historique", icon: History },
  { href: "/favoris", label: "Favoris", icon: Star },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, signOut, loading, configured } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-primary-dark/95 backdrop-blur border-b border-primary-light/30">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-accent text-2xl">⚽</span>
            <span>
              FootPredict <span className="text-accent">CI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-accent/20 text-accent"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}

            {!loading && (
              user ? (
                <div className="flex items-center gap-2 ml-2">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 px-2">
                    <User size={14} />
                    <span className="max-w-[120px] truncate">{user.email}</span>
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  href="/connexion"
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ml-1",
                    pathname === "/connexion"
                      ? "bg-accent/20 text-accent"
                      : "bg-accent text-white hover:bg-accent-dark"
                  )}
                >
                  <LogIn size={18} />
                  Connexion
                </Link>
              )
            )}
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden pb-4 flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
                  pathname === href
                    ? "bg-accent/20 text-accent"
                    : "text-gray-300 hover:bg-white/10"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            {!loading &&
              (user ? (
                <>
                  <div className="px-4 py-2 text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:bg-white/10 text-left"
                  >
                    <LogOut size={18} />
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  href="/connexion"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-accent"
                >
                  <LogIn size={18} />
                  Connexion
                </Link>
              ))}
            {!configured && (
              <p className="px-4 py-2 text-xs text-amber-400/80">
                Auth désactivée (configurer Supabase)
              </p>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
