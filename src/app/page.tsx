import { CalendarView } from "@/components/CalendarView";
import { NextUpSidebar } from "@/components/NextUpSidebar";
import { HighlightsSection } from "@/components/HighlightsSection";
import { fetchHighlights } from "@/lib/youtube";

export default async function Home() {
  const highlights = await fetchHighlights(9);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="12" y1="2" x2="12" y2="5" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="5" y2="12" />
                  <line x1="19" y1="12" x2="22" y2="12" />
                </svg>
                <h1 className="text-lg font-bold tracking-tight">
                  Peloton
                </h1>
              </div>
              <span className="text-xs text-muted font-mono">2026</span>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <span className="text-foreground font-medium">Calendar</span>
              <a href="#highlights" className="text-muted hover:text-foreground transition-colors">
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

            {/* Highlights */}
            <div id="highlights" className="mt-12">
              <h2 className="text-xl font-semibold mb-1">Recent Highlights</h2>
              <p className="text-sm text-muted mb-4">
                Race highlights from Lanterne Rouge, GCN Racing, and more.
              </p>
              <HighlightsSection videos={highlights} />
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <NextUpSidebar />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-xs text-zinc-600 text-center">
            Race data curated from UCI calendar. Not affiliated with UCI, ASO, or RCS Sport.
          </p>
        </div>
      </footer>
    </div>
  );
}
