import { CalendarView } from "@/components/CalendarView";
import { NextUpSidebar } from "@/components/NextUpSidebar";
import { LatestCoverage } from "@/components/LatestCoverage";
import { ALL_RACES, getRaceStatus } from "@/lib/races";
import { fetchLatestCoverage } from "@/lib/tiz";

export const revalidate = 1800;

export default async function Home() {
  const today = new Date().toISOString().split("T")[0];
  const completedOrActive = ALL_RACES.filter((r) => {
    const status = getRaceStatus(r, today);
    return status === "completed" || status === "active";
  }).sort((a, b) => b.startDate.localeCompare(a.startDate));

  const latestCoverage = await fetchLatestCoverage(
    completedOrActive.map((r) => ({ id: r.id, name: r.name, endDate: r.endDate })),
    8
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold tracking-tight">
                VeloTron<sup className="text-[10px] font-mono text-muted ml-0.5 -top-2 relative">26</sup>
              </h1>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <span className="text-foreground font-medium">Calendar</span>
              <a href="/results" className="text-muted hover:text-foreground transition-colors">
                Results
              </a>
              <a href="/highlights" className="text-muted hover:text-foreground transition-colors">
                Highlights
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Left: Calendar */}
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-1">Race Calendar</h2>
              <p className="text-sm text-muted">
                UCI WorldTour, Monuments, and key races for the 2026 season.
              </p>
            </div>
            <CalendarView />
          </div>

          {/* Right: Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-8 space-y-6">
              <LatestCoverage items={latestCoverage} />
              <NextUpSidebar />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-xs text-muted/60 text-center">
            Race data curated from UCI calendar. Not affiliated with UCI, ASO, or RCS Sport.
          </p>
        </div>
      </footer>
    </div>
  );
}
