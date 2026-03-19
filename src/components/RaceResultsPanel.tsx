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
          <tr className="text-[10px] text-muted uppercase tracking-wider">
            <th className="pb-2 pr-2 text-left w-8"></th>
            <th className="pb-2 pr-2 text-left">Rider</th>
            <th className="pb-2 pr-2 text-left hidden sm:table-cell">Team</th>
            <th className="pb-2 text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          {results.slice(0, displayCount).map((r, i) => (
            <tr
              key={r.rank}
              className={
                r.rank <= 3 ? "text-foreground" : "text-muted"
              }
            >
              <td className="py-1.5 pr-2 font-mono text-xs text-muted/60 w-8">
                {r.rank}
              </td>
              <td className="py-1.5 pr-2">
                <span className={r.rank <= 3 ? "font-medium" : ""}>{r.rider}</span>
                {r.nationality && (
                  <span className="text-[10px] text-muted/60 ml-1">{r.nationality}</span>
                )}
                <span className="text-[11px] text-muted sm:hidden block">{r.team}</span>
              </td>
              <td className="py-1.5 pr-2 text-muted/80 hidden sm:table-cell text-xs">
                {r.team}
              </td>
              <td className="py-1.5 text-right font-mono text-xs text-muted/80">{r.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PodiumPlace({
  position,
  rider,
  team,
  time,
}: {
  position: 1 | 2 | 3;
  rider: string;
  team?: string | null;
  time?: string | null;
}) {
  const height = position === 1 ? "h-20" : position === 2 ? "h-14" : "h-10";
  const bg =
    position === 1
      ? "bg-yellow-500/20 border-yellow-500/30"
      : position === 2
        ? "bg-zinc-400/15 border-zinc-400/25"
        : "bg-amber-700/15 border-amber-700/25";
  const label =
    position === 1
      ? "text-yellow-500"
      : position === 2
        ? "text-zinc-400"
        : "text-amber-600";

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm font-semibold text-foreground mb-0.5 leading-tight">{rider}</p>
      {team && <p className="text-[10px] text-muted mb-2">{team}</p>}
      {time && !team && <p className="text-[10px] text-muted mb-2">{time}</p>}
      <div className={`w-full rounded-t-md border-t border-x ${bg} ${height} flex items-end justify-center pb-2`}>
        <span className={`text-lg font-bold font-mono ${label}`}>{position}</span>
      </div>
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
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Podium */}
      {results.winner && (
        <div>
          {/* Podium blocks — 2nd, 1st, 3rd ordering */}
          <div className="grid grid-cols-3 gap-3 items-end">
            {results.second ? (
              <PodiumPlace position={2} rider={results.second} team={results.secondTeam} />
            ) : <div />}
            <PodiumPlace
              position={1}
              rider={results.winner}
              team={results.winnerTeam}
              time={results.totalTime}
            />
            {results.third ? (
              <PodiumPlace position={3} rider={results.third} team={results.thirdTeam} />
            ) : <div />}
          </div>

          {/* Winner time — centered below podium */}
          {results.totalTime && results.winnerTeam && (
            <p className="text-center text-xs text-muted mt-3 font-mono">{results.totalTime}</p>
          )}
        </div>
      )}

      {/* Divider + expand toggle */}
      {hasExpandable && (
        <div className="mt-5 pt-4 border-t border-border">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
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
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 space-y-6">
          {/* GC */}
          {gc && (
            <div>
              <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">
                General Classification
              </h3>
              <ResultsTable results={gc.results} />
            </div>
          )}

          {/* Stages */}
          {results.stages.length > 0 && (
            <div>
              <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">
                Stage Results
              </h3>
              <div className="space-y-px rounded-lg border border-border overflow-hidden">
                {results.stages.map((stage) => (
                  <div key={stage.stageNumber} className="bg-background">
                    <button
                      onClick={() =>
                        setExpandedStage(
                          expandedStage === stage.stageNumber ? null : stage.stageNumber
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-card-hover transition-colors text-sm border-b border-border/50 last:border-0"
                    >
                      <span className="font-medium text-foreground">{stage.stageName}</span>
                      <div className="flex items-center gap-3">
                        {stage.results[0] && (
                          <span className="text-xs text-muted font-medium">
                            {stage.results[0].rider}
                          </span>
                        )}
                        <svg
                          className={`w-3 h-3 text-muted/60 transition-transform ${
                            expandedStage === stage.stageNumber ? "rotate-180" : ""
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </button>
                    {expandedStage === stage.stageNumber && (
                      <div className="px-3 py-3 bg-card/50 border-b border-border/50 space-y-4">
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
              <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">
                Classifications
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {otherClassifications.map((c) => {
                  const label = c.name.toLowerCase();
                  const accent = label.includes("points")
                    ? "border-green-500/20"
                    : label.includes("mountain")
                      ? "border-red-500/20"
                      : label.includes("young")
                        ? "border-white/20"
                        : "border-blue-500/20";
                  return (
                    <div key={c.name} className={`rounded-lg border ${accent} bg-background p-3`}>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">{c.name}</p>
                      {c.results[0] && (
                        <p className="text-sm font-semibold text-foreground mb-2">{c.results[0].rider}</p>
                      )}
                      <div className="space-y-0.5">
                        {c.results.slice(1, 4).map((r) => (
                          <p key={r.rank} className="text-xs text-muted">
                            <span className="font-mono text-muted/60 mr-1">{r.rank}.</span>
                            {r.rider}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
