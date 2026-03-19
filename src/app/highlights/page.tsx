import Link from "next/link";
import { ALL_RACES, getRaceStatus } from "@/lib/races";
import { fetchHighlights, fetchRaceHighlights, YouTubeVideo } from "@/lib/youtube";
import { countryFlag } from "@/lib/countryFlags";
import { getTizUrl } from "@/lib/tiz";
import { HighlightsSection } from "@/components/HighlightsSection";

interface RaceHighlightGroup {
  race: (typeof ALL_RACES)[number];
  videos: YouTubeVideo[];
  tizUrl: string | null;
}

export default async function HighlightsPage() {
  const today = new Date().toISOString().split("T")[0];

  // Get completed and active races, most recent first
  const relevantRaces = ALL_RACES.filter((r) => {
    const status = getRaceStatus(r, today);
    return status === "completed" || status === "active";
  }).sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Fetch all highlights once, then filter per race
  const allHighlights = await fetchHighlights(60);

  // Also get latest highlights that might not match a specific race
  const latestHighlights = allHighlights.slice(0, 6);

  // Group highlights by race
  const raceGroups: RaceHighlightGroup[] = [];

  for (const race of relevantRaces) {
    const searchTerms = (race.youtubeSearchTerm || race.name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['']/g, "")
      .split(/[\s-]+/)
      .filter((t) => t.length > 2 && !["the", "and", "des", "del", "2026", "2025", "highlights"].includes(t));

    const matched = allHighlights.filter((v) => {
      const title = v.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return searchTerms.some((term) => title.includes(term));
    });

    if (matched.length > 0) {
      raceGroups.push({
        race,
        videos: matched.slice(0, 6),
        tizUrl: getTizUrl(race.id),
      });
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-1.5">
                <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="12" y1="2" x2="12" y2="5" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="5" y2="12" />
                  <line x1="19" y1="12" x2="22" y2="12" />
                </svg>
                <span className="text-lg font-bold tracking-tight">Peloton</span>
              </Link>
              <span className="text-xs text-muted font-mono">2026</span>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-muted hover:text-foreground transition-colors">
                Calendar
              </Link>
              <Link href="/results" className="text-muted hover:text-foreground transition-colors">
                Results
              </Link>
              <span className="text-foreground font-medium">Highlights</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Race Highlights</h1>
          <p className="text-sm text-muted">
            Extended highlights, final kilometers, and full race replays.
          </p>
        </div>

        {/* Latest highlights */}
        <div className="mb-12">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted mb-4">
            Latest
          </h2>
          <HighlightsSection videos={latestHighlights} />
        </div>

        {/* By race */}
        <div className="space-y-12">
          {raceGroups.map(({ race, videos, tizUrl }) => (
            <div key={race.id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{countryFlag(race.countryCode)}</span>
                  <div>
                    <Link
                      href={`/race/${race.id}`}
                      className="text-base font-semibold hover:text-white transition-colors"
                    >
                      {race.name}
                    </Link>
                    <p className="text-xs text-muted">
                      {new Date(race.startDate + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {race.startDate !== race.endDate &&
                        ` – ${new Date(race.endDate + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}`}
                    </p>
                  </div>
                </div>

                {/* Action links */}
                <div className="flex items-center gap-2">
                  {tizUrl && (
                    <a
                      href={tizUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:border-zinc-600 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Full Race / Final KM
                    </a>
                  )}
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent((race.youtubeSearchTerm || race.name) + " extended highlights")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:border-zinc-600 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                    More on YouTube
                  </a>
                </div>
              </div>

              <HighlightsSection videos={videos} />
            </div>
          ))}

          {raceGroups.length === 0 && (
            <p className="text-center text-muted py-12">
              No race highlights yet for the 2026 season. Check back once the first races are completed.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
