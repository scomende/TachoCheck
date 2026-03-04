"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Tabs anpassen: href und label hier ergänzen oder ändern.
const TABS = [
  { href: "/fahrerkarten", label: "Fahrerkarten" },
  { href: "/arv-verstoesse", label: "ARV-Verstöße" },
  { href: "/betriebskontrolle", label: "Betriebskontrolle" },
  { href: "/fahrzeuge", label: "Fahrzeuge" },
] as const;

export default function FilterTabsBar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Suchfeld + Filter (eine Zeile) */}
      <div className="flex flex-1 items-center gap-4 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            aria-hidden
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Mitarbeiter:in suchen…"
            className="w-full rounded border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm placeholder-zinc-500 focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-900 dark:placeholder-zinc-400 dark:focus:bg-zinc-900"
            aria-label="Mitarbeiter:in suchen"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input type="checkbox" className="rounded border-zinc-300" />
            Filter 1
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input type="checkbox" className="rounded border-zinc-300" />
            Filter 2
          </label>
        </div>
      </div>

      {/* Tabs als Hauptnavigation */}
      <nav className="flex gap-0" aria-label="Hauptnavigation">
        {TABS.map(({ href, label }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`relative min-w-0 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "text-[var(--primary)]"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
