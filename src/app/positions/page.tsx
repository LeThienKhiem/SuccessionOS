"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Briefcase, ChevronRight, Sparkles, X } from "lucide-react";

import { positions, departments } from "@/data/positions";
import { employees } from "@/data/employees";
import { successionMap } from "@/data/succession";

import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { ReadinessBadge } from "@/components/ReadinessBadge";
import { Button } from "@/components/ui/button";

type LevelFilter = "all" | "director" | "manager" | "lead";
type DiffFilter = "all" | "critical" | "very-high" | "high";

type SuccessionStatus = "covered" | "partial" | "at-risk" | "critical";

function readinessRank(r: string) {
  return r === "now" ? 3 : r === "1-2yr" ? 2 : r === "3-5yr" ? 1 : 0;
}

function bestCandidate(positionId: string) {
  const entry = successionMap.find((s) => s.positionId === positionId);
  if (!entry || entry.candidates.length === 0) return null;
  return [...entry.candidates].sort((a, b) => readinessRank(b.readiness) - readinessRank(a.readiness))[0];
}

function difficultyRank(d: string) {
  return d === "critical" ? 3 : d === "very-high" ? 2 : 1;
}

function successionStatus(positionId: string): SuccessionStatus {
  const best = bestCandidate(positionId);
  const r = best?.readiness;
  if (r === "now") return "covered";
  if (r === "1-2yr") return "partial";
  if (r === "3-5yr") return "at-risk";
  return "critical";
}

function headerTone(s: SuccessionStatus) {
  if (s === "covered") return "bg-[#F0FDF4] border-t-[3px] border-t-[#22C55E]";
  if (s === "partial") return "bg-[#FFFBEB] border-t-[3px] border-t-[#F59E0B]";
  if (s === "at-risk") return "bg-[#FFF7ED] border-t-[3px] border-t-[#EF4444]";
  return "bg-[#FEF2F2] border-t-[3px] border-t-[#DC2626]";
}

function successionBadge(s: SuccessionStatus) {
  if (s === "covered") return { text: "✓ Đã có kế thừa", cls: "bg-[#DCFCE7] text-[#15803D]" };
  if (s === "partial") return { text: "⚡ Đang phát triển", cls: "bg-[#FEF9C3] text-[#854D0E]" };
  if (s === "at-risk") return { text: "⚠ Cần chú ý", cls: "bg-[#FEE2E2] text-[#DC2626]" };
  return { text: "🔴 Chưa có kế thừa", cls: "bg-[#FEE2E2] text-[#DC2626]" };
}

type AiSuggestion = {
  employeeId: string;
  fitScore: number;
  reason: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function requiredOverallByLevel(level: string) {
  if (level === "director") return 90;
  if (level === "manager") return 85;
  if (level === "lead") return 80;
  return 75;
}

function computeFitScore(level: string, emp: (typeof employees)[number]) {
  const required = requiredOverallByLevel(level);
  const gapPenalty = Math.max(0, required - emp.overallScore) * 0.8; // demo heuristic
  const idpBonus = emp.idpStatus === "active" ? 5 : 0;
  const riskPenalty =
    emp.riskScore >= 60 ? 12 : emp.riskScore >= 40 ? 8 : emp.riskScore >= 30 ? 5 : 2;
  return clamp(Math.round(emp.overallScore - gapPenalty + idpBonus - riskPenalty), 0, 100);
}

function replacementNote(d: string) {
  if (d === "critical")
    return { text: "Rất khó tuyển ngoài", cls: "bg-[#F3F4F6] text-[#6B7280]" };
  if (d === "very-high")
    return { text: "Khó tuyển ngoài", cls: "bg-[#F3F4F6] text-[#6B7280]" };
  return null;
}

function levelBadge(level: string) {
  if (level === "director")
    return "bg-white text-[#4F46E5] border border-[#E5E7EB]";
  if (level === "manager")
    return "bg-white text-[#0F766E] border border-[#E5E7EB]";
  return "bg-white text-[#374151] border border-[#E5E7EB]";
}

export default function PositionsPage() {
  const [level, setLevel] = React.useState<LevelFilter>("all");
  const [deptId, setDeptId] = React.useState<string>("all");
  const [difficulty, setDifficulty] = React.useState<DiffFilter>("all");
  const [aiPanel, setAiPanel] = React.useState<{ open: boolean; positionId: string | null }>({
    open: false,
    positionId: null,
  });
  const [backfills, setBackfills] = React.useState<Record<string, string[]>>({});
  const [toast, setToast] = React.useState<null | { text: string }>(null);

  const showToast = React.useCallback((text: string) => {
    setToast({ text });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const countsByLevel = React.useMemo(() => {
    const director = positions.filter((p) => p.level === "director").length;
    const manager = positions.filter((p) => p.level === "manager").length;
    const lead = positions.filter((p) => p.level === "lead").length;
    return { all: positions.length, director, manager, lead };
  }, []);

  const summary = React.useMemo(() => {
    let now = 0;
    let y12 = 0;
    let y35 = 0;
    let none = 0;
    for (const p of positions) {
      const best = bestCandidate(p.id);
      if (!best) {
        none += 1;
        continue;
      }
      if (best.readiness === "now") now += 1;
      else if (best.readiness === "1-2yr") y12 += 1;
      else y35 += 1;
    }
    return { now, y12, y35, none };
  }, []);

  // Demo KPIs (per spec)
  const kpiCovered2 = { numerator: 4, denom: 12 };
  const kpiUrgent = 5;

  const selectedPosition = aiPanel.positionId
    ? positions.find((p) => p.id === aiPanel.positionId) ?? null
    : null;

  const selectedSuggestions: AiSuggestion[] = React.useMemo(() => {
    if (!selectedPosition) return [];

    // Hard-coded demo story for Finance Director and BD Manager
    if (selectedPosition.id === "pos-fd" || selectedPosition.id === "pos-bdm") {
      return [
        {
          employeeId: "emp-019",
          fitScore: 91,
          reason: "Kỹ thuật vững, đang deputy 2 năm, IDP 75%",
        },
        {
          employeeId: "emp-010",
          fitScore: 74,
          reason: "Tiềm năng cao, cần thêm 18 tháng",
        },
        {
          employeeId: "emp-002",
          fitScore: 68,
          reason: "Kỹ thuật xuất sắc nhưng risk score 35",
        },
      ];
    }

    const entry = successionMap.find((s) => s.positionId === selectedPosition.id);
    const excluded = new Set<string>([
      selectedPosition.currentHolderId,
      ...(entry?.candidates.map((c) => c.employeeId) ?? []),
      ...(backfills[selectedPosition.id] ?? []),
    ]);

    return employees
      .filter((e) => !excluded.has(e.id))
      .map((e) => ({
        employeeId: e.id,
        fitScore: computeFitScore(selectedPosition.level, e),
        reason:
          e.idpStatus === "active"
            ? "IDP đang active, có thể tăng tốc phát triển"
            : "Có nền tảng tốt, cần bổ sung theo kế hoạch 70-20-10",
      }))
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, 3);
  }, [backfills, selectedPosition]);

  function addBackfill(positionId: string, employeeId: string) {
    const emp = employees.find((e) => e.id === employeeId);
    const pos = positions.find((p) => p.id === positionId);
    setBackfills((prev) => {
      const curr = prev[positionId] ?? [];
      if (curr.includes(employeeId)) return prev;
      return { ...prev, [positionId]: [employeeId, ...curr] };
    });
    showToast(
      `Đã thêm ${emp?.name ?? employeeId} vào danh sách kế thừa ${pos?.titleVi ?? positionId}`
    );
  }

  const filtered = React.useMemo(() => {
    let list = [...positions];
    if (level !== "all") list = list.filter((p) => p.level === level);
    if (deptId !== "all") list = list.filter((p) => p.departmentId === deptId);
    if (difficulty !== "all") list = list.filter((p) => p.replacementDifficulty === difficulty);

    list.sort((a, b) => {
      const da = difficultyRank(a.replacementDifficulty);
      const db = difficultyRank(b.replacementDifficulty);
      if (db !== da) return db - da;
      return a.titleVi.localeCompare(b.titleVi, "vi");
    });

    return list;
  }, [level, deptId, difficulty]);

  const pillClass = (active: boolean) =>
    active
      ? "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]"
      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="space-y-2">
        <p className="text-[13px] text-[#6B7280]">Vị trí then chốt</p>
        <h1 className="text-[24px] font-semibold text-[#111827]">12 Vị trí Then chốt</h1>
        <p className="text-[14px] text-[#6B7280]">Theo dõi độ sẵn sàng kế thừa theo từng vị trí</p>
        <hr className="border-[#E5E7EB]" />
      </div>

      {/* SUMMARY BAR */}
      <div className="so-card rounded-xl px-5 py-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
          <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <div className="text-[13px] text-[#6B7280]">Sẵn sàng ngay</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
              <span className="text-[16px] font-bold text-[#111827]">{summary.now}</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <div className="text-[13px] text-[#6B7280]">1–2 năm</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[16px] font-bold text-[#111827]">{summary.y12}</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <div className="text-[13px] text-[#6B7280]">3–5 năm</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F97316]" />
              <span className="text-[16px] font-bold text-[#111827]">{summary.y35}</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <div className="text-[13px] text-[#6B7280]">Chưa có kế thừa</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
              <span className="text-[16px] font-bold text-[#111827]">{summary.none}</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <div className="text-[13px] text-[#6B7280]">Vị trí có ≥2 ứng viên sẵn sàng</div>
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <div className="text-[16px] font-bold text-[#111827]">
                {kpiCovered2.numerator} / {kpiCovered2.denom}
              </div>
              <div className="text-[12px] font-semibold text-[#15803D]">
                {Math.round((kpiCovered2.numerator / kpiCovered2.denom) * 100)}%
              </div>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-[#E5E7EB]">
              <div
                className="h-2 rounded-full bg-[#22C55E]"
                style={{ width: `${(kpiCovered2.numerator / kpiCovered2.denom) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <div className="text-[13px] text-[#6B7280]">Vị trí cần bổ sung gấp</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-[18px] font-extrabold text-[#DC2626]">{kpiUrgent}</div>
              <div className="h-9 w-9 rounded-xl bg-[#FEF2F2] grid place-items-center">
                <AlertTriangle className="h-5 w-5 text-[#DC2626]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="so-card rounded-xl px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLevel("all")}
              className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(level === "all")}`}
            >
              Tất cả{" "}
              <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">{countsByLevel.all}</span>
            </button>
            <button
              type="button"
              onClick={() => setLevel("director")}
              className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(level === "director")}`}
            >
              Director{" "}
              <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">{countsByLevel.director}</span>
            </button>
            <button
              type="button"
              onClick={() => setLevel("manager")}
              className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(level === "manager")}`}
            >
              Manager{" "}
              <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">{countsByLevel.manager}</span>
            </button>
            <button
              type="button"
              onClick={() => setLevel("lead")}
              className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(level === "lead")}`}
            >
              Lead{" "}
              <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">{countsByLevel.lead}</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              className="h-10 w-full sm:w-[180px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#374151] outline-none focus:border-[#6366F1]"
            >
              <option value="all">Phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DiffFilter)}
              className="h-10 w-full sm:w-[180px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#374151] outline-none focus:border-[#6366F1]"
            >
              <option value="all">Mức độ khó thay</option>
              <option value="critical">Nghiêm trọng (critical)</option>
              <option value="very-high">Rất cao (very-high)</option>
              <option value="high">Cao (high)</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="so-card rounded-xl px-6 py-14">
          <div className="flex flex-col items-center gap-3 text-center">
            <Briefcase className="h-10 w-10 text-[#9CA3AF]" />
            <div className="text-[14px] font-semibold text-[#374151]">
              Không có vị trí phù hợp với bộ lọc
            </div>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                setLevel("all");
                setDeptId("all");
                setDifficulty("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((p) => {
            const dept = departments.find((d) => d.id === p.departmentId);
            const holder = employees.find((e) => e.id === p.currentHolderId);
            const entry = successionMap.find((s) => s.positionId === p.id);
            const s0 = successionStatus(p.id);
            const hasReadyNow = bestCandidate(p.id)?.readiness === "now";
            const hasAdded = (backfills[p.id] ?? []).length > 0;
            const s: SuccessionStatus = !hasReadyNow && hasAdded ? "partial" : s0;
            const badge =
              !hasReadyNow && hasAdded
                ? { text: "⚡ Đang xem xét", cls: "bg-[#FEF9C3] text-[#854D0E]" }
                : successionBadge(s);
            const note = replacementNote(p.replacementDifficulty);

            return (
              <div key={p.id} className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
                {/* Header */}
                <div className={`rounded-t-xl px-4 py-3 ${headerTone(s)}`}>
                  {!hasReadyNow ? (
                    <div
                      className={[
                        "mb-3 rounded-lg border px-3 py-2",
                        hasAdded
                          ? "border-[#FDE68A] bg-[#FFFBEB] text-[#854D0E]"
                          : "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 text-[13px] font-semibold">
                          <AlertTriangle className="h-4 w-4" />
                          {hasAdded
                            ? "⚡ Đang xem xét backfill (AI suggestion đã thêm)"
                            : "⚠ Chưa có nhân sự sẵn sàng thay thế ngay"}
                        </div>
                        <button
                          type="button"
                          onClick={() => setAiPanel({ open: true, positionId: p.id })}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4F46E5] border border-[#E5E7EB] hover:bg-[#F9FAFB]"
                        >
                          <Sparkles className="h-4 w-4" />
                          Xem đề xuất AI
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${levelBadge(p.level)}`}>
                        {p.level === "director" ? "Director" : p.level === "manager" ? "Manager" : "Lead"}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
                        {dept?.name ?? "—"}
                      </span>
                      {note ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${note.cls}`}
                          title={`Mức độ khó khăn nếu phải tuyển dụng\nbên ngoài thị trường cho vị trí này`}
                        >
                          {note.text}
                        </span>
                      ) : null}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${badge.cls}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="px-4 py-4">
                  <div className="text-[18px] font-bold text-[#111827]">{p.title}</div>
                  <div className="mt-2 text-[14px] text-[#6B7280]">{p.titleVi}</div>

                  <div className="my-3 h-px bg-[#E5E7EB]" />

                  <div className="text-[13px] text-[#6B7280]">Đang giữ bởi:</div>
                  <div className="mt-2 flex items-center gap-3">
                    {holder ? (
                      <>
                        <EmployeeAvatar employee={holder} size="sm" />
                        <div className="font-medium text-[#111827]">{holder.name}</div>
                      </>
                    ) : (
                      <div className="text-[14px] text-[#6B7280]">Đang tuyển dụng</div>
                    )}
                  </div>

                  <div className="my-3 h-px bg-[#E5E7EB]" />

                  <div className="flex items-center justify-between">
                    <div className="text-[13px] text-[#6B7280]">Ứng viên kế thừa:</div>
                    <span className="rounded-full bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#374151] border border-[#E5E7EB]">
                      {entry?.candidates.length ?? 0}
                    </span>
                  </div>

                  {entry && entry.candidates.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {entry.candidates.slice(0, 3).map((c) => {
                        const emp = employees.find((e) => e.id === c.employeeId);
                        return (
                          <div key={c.employeeId} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {emp ? <EmployeeAvatar employee={emp} size="sm" /> : null}
                              <div className="truncate font-medium text-[#111827]">
                                {emp?.name ?? c.employeeId}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <ReadinessBadge readiness={c.readiness} />
                              <span className="text-[13px] text-[#6B7280]">Gap: {c.gapScore}</span>
                            </div>
                          </div>
                        );
                      })}

                      {entry.candidates.length > 3 ? (
                        <div className="text-[13px] text-[#6B7280]">
                          +{entry.candidates.length - 3} người khác
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-[#DC2626]">
                      <AlertTriangle className="h-4 w-4" />
                      <div className="text-[13px] font-semibold">Chưa có ứng viên kế thừa</div>
                    </div>
                  )}

                  {hasAdded ? (
                    <div className="mt-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2">
                      <div className="text-[12px] font-semibold text-[#854D0E]">
                        Backfill đã thêm (prototype):
                      </div>
                      <div className="mt-2 space-y-1">
                        {(backfills[p.id] ?? []).slice(0, 2).map((id) => {
                          const e = employees.find((x) => x.id === id);
                          const score = e ? computeFitScore(p.level, e) : 0;
                          return (
                            <div key={id} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {e ? <EmployeeAvatar employee={e} size="sm" /> : null}
                                <div className="truncate text-[13px] font-semibold text-[#111827]">
                                  {e?.name ?? id}
                                </div>
                              </div>
                              <span className="text-[12px] font-semibold text-[#854D0E]">
                                {score}%
                              </span>
                            </div>
                          );
                        })}
                        {(backfills[p.id] ?? []).length > 2 ? (
                          <div className="text-[12px] text-[#854D0E]">
                            +{(backfills[p.id] ?? []).length - 2} người khác
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {p.requiredCertifications.length > 0 ? (
                    <div className="mt-3">
                      <div className="text-[13px] text-[#6B7280]">Yêu cầu chứng chỉ:</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.requiredCertifications.map((cert) => (
                          <span
                            key={cert}
                            className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-[#374151]"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Footer */}
                <div className="border-t border-[#E5E7EB] px-4 py-3">
                  <Link href={`/succession?position=${p.id}`} className="text-[13px] font-semibold text-[#4F46E5] hover:underline">
                    Xem chi tiết kế thừa →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI slide panel */}
      <div
        className={[
          "fixed inset-0 z-50",
          aiPanel.open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <div
          className={[
            "absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity",
            aiPanel.open ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setAiPanel({ open: false, positionId: null })}
        />
        <div
          className={[
            "absolute right-0 top-0 h-[100dvh] w-[420px] max-w-[calc(100vw-24px)] bg-white shadow-2xl border-l border-[#E5E7EB] transition-transform",
            aiPanel.open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
            <div className="min-w-0">
              <div className="text-[16px] font-bold text-[#111827]">Top 3 ứng viên phù hợp nhất</div>
              <div className="mt-1 text-[13px] text-[#6B7280] truncate">
                {selectedPosition?.titleVi ?? "—"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAiPanel({ open: false, positionId: null })}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827]"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 space-y-3 overflow-y-auto h-[calc(100dvh-140px)]">
            {selectedSuggestions.map((sug, idx) => {
              const e = employees.find((x) => x.id === sug.employeeId);
              const alreadyAdded =
                !!(aiPanel.positionId && (backfills[aiPanel.positionId] ?? []).includes(sug.employeeId));
              return (
                <div key={sug.employeeId} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        {e ? <EmployeeAvatar employee={e} size="sm" /> : null}
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-semibold text-[#111827]">
                            {idx + 1}. {e?.name ?? sug.employeeId}
                          </div>
                          <div className="truncate text-[12px] text-[#6B7280]">
                            {e?.currentRoleTitle ?? "—"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-[13px] text-[#374151] leading-6">
                        <span className="font-semibold">{sug.fitScore}%</span> phù hợp · {sug.reason}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {alreadyAdded ? (
                        <button
                          type="button"
                          disabled
                          className="rounded-lg bg-[#DCFCE7] px-3 py-1.5 text-[13px] font-semibold text-[#15803D]"
                        >
                          Đã thêm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!aiPanel.positionId) return;
                            addBackfill(aiPanel.positionId, sug.employeeId);
                          }}
                          className="rounded-lg bg-[#4F46E5] px-3 py-1.5 text-[13px] font-semibold text-white"
                        >
                          + Thêm vào kế thừa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#E5E7EB] px-5 py-3 text-[12px] text-[#6B7280]">
            FitScore (demo) = overallScore - gapPenalty + idpBonus - riskPenalty
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[60] rounded-lg bg-[#111827] px-5 py-3 text-[14px] text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

