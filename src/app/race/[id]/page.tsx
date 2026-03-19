import { notFound } from "next/navigation";
import Link from "next/link";
import { ALL_RACES, getRaceStatus, getStageDay, CLASS_COLORS } from "@/lib/races";
import { countryFlag } from "@/lib/countryFlags";
import { fetchRaceHighlights } from "@/lib/youtube";
import { fetchRaceResults } from "@/lib/wikipedia";
import { fetchTizVideos, getTizCategoryUrl } from "@/lib/tiz";
import { HighlightsSection } from "@/components/HighlightsSection";
import { RaceResultsPanel } from "@/components/RaceResultsPanel";
import { TizSidebar } from "@/components/TizSidebar";

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateLong(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
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

export const revalidate = 1800; // revalidate every 30 min

export async function generateStaticParams() {
  return ALL_RACES.map((race) => ({ id: race.id }));
}

export default async function RacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const race = ALL_RACES.find((r) => r.id === id);

  if (!race) notFound();

  const status = getRaceStatus(race);
  const stageDay = getStageDay(race);
  const hasResults = status !== "upcoming";

  const [highlights, raceResults, tizVideos] = await Promise.all([
    fetchRaceHighlights(race.youtubeSearchTerm || race.name, 6),
    hasResults ? fetchRaceResults(race.id) : Promise.resolve(null),
    hasResults ? fetchTizVideos(race.id) : Promise.resolve([]),
  ]);
  const tizCategoryUrl = getTizCategoryUrl(race.id);
  const hasResultsData = raceResults && (raceResults.winner || raceResults.classifications.length > 0 || raceResults.stages.length > 0);
  const hasTiz = tizVideos.length > 0 && tizCategoryUrl;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Calendar
            </Link>
            <nav className="flex items-center gap-3">
              {race.pcsSlug && (
                <a
                  href={`https://www.procyclingstats.com/race/${race.pcsSlug}/2026`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  PCS
                </a>
              )}
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(race.youtubeSearchTerm || race.name + " 2026")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                YouTube
              </a>
              {tizCategoryUrl && (
                <a
                  href={tizCategoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  tiz
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Race header — compact */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{countryFlag(race.countryCode)}</span>
            <h1 className="text-xl font-bold">{race.name}</h1>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${CLASS_COLORS[race.class]}`}
            >
              {race.class}
            </span>
            {status === "active" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green/20 px-2.5 py-0.5 text-xs font-medium text-green border border-green/30">
                <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                {stageDay && race.stages ? `Stage ${stageDay}/${race.stages}` : "Live"}
              </span>
            )}
            {status === "upcoming" && daysUntil(race.startDate) <= 14 && (
              <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent border border-accent/30">
                {daysUntil(race.startDate)}d
              </span>
            )}
          </div>
          <p className="text-sm text-muted">
            {formatDateShort(race.startDate)}
            {race.startDate !== race.endDate && ` – ${formatDateShort(race.endDate)}`}
            {race.distance && ` · ${race.distance}`}
            {race.stages && ` · ${race.stages} stages`}
          </p>
        </div>

        {/* Upcoming race — simple layout */}
        {status === "upcoming" && (
          <div>
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-6 py-8 text-center mb-8">
              <p className="text-3xl font-bold font-mono text-accent mb-1">
                {daysUntil(race.startDate)}
              </p>
              <p className="text-sm text-muted">
                days until {formatDateLong(race.startDate)}
              </p>
            </div>

            {race.winner2025 && (
              <div className="rounded-lg border border-border bg-card p-4 mb-8">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">2025 Winner</p>
                <p className="font-semibold">{race.winner2025}</p>
              </div>
            )}

            {highlights.length > 0 && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-muted mb-3">Highlights</h2>
                <HighlightsSection videos={highlights} />
              </div>
            )}
          </div>
        )}

        {/* Completed/Active race — two-column layout */}
        {hasResults && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            {/* Left: Results + Highlights */}
            <div className="space-y-10">
              {hasResultsData && (
                <div>
                  <h2 className="text-sm font-medium uppercase tracking-wider text-muted mb-4">Results</h2>
                  <RaceResultsPanel results={raceResults!} />
                </div>
              )}

              {highlights.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium uppercase tracking-wider text-muted mb-4">Highlights</h2>
                  <HighlightsSection videos={highlights} />
                </div>
              )}
            </div>

            {/* Right sidebar — sticky */}
            <div className="hidden lg:block">
              <div className="sticky top-8 space-y-6">
                {/* Watch on tiz */}
                {hasTiz && (
                  <TizSidebar videos={tizVideos} categoryUrl={tizCategoryUrl!} />
                )}

                {/* Race info */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Info</h2>
                  <dl className="space-y-2 text-sm">
                    {raceResults?.winner && (
                      <div className="flex justify-between">
                        <dt className="text-muted">Winner</dt>
                        <dd className="font-semibold text-right">{raceResults.winner}</dd>
                      </div>
                    )}
                    {raceResults?.second && (
                      <div className="flex justify-between">
                        <dt className="text-muted">2nd</dt>
                        <dd className="text-muted text-right">{raceResults.second}</dd>
                      </div>
                    )}
                    {raceResults?.third && (
                      <div className="flex justify-between">
                        <dt className="text-muted">3rd</dt>
                        <dd className="text-muted text-right">{raceResults.third}</dd>
                      </div>
                    )}
                    {(raceResults?.totalTime || race.distance || race.stages) && (
                      <div className="border-t border-border/50 pt-2 space-y-2">
                        {raceResults?.totalTime && (
                          <div className="flex justify-between">
                            <dt className="text-muted">Time</dt>
                            <dd className="font-mono text-xs text-muted">{raceResults.totalTime}</dd>
                          </div>
                        )}
                        {(raceResults?.distance || race.distance) && (
                          <div className="flex justify-between">
                            <dt className="text-muted">Distance</dt>
                            <dd className="font-mono text-xs text-muted">{raceResults?.distance ? `${raceResults.distance} km` : race.distance}</dd>
                          </div>
                        )}
                        {race.stages && (
                          <div className="flex justify-between">
                            <dt className="text-muted">Stages</dt>
                            <dd className="font-mono text-xs text-muted">{race.stages}</dd>
                          </div>
                        )}
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
