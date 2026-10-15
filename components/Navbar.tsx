"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Star, Menu, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Matchs", icon: Home },
  { href: "/historique", label: "Historique", icon: History },
  { href: "/favoris", label: "Favoris", icon: Star },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
          </nav>
        )}
      </div>
    </header>
  );
}
