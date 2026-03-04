"use client";

import { useMemo, useState } from "react";

// --- Types ---

export type SegmentType =
  | "Lenkzeit"
  | "Arbeitszeit"
  | "Bereitschaftszeit"
  | "Ruhezeit";

export interface DrivingSegment {
  id: string;
  type: SegmentType;
  /** Minutes from midnight (0–1439) */
  startMinutes: number;
  durationMinutes: number;
}

export interface DrivingDay {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Mo, Di, …
  segments: DrivingSegment[];
}

export interface Driver {
  id: string;
  name: string;
}

export interface ARVViolation {
  id: string;
  dayLabel: string;
  message: string;
}

// --- Helpers ---

const SEGMENT_COLORS: Record<SegmentType, string> = {
  Lenkzeit: "bg-red-500",
  Arbeitszeit: "bg-blue-500",
  Bereitschaftszeit: "bg-amber-400",
  Ruhezeit: "bg-green-500",
};

const DAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateDE(d: Date): string {
  return d.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTimeFromMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function getWeekNumber(d: Date): number {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function getWeekRange(weekStart: Date): { kw: number; from: string; to: string } {
  const kw = getWeekNumber(weekStart);
  const from = formatDateDE(weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const to = formatDateDE(end);
  return { kw, from, to };
}

// --- Mock data ---

const MOCK_DRIVERS: Driver[] = [
  { id: "1", name: "Anna Müller" },
  { id: "2", name: "Bruno Schmid" },
  { id: "3", name: "Clara Weber" },
];

/** Generates mock segments for one day. Deterministic from driverId + date. */
function mockSegmentsForDay(
  driverId: string,
  dateStr: string,
  dayIndex: number
): DrivingSegment[] {
  const hash = (s: string) => s.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const seed = hash(driverId + dateStr);
  const segments: DrivingSegment[] = [];
  // Simple pattern: rest → work/drive → rest
  if (dayIndex < 5) {
    // Weekday
    segments.push(
      { id: `${dateStr}-0`, type: "Ruhezeit", startMinutes: 0, durationMinutes: 6 * 60 },
      { id: `${dateStr}-1`, type: "Lenkzeit", startMinutes: 6 * 60, durationMinutes: 2 * 60 },
      { id: `${dateStr}-2`, type: "Arbeitszeit", startMinutes: 8 * 60, durationMinutes: 4 * 60 },
      { id: `${dateStr}-3`, type: "Bereitschaftszeit", startMinutes: 12 * 60, durationMinutes: 1 * 60 },
      { id: `${dateStr}-4`, type: "Lenkzeit", startMinutes: 13 * 60, durationMinutes: 90 },
      { id: `${dateStr}-5`, type: "Ruhezeit", startMinutes: 14 * 60 + 30, durationMinutes: 9 * 60 + 30 }
    );
  } else {
    segments.push(
      { id: `${dateStr}-0`, type: "Ruhezeit", startMinutes: 0, durationMinutes: 24 * 60 }
    );
  }
  return segments;
}

function getMockWeekData(
  driverId: string,
  weekStart: Date
): { days: DrivingDay[] } {
  const days: DrivingDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      dayLabel: DAY_LABELS[i],
      segments: mockSegmentsForDay(driverId, dateStr, i),
    });
  }
  return { days };
}

function getMockViolations(driverId: string, weekStart: Date): ARVViolation[] {
  const { kw } = getWeekRange(weekStart);
  const hash = driverId.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const violations: ARVViolation[] = [];
  if (hash % 2 === 0) {
    violations.push({
      id: "v1",
      dayLabel: "Mo",
      message: "Maximale Tagesarbeitszeit überschritten",
    });
  }
  if (hash % 3 === 0) {
    violations.push({
      id: "v2",
      dayLabel: "Mi",
      message: "Mindestruhezeit unterschritten",
    });
  }
  violations.push({
    id: "v3",
    dayLabel: "Fr",
    message: "Maximale Wochenlenkzeit erreicht",
  });
  return violations;
}

// --- Segment bar with tooltip ---

function SegmentBar({
  segment,
  onHover,
  onLeave,
}: {
  segment: DrivingSegment;
  onHover: (seg: DrivingSegment, el: HTMLElement) => void;
  onLeave: () => void;
}) {
  const left = (segment.startMinutes / (24 * 60)) * 100;
  const width = Math.max(
    (segment.durationMinutes / (24 * 60)) * 100,
    2
  );

  return (
    <div
      className={`absolute top-0.5 bottom-0.5 rounded ${SEGMENT_COLORS[segment.type]} cursor-pointer`}
      style={{ left: `${left}%`, width: `${width}%` }}
      onMouseEnter={(e) => onHover(segment, e.currentTarget)}
      onMouseLeave={onLeave}
      role="img"
      aria-label={`${segment.type} ${formatTimeFromMinutes(segment.startMinutes)} ${segment.durationMinutes} Min`}
    />
  );
}

// --- Main component ---

export default function WeeklyDriverView() {
  const [selectedDriverId, setSelectedDriverId] = useState(MOCK_DRIVERS[0].id);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [tooltip, setTooltip] = useState<{
    segment: DrivingSegment;
    x: number;
    y: number;
  } | null>(null);

  const { days } = useMemo(
    () => getMockWeekData(selectedDriverId, weekStart),
    [selectedDriverId, weekStart]
  );
  const violations = useMemo(
    () => getMockViolations(selectedDriverId, weekStart),
    [selectedDriverId, weekStart]
  );
  const weekRange = useMemo(() => getWeekRange(weekStart), [weekStart]);

  const goPrevWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() - 7);
    setWeekStart(next);
  };
  const goNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };

  const handleSegmentHover = (segment: DrivingSegment, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    setTooltip({
      segment,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <div className="space-y-4">
      {/* Filterbereich */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Fahrer:in
          </label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-label="Fahrer:in auswählen"
          >
            {MOCK_DRIVERS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Woche
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrevWeek}
              className="rounded border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              aria-label="Vorherige Woche"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2 rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800">
              <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                KW {weekRange.kw} / {weekRange.from} – {weekRange.to}
              </span>
            </div>
            <button
              type="button"
              onClick={goNextWeek}
              className="rounded border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              aria-label="Nächste Woche"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chart + ARV-Panel */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Wochenübersicht Chart */}
        <div className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <div className="inline-block min-w-[600px] p-4">
            {/* Zeitachse 00:00–24:00 */}
            <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
            <div className="space-y-2">
              {days.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="w-8 shrink-0 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {day.dayLabel}
                  </div>
                  <div className="relative h-8 flex-1 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                    {day.segments.map((seg) => (
                      <SegmentBar
                        key={seg.id}
                        segment={seg}
                        onHover={handleSegmentHover}
                        onLeave={() => setTooltip(null)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Legende */}
            <div className="mt-4 flex flex-wrap gap-4 border-t border-zinc-200 pt-3 dark:border-zinc-700">
              {(Object.entries(SEGMENT_COLORS) as [SegmentType, string][]).map(([type, bg]) => (
                <span key={type} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className={`h-3 w-6 rounded ${bg}`} aria-hidden />
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ARV-Verstöße Panel */}
        <aside className="w-full shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900 lg:w-72">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            ARV-Verstöße dieser Woche
          </h3>
          {violations.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Keine Verstöße erfasst.
            </p>
          ) : (
            <ul className="space-y-2">
              {violations.map((v) => (
                <li
                  key={v.id}
                  className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                >
                  <span className="font-medium">{v.dayLabel}:</span>{" "}
                  {v.message}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {/* Tooltip (portal-style, fixed) */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full -mt-2 rounded bg-zinc-800 px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
          role="tooltip"
        >
          <div className="font-medium">{tooltip.segment.type}</div>
          <div>
            {formatTimeFromMinutes(tooltip.segment.startMinutes)} –{" "}
            {formatTimeFromMinutes(
              tooltip.segment.startMinutes + tooltip.segment.durationMinutes
            )}
          </div>
          <div>Dauer: {tooltip.segment.durationMinutes} Min</div>
        </div>
      )}
    </div>
  );
}
