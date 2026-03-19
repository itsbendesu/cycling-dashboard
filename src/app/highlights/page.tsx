import Link from "next/link";
import { ALL_RACES, getRaceStatus } from "@/lib/races";
import { fetchHighlights, fetchAllRaceHighlights, buildRaceMatchers, videoMatchesRace, YouTubeVideo } from "@/lib/youtube";
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
  // Also check RSS highlights against race names using proper matching
  for (const race of relevantRaces) {
    const matchers = buildRaceMatchers(race.youtubeSearchTerm || race.name);
    for (const v of allVideos) {
      if (videoMatchesRace(v.title, matchers) && !videoRaceMap[v.id]?.includes(race.id)) {
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
              <Link href="/" className="text-lg font-bold tracking-tight">
                VeloTron<sup className="text-[10px] font-mono text-muted ml-0.5 -top-2 relative">26</sup>
              </Link>
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
