"use client";

export default function AppBar() {
  return (
    <header
      className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950"
      role="banner"
    >
      {/* Links: App-Name */}
      <h1 className="text-lg font-semibold tracking-tight text-[var(--primary)]">
        Tacho Check
      </h1>

      {/* Mitte: Kostenstelle + Rayon Dropdowns */}
      <div className="flex flex-1 items-center gap-3 pl-4">
        <select
          className="rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          aria-label="Kostenstelle"
          title="Kostenstelle"
        >
          <option>2848 Zürich Sihlcity Food</option>
          <option>Andere Kostenstelle</option>
        </select>
        <select
          className="rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          aria-label="Rayon"
          title="Rayon"
        >
          <option>Alle PEEs</option>
          <option>PEE 1</option>
          <option>PEE 2</option>
        </select>
      </div>

      {/* Rechts: User + Sprachwahl */}
      <div className="flex items-center gap-3">
        <span
          className="text-sm text-zinc-600 dark:text-zinc-400"
          aria-label="Angemeldeter Benutzer"
        >
          Marcel Muster
        </span>
        <select
          className="rounded border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-700 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
          aria-label="Sprache"
          title="Sprache"
        >
          <option value="de">DE</option>
          <option value="fr">FR</option>
          <option value="it">IT</option>
        </select>
      </div>
    </header>
  );
}
