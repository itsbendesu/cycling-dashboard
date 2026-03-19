import Link from "next/link";
import { ALL_RACES, getRaceStatus } from "@/lib/races";
import { fetchHighlights, fetchAllRaceHighlights, YouTubeVideo } from "@/lib/youtube";
import { getTizUrl } from "@/lib/tiz";
import { Logo } from "@/components/Logo";
import { HighlightsClient } from "./HighlightsClient";

export interface RaceFilterOption {
  id: string;
  name: string;
  shortName: string;
  countryCode: string;
  tizUrl: string | null;
  videoCount: number;
}

export default async function HighlightsPage() {
  const today = new Date().toISOString().split("T")[0];

  // Get completed and active races, most recent first
  const relevantRaces = ALL_RACES.filter((r) => {
    const status = getRaceStatus(r, today);
    return status === "completed" || status === "active";
  }).sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Build race queries for search
  const raceQueries = relevantRaces.map((r) => ({
    id: r.id,
    searchTerm: r.youtubeSearchTerm || r.name,
  }));

  // Fetch RSS highlights + per-race search in parallel
  const [allHighlights, perRaceHighlights] = await Promise.all([
    fetchHighlights(60),
    fetchAllRaceHighlights(raceQueries),
  ]);

  // Combine: all videos (deduped)
  const seen = new Set<string>();
  const allVideos: YouTubeVideo[] = [];
  for (const v of allHighlights) {
    if (!seen.has(v.id)) { seen.add(v.id); allVideos.push(v); }
  }
  for (const videos of Object.values(perRaceHighlights)) {
    for (const v of videos) {
      if (!seen.has(v.id)) { seen.add(v.id); allVideos.push(v); }
    }
  }

  // Build video-to-race mapping
  const videoRaceMap: Record<string, string[]> = {};
  for (const v of allVideos) {
    videoRaceMap[v.id] = [];
  }
  for (const [raceId, videos] of Object.entries(perRaceHighlights)) {
    for (const v of videos) {
      if (!videoRaceMap[v.id]) videoRaceMap[v.id] = [];
      videoRaceMap[v.id].push(raceId);
    }
  }
  // Also check RSS highlights against race names
  for (const race of relevantRaces) {
    const terms = (race.youtubeSearchTerm || race.name)
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/['']/g, "").split(/[\s-]+/)
      .filter((t: string) => t.length > 2 && !["the", "and", "des", "del", "2026", "2025", "highlights"].includes(t));

    for (const v of allVideos) {
      const title = v.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (terms.some((term: string) => title.includes(term)) && !videoRaceMap[v.id]?.includes(race.id)) {
        videoRaceMap[v.id].push(race.id);
      }
    }
  }

  // Build race filter options
  const raceFilters: RaceFilterOption[] = relevantRaces
    .map((race) => ({
      id: race.id,
      name: race.name,
      shortName: race.shortName || race.name,
      countryCode: race.countryCode,
      tizUrl: getTizUrl(race.id),
      videoCount: allVideos.filter((v) => videoRaceMap[v.id]?.includes(race.id)).length,
    }))
    .filter((r) => r.videoCount > 0 || r.tizUrl !== null);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-1.5">
                <Logo className="w-6 h-6 text-accent" />
                <span className="text-lg font-bold tracking-tight">Peloton</span>
              </Link>
              <span className="text-xs text-muted font-mono">2026</span>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-muted hover:text-foreground transition-colors">Calendar</Link>
              <Link href="/results" className="text-muted hover:text-foreground transition-colors">Results</Link>
              <span className="text-foreground font-medium">Highlights</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Race Highlights</h1>
          <p className="text-sm text-muted">
            Extended highlights from official race channels. Full races and final KM on tiz.
          </p>
        </div>

        <HighlightsClient
          videos={allVideos}
          videoRaceMap={videoRaceMap}
          raceFilters={raceFilters}
        />
      </main>
    </div>
  );
}
