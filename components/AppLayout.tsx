"use client";

import AppBar from "./AppBar";
import FilterTabsBar from "./FilterTabsBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppBar />
      <FilterTabsBar />
      <main
        className="flex-1 overflow-auto bg-white p-4 dark:bg-zinc-950 sm:p-6"
        id="main-content"
      >
        {children}
      </main>
    </div>
  );
}
