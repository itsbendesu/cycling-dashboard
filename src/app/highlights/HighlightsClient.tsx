"use client";

import { useState } from "react";
import { YouTubeVideo } from "@/lib/youtube";
import { RaceFilterOption } from "./page";
import { HighlightsSection } from "@/components/HighlightsSection";
import { countryFlag } from "@/lib/countryFlags";

export function HighlightsClient({
  videos,
  videoRaceMap,
  raceFilters,
}: {
  videos: YouTubeVideo[];
  videoRaceMap: Record<string, string[]>;
  raceFilters: RaceFilterOption[];
}) {
  const [selectedRace, setSelectedRace] = useState<string | null>(null);

  const filtered = selectedRace
    ? videos.filter((v) => videoRaceMap[v.id]?.includes(selectedRace))
    : videos;

  const selectedRaceData = raceFilters.find((r) => r.id === selectedRace);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
      {/* Left: Videos */}
      <div>
        {selectedRaceData && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span>{countryFlag(selectedRaceData.countryCode)}</span>
              <h2 className="text-base font-semibold">{selectedRaceData.name}</h2>
              <span className="text-xs text-muted">
                {filtered.length} video{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedRaceData.tizUrl && (
                <a
                  href={selectedRaceData.tizUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 transition-all"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Full Race / Final KM
                </a>
              )}
              <button
                onClick={() => setSelectedRace(null)}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                Clear filter
              </button>
            </div>
          </div>
        )}

        {!selectedRaceData && (
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted mb-4">
            All Highlights
          </h2>
        )}

        {filtered.length > 0 ? (
          <HighlightsSection videos={filtered} />
        ) : (
          <p className="text-center text-muted py-12">
            No extended highlights available for this race yet.
          </p>
        )}
      </div>

      {/* Right: Race filter */}
      <div className="hidden lg:block">
        <div className="sticky top-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
            Filter by Race
          </h2>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedRace(null)}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                selectedRace === null
                  ? "bg-foreground text-background font-medium"
                  : "text-muted hover:text-foreground hover:bg-card"
              }`}
            >
              <span>All races</span>
              <span
                className={`text-xs font-mono ${
                  selectedRace === null ? "text-background/60" : "text-zinc-600"
                }`}
              >
                {videos.length}
              </span>
            </button>

            {raceFilters.map((race) => (
              <button
                key={race.id}
                onClick={() => setSelectedRace(race.id)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                  selectedRace === race.id
                    ? "bg-foreground text-background font-medium"
                    : "text-muted hover:text-foreground hover:bg-card"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="text-xs">{countryFlag(race.countryCode)}</span>
                  <span className="truncate">{race.shortName}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {race.tizUrl && (
                    <span
                      className={`text-[10px] ${
                        selectedRace === race.id
                          ? "text-background/40"
                          : "text-zinc-600"
                      }`}
                    >
                      tiz
                    </span>
                  )}
                  <span
                    className={`text-xs font-mono ${
                      selectedRace === race.id
                        ? "text-background/60"
                        : "text-zinc-600"
                    }`}
                  >
                    {race.videoCount}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: race filter as horizontal scroll */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedRace(null)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedRace === null
                ? "bg-foreground text-background"
                : "bg-card text-muted border border-border"
            }`}
          >
            All ({videos.length})
          </button>
          {raceFilters.map((race) => (
            <button
              key={race.id}
              onClick={() => setSelectedRace(race.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedRace === race.id
                  ? "bg-foreground text-background"
                  : "bg-card text-muted border border-border"
              }`}
            >
              {countryFlag(race.countryCode)} {race.shortName} ({race.videoCount})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
