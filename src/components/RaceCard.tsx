"use client";

import { Race, RaceStatus, getRaceStatus, getStageDay, CLASS_COLORS } from "@/lib/races";
import { countryFlag } from "@/lib/countryFlags";
import Link from "next/link";

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

  if (start === end) {
    return s.toLocaleDateString("en-US", opts);
  }
  if (s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString("en-US", opts)}–${e.getDate()}`;
  }
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)}`;
}

function StatusBadge({ status, race }: { status: RaceStatus; race: Race }) {
  if (status === "active") {
    const day = getStageDay(race);
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green/20 px-2.5 py-0.5 text-xs font-medium text-green border border-green/30">
        <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
        {day && race.stages ? `Stage ${day}/${race.stages}` : "Live"}
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
        Completed
      </span>
    );
  }
  const daysUntil = Math.ceil(
    (new Date(race.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntil <= 7) {
    return (
      <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent border border-accent/30">
        {daysUntil === 0 ? "Tomorrow" : `${daysUntil}d`}
      </span>
    );
  }
  return null;
}

export function RaceCard({ race }: { race: Race }) {
  const status = getRaceStatus(race);

  return (
    <Link
      href={`/race/${race.id}`}
      className={`group block rounded-lg border transition-all ${
        status === "active"
          ? "border-green/30 bg-green/5 hover:border-green/50"
          : "border-border bg-card hover:bg-card-hover hover:border-zinc-600"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{countryFlag(race.countryCode)}</span>
              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-white">
                {race.name}
              </h3>
            </div>
            <p className="text-xs text-muted">
              {formatDateRange(race.startDate, race.endDate)}
              {race.distance && ` · ${race.distance}`}
              {race.stages && ` · ${race.stages} stages`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${CLASS_COLORS[race.class]}`}
            >
              {race.class === "WT Stage Race"
                ? "WorldTour"
                : race.class === "WT One Day"
                  ? "WT 1-Day"
                  : race.class}
            </span>
            <StatusBadge status={status} race={race} />
          </div>
        </div>
        {race.estimated && (
          <p className="mt-2 text-[10px] text-zinc-600 italic">Dates estimated</p>
        )}
      </div>
    </Link>
  );
}

export function RaceCardCompact({ race }: { race: Race }) {
  const status = getRaceStatus(race);

  return (
    <Link
      href={`/race/${race.id}`}
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
        status === "active"
          ? "border-green/30 bg-green/5 hover:border-green/50"
          : "border-border bg-card hover:bg-card-hover"
      }`}
    >
      <span className="text-base">{countryFlag(race.countryCode)}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {race.shortName || race.name}
        </p>
        <p className="text-xs text-muted">
          {formatDateRange(race.startDate, race.endDate)}
        </p>
      </div>
      <StatusBadge status={status} race={race} />
    </Link>
  );
}
