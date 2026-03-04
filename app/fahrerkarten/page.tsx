import WeeklyDriverView from "./WeeklyDriverView";

export default function FahrerkartenPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Fahrerkarten
      </h2>
      <WeeklyDriverView />
    </div>
  );
}
