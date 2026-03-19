"use client";

import { getUpcomingRaces, getActiveRaces, getCompletedRaces, ALL_RACES } from "@/lib/races";
import { RaceCardCompact } from "./RaceCard";

export function NextUpSidebar() {
  const active = getActiveRaces(ALL_RACES);
  const completed = getCompletedRaces(ALL_RACES);
  const upcoming = getUpcomingRaces(ALL_RACES, 4);

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

      {completed.length > 0 && (
        <div>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
            Recent Races
          </h2>
          <div className="space-y-2">
            {completed.slice(0, 6).map((race) => (
              <RaceCardCompact key={race.id} race={race} />
            ))}
          </div>
        </div>
      )}

      {upcomingOnly.length > 0 && (
        <div>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
            Next Up
          </h2>
          <div className="space-y-2">
            {upcomingOnly.slice(0, 3).map((race) => (
              <RaceCardCompact key={race.id} race={race} />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
