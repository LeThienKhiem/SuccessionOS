"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  Cpu,
  GitBranch,
  GitMerge,
  LayoutGrid,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  ChevronDown,
  X,
} from "lucide-react";

import { employees } from "@/data/employees";
import { departments, positions } from "@/data/positions";
import { successionMap } from "@/data/succession";
import { getNineBoxQuadrant, getTierLabel } from "@/data/assessments";

import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { KnowledgeTransferPanel } from "@/components/KnowledgeTransferPanel";
import { ReadinessBadge } from "@/components/ReadinessBadge";
import { TierBadge } from "@/components/TierBadge";
import { Button } from "@/components/ui/button";

type Tab = "matrix" | "byPosition";

function readinessRank(r: string) {
  return r === "now" ? 3 : r === "1-2yr" ? 2 : r === "3-5yr" ? 1 : 0;
}

function requiredOverallScoreForPosition(level: string) {
  // Prototype heuristic: map role level -> target overall score threshold (0–100)
  if (level === "director") return 90;
  if (level === "manager") return 85;
  if (level === "lead") return 80;
  return 75;
}

function bestCandidate(positionId: string) {
  const entry = successionMap.find((s) => s.positionId === positionId);
  if (!entry || entry.candidates.length === 0) return null;
  return [...entry.candidates].sort(
    (a, b) => readinessRank(b.readiness) - readinessRank(a.readiness)
  )[0];
}

function indicatorColor(readiness: string | null) {
  if (readiness === "now") return "bg-[#22C55E]";
  if (readiness === "1-2yr") return "bg-[#F59E0B]";
  if (readiness === "3-5yr") return "bg-[#F97316]";
  return "bg-[#EF4444]";
}

function tierAvatarStyle(tier: string) {
  if (tier === "core") return "bg-[#EDE9FE] text-[#4F46E5]";
  if (tier === "potential") return "bg-[#DBEAFE] text-[#1D4ED8]";
  return "bg-[#CCFBF1] text-[#0F766E]";
}

function cellStyle(row: 1 | 2 | 3, col: 1 | 2 | 3) {
  // row = potential, col = performance (per spec in this page)
  const key = `${row}-${col}`;
  const map: Record<string, { label: string; bg: string; border: string }> = {
    // Potential high (row 3)
    "3-1": { label: "Enigma", bg: "bg-[#EFF6FF]", border: "border-[#BFDBFE]" },
    "3-2": {
      label: "Future Star",
      bg: "bg-[#EEF2FF]",
      border: "border-[#C7D2FE]",
    },
    "3-3": { label: "Star ⭐", bg: "bg-[#EDE9FE]", border: "border-[#A5B4FC]" },
    // Potential mid (row 2)
    "2-1": {
      label: "Inconsistent",
      bg: "bg-[#FFFBEB]",
      border: "border-[#FDE68A]",
    },
    "2-2": { label: "Core Player", bg: "bg-[#F0FDF4]", border: "border-[#BBF7D0]" },
    "2-3": {
      label: "High Performer",
      bg: "bg-[#DCFCE7]",
      border: "border-[#86EFAC]",
    },
    // Potential low (row 1)
    "1-1": {
      label: "Under Performer",
      bg: "bg-[#FEF2F2]",
      border: "border-[#FECACA]",
    },
    "1-2": { label: "Reliable", bg: "bg-[#F9FAFB]", border: "border-[#E5E7EB]" },
    "1-3": { label: "Expert", bg: "bg-[#F0FDFA]", border: "border-[#99F6E4]" },
  };
  return map[key];
}

export default function SuccessionPage() {
  const [tab, setTab] = React.useState<Tab>("matrix");
  const [selectedPositionId, setSelectedPositionId] =
    React.useState<string>("pos-pd");
  const [openKtp, setOpenKtp] = React.useState<Record<string, boolean>>({});

  const [searchModal, setSearchModal] = React.useState<{
    open: boolean;
    positionId: string | null;
  }>({ open: false, positionId: null });

  // Track manual successors được add (prototype - in-memory only)
  const [manualSuccessors, setManualSuccessors] = React.useState<Record<string, string[]>>({});

  React.useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const p = sp.get("position");
    if (p) setSelectedPositionId(p);
    const t = sp.get("tab");
    if (t === "2" || t === "byPosition") setTab("byPosition");
    if (t === "1" || t === "matrix") setTab("matrix");
  }, []);

  const selectedPosition = positions.find((p) => p.id === selectedPositionId) ?? positions[0];
  const selectedEntry = successionMap.find((s) => s.positionId === selectedPosition.id);
  const best = bestCandidate(selectedPosition.id);

  const originalCandidates = selectedEntry?.candidates ?? [];
  const addedIds = manualSuccessors[selectedPosition.id] ?? [];
  const requiredOverall = requiredOverallScoreForPosition(selectedPosition.level);
  const addedCandidates = employees
    .filter((e) => addedIds.includes(e.id))
    .map((e) => {
      const gap = requiredOverall - e.overallScore;
      return {
        employeeId: e.id,
        readiness: e.readiness ?? "3-5yr",
        gapScore: gap,
        strengths: [],
        developmentNeeds: [],
        nominatedDate: "—",
        nominatedBy: "Thêm thủ công",
        isManuallyAdded: true as const,
      };
    });

  const candidates = [
    ...originalCandidates.map((c) => ({ ...c, isManuallyAdded: false as const })),
    ...addedCandidates,
  ];

  const currentHolder = employees.find((e) => e.id === selectedPosition.currentHolderId);

  function addSuccessor(positionId: string, employeeId: string) {
    setManualSuccessors((prev) => {
      const curr = prev[positionId] ?? [];
      if (curr.includes(employeeId)) return prev;
      return { ...prev, [positionId]: [...curr, employeeId] };
    });
  }

  function removeSuccessor(positionId: string, employeeId: string) {
    setManualSuccessors((prev) => {
      const curr = prev[positionId] ?? [];
      const next = curr.filter((id) => id !== employeeId);
      if (next.length === 0) {
        const { [positionId]: _omit, ...rest } = prev;
        return rest;
      }
      return { ...prev, [positionId]: next };
    });
  }

  // Tab 1 buckets (matrix)
  const matrixBuckets = React.useMemo(() => {
    const buckets = new Map<string, typeof employees>();
    for (const e of employees) {
      // getNineBoxQuadrant: row=performance band, col=potential band (from data helper)
      const q = getNineBoxQuadrant(e.performanceScore, e.potentialScore);
      // Page spec: row=Potential, col=Performance
      const row = q.col;
      const col = q.row;
      const key = `${row}-${col}`;
      const arr = buckets.get(key);
      if (arr) arr.push(e);
      else buckets.set(key, [e]);
    }
    return buckets;
  }, []);

  const starsFuture = React.useMemo(() => {
    const a = matrixBuckets.get("3-3")?.length ?? 0; // Star
    const b = matrixBuckets.get("3-2")?.length ?? 0; // Future Star
    return a + b;
  }, [matrixBuckets]);

  const needAttention = React.useMemo(() => {
    const a = matrixBuckets.get("1-1")?.length ?? 0;
    const b = matrixBuckets.get("2-1")?.length ?? 0;
    const c = matrixBuckets.get("1-2")?.length ?? 0;
    return a + b + c;
  }, [matrixBuckets]);

  const technicalCount = React.useMemo(
    () => employees.filter((e) => e.careerTrack === "technical").length,
    []
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="space-y-2">
        <p className="text-[13px] text-[#6B7280]">Bản đồ kế thừa</p>
        <h1 className="text-[24px] font-semibold text-[#111827]">
          Bản đồ Kế thừa &amp; 9-Box Matrix
        </h1>
        <p className="text-[14px] text-[#6B7280]">
          Phân tích năng lực và kế hoạch kế thừa nhân sự then chốt
        </p>
        <hr className="border-[#E5E7EB]" />
      </div>

      {/* TABS */}
      <div className="flex items-center gap-6 border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setTab("matrix")}
          className={`inline-flex items-center gap-2 pb-3 text-[14px] ${
            tab === "matrix"
              ? "border-b-2 border-b-[#4F46E5] text-[#4F46E5] font-semibold"
              : "text-[#6B7280]"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          9-Box Matrix
        </button>
        <button
          type="button"
          onClick={() => setTab("byPosition")}
          className={`inline-flex items-center gap-2 pb-3 text-[14px] ${
            tab === "byPosition"
              ? "border-b-2 border-b-[#4F46E5] text-[#4F46E5] font-semibold"
              : "text-[#6B7280]"
          }`}
        >
          <GitBranch className="h-4 w-4" />
          Kế thừa theo vị trí
        </button>
      </div>

      {tab === "matrix" ? (
        <div className="space-y-4">
          {/* LEGEND */}
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[#374151]">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#6366F1]" />
              Nòng cốt
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
              Tiềm năng
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
              Kế thừa
            </div>
          </div>

          {/* 9-BOX GRID */}
          <div className="so-card rounded-xl p-6">
            <div className="flex items-stretch gap-2">
              {/* Y-axis label — left, vertical */}
              <div className="flex items-center justify-center w-[20px] shrink-0">
                <span className="rotate-[-90deg] whitespace-nowrap text-[12px] text-[#6B7280] origin-center">
                  Tiềm năng →
                </span>
              </div>

              {/* Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-3">
                  {([3, 2, 1] as const).map((row) =>
                    ([1, 2, 3] as const).map((col) => {
                      const meta = cellStyle(row, col);
                      const key = `${row}-${col}`;
                      const list = matrixBuckets.get(key) ?? [];
                      return (
                        <div
                          key={key}
                          className={[
                            "min-h-[140px] rounded-lg border p-3",
                            meta.bg,
                            meta.border,
                          ].join(" ")}
                        >
                          <div className="text-[11px] font-semibold text-[#6B7280] uppercase">
                            {meta.label}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {list.map((e) => (
                              <Link
                                key={e.id}
                                href={`/talent/${e.id}`}
                                title={`${e.name} | ${getTierLabel(e.tier)} | Perf: ${e.performanceScore} | Pot: ${e.potentialScore}`}
                                className={[
                                  "h-8 w-8 rounded-full grid place-items-center",
                                  "text-[11px] font-extrabold cursor-pointer",
                                  tierAvatarStyle(e.tier),
                                ].join(" ")}
                              >
                                {e.initials}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* X-axis — under grid only */}
                <div className="flex mt-2 ml-[28px] items-center gap-4 text-[12px] text-[#6B7280]">
                  <span>Performance →</span>
                  <div className="flex flex-1 justify-between max-w-[520px]">
                    <span>Thấp</span>
                    <span>Trung bình</span>
                    <span>Cao</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INSIGHT BAR */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="so-card rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[16px] font-semibold text-[#374151]">
                    Stars &amp; Future Stars
                  </div>
                  <div className="mt-2 text-[32px] font-bold text-[#111827]">
                    {starsFuture}
                  </div>
                  <div className="mt-2 text-[13px] text-[#6B7280]">
                    nhân sự tiềm năng cao nhất
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-[#FFFBEB] grid place-items-center">
                  <Star className="h-5 w-5 text-[#F59E0B]" />
                </div>
              </div>
            </div>

            <div className="so-card rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[16px] font-semibold text-[#374151]">
                    Cần chú ý
                  </div>
                  <div className="mt-2 text-[32px] font-bold text-[#111827]">
                    {needAttention}
                  </div>
                  <div className="mt-2 text-[13px] text-[#6B7280]">
                    nhân sự cần hỗ trợ phát triển
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-[#FEF2F2] grid place-items-center">
                  <AlertCircle className="h-5 w-5 text-[#EF4444]" />
                </div>
              </div>
            </div>

            <div className="so-card rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[16px] font-semibold text-[#374151]">
                    Expert &amp; Technical Track
                  </div>
                  <div className="mt-2 text-[32px] font-bold text-[#111827]">
                    {technicalCount}
                  </div>
                  <div className="mt-2 text-[13px] text-[#6B7280]">
                    nhân sự tuyến chuyên gia
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-[#F0FDFA] grid place-items-center">
                  <Cpu className="h-5 w-5 text-[#14B8A6]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px,1fr]">
          {/* LEFT PANEL */}
          <div className="so-card rounded-xl p-4">
            <div className="text-[11px] font-semibold text-[#6B7280] uppercase">
              Chọn vị trí
            </div>
            <div className="mt-3 space-y-1">
              {positions.map((p) => {
                const entry = successionMap.find((s) => s.positionId === p.id);
                const best = bestCandidate(p.id);
                const selected = p.id === selectedPositionId;
                const badgeCount = entry?.candidates.length ?? 0;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPositionId(p.id)}
                    className={[
                      "w-full text-left rounded-lg px-3 py-2 transition",
                      "hover:bg-[#F9FAFB]",
                      selected ? "bg-[#EEF2FF] text-[#4F46E5] font-semibold border-l-[3px] border-l-[#6366F1]" : "text-[#374151]",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={[
                            "h-2 w-2 rounded-full",
                            indicatorColor(best?.readiness ?? null),
                          ].join(" ")}
                        />
                        <span className="truncate text-[13px]">
                          {p.titleVi}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
                        {badgeCount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="so-card rounded-xl p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-[20px] font-bold text-[#111827] truncate">
                  {selectedPosition.title}
                </div>
                <div className="mt-1 text-[14px] text-[#6B7280] truncate">
                  {selectedPosition.titleVi}
                </div>
              </div>
              <div className="shrink-0">
                {best ? (
                  <ReadinessBadge readiness={best.readiness} className="px-4 py-1.5" />
                ) : addedCandidates.length > 0 && originalCandidates.length === 0 ? (
                  <span className="inline-flex items-center rounded-full border border-[#FDE68A] bg-[#FEF9C3] px-4 py-1.5 text-[12px] font-semibold text-[#854D0E]">
                    ⚡ Đang xem xét
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-[#FECACA] bg-[#FEF2F2] px-4 py-1.5 text-[12px] font-semibold text-[#DC2626]">
                    Chưa có kế thừa
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4">
              {currentHolder ? (
                <>
                  <EmployeeAvatar employee={currentHolder} size="md" />
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-[#111827] truncate">
                      {currentHolder.name}
                    </div>
                    <div className="text-[13px] text-[#6B7280] truncate">
                      {currentHolder.currentRoleTitle ?? "—"}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-[14px] text-[#6B7280]">Đang tuyển dụng</div>
              )}
            </div>

            <div className="my-5 h-px bg-[#E5E7EB]" />

            {candidates.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <GitBranch className="h-10 w-10 text-[#9CA3AF]" />
                <div className="text-[14px] font-semibold text-[#374151]">
                  Vị trí này chưa có ứng viên kế thừa
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  Cần xác định và phát triển nhân sự phù hợp
                </div>
                <button
                  type="button"
                  onClick={() => setSearchModal({ open: true, positionId: selectedPosition.id })}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2 text-white"
                >
                  <Search className="h-4 w-4" />
                  Tìm người kế thừa
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.map((c, idx) => {
                  const emp = employees.find((e) => e.id === c.employeeId);

                  const ready = Math.max(0, Math.min(100, 100 - c.gapScore));
                  const gapTone =
                    c.gapScore <= 20
                      ? { color: "#22C55E", label: "Gần sẵn sàng" }
                      : c.gapScore <= 40
                        ? { color: "#14B8A6", label: "Đang phát triển tốt" }
                        : c.gapScore <= 60
                          ? { color: "#F59E0B", label: "Cần thêm thời gian" }
                          : { color: "#EF4444", label: "Gap còn lớn" };

                  return (
                    <div key={c.employeeId} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                      {/* Header */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-7 w-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] grid place-items-center text-[14px] font-bold">
                            {idx + 1}
                          </div>
                          {emp ? <EmployeeAvatar employee={emp} size="md" /> : null}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="truncate text-[16px] font-semibold text-[#111827]">
                                {emp?.name ?? c.employeeId}
                              </div>
                              {c.isManuallyAdded ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="rounded-full bg-[#FEF9C3] px-2 py-0.5 text-[11px] font-semibold text-[#854D0E]">
                                    Thêm thủ công
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeSuccessor(selectedPosition.id, c.employeeId)}
                                    className="text-[#F87171] hover:text-[#DC2626]"
                                    aria-label="Gỡ"
                                    title="Gỡ"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : null}
                            </div>
                            <div className="truncate text-[13px] text-[#6B7280]">
                              {emp?.currentRoleTitle ?? "—"}
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <ReadinessBadge readiness={c.readiness} className="px-4 py-1.5" />
                          <div className="text-[13px] text-[#6B7280]">Ưu tiên #{idx + 1}</div>
                        </div>
                      </div>

                      {/* Gap indicator */}
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="text-[13px] text-[#6B7280] shrink-0">
                          Mức độ sẵn sàng:
                        </div>
                        <div className="flex-1">
                          <div className="h-2 w-full rounded-full bg-[#E5E7EB]">
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${ready}%`, background: gapTone.color }}
                            />
                          </div>
                        </div>
                        <div className="text-[13px] font-semibold text-[#374151] shrink-0">
                          {ready}% sẵn sàng
                        </div>
                      </div>
                      <div className="mt-2 text-[13px] text-[#6B7280]">{gapTone.label}</div>

                      {/* Strengths & dev needs */}
                      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#374151]">
                            <CheckCircle className="h-4 w-4 text-[#22C55E]" />
                            Điểm mạnh
                          </div>
                          <ul className="mt-2 space-y-1 text-[13px] text-[#374151]">
                            {c.strengths.map((s) => (
                              <li key={s} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                                <span>{s}</span>
                              </li>
                            ))}
                            {c.strengths.length === 0 ? (
                              <li className="text-[#6B7280]">—</li>
                            ) : null}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#374151]">
                            <TrendingUp className="h-4 w-4 text-[#F59E0B]" />
                            Cần phát triển
                          </div>
                          <ul className="mt-2 space-y-1 text-[13px] text-[#374151]">
                            {c.developmentNeeds.map((n) => (
                              <li key={n} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                                <span>{n}</span>
                              </li>
                            ))}
                            {c.developmentNeeds.length === 0 ? (
                              <li className="text-[#6B7280]">—</li>
                            ) : null}
                          </ul>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 border-t border-[#E5E7EB] pt-4 flex items-center justify-between gap-3">
                        <div className="text-[13px] text-[#6B7280]">
                          Đề cử bởi {c.nominatedBy} · {c.nominatedDate}
                        </div>
                        <Button asChild variant="outline" className="h-8 rounded-lg px-3 whitespace-nowrap">
                          <Link href={`/talent/${c.employeeId}`}>Xem hồ sơ →</Link>
                        </Button>
                      </div>

                      {/* KTP accordion (only now / 1-2yr) */}
                      {c.readiness === "now" || c.readiness === "1-2yr" ? (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenKtp((prev) => ({
                                ...prev,
                                [c.employeeId]: !prev[c.employeeId],
                              }))
                            }
                            className="w-full flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 hover:bg-white"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GitMerge className="h-4 w-4 text-[#4F46E5]" />
                              <div className="text-[13px] font-semibold text-[#374151] truncate">
                                Kế hoạch Chuyển giao Tri thức
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
                                {openKtp[c.employeeId] ? "Đóng" : "Mở"}
                              </span>
                              <ChevronDown
                                className={[
                                  "h-4 w-4 text-[#6B7280] transition",
                                  openKtp[c.employeeId] ? "rotate-180" : "",
                                ].join(" ")}
                              />
                            </div>
                          </button>

                          {openKtp[c.employeeId] ? (
                            <div className="mt-3">
                              <KnowledgeTransferPanel
                                positionId={selectedPosition.id}
                                holderId={selectedPosition.currentHolderId}
                                successorId={c.employeeId}
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <CandidateSearchModal
        open={searchModal.open}
        positionId={searchModal.positionId}
        onClose={() => setSearchModal({ open: false, positionId: null })}
        manualSuccessors={manualSuccessors}
        onAdd={(positionId, employeeId) => addSuccessor(positionId, employeeId)}
        employees={employees}
        positions={positions}
        successionMap={successionMap}
      />
    </div>
  );
}

function CandidateSearchModal(props: {
  open: boolean;
  positionId: string | null;
  onClose: () => void;
  manualSuccessors: Record<string, string[]>;
  onAdd: (positionId: string, employeeId: string) => void;
  employees: typeof employees;
  positions: typeof positions;
  successionMap: typeof successionMap;
}) {
  const { open, positionId, onClose, manualSuccessors, onAdd, employees, positions, successionMap } =
    props;

  const [nameQuery, setNameQuery] = React.useState("");
  const [tier, setTier] = React.useState<"all" | "core" | "potential" | "successor">("all");
  const [sort, setSort] = React.useState<"gap" | "overall" | "name">("gap");

  React.useEffect(() => {
    if (!open) return;
    setNameQuery("");
    setTier("all");
    setSort("gap");
  }, [open, positionId]);

  const position = React.useMemo(() => {
    if (!positionId) return null;
    return positions.find((p) => p.id === positionId) ?? null;
  }, [positionId, positions]);

  const requiredOverall = position ? requiredOverallScoreForPosition(position.level) : 85;

  const excludedIds = React.useMemo(() => {
    if (!positionId) return new Set<string>();
    const entry = successionMap.find((s) => s.positionId === positionId);
    const original = (entry?.candidates ?? []).map((c) => c.employeeId);
    const manual = manualSuccessors[positionId] ?? [];
    return new Set<string>([...(original ?? []), ...(manual ?? [])]);
  }, [manualSuccessors, positionId, successionMap]);

  const candidates = React.useMemo(() => {
    if (!open || !positionId || !position) return [];

    const holderId = position.currentHolderId;

    const list = employees
      .filter((e) => e.id !== holderId)
      .filter((e) => !excludedIds.has(e.id))
      .filter((e) => {
        if (!nameQuery.trim()) return true;
        return e.name.toLowerCase().includes(nameQuery.trim().toLowerCase());
      })
      .filter((e) => {
        if (tier === "all") return true;
        return e.tier === tier;
      })
      .map((e) => {
        const gapScore = requiredOverall - e.overallScore;
        return { employee: e, gapScore };
      });

    const sorted = [...list].sort((a, b) => {
      if (sort === "overall") return b.employee.overallScore - a.employee.overallScore;
      if (sort === "name") return a.employee.name.localeCompare(b.employee.name, "vi");
      // default: lowest gap first
      return a.gapScore - b.gapScore;
    });

    return sorted.slice(0, 10);
  }, [employees, excludedIds, nameQuery, open, position, positionId, requiredOverall, sort, tier]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-search-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[#E5E7EB] p-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Search className="h-[18px] w-[18px] shrink-0 text-[#4F46E5]" />
              <div id="candidate-search-modal-title" className="text-[18px] font-bold text-[#111827]">
                Tìm người kế thừa
              </div>
            </div>
            <div className="mt-1 truncate text-[13px] text-[#6B7280]">{position?.titleVi ?? "—"}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827]"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI SUGGESTION BANNER */}
        <div className="flex-shrink-0 border-b border-[#E5E7EB] px-6 py-3">
          <div className="rounded-lg border border-[#C7D2FE] bg-[#EEF2FF] px-4 py-3">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#4F46E5]" />
              <div className="text-[13px] text-[#374151]">
                AI gợi ý dựa trên gap score và assessment. Bạn có thể thêm bất kỳ ai từ danh sách.
              </div>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-6 py-3">
          <input
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Tìm theo tên..."
            className="h-9 max-w-full min-w-0 flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#A5B4FC] sm:max-w-[220px] sm:flex-none"
          />

          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as typeof tier)}
            className="h-9 w-full max-w-[130px] rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px]"
          >
            <option value="all">Tất cả</option>
            <option value="core">Nòng cốt</option>
            <option value="potential">Tiềm năng</option>
            <option value="successor">Kế thừa</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-9 w-full max-w-[170px] rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px]"
          >
            <option value="gap">Gap thấp nhất (phù hợp nhất)</option>
            <option value="overall">Overall score cao nhất</option>
            <option value="name">Tên A–Z</option>
          </select>
        </div>

        {/* CANDIDATE LIST */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {candidates.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-[#6B7280]">
              Không tìm thấy ứng viên phù hợp
            </div>
          ) : (
            <div>
              {candidates.map(({ employee: e, gapScore }) => {
                const alreadyAdded = (manualSuccessors[positionId ?? ""] ?? []).includes(e.id);
                const gapLabel =
                  gapScore <= 0
                    ? { text: "✓ Vượt yêu cầu", color: "#16A34A" }
                    : gapScore <= 15
                      ? { text: `${gapScore} điểm cần phát triển`, color: "#D97706" }
                      : { text: `${gapScore} điểm — cần đào tạo nhiều`, color: "#6B7280" };

                const overallPct = Math.max(0, Math.min(100, e.overallScore));

                return (
                  <div
                    key={e.id}
                    className="mb-2 flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3"
                  >
                    {/* Col 1 — Avatar + Info */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <EmployeeAvatar employee={e} size="sm" className="shrink-0" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[#111827]">{e.name}</div>
                        <div className="truncate text-xs text-gray-500">{e.currentRoleTitle ?? "—"}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <TierBadge tier={e.tier} className="scale-90 origin-left" />
                          <ReadinessBadge readiness={e.readiness} className="scale-90 origin-left" />
                        </div>
                      </div>
                    </div>

                    {/* Col 2 — Gap scores */}
                    <div className="w-44 shrink-0 text-sm">
                      <div className="text-[#374151]">
                        Overall: <span className="font-semibold">{e.overallScore}</span>/100
                      </div>
                      <div className="mt-1 h-1.5 max-w-[120px] rounded-full bg-[#E5E7EB]">
                        <div
                          className="h-1.5 rounded-full bg-[#22C55E]"
                          style={{ width: `${overallPct}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs leading-snug" style={{ color: gapLabel.color }}>
                        Gap: {gapLabel.text}
                      </div>
                    </div>

                    {/* Col 3 — Action */}
                    <div className="shrink-0">
                      {alreadyAdded ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#DCFCE7] px-3 py-1.5 text-sm font-semibold text-[#15803D]"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Đã thêm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!positionId) return;
                            onAdd(positionId, e.id);
                          }}
                          className="whitespace-nowrap rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white"
                        >
                          Thêm vào kế thừa
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-[#E5E7EB] px-6 py-4">
          <div className="pr-4 text-[12px] text-[#6B7280]">
            Đây là gợi ý — bạn có thể thêm bất kỳ ai và điều chỉnh sau
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 shrink-0 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#374151] hover:bg-[#F9FAFB]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

