"use client";

import { useState, useEffect, useCallback } from "react";
import { TizVideo } from "@/lib/tiz";

interface CoverageItem {
  raceId: string;
  raceName: string;
  video: TizVideo;
}

const WATCHED_KEY = "peloton-watched";

function getWatched(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(WATCHED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function setWatched(watched: Set<string>) {
  localStorage.setItem(WATCHED_KEY, JSON.stringify([...watched]));
}

export function LatestCoverage({ items }: { items: CoverageItem[] }) {
  const [watched, setWatchedState] = useState<Set<string>>(new Set());
  const [showWatched, setShowWatched] = useState(false);

  useEffect(() => {
    setWatchedState(getWatched());
  }, []);

  const toggleWatched = useCallback((url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWatchedState((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      setWatched(next);
      return next;
    });
  }, []);

  const unwatchedItems = items.filter((item) => !watched.has(item.video.url));
  const watchedItems = items.filter((item) => watched.has(item.video.url));
  const displayItems = showWatched ? items : unwatchedItems;

  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">
          Latest Coverage
        </h2>
        {watchedItems.length > 0 && (
          <button
            onClick={() => setShowWatched(!showWatched)}
            className="text-[10px] text-muted/60 hover:text-muted transition-colors"
          >
            {showWatched ? "Hide watched" : `+${watchedItems.length} watched`}
          </button>
        )}
      </div>
      <div className="space-y-1">
        {displayItems.map((item) => {
          const isWatched = watched.has(item.video.url);
          return (
            <div
              key={item.video.url}
              className={`group flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                isWatched
                  ? "border-border/50 bg-card/50 opacity-50"
                  : "border-border bg-card hover:bg-card-hover hover:border-muted"
              }`}
            >
              {/* Watch toggle */}
              <button
                onClick={(e) => toggleWatched(item.video.url, e)}
                className={`shrink-0 w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                  isWatched
                    ? "bg-green/20 border-green/40 text-green"
                    : "border-border hover:border-muted text-transparent hover:text-muted/40"
                }`}
                title={isWatched ? "Mark as unwatched" : "Mark as watched"}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </button>

              {/* Link */}
              <a
                href={item.video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`shrink-0 text-[9px] font-bold uppercase rounded px-1 py-0.5 ${
                      item.video.type === "full"
                        ? "bg-blue/10 text-blue"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {item.video.type === "full" ? "Full" : "Final 10"}
                  </span>
                  <p className="text-xs text-foreground truncate">
                    {item.raceName}
                    {item.video.stageNumber != null && ` S${item.video.stageNumber}`}
                  </p>
                </div>
              </a>
            </div>
          );
        })}
      </div>
      {unwatchedItems.length === 0 && !showWatched && (
        <p className="text-center text-xs text-muted/60 py-4">
          All caught up
        </p>
      )}
    </div>
  );
}
