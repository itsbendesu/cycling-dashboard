import Link from "next/link";
import { ALL_RACES, getRaceStatus } from "@/lib/races";
import { fetchHighlights, YouTubeVideo } from "@/lib/youtube";
import { getTizUrl } from "@/lib/tiz";
import { HighlightsClient } from "./HighlightsClient";

export interface RaceFilterOption {
  id: string;
  name: string;
  shortName: string;
  countryCode: string;
  tizUrl: string | null;
  videoCount: number;
}

function matchVideoToRace(
  video: YouTubeVideo,
  race: (typeof ALL_RACES)[number]
): boolean {
  const searchTerms = (race.youtubeSearchTerm || race.name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .split(/[\s-]+/)
    .filter(
      (t) =>
        t.length > 2 &&
        !["the", "and", "des", "del", "2026", "2025", "highlights"].includes(t)
    );

  const title = video.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return searchTerms.some((term) => title.includes(term));
}

export default async function HighlightsPage() {
  const today = new Date().toISOString().split("T")[0];

  const allHighlights = await fetchHighlights(60);

  // Build race filter options — only races that have at least one highlight
  const relevantRaces = ALL_RACES.filter((r) => {
    const status = getRaceStatus(r, today);
    return status === "completed" || status === "active";
  }).sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Tag each video with its matching race IDs
  const videoRaceMap: Record<string, string[]> = {};
  for (const video of allHighlights) {
    videoRaceMap[video.id] = [];
    for (const race of relevantRaces) {
      if (matchVideoToRace(video, race)) {
        videoRaceMap[video.id].push(race.id);
      }
    }
  }

  const raceFilters: RaceFilterOption[] = relevantRaces
    .map((race) => {
      const count = allHighlights.filter((v) =>
        videoRaceMap[v.id]?.includes(race.id)
      ).length;
      return {
        id: race.id,
        name: race.name,
        shortName: race.shortName || race.name,
        countryCode: race.countryCode,
        tizUrl: getTizUrl(race.id),
        videoCount: count,
      };
    })
    .filter((r) => r.videoCount > 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-1.5">
                <svg
                  className="w-6 h-6 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
              <Link
                href="/"
                className="text-muted hover:text-foreground transition-colors"
              >
                Calendar
              </Link>
              <Link
                href="/results"
                className="text-muted hover:text-foreground transition-colors"
              >
                Results
              </Link>
              <span className="text-foreground font-medium">Highlights</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Race Highlights</h1>
          <p className="text-sm text-muted">
            Extended highlights from Tour de France and TNT Sports Cycling.
          </p>
        </div>

        <HighlightsClient
          videos={allHighlights}
          videoRaceMap={videoRaceMap}
          raceFilters={raceFilters}
        />
      </main>
    </div>
  );
}
