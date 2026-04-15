"use client";

import * as React from "react";
import { employees } from "@/data/employees";
import {
  assessments,
  getNineBoxQuadrant,
  getReadinessColor,
  getTierColor,
  getTierLabel,
} from "@/data/assessments";

type Employee = (typeof employees)[number];
type Assessment = (typeof assessments)[number];

type Anchor = { x: number; y: number };
type Selected = { employee: Employee; assessment: Assessment; anchor: Anchor };

function tierAvatarClass(tier: Employee["tier"]) {
  if (tier === "core") return "bg-purple-600 text-white ring-purple-200 dark:ring-purple-900/40";
  if (tier === "potential") return "bg-blue-600 text-white ring-blue-200 dark:ring-blue-900/40";
  return "bg-teal-600 text-white ring-teal-200 dark:ring-teal-900/40";
}

function levelScore(level: 1 | 2 | 3) {
  return level === 3 ? 80 : level === 2 ? 60 : 0;
}

function cellId(perfLevel: 1 | 2 | 3, potLevel: 1 | 2 | 3) {
  // X=Performance, Y=Potential
  return `p${perfLevel}-t${potLevel}`;
}

function cellMeta(perfLevel: 1 | 2 | 3, potLevel: 1 | 2 | 3) {
  return getNineBoxQuadrant(levelScore(perfLevel), levelScore(potLevel));
}

export function NineBoxGrid() {
  const assessmentsByEmployeeId = React.useMemo(() => {
    const map = new Map<string, Assessment>();
    for (const a of assessments) map.set(a.employeeId, a);
    return map;
  }, []);

  const buckets = React.useMemo(() => {
    const map = new Map<string, { employee: Employee; assessment: Assessment }[]>();

    for (const emp of employees) {
      const a = assessmentsByEmployeeId.get(emp.id);
      if (!a) continue;

      const q = getNineBoxQuadrant(a.performance, a.potential);
      // Spec: X=Performance, Y=Potential.
      // getNineBoxQuadrant returns row=performance band, col=potential band.
      const perfLevel = q.row;
      const potLevel = q.col;
      const key = cellId(perfLevel, potLevel);

      const arr = map.get(key);
      const item = { employee: emp, assessment: a };
      if (arr) arr.push(item);
      else map.set(key, [item]);
    }

    for (const [, list] of map) list.sort((x, y) => y.assessment.overall - x.assessment.overall);
    return map;
  }, [assessmentsByEmployeeId]);

  const [selected, setSelected] = React.useState<Selected | null>(null);

  React.useEffect(() => {
    if (!selected) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">9-Box Grid</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            X = Performance (thấp → cao), Y = Potential (thấp → cao). Ngưỡng: &lt;60 / 60–79 / ≥80.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-100 px-3 py-1 text-purple-800">
            <span className="h-2 w-2 rounded-full bg-purple-600" />
            Core
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-blue-800">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Potential
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-100 px-3 py-1 text-teal-800">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            Successor
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[auto,1fr] gap-3">
        <div className="flex flex-col justify-between py-2 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="leading-4">
            <div className="font-medium text-zinc-800 dark:text-zinc-200">Potential</div>
            <div>(Y)</div>
          </div>
          <div className="rotate-180 [writing-mode:vertical-rl] text-[11px] tracking-wide">HIGH → LOW</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {([3, 2, 1] as const).map((potLevel) =>
            ([1, 2, 3] as const).map((perfLevel) => {
              const meta = cellMeta(perfLevel, potLevel);
              const key = cellId(perfLevel, potLevel);
              const list = buckets.get(key) ?? [];

              return (
                <div
                  key={key}
                  className={[
                    "min-h-[170px] rounded-xl border p-3 shadow-sm",
                    meta.color,
                    "dark:border-zinc-800 dark:bg-zinc-950",
                  ].join(" ")}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{meta.label}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">{list.length}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {list.map(({ employee, assessment }) => (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={(e) => {
                          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                          setSelected({
                            employee,
                            assessment,
                            anchor: { x: rect.left + rect.width / 2, y: rect.top },
                          });
                        }}
                        className={[
                          "grid h-10 w-10 place-items-center rounded-full text-xs font-semibold",
                          "ring-2 ring-offset-2 ring-offset-white shadow-sm transition hover:scale-[1.03] active:scale-[0.98]",
                          "dark:ring-offset-zinc-950",
                          tierAvatarClass(employee.tier),
                        ].join(" ")}
                        aria-label={`${employee.name} (${employee.tier})`}
                      >
                        {employee.initials}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[auto,1fr] gap-3">
        <div />
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <div className="font-medium text-zinc-800 dark:text-zinc-200">Performance (X)</div>
          <div className="flex w-full max-w-[520px] justify-between">
            <span>Low</span>
            <span>Mid</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelected(null);
          }}
        >
          <div
            className="fixed z-50 w-[320px] -translate-x-1/2 rounded-xl border border-black/10 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-zinc-950"
            style={{
              left: selected.anchor.x,
              top: Math.max(12, selected.anchor.y - 12),
              transform: "translate(-50%, -100%)",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            role="tooltip"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{selected.employee.name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${getTierColor(
                      selected.employee.tier
                    )}`}
                  >
                    {getTierLabel(selected.employee.tier)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${getReadinessColor(
                      selected.employee.readiness
                    )}`}
                  >
                    {selected.employee.readiness}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setSelected(null)}
              >
                Esc
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-zinc-50 p-2 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Overall</div>
                <div className="mt-0.5 text-sm font-semibold">{selected.assessment.overall}</div>
              </div>
              <div className="rounded-lg bg-zinc-50 p-2 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Perf</div>
                <div className="mt-0.5 text-sm font-semibold">{selected.assessment.performance}</div>
              </div>
              <div className="rounded-lg bg-zinc-50 p-2 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Pot</div>
                <div className="mt-0.5 text-sm font-semibold">{selected.assessment.potential}</div>
              </div>
            </div>

            <div className="pointer-events-none absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

