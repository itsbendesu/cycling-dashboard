"use client";

import { useState } from "react";
import { RaceResults } from "@/lib/wikipedia";

function ClassificationIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("general")) return <span className="text-yellow-400">GC</span>;
  if (n.includes("points")) return <span className="text-green-400">Pts</span>;
  if (n.includes("mountain")) return <span className="text-red-400">KOM</span>;
  if (n.includes("young")) return <span className="text-white">Youth</span>;
  if (n.includes("team")) return <span className="text-blue-400">Team</span>;
  return null;
}

function ResultsTable({
  results,
  compact = false,
}: {
  results: { rank: number; rider: string; nationality: string; team: string; time: string }[];
  compact?: boolean;
}) {
  const displayCount = compact ? 5 : 10;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
            <th className="py-2 pr-2 text-left w-10">#</th>
            <th className="py-2 pr-2 text-left">Rider</th>
            <th className="py-2 pr-2 text-left hidden sm:table-cell">Team</th>
            <th className="py-2 text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          {results.slice(0, displayCount).map((r) => (
            <tr
              key={r.rank}
              className={`border-b border-border/50 ${
                r.rank <= 3 ? "text-foreground" : "text-muted"
              }`}
            >
              <td className="py-2 pr-2 font-mono text-xs">
                {r.rank <= 3 ? (
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                      r.rank === 1
                        ? "bg-yellow-500/20 text-yellow-400"
                        : r.rank === 2
                          ? "bg-zinc-400/20 text-foreground"
                          : "bg-amber-700/20 text-amber-600"
                    }`}
                  >
                    {r.rank}
                  </span>
                ) : (
                  r.rank
                )}
              </td>
              <td className="py-2 pr-2">
                <div>
                  <span className="font-medium">{r.rider}</span>
                  {r.nationality && (
                    <span className="text-xs text-muted ml-1.5">{r.nationality}</span>
                  )}
                </div>
                <div className="text-xs text-muted sm:hidden">{r.team}</div>
              </td>
              <td className="py-2 pr-2 text-muted hidden sm:table-cell text-xs">
                {r.team}
              </td>
              <td className="py-2 text-right font-mono text-xs">{r.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RaceResultsPanel({ results }: { results: RaceResults }) {
  type Tab = "gc" | "stages" | "classifications";
  const [tab, setTab] = useState<Tab>(
    results.classifications.length > 0 ? "gc" : results.stages.length > 0 ? "stages" : "gc"
  );
  const [expandedStage, setExpandedStage] = useState<number | null>(
    results.stages.length > 0 ? results.stages[results.stages.length - 1].stageNumber : null
  );

  const gc = results.classifications.find((c) =>
    c.name.toLowerCase().includes("general")
  );
  const otherClassifications = results.classifications.filter(
    (c) => !c.name.toLowerCase().includes("general")
  );

  const tabs: { label: string; value: Tab; show: boolean }[] = [
    { label: "GC", value: "gc", show: !!gc || !!results.winner },
    { label: "Stages", value: "stages", show: results.stages.length > 0 },
    { label: "Classifications", value: "classifications", show: otherClassifications.length > 0 },
  ];

  return (
    <div>
      {/* Podium summary */}
      {results.winner && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏆</div>
            <div>
              <p className="font-semibold text-foreground">{results.winner}</p>
              <p className="text-xs text-muted">
                {results.winnerTeam && <span>{results.winnerTeam}</span>}
                {results.totalTime && <span> · {results.totalTime}</span>}
              </p>
            </div>
          </div>
          {(results.second || results.third) && (
            <div className="flex gap-6 mt-3 pl-11 text-sm">
              {results.second && (
                <div>
                  <span className="text-muted">2.</span>{" "}
                  <span className="text-foreground">{results.second}</span>
                </div>
              )}
              {results.third && (
                <div>
                  <span className="text-muted">3.</span>{" "}
                  <span className="text-foreground">{results.third}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 border-b border-border">
        {tabs
          .filter((t) => t.show)
          .map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                tab === t.value
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      {/* GC tab */}
      {tab === "gc" && gc && (
        <ResultsTable results={gc.results} />
      )}

      {/* Stages tab */}
      {tab === "stages" && (
        <div className="space-y-2">
          {results.stages.map((stage) => (
            <div key={stage.stageNumber} className="rounded-lg border border-border">
              <button
                onClick={() =>
                  setExpandedStage(
                    expandedStage === stage.stageNumber ? null : stage.stageNumber
                  )
                }
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-card-hover transition-colors"
              >
                <span className="text-sm font-medium">{stage.stageName}</span>
                <div className="flex items-center gap-2">
                  {stage.results[0] && (
                    <span className="text-xs text-muted">
                      Winner: <span className="text-foreground">{stage.results[0].rider}</span>
                    </span>
                  )}
                  <svg
                    className={`w-4 h-4 text-muted transition-transform ${
                      expandedStage === stage.stageNumber ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>
              {expandedStage === stage.stageNumber && (
                <div className="px-4 pb-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted mb-2">
                      Stage Result
                    </h4>
                    <ResultsTable results={stage.results} compact />
                  </div>
                  {stage.gcAfterStage.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium uppercase tracking-wider text-muted mb-2">
                        GC After Stage
                      </h4>
                      <ResultsTable results={stage.gcAfterStage} compact />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Classifications tab */}
      {tab === "classifications" && (
        <div className="space-y-6">
          {otherClassifications.map((c) => (
            <div key={c.name}>
              <h4 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted mb-2">
                <ClassificationIcon name={c.name} />
                {c.name}
              </h4>
              <ResultsTable results={c.results} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
