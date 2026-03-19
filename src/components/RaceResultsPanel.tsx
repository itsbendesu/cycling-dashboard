"use client";

import { useState } from "react";
import { RaceResults } from "@/lib/wikipedia";

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
  const [expanded, setExpanded] = useState(false);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  const gc = results.classifications.find((c) =>
    c.name.toLowerCase().includes("general")
  );
  const otherClassifications = results.classifications.filter(
    (c) => !c.name.toLowerCase().includes("general")
  );

  if (!results.winner && !gc && results.stages.length === 0) return null;

  const hasExpandable = gc || results.stages.length > 0 || otherClassifications.length > 0;

  return (
    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
      {/* Podium — always visible */}
      {results.winner && (
        <div>
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

      {/* Expand toggle */}
      {hasExpandable && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 mt-4 rounded-md border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          {expanded ? "Hide details" : "GC, stages & classifications"}
        </button>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 space-y-6">
          {/* GC */}
          {gc && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted mb-2">
                General Classification
              </h3>
              <ResultsTable results={gc.results} />
            </div>
          )}

          {/* Stages */}
          {results.stages.length > 0 && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted mb-2">
                Stage Results
              </h3>
              <div className="space-y-1">
                {results.stages.map((stage) => (
                  <div key={stage.stageNumber} className="rounded-lg border border-border">
                    <button
                      onClick={() =>
                        setExpandedStage(
                          expandedStage === stage.stageNumber ? null : stage.stageNumber
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-card-hover transition-colors text-sm"
                    >
                      <span className="font-medium">{stage.stageName}</span>
                      <div className="flex items-center gap-2">
                        {stage.results[0] && (
                          <span className="text-xs text-muted">
                            {stage.results[0].rider}
                          </span>
                        )}
                        <svg
                          className={`w-3.5 h-3.5 text-muted transition-transform ${
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
                      <div className="px-3 pb-3 space-y-3">
                        <ResultsTable results={stage.results} compact />
                        {stage.gcAfterStage.length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-1">
                              GC after stage
                            </p>
                            <ResultsTable results={stage.gcAfterStage} compact />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other classifications */}
          {otherClassifications.length > 0 && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted mb-2">
                Classifications
              </h3>
              <div className="space-y-4">
                {otherClassifications.map((c) => (
                  <div key={c.name}>
                    <p className="text-xs text-muted mb-1">{c.name}</p>
                    <ResultsTable results={c.results} compact />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
