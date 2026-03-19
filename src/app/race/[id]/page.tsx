import { notFound } from "next/navigation";
import Link from "next/link";
import { RACES_2025, getRaceStatus, getStageDay, CLASS_COLORS } from "@/lib/races";
import { countryFlag } from "@/lib/countryFlags";
import { searchYouTubeHighlights } from "@/lib/youtube";
import { HighlightsSection } from "@/components/HighlightsSection";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export async function generateStaticParams() {
  return RACES_2025.map((race) => ({ id: race.id }));
}

export default async function RacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const race = RACES_2025.find((r) => r.id === id);

  if (!race) notFound();

  const status = getRaceStatus(race);
  const stageDay = getStageDay(race);
  const highlights = await searchYouTubeHighlights(
    race.youtubeSearchTerm || `${race.name} 2025 highlights`,
    6
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Calendar
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Race header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl">{countryFlag(race.countryCode)}</span>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{race.name}</h1>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${CLASS_COLORS[race.class]}`}
                >
                  {race.class}
                </span>
              </div>
              <p className="text-muted">
                {race.country} · {formatDate(race.startDate)}
                {race.startDate !== race.endDate && ` – ${formatDate(race.endDate)}`}
              </p>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex flex-wrap gap-4 mt-6">
            {status === "active" && (
              <div className="rounded-lg border border-green/30 bg-green/5 px-4 py-3 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-green animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-green">
                    Race in progress
                    {stageDay && race.stages && ` — Stage ${stageDay} of ${race.stages}`}
                  </p>
                </div>
              </div>
            )}
            {status === "upcoming" && (
              <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
                <p className="text-sm font-semibold text-accent">
                  {daysUntil(race.startDate)} days until start
                </p>
              </div>
            )}
            {status === "completed" && (
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-sm text-muted">Race completed</p>
              </div>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {race.distance && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Distance</p>
              <p className="text-lg font-bold font-mono">{race.distance}</p>
            </div>
          )}
          {race.stages && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Stages</p>
              <p className="text-lg font-bold font-mono">{race.stages}</p>
            </div>
          )}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Classification</p>
            <p className="text-lg font-bold">{race.class}</p>
          </div>
          {race.winner2024 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">
                2024 Winner
              </p>
              <p className="text-lg font-bold">{race.winner2024}</p>
            </div>
          )}
        </div>

        {/* External links */}
        <div className="flex flex-wrap gap-3 mb-10">
          {race.pcsSlug && (
            <a
              href={`https://www.procyclingstats.com/race/${race.pcsSlug}/2025`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted hover:text-foreground hover:border-zinc-600 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              ProCyclingStats
            </a>
          )}
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(race.youtubeSearchTerm || race.name + " 2025")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted hover:text-foreground hover:border-zinc-600 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
            YouTube Highlights
          </a>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Video Highlights</h2>
            <HighlightsSection videos={highlights} />
          </div>
        )}
      </main>
    </div>
  );
}
