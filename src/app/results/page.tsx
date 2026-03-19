import Link from "next/link";
import { ALL_RACES, getRaceStatus, CLASS_COLORS } from "@/lib/races";
import { fetchRaceResults, RaceResults } from "@/lib/wikipedia";
import { countryFlag } from "@/lib/countryFlags";
import { Logo } from "@/components/Logo";

interface CompletedRaceWithResults {
  race: (typeof ALL_RACES)[number];
  results: RaceResults;
}

export default async function ResultsPage() {
  const today = new Date().toISOString().split("T")[0];

  // Get completed and active races
  const relevantRaces = ALL_RACES.filter((r) => {
    const status = getRaceStatus(r, today);
    return status === "completed" || status === "active";
  }).sort((a, b) => b.startDate.localeCompare(a.startDate)); // most recent first

  // Fetch results for all completed races in parallel
  const resultsPromises = relevantRaces.map(async (race) => {
    const results = await fetchRaceResults(race.id);
    if (!results || !results.winner) return null;
    return { race, results } as CompletedRaceWithResults;
  });

  const allResults = (await Promise.all(resultsPromises)).filter(
    (r): r is CompletedRaceWithResults => r !== null
  );

  // Build season rider wins table
  const riderWins: Record<string, { wins: number; races: string[] }> = {};
  for (const { race, results } of allResults) {
    if (results.winner) {
      const name = results.winner;
      if (!riderWins[name]) riderWins[name] = { wins: 0, races: [] };
      riderWins[name].wins++;
      riderWins[name].races.push(race.shortName || race.name);
    }
  }
  const topRiders = Object.entries(riderWins)
    .sort((a, b) => b[1].wins - a[1].wins)
    .slice(0, 15);

  // Build team wins table
  const teamWins: Record<string, { wins: number; races: string[] }> = {};
  for (const { race, results } of allResults) {
    if (results.winnerTeam) {
      const team = results.winnerTeam;
      if (!teamWins[team]) teamWins[team] = { wins: 0, races: [] };
      teamWins[team].wins++;
      teamWins[team].races.push(race.shortName || race.name);
    }
  }
  const topTeams = Object.entries(teamWins)
    .sort((a, b) => b[1].wins - a[1].wins)
    .slice(0, 10);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-1.5">
                <Logo className="w-6 h-6 text-accent" />
                <span className="text-lg font-bold tracking-tight">Peloton</span>
              </Link>
              <span className="text-xs text-muted font-mono">2026</span>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-muted hover:text-foreground transition-colors">
                Calendar
              </Link>
              <span className="text-foreground font-medium">Results</span>
              <Link href="/highlights" className="text-muted hover:text-foreground transition-colors">
                Highlights
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">2026 Season Results</h1>
          <p className="text-sm text-muted">
            Race winners, rider standings, and team results from the current season.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left: Race results */}
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted mb-4">
              Race Winners
            </h2>
            <div className="space-y-2">
              {allResults.map(({ race, results }) => (
                <Link
                  key={race.id}
                  href={`/race/${race.id}`}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:bg-card-hover hover:border-muted transition-all group"
                >
                  <span className="text-xl">{countryFlag(race.countryCode)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold group-hover:text-foreground">
                        {race.name}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wider ${CLASS_COLORS[race.class]}`}
                      >
                        {race.class === "Grand Tour"
                          ? "GT"
                          : race.class === "Monument"
                            ? "Mon"
                            : race.class === "WT Stage Race"
                              ? "WT"
                              : "1D"}
                      </span>
                    </div>
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
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">
                      {results.winner}
                    </p>
                    {results.second && (
                      <p className="text-xs text-muted">
                        {results.second} · {results.third}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
              {allResults.length === 0 && (
                <p className="text-center text-muted py-12">
                  No race results yet for the 2026 season.
                </p>
              )}
            </div>
          </div>

          {/* Right: Season standings */}
          <div className="space-y-8">
            {/* Rider wins */}
            {topRiders.length > 0 && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-muted mb-4">
                  Rider Wins
                </h2>
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
                        <th className="py-2 px-3 text-left w-8">#</th>
                        <th className="py-2 px-3 text-left">Rider</th>
                        <th className="py-2 px-3 text-right">Wins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topRiders.map(([rider, { wins, races }], i) => (
                        <tr key={rider} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 px-3 font-mono text-xs text-muted">
                            {i + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-medium">{rider}</p>
                            <p className="text-xs text-muted">{races.join(", ")}</p>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold">
                              {wins}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Team wins */}
            {topTeams.length > 0 && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-muted mb-4">
                  Team Wins
                </h2>
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
                        <th className="py-2 px-3 text-left w-8">#</th>
                        <th className="py-2 px-3 text-left">Team</th>
                        <th className="py-2 px-3 text-right">Wins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topTeams.map(([team, { wins, races }], i) => (
                        <tr key={team} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 px-3 font-mono text-xs text-muted">
                            {i + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-medium">{team}</p>
                            <p className="text-xs text-muted">{races.join(", ")}</p>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue/20 text-blue text-xs font-bold">
                              {wins}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
