"use client";

import { YouTubeVideo } from "@/lib/youtube";

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K`;
  return String(views);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1w ago";
  return `${weeks}w ago`;
}

export function HighlightsSection({ videos }: { videos: YouTubeVideo[] }) {
  if (videos.length === 0) {
    return (
      <p className="text-center text-muted py-8">
        No recent race highlights found.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <a
          key={video.id}
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-lg border border-border bg-card overflow-hidden hover:border-muted transition-all"
        >
          <div className="aspect-video bg-card relative">
            {video.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 text-muted/60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-3">
            <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-foreground">
              {video.title}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-xs text-muted">
                {video.channelTitle}
              </p>
              <span className="text-border">·</span>
              <p className="text-xs text-muted">
                {timeAgo(video.publishedAt)}
              </p>
              {video.views && video.views > 0 && (
                <>
                  <span className="text-border">·</span>
                  <p className="text-xs text-muted">
                    {formatViews(video.views)} views
                  </p>
                </>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
