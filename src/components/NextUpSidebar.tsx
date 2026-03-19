"use client";

import { getUpcomingRaces, getActiveRaces, RACES_2025 } from "@/lib/races";
import { RaceCardCompact } from "./RaceCard";

export function NextUpSidebar() {
  const active = getActiveRaces(RACES_2025);
  const upcoming = getUpcomingRaces(RACES_2025, 8);

  // Filter upcoming to not include active races
  const activeIds = new Set(active.map((r) => r.id));
  const upcomingOnly = upcoming.filter((r) => !activeIds.has(r.id));

  return (
    <aside className="space-y-6">
      {active.length > 0 && (
        <div>
          <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-green mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
            Racing Now
          </h2>
          <div className="space-y-2">
            {active.map((race) => (
              <RaceCardCompact key={race.id} race={race} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
          Coming Up
        </h2>
        <div className="space-y-2">
          {upcomingOnly.slice(0, 6).map((race) => (
            <RaceCardCompact key={race.id} race={race} />
          ))}
        </div>
      </div>

      {/* Season stats */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
          2025 Season
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {RACES_2025.length}
            </p>
            <p className="text-xs text-muted">Races tracked</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {RACES_2025.filter((r) => r.class === "Grand Tour").length}
            </p>
            <p className="text-xs text-muted">Grand Tours</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {RACES_2025.filter((r) => r.class === "Monument").length}
            </p>
            <p className="text-xs text-muted">Monuments</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {active.length}
            </p>
            <p className="text-xs text-muted">Active now</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
