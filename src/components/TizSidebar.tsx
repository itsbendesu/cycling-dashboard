"use client";

import { useState, useEffect, useCallback } from "react";
import { TizVideo } from "@/lib/tiz";

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

function saveWatched(watched: Set<string>) {
  localStorage.setItem(WATCHED_KEY, JSON.stringify([...watched]));
}

export function TizSidebar({
  videos,
  categoryUrl,
}: {
  videos: TizVideo[];
  categoryUrl: string;
}) {
  const [watched, setWatchedState] = useState<Set<string>>(new Set());

  useEffect(() => {
    setWatchedState(getWatched());
  }, []);

  const toggleWatched = useCallback((url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWatchedState((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      saveWatched(next);
      return next;
    });
  }, []);

  const hasStages = videos.some((v) => v.stageNumber !== undefined);

  if (hasStages) {
    const stages = new Map<number, TizVideo[]>();
    for (const v of videos) {
      const key = v.stageNumber ?? 0;
      if (!stages.has(key)) stages.set(key, []);
      stages.get(key)!.push(v);
    }

    // Check if all videos for a stage are watched
    const isStageWatched = (stageVideos: TizVideo[]) =>
      stageVideos.every((v) => watched.has(v.url));

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Watch</h2>
          <a
            href={categoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted/60 hover:text-muted transition-colors"
          >
            all on tiz
          </a>
        </div>
        <div className="space-y-1">
          {Array.from(stages.entries())
            .sort(([a], [b]) => a - b)
            .map(([stageNum, stageVideos]) => {
              const stageWatched = isStageWatched(stageVideos);
              return (
                <div
                  key={stageNum}
                  className={`flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-opacity ${
                    stageWatched ? "opacity-40" : ""
                  }`}
                >
                  {/* Watch toggle for the whole stage */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setWatchedState((prev) => {
                        const next = new Set(prev);
                        const allWatched = stageVideos.every((v) => next.has(v.url));
                        for (const v of stageVideos) {
                          if (allWatched) next.delete(v.url);
                          else next.add(v.url);
                        }
                        saveWatched(next);
                        return next;
                      });
                    }}
                    className={`shrink-0 w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center ${
                      stageWatched
                        ? "bg-green/20 border-green/40 text-green"
                        : "border-border hover:border-muted text-transparent hover:text-muted/40"
                    }`}
                    title={stageWatched ? "Mark as unwatched" : "Mark as watched"}
                  >
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </button>

                  <span className={`text-sm flex-1 ${stageWatched ? "text-muted line-through" : "text-foreground"}`}>
                    Stage {stageNum}
                  </span>
                  <div className="flex gap-1.5">
                    {stageVideos.find((v) => v.type === "full") && (
                      <a
                        href={stageVideos.find((v) => v.type === "full")!.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-blue/10 text-blue border border-blue/20 px-2 py-0.5 text-[10px] font-medium hover:bg-blue/20 transition-colors"
                      >
                        Full
                      </a>
                    )}
                    {stageVideos.find((v) => v.type === "final-km") && (
                      <a
                        href={stageVideos.find((v) => v.type === "final-km")!.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 text-[10px] font-medium hover:bg-accent/20 transition-colors"
                      >
                        Final 10
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // One-day race
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Watch</h2>
        <a
          href={categoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted/60 hover:text-muted transition-colors"
        >
          all on tiz
        </a>
      </div>
      <div className="space-y-1">
        {videos.map((v) => {
          const isWatched = watched.has(v.url);
          return (
            <div
              key={v.url}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                isWatched
                  ? "border-border/50 opacity-40"
                  : v.type === "final-km"
                    ? "border-accent/20 bg-accent/5 hover:bg-accent/10"
                    : "border-blue/20 bg-blue/5 hover:bg-blue/10"
              }`}
            >
              <button
                onClick={(e) => toggleWatched(v.url, e)}
                className={`shrink-0 w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center ${
                  isWatched
                    ? "bg-green/20 border-green/40 text-green"
                    : "border-border hover:border-muted text-transparent hover:text-muted/40"
                }`}
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </button>
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <span className={`text-sm ${isWatched ? "text-muted line-through" : "text-foreground"}`}>
                  {v.type === "full" ? "Full Race" : "Final KM"}
                </span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
