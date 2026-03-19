"use client";

import { useState } from "react";
import { Race, RACES_2025, getRaceStatus, CLASS_COLORS, RaceClass } from "@/lib/races";
import { RaceCard } from "./RaceCard";

type Filter = "all" | RaceClass;

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Grand Tours", value: "Grand Tour" },
  { label: "Monuments", value: "Monument" },
  { label: "WT Stage", value: "WT Stage Race" },
  { label: "WT One Day", value: "WT One Day" },
];

function groupByMonth(races: Race[]): Record<string, Race[]> {
  const groups: Record<string, Race[]> = {};
  for (const race of races) {
    const d = new Date(race.startDate + "T00:00:00");
    const key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(race);
  }
  return groups;
}

export function CalendarView() {
  const [filter, setFilter] = useState<Filter>("all");
  const [showCompleted, setShowCompleted] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const filtered = RACES_2025.filter((r) => {
    if (filter !== "all" && r.class !== filter) return false;
    if (!showCompleted && getRaceStatus(r, today) === "completed") return false;
    return true;
  }).sort((a, b) => a.startDate.localeCompare(b.startDate));

  const grouped = groupByMonth(filtered);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-foreground text-background"
                  : "bg-card text-muted hover:text-foreground border border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          {showCompleted ? "Hide" : "Show"} completed
        </button>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([month, races]) => (
          <div key={month}>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
              {month}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {races.map((race) => (
                <RaceCard key={race.id} race={race} />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted py-12">No races match the current filter.</p>
        )}
      </div>
    </div>
  );
}
