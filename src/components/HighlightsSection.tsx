"use client";

import { YouTubeVideo } from "@/lib/youtube";

export function HighlightsSection({ videos }: { videos: YouTubeVideo[] }) {
  if (videos.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <a
          key={video.id}
          href={video.id.startsWith("mock-") ? "#" : `https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-lg border border-border bg-card overflow-hidden hover:border-zinc-600 transition-all"
        >
          <div className="aspect-video bg-zinc-800 relative">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 text-zinc-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white/0 group-hover:text-white/90 transition-colors drop-shadow-lg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="p-3">
            <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-white">
              {video.title}
            </p>
            <p className="text-xs text-muted mt-1">
              {video.channelTitle} ·{" "}
              {new Date(video.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
