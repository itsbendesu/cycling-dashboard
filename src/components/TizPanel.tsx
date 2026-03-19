"use client";

import { useState } from "react";
import { TizVideo } from "@/lib/tiz";

type Filter = "all" | "full" | "final-km";

export function TizPanel({
  videos,
  categoryUrl,
}: {
  videos: TizVideo[];
  categoryUrl: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? videos : videos.filter((v) => v.type === filter);
  const fullCount = videos.filter((v) => v.type === "full").length;
  const finalKmCount = videos.filter((v) => v.type === "final-km").length;

  // Group by stage for stage races, flat list for one-day
  const hasStages = videos.some((v) => v.stageNumber !== undefined);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          {(
            [
              { label: "All", value: "all" as Filter, count: videos.length },
              { label: "Full Race", value: "full" as Filter, count: fullCount },
              { label: "Final KM", value: "final-km" as Filter, count: finalKmCount },
            ] as const
          )
            .filter((f) => f.count > 0)
            .map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-foreground text-background"
                    : "bg-card text-muted hover:text-foreground border border-border"
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
        </div>
        <a
          href={categoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          View all on tiz
        </a>
      </div>

      {/* Video list */}
      <div className="space-y-1">
        {filtered.map((video) => (
          <a
            key={video.url}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-card-hover hover:border-muted transition-all group"
          >
            {/* Icon */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                video.type === "full"
                  ? "bg-blue/10 text-blue"
                  : "bg-accent/10 text-accent"
              }`}
            >
              {video.type === "full" ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              )}
            </div>

            {/* Title */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground group-hover:text-foreground truncate">
                {video.stageNumber ? `Stage ${video.stageNumber}` : video.title.split(/\d{4}/)[0].trim()}
                {video.type === "final-km" && (
                  <span className="text-muted font-normal"> — Final KM</span>
                )}
                {video.type === "full" && video.stageNumber && (
                  <span className="text-muted font-normal"> — Full Stage</span>
                )}
                {video.type === "full" && !video.stageNumber && (
                  <span className="text-muted font-normal"> — Full Race</span>
                )}
              </p>
            </div>

            {/* Badge */}
            <span
              className={`shrink-0 text-[10px] font-medium uppercase tracking-wider rounded-full px-2 py-0.5 ${
                video.type === "full"
                  ? "bg-blue/10 text-blue border border-blue/20"
                  : "bg-accent/10 text-accent border border-accent/20"
              }`}
            >
              {video.type === "full" ? "Full" : "Last KM"}
            </span>

            {/* External arrow */}
            <svg
              className="w-4 h-4 text-muted/60 group-hover:text-muted shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted py-8 text-sm">
          No {filter === "full" ? "full race" : "final KM"} videos available.
        </p>
      )}
    </div>
  );
}
