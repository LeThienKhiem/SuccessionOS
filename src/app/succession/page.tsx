"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  Cpu,
  GitBranch,
  GitMerge,
  LayoutGrid,
  Search,
  Sparkles,
  Star,
  ChevronDown,
  UserCheck,
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
import type { Employee } from "@/data/types";

type Tab = "matrix" | "byPosition";

type AiSuggestion = {
  employeeId: string;
  fitScore: number;
  reason: string;
};

function requiredOverallScoreForPosition(level: string) {
  // Prototype heuristic: map role level -> target overall score threshold (0–100)
  if (level === "director") return 90;
  if (level === "manager") return 85;
  if (level === "lead") return 80;
  return 75;
}

function tierAvatarStyle(tier: string) {
  if (tier === "core") return "bg-[#EDE9FE] text-[#4F46E5]";
  if (tier === "potential") return "bg-[#DBEAFE] text-[#1D4ED8]";
  return "bg-[#CCFBF1] text-[#0F766E]";
}

function computeFitScore(e: Employee): number {
  let base = e.overallScore;
  if (e.riskScore > 50) base -= 10;
  if (e.idpStatus === "active") base += 5;
  return Math.max(0, Math.min(100, base));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function requiredOverallByLevel(level: string) {
  if (level === "director") return 90;
  if (level === "manager") return 85;
  if (level === "lead") return 80;
  return 75;
}

function computeFitScoreForPosition(level: string, emp: Employee) {
  const required = requiredOverallByLevel(level);
  const gapPenalty = Math.max(0, required - emp.overallScore) * 0.8; // demo heuristic (same as /positions)
  const idpBonus = emp.idpStatus === "active" ? 5 : 0;
  const riskPenalty =
    emp.riskScore >= 60 ? 12 : emp.riskScore >= 40 ? 8 : emp.riskScore >= 30 ? 5 : 2;
  return clamp(Math.round(emp.overallScore - gapPenalty + idpBonus - riskPenalty), 0, 100);
}

function mergedCandidatesForPosition(
  positionId: string,
  manualSuccessors: Record<string, string[]>
) {
  const pos = positions.find((p) => p.id === positionId) ?? positions[0];
  const selectedEntry = successionMap.find((s) => s.positionId === positionId);
  const originalCandidates = selectedEntry?.candidates ?? [];
  const addedIds = manualSuccessors[positionId] ?? [];
  const requiredOverall = requiredOverallScoreForPosition(pos.level);
  const addedCandidates = employees
    .filter((e) => addedIds.includes(e.id))
    .map((e) => {
      const gap = requiredOverall - e.overallScore;
      return {
        employeeId: e.id,
        readiness: e.readiness ?? "3-5yr",
        gapScore: gap,
        strengths: [] as string[],
        developmentNeeds: [] as string[],
        nominatedDate: "—",
        nominatedBy: "Thêm thủ công",
        isManuallyAdded: true as const,
      };
    });

  return [
    ...originalCandidates.map((c) => ({ ...c, isManuallyAdded: false as const })),
    ...addedCandidates,
  ];
}

function positionListMeta(positionId: string, manualSuccessors: Record<string, string[]>) {
  const list = mergedCandidatesForPosition(positionId, manualSuccessors);
  const count = list.length;
  const nowCount = list.filter((c) => c.readiness === "now").length;

  let dot = "#EF4444";
  if (count > 0 && nowCount < 2) dot = "#F59E0B";
  if (nowCount >= 2) dot = "#22C55E";

  let badge: { text: string; bg: string; textColor: string };
  if (count === 0) badge = { text: "0", bg: "#FEF2F2", textColor: "#EF4444" };
  else if (count === 1) badge = { text: "1", bg: "#FEF9C3", textColor: "#D97706" };
  else badge = { text: "2+", bg: "#F0FDF4", textColor: "#16A34A" };

  return { count, nowCount, dot, badge, subtitle: count === 0 ? "Chưa có ứng viên" : `${count} ứng viên` };
}

function hashHue(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}

function avatarGradient(id: string) {
  const h1 = hashHue(id);
  const h2 = (h1 + 42) % 360;
  return `linear-gradient(135deg, hsl(${h1} 85% 55%), hsl(${h2} 85% 45%))`;
}

function fitPctFromGap(gapScore: number) {
  return Math.max(0, Math.min(100, 100 - gapScore));
}

function fitBarGradient(pct: number) {
  if (pct >= 90) return "linear-gradient(90deg,#4ADE80,#22C55E)";
  if (pct >= 70) return "linear-gradient(90deg,#86EFAC,#4ADE80)";
  if (pct >= 50) return "linear-gradient(90deg,#FCD34D,#FBBF24)";
  return "linear-gradient(90deg,#FCA5A5,#F87171)";
}

function PositionList(props: {
  positions: typeof positions;
  selectedPositionId: string;
  onSelect: (id: string) => void;
  manualSuccessors: Record<string, string[]>;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRight: "1px solid #E5E7EB",
        overflowY: "auto",
        minHeight: 0,
        flex: "1 1 0%",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ padding: "16px", borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>
          12 Vị trí Then chốt
        </div>
      </div>

      <div>
        {props.positions.map((p) => {
          const meta = positionListMeta(p.id, props.manualSuccessors);
          const active = p.id === props.selectedPositionId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => props.onSelect(p.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 16px",
                borderBottom: "1px solid #F3F4F6",
                cursor: "pointer",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                background: active ? "#EEF2FF" : "transparent",
                borderLeft: active ? "3px solid #6366F1" : "3px solid transparent",
                paddingLeft: active ? "13px" : "16px",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget.style.background = "#F9FAFB");
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget.style.background = "transparent");
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "999px",
                      background: meta.dot,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: active ? 600 : 500,
                      color: active ? "#4F46E5" : "#111827",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.titleVi}
                  </div>
                </div>
                <div style={{ marginTop: "6px", paddingLeft: "16px", fontSize: "11px", color: "#6B7280" }}>
                  {meta.subtitle}
                </div>
              </div>

              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "999px",
                  background: meta.badge.bg,
                  color: meta.badge.textColor,
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {meta.badge.text}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PositionDetail(props: {
  selectedPosition: (typeof positions)[number];
  candidates: ReturnType<typeof mergedCandidatesForPosition>;
  currentHolder?: Employee;
  onAddClick: () => void;
  onAiSuggest: () => void;
  openKtp: Record<string, boolean>;
  setOpenKtp: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  removeSuccessor: (positionId: string, employeeId: string) => void;
}) {
  const list = props.candidates;
  const nowCount = list.filter((c) => c.readiness === "now").length;
  const count = list.length;

  const readinessPill =
    count === 0
      ? { text: "Chưa có kế thừa", bg: "#FEE2E2", color: "#991B1B" }
      : nowCount >= 2
        ? { text: "Sẵn sàng ngay", bg: "#DCFCE7", color: "#15803D" }
        : { text: "Cần thêm thời gian", bg: "#FEF9C3", color: "#92400E" };

  const riskForPosition = (() => {
    const holder = props.currentHolder;
    const emps = list
      .map((c) => employees.find((e) => e.id === c.employeeId))
      .filter(Boolean) as Employee[];
    const pool = holder ? [holder, ...emps] : emps;
    if (pool.length === 0) return { label: "—", color: "#6B7280" };
    const worst = pool.reduce((a, b) => (a.riskScore >= b.riskScore ? a : b));
    if (worst.riskLevel === "critical" || worst.riskLevel === "high")
      return { label: "Cao", color: "#DC2626" };
    if (worst.riskLevel === "medium") return { label: "Trung bình", color: "#D97706" };
    return { label: "Thấp", color: "#15803D" };
  })();

  return (
    <div
      style={{
        background: "#F9FAFB",
        padding: "24px",
        overflowY: "auto",
        minHeight: 0,
        flex: "1 1 0%",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="so-card" style={{ borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>{props.selectedPosition.titleVi}</div>
            <div style={{ marginTop: "6px", fontSize: "13px", color: "#6B7280" }}>{props.selectedPosition.title}</div>
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              borderRadius: "999px",
              padding: "6px 10px",
              fontSize: "12px",
              fontWeight: 700,
              background: readinessPill.bg,
              color: readinessPill.color,
              whiteSpace: "nowrap",
            }}
          >
            {readinessPill.text}
          </div>
        </div>

        <div style={{ marginTop: "12px", display: "flex", alignItems: "stretch", gap: "0" }}>
          <div style={{ flex: 1, paddingRight: "16px" }}>
            <div style={{ fontSize: "13px", color: "#6B7280" }}>Ứng viên kế thừa</div>
            <div style={{ marginTop: "6px", fontSize: "20px", fontWeight: 800, color: "#4F46E5" }}>{count}</div>
          </div>
          <div style={{ width: "1px", background: "#E5E7EB" }} />
          <div style={{ flex: 1, padding: "0 16px" }}>
            <div style={{ fontSize: "13px", color: "#6B7280" }}>Sẵn sàng ngay</div>
            <div style={{ marginTop: "6px", fontSize: "20px", fontWeight: 800, color: "#16A34A" }}>{nowCount}</div>
          </div>
          <div style={{ width: "1px", background: "#E5E7EB" }} />
          <div style={{ flex: 1, paddingLeft: "16px" }}>
            <div style={{ fontSize: "13px", color: "#6B7280" }}>Mức độ rủi ro</div>
            <div style={{ marginTop: "6px", fontSize: "20px", fontWeight: 800, color: riskForPosition.color }}>
              {riskForPosition.label}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>Danh sách ứng viên kế thừa</div>
        <button
          type="button"
          onClick={props.onAddClick}
          style={{
            border: "1px solid #E5E7EB",
            background: "#fff",
            borderRadius: "10px",
            padding: "8px 10px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#374151",
            cursor: "pointer",
          }}
        >
          + Thêm ứng viên
        </button>
      </div>

      <div style={{ marginTop: "12px" }}>
        {count === 0 ? (
          <div className="so-card" style={{ borderRadius: "12px", padding: "18px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "#FFFBEB",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <AlertCircle className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                  Vị trí này chưa có ứng viên kế thừa
                </div>
                <div style={{ marginTop: "6px", fontSize: "13px", color: "#6B7280" }}>
                  Hãy dùng AI để gợi ý nhanh các profile phù hợp (prototype).
                </div>
                <button
                  type="button"
                  onClick={props.onAiSuggest}
                  style={{
                    marginTop: "12px",
                    border: "1px solid #C7D2FE",
                    background: "#EEF2FF",
                    color: "#4F46E5",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  Xem gợi ý AI
                </button>
              </div>
            </div>
          </div>
        ) : (
          list.map((c, idx) => {
            const emp = employees.find((e) => e.id === c.employeeId);
            const pct = fitPctFromGap(c.gapScore);
            const riskCls = emp ? riskRetentionBadge(emp.riskLevel) : { label: "—", className: "bg-[#F3F4F6] text-[#6B7280]" };

            return (
              <div
                key={c.employeeId}
                className="so-card"
                style={{
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "10px",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#A5B4FC")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#E5E7EB")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "999px",
                      background: avatarGradient(c.employeeId),
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {emp?.initials ?? "?"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                            {emp?.name ?? c.employeeId}
                          </div>
                          {c.isManuallyAdded ? (
                            <button
                              type="button"
                              onClick={() => props.removeSuccessor(props.selectedPosition.id, c.employeeId)}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "#F87171",
                                cursor: "pointer",
                                padding: 0,
                              }}
                              aria-label="Gỡ"
                              title="Gỡ"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                        <div style={{ marginTop: "4px", fontSize: "12px", color: "#6B7280" }}>
                          {emp?.currentRoleTitle ?? "—"}
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: "#6B7280", flexShrink: 0 }}>#{idx + 1}</div>
                    </div>

                    <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {emp ? <TierBadge tier={emp.tier} /> : null}
                      <ReadinessBadge readiness={c.readiness} />
                      <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-bold text-[#4F46E5]">
                        Điểm: {emp?.overallScore ?? "—"}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${riskCls.className}`}>
                        Rủi ro: {emp?.riskScore ?? "—"}
                      </span>
                    </div>

                    {c.readiness === "now" || c.readiness === "1-2yr" ? (
                      <div style={{ marginTop: "12px" }}>
                        <button
                          type="button"
                          onClick={() =>
                            props.setOpenKtp((prev) => ({
                              ...prev,
                              [c.employeeId]: !prev[c.employeeId],
                            }))
                          }
                          className="w-full flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 hover:bg-[#F9FAFB]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <GitMerge className="h-4 w-4 text-[#4F46E5]" />
                            <div className="text-[12px] font-semibold text-[#374151] truncate">
                              Kế hoạch Chuyển giao Tri thức
                            </div>
                          </div>
                          <ChevronDown
                            className={[
                              "h-4 w-4 text-[#6B7280] transition",
                              props.openKtp[c.employeeId] ? "rotate-180" : "",
                            ].join(" ")}
                          />
                        </button>
                        {props.openKtp[c.employeeId] ? (
                          <div className="mt-2">
                            <KnowledgeTransferPanel
                              positionId={props.selectedPosition.id}
                              holderId={props.selectedPosition.currentHolderId}
                              successorId={c.employeeId}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ width: "180px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                      <div style={{ fontSize: "11px", color: "#6B7280" }}>Mức độ phù hợp</div>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "#111827" }}>{pct}%</div>
                    </div>
                    <div style={{ marginTop: "4px", height: "6px", borderRadius: "999px", background: "#F3F4F6" }}>
                      <div
                        style={{
                          height: "6px",
                          borderRadius: "999px",
                          width: `${pct}%`,
                          background: fitBarGradient(pct),
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                  <Button asChild variant="outline" className="h-8 rounded-lg px-3 whitespace-nowrap">
                    <Link href={`/talent/${c.employeeId}`}>Xem hồ sơ →</Link>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
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

function SuccessionByPositionTabContent(props: {
  manualSuccessors: Record<string, string[]>;
  openKtp: Record<string, boolean>;
  setOpenKtp: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setSearchModal: React.Dispatch<
    React.SetStateAction<{ open: boolean; positionId: string | null }>
  >;
  setAiPanel: React.Dispatch<React.SetStateAction<{ open: boolean; positionId: string | null }>>;
  removeSuccessor: (positionId: string, employeeId: string) => void;
}) {
  const [selectedPositionId, setSelectedPositionId] = React.useState<string>(() => {
    if (typeof window === "undefined") return "pos-pd";
    const p = new URLSearchParams(window.location.search).get("position");
    return p && positions.some((x) => x.id === p) ? p : "pos-pd";
  });

  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("position");
    if (p && positions.some((x) => x.id === p)) setSelectedPositionId(p);
  }, []);

  const selectedPosition = positions.find((p) => p.id === selectedPositionId) ?? positions[0];
  const candidates = mergedCandidatesForPosition(selectedPosition.id, props.manualSuccessors);
  const currentHolder = employees.find((e) => e.id === selectedPosition.currentHolderId);

  return (
    <div
      className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden"
      style={{
        height: "calc(100vh - 200px)",
        maxHeight: "calc(100vh - 200px)",
        minHeight: "520px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: 0,
          height: "100%",
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <div
          style={{
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: "#fff",
          }}
        >
          <PositionList
            positions={positions}
            selectedPositionId={selectedPositionId}
            onSelect={setSelectedPositionId}
            manualSuccessors={props.manualSuccessors}
          />
        </div>
        <div
          style={{
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: "#F9FAFB",
          }}
        >
          <PositionDetail
            selectedPosition={selectedPosition}
            candidates={candidates}
            currentHolder={currentHolder}
            onAddClick={() => props.setSearchModal({ open: true, positionId: selectedPosition.id })}
            onAiSuggest={() => props.setAiPanel({ open: true, positionId: selectedPosition.id })}
            openKtp={props.openKtp}
            setOpenKtp={props.setOpenKtp}
            removeSuccessor={props.removeSuccessor}
          />
        </div>
      </div>
    </div>
  );
}

export default function SuccessionPage() {
  const [tab, setTab] = React.useState<Tab>("byPosition");
  const [openKtp, setOpenKtp] = React.useState<Record<string, boolean>>({});

  const [aiPanel, setAiPanel] = React.useState<{ open: boolean; positionId: string | null }>({
    open: false,
    positionId: null,
  });
  const [aiBackfills, setAiBackfills] = React.useState<Record<string, string[]>>({});

  const [searchModal, setSearchModal] = React.useState<{
    open: boolean;
    positionId: string | null;
  }>({ open: false, positionId: null });

  // Track manual successors được add (prototype - in-memory only)
  const [manualSuccessors, setManualSuccessors] = React.useState<Record<string, string[]>>({});

  const [toast, setToast] = React.useState<null | { text: string }>(null);
  const showToast = React.useCallback((text: string) => {
    setToast({ text });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  React.useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("tab");
    if (t === "2" || t === "byPosition") setTab("byPosition");
    if (t === "1" || t === "matrix") setTab("matrix");
  }, []);

  const aiPanelPosition = aiPanel.positionId
    ? positions.find((p) => p.id === aiPanel.positionId) ?? null
    : null;

  const aiSuggestions: AiSuggestion[] = React.useMemo(() => {
    if (!aiPanelPosition) return [];

    // Hard-coded demo story (same as /positions)
    if (aiPanelPosition.id === "pos-fd" || aiPanelPosition.id === "pos-bdm") {
      return [
        { employeeId: "emp-019", fitScore: 91, reason: "Kỹ thuật vững, đang deputy 2 năm, IDP 75%" },
        { employeeId: "emp-010", fitScore: 74, reason: "Tiềm năng cao, cần thêm 18 tháng" },
        { employeeId: "emp-002", fitScore: 68, reason: "Kỹ thuật xuất sắc nhưng risk score 35" },
      ];
    }

    const entry = successionMap.find((s) => s.positionId === aiPanelPosition.id);
    const manual = manualSuccessors[aiPanelPosition.id] ?? [];
    const excluded = new Set<string>([
      aiPanelPosition.currentHolderId,
      ...(entry?.candidates.map((c) => c.employeeId) ?? []),
      ...manual,
      ...(aiBackfills[aiPanelPosition.id] ?? []),
    ]);

    return employees
      .filter((e) => !excluded.has(e.id))
      .map((e) => ({
        employeeId: e.id,
        fitScore: computeFitScoreForPosition(aiPanelPosition.level, e),
        reason:
          e.idpStatus === "active"
            ? "IDP đang active, có thể tăng tốc phát triển"
            : "Có nền tảng tốt, cần bổ sung theo kế hoạch 70-20-10",
      }))
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, 3);
  }, [aiBackfills, aiPanelPosition, manualSuccessors]);

  function addSuccessorsBulk(positionId: string, employeeIds: string[]) {
    if (employeeIds.length === 0) return;
    setManualSuccessors((prev) => {
      const curr = new Set(prev[positionId] ?? []);
      for (const id of employeeIds) curr.add(id);
      return { ...prev, [positionId]: Array.from(curr) };
    });
  }

  function addAiBackfill(positionId: string, employeeId: string) {
    const emp = employees.find((e) => e.id === employeeId);
    const pos = positions.find((p) => p.id === positionId);
    setAiBackfills((prev) => {
      const curr = prev[positionId] ?? [];
      if (curr.includes(employeeId)) return prev;
      return { ...prev, [positionId]: [employeeId, ...curr] };
    });
    addSuccessorsBulk(positionId, [employeeId]);
    showToast(`Đã thêm ${emp?.name ?? employeeId} vào danh sách kế thừa ${pos?.titleVi ?? positionId}`);
  }

  function removeSuccessor(positionId: string, employeeId: string) {
    setManualSuccessors((prev) => {
      const nextMap = { ...prev };
      const filtered = (nextMap[positionId] ?? []).filter((id) => id !== employeeId);
      if (filtered.length === 0) delete nextMap[positionId];
      else nextMap[positionId] = filtered;
      return nextMap;
    });
    setAiBackfills((prev) => {
      const nextMap = { ...prev };
      const filtered = (nextMap[positionId] ?? []).filter((id) => id !== employeeId);
      if (filtered.length === 0) delete nextMap[positionId];
      else nextMap[positionId] = filtered;
      return nextMap;
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
    <div className="w-full space-y-6">
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
        <SuccessionByPositionTabContent
          manualSuccessors={manualSuccessors}
          openKtp={openKtp}
          setOpenKtp={setOpenKtp}
          setSearchModal={setSearchModal}
          setAiPanel={setAiPanel}
          removeSuccessor={removeSuccessor}
        />
      )}

      {/* AI slide panel (same pattern as /positions) */}
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
                {aiPanelPosition?.titleVi ?? "—"}
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
            {aiSuggestions.map((sug, idx) => {
              const e = employees.find((x) => x.id === sug.employeeId);
              const alreadyAdded = !!(
                aiPanel.positionId &&
                (manualSuccessors[aiPanel.positionId] ?? []).includes(sug.employeeId)
              );
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
                            addAiBackfill(aiPanel.positionId, sug.employeeId);
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

      <CandidateSearchModal
        open={searchModal.open}
        positionId={searchModal.positionId}
        onClose={() => setSearchModal({ open: false, positionId: null })}
        manualSuccessors={manualSuccessors}
        employees={employees}
        positions={positions}
        successionMap={successionMap}
        onBulkAdd={(positionId, employeeIds, positionTitleVi) => {
          addSuccessorsBulk(positionId, employeeIds);
          showToast(
            `Đã thêm ${employeeIds.length} ứng viên vào danh sách kế thừa ${positionTitleVi}`
          );
        }}
      />

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[60] rounded-lg bg-[#111827] px-5 py-3 text-[14px] text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

function departmentName(departmentId: string) {
  return departments.find((d) => d.id === departmentId)?.name ?? "—";
}

function fitScoreBarColor(score: number) {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function riskRetentionBadge(level: Employee["riskLevel"]) {
  if (level === "low")
    return { label: "Thấp", className: "bg-[#DCFCE7] text-[#15803D]" };
  if (level === "medium")
    return { label: "TB", className: "bg-[#FEF9C3] text-[#854D0E]" };
  if (level === "high")
    return { label: "Cao", className: "bg-[#FEE2E2] text-[#DC2626]" };
  return { label: "Rất cao", className: "bg-[#DC2626] text-white" };
}

function readinessCell(readiness: Employee["readiness"]) {
  if (readiness === "now")
    return { text: "Sẵn sàng ngay", color: "#15803D" };
  if (readiness === "1-2yr")
    return { text: "Trung hạn 1–2 năm", color: "#B45309" };
  return { text: "Dài hạn 3–5 năm", color: "#6B7280" };
}

function CandidateSearchModal(props: {
  open: boolean;
  positionId: string | null;
  onClose: () => void;
  manualSuccessors: Record<string, string[]>;
  onBulkAdd: (positionId: string, employeeIds: string[], positionTitleVi: string) => void;
  employees: typeof employees;
  positions: typeof positions;
  successionMap: typeof successionMap;
}) {
  const { open, positionId, onClose, manualSuccessors, onBulkAdd, employees, positions, successionMap } =
    props;

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [filters, setFilters] = React.useState<{
    minFitScore: number;
    maxRisk: string;
    idpActive: boolean;
  }>({ minFitScore: 0, maxRisk: "all", idpActive: false });

  const [openExpandSearch, setOpenExpandSearch] = React.useState(false);
  const [openBasic, setOpenBasic] = React.useState(true);
  const [openAdvanced, setOpenAdvanced] = React.useState(false);
  const [criteriaQuery, setCriteriaQuery] = React.useState("");
  const [basic, setBasic] = React.useState({
    dept: false,
    tier: false,
    title: false,
    readiness: false,
    manager: false,
  });
  const [advRiskLt30, setAdvRiskLt30] = React.useState(false);
  const [advKtp, setAdvKtp] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setSelectedIds([]);
    setCurrentPage(1);
    setFilters({ minFitScore: 0, maxRisk: "all", idpActive: false });
    setCriteriaQuery("");
    setOpenExpandSearch(false);
    setOpenBasic(true);
    setOpenAdvanced(false);
    setBasic({
      dept: false,
      tier: false,
      title: false,
      readiness: false,
      manager: false,
    });
    setAdvRiskLt30(false);
    setAdvKtp(false);
  }, [open, positionId]);

  const position = React.useMemo(() => {
    if (!positionId) return null;
    return positions.find((p) => p.id === positionId) ?? null;
  }, [positionId, positions]);

  const excludedIds = React.useMemo(() => {
    if (!positionId) return new Set<string>();
    const entry = successionMap.find((s) => s.positionId === positionId);
    const original = (entry?.candidates ?? []).map((c) => c.employeeId);
    const manual = manualSuccessors[positionId] ?? [];
    return new Set<string>([...(original ?? []), ...(manual ?? [])]);
  }, [manualSuccessors, positionId, successionMap]);

  const filteredEmployees = React.useMemo(() => {
    if (!open || !positionId || !position) return [];

    const holderId = position.currentHolderId;
    const holder = employees.find((e) => e.id === holderId);

    let list = employees.filter((e) => e.id !== holderId).filter((e) => !excludedIds.has(e.id));

    const q =
      openExpandSearch && criteriaQuery.trim()
        ? criteriaQuery.trim().toLowerCase()
        : "";
    if (q) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          (e.currentRoleTitle ?? "").toLowerCase().includes(q)
      );
    }

    if (basic.dept) list = list.filter((e) => e.departmentId === position.departmentId);
    if (basic.tier) list = list.filter((e) => e.tier === "potential" || e.tier === "successor");
    if (basic.title) list = list.filter((e) => (e.currentRoleTitle ?? "").trim().length > 0);
    if (basic.readiness)
      list = list.filter((e) => e.readiness === "now" || e.readiness === "1-2yr");
    if (basic.manager && holderId) list = list.filter((e) => e.mentorId === holderId);

    if (advRiskLt30) list = list.filter((e) => e.riskScore < 30);
    if (filters.idpActive) list = list.filter((e) => e.idpStatus === "active");
    if (advKtp && holder?.currentProjectId) {
      const pid = holder.currentProjectId;
      list = list.filter(
        (e) =>
          e.currentProjectId === pid &&
          (e.readiness === "now" || e.readiness === "1-2yr")
      );
    }

    list = list.filter((e) => computeFitScore(e) >= filters.minFitScore);
    if (filters.maxRisk !== "all") {
      list = list.filter((e) => e.riskLevel === filters.maxRisk);
    }

    list.sort((a, b) => computeFitScore(b) - computeFitScore(a));
    return list;
  }, [
    advKtp,
    advRiskLt30,
    basic,
    employees,
    excludedIds,
    filters.idpActive,
    filters.maxRisk,
    filters.minFitScore,
    open,
    openExpandSearch,
    position,
    positionId,
    criteriaQuery,
  ]);

  const pageSize = 10;
  const total = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageSlice = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, safePage]);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const expandCriteriaCount = openExpandSearch && criteriaQuery.trim() ? 1 : 0;

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function addAllSelected() {
    if (!positionId || !position || selectedIds.length === 0) return;
    onBulkAdd(positionId, selectedIds, position.titleVi);
    setSelectedIds([]);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-search-modal-title"
    >
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
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

      {/* Two columns — full remaining viewport */}
      <div className="flex min-h-0 flex-1 flex-row">
        {/* Left — filter panel */}
        <aside className="flex w-[min(360px,32vw)] min-w-[260px] shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB]">
            <div className="flex-1 overflow-y-auto p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#111827]">Bộ tiêu chuẩn</span>
                  <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-semibold text-[#15803D]">
                    Đã thiết lập
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[#6B7280]">{position?.titleVi ?? "—"}</p>
                <div className="mt-2 flex flex-wrap gap-[6px]">
                  <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[12px] text-[#4F46E5]">
                    Hiệu suất (1)
                  </span>
                  <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[12px] text-[#4F46E5]">
                    Năng lực (1)
                  </span>
                  <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[12px] text-[#4F46E5]">
                    Tiềm năng (1)
                  </span>
                  <span className="rounded-full bg-[#FEE2E2] px-3 py-1 text-[12px] text-[#DC2626]">
                    Rủi ro (1)
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-[#E5E7EB] pt-4">
                <button
                  type="button"
                  onClick={() => setOpenExpandSearch((v) => !v)}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <span className="text-[13px] font-semibold text-[#111827]">
                    Tìm kiếm mở rộng ({expandCriteriaCount})
                  </span>
                  <ChevronDown
                    className={[
                      "h-4 w-4 shrink-0 text-[#6B7280] transition",
                      openExpandSearch ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>
                {openExpandSearch ? (
                  <input
                    value={criteriaQuery}
                    onChange={(e) => setCriteriaQuery(e.target.value)}
                    placeholder="Tên tiêu chí..."
                    className="mt-2 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#A5B4FC]"
                  />
                ) : null}
              </div>

              <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                <button
                  type="button"
                  onClick={() => setOpenBasic((v) => !v)}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <span className="text-[13px] font-semibold text-[#111827]">Thông tin cơ bản</span>
                  <ChevronDown
                    className={[
                      "h-4 w-4 shrink-0 text-[#6B7280] transition",
                      openBasic ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>
                {openBasic ? (
                  <div className="mt-3 flex flex-col gap-1.5 text-[13px] text-[#374151]">
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={basic.dept}
                        onChange={(e) => setBasic((b) => ({ ...b, dept: e.target.checked }))}
                        className="h-3.5 w-3.5 rounded border-[#D1D5DB] accent-[#4F46E5]"
                      />
                      Phòng ban (Hiện tại)
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={basic.tier}
                        onChange={(e) => setBasic((b) => ({ ...b, tier: e.target.checked }))}
                        className="h-3.5 w-3.5 rounded border-[#D1D5DB] accent-[#4F46E5]"
                      />
                      Tầng nhân sự
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={basic.title}
                        onChange={(e) => setBasic((b) => ({ ...b, title: e.target.checked }))}
                        className="h-3.5 w-3.5 rounded border-[#D1D5DB] accent-[#4F46E5]"
                      />
                      Chức danh hiện tại
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={basic.readiness}
                        onChange={(e) => setBasic((b) => ({ ...b, readiness: e.target.checked }))}
                        className="h-3.5 w-3.5 rounded border-[#D1D5DB] accent-[#4F46E5]"
                      />
                      Readiness level
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={basic.manager}
                        onChange={(e) => setBasic((b) => ({ ...b, manager: e.target.checked }))}
                        className="h-3.5 w-3.5 rounded border-[#D1D5DB] accent-[#4F46E5]"
                      />
                      Quản lý trực tiếp
                    </label>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                <button
                  type="button"
                  onClick={() => setOpenAdvanced((v) => !v)}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <span className="text-[13px] font-semibold text-[#111827]">Thông tin nâng cao</span>
                  <ChevronDown
                    className={[
                      "h-4 w-4 shrink-0 text-[#6B7280] transition",
                      openAdvanced ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>
                {openAdvanced ? (
                  <div className="mt-3 flex flex-col gap-1.5 text-[13px] text-[#374151]">
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={advRiskLt30}
                        onChange={(e) => setAdvRiskLt30(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-[#D1D5DB] accent-[#4F46E5]"
                      />
                      Risk score &lt; 30
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={filters.idpActive}
                        onChange={(e) => setFilters((f) => ({ ...f, idpActive: e.target.checked }))}
                        className="h-3.5 w-3.5 rounded border-[#D1D5DB] accent-[#4F46E5]"
                      />
                      IDP đang active
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={advKtp}
                        onChange={(e) => setAdvKtp(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-[#D1D5DB] accent-[#4F46E5]"
                      />
                      Có KTP với holder
                    </label>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 border-t border-[#E5E7EB] p-5">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="w-full rounded-lg bg-[#4F46E5] py-2 text-[14px] font-semibold text-white"
              >
                Tìm kiếm
              </button>
            </div>
        </aside>

        {/* Right — results */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <div className="text-[14px] font-semibold text-[#111827]">
                Kết quả tìm kiếm: {total} ứng viên
              </div>
              {selectedIds.length > 0 ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[12px] font-semibold text-[#4F46E5]">
                    {selectedIds.length} đã chọn
                  </span>
                  <button
                    type="button"
                    onClick={addAllSelected}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-transparent bg-[#4F46E5] px-3 py-1.5 text-[13px] font-semibold text-white"
                  >
                    <UserCheck className="h-4 w-4" />
                    Thêm vào kế thừa
                  </button>
                </div>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto p-0">
              <table className="w-full min-w-[890px] table-fixed border-collapse text-left">
                <thead className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-white">
                  <tr className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
                    <th className="w-10 px-2 py-3" />
                    <th className="w-[220px] py-3 pl-2 pr-2">Nhân viên</th>
                    <th className="w-[110px] py-3 pr-2">Phòng ban</th>
                    <th className="w-[150px] py-3 pr-2">Chức danh</th>
                    <th className="w-[130px] py-3 pr-2">Mức độ phù hợp</th>
                    <th className="w-[130px] py-3 pr-2">Sẵn sàng</th>
                    <th className="w-[110px] py-3 pr-3">Rủi ro rời đi</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[13px] text-[#6B7280]">
                        Không tìm thấy ứng viên phù hợp
                      </td>
                    </tr>
                  ) : (
                    pageSlice.map((e) => {
                      const fit = computeFitScore(e);
                      const barW = `${fit}%`;
                      const barColor = fitScoreBarColor(fit);
                      const rCell = readinessCell(e.readiness);
                      const risk = riskRetentionBadge(e.riskLevel);
                      const checked = selectedIds.includes(e.id);
                      return (
                        <tr
                          key={e.id}
                          className={[
                            "border-b border-[#F3F4F6] transition hover:bg-[#F9FAFB]",
                            checked ? "bg-[#F5F3FF]" : "",
                          ].join(" ")}
                        >
                          <td className="w-10 px-2 py-3 align-middle">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelected(e.id)}
                              className="h-3.5 w-3.5 rounded border-[#D1D5DB] accent-[#4F46E5]"
                              aria-label={`Chọn ${e.name}`}
                            />
                          </td>
                          <td className="py-3 pl-2 pr-2 align-middle">
                            <div className="flex items-center gap-2">
                              <EmployeeAvatar employee={e} size="sm" className="shrink-0" />
                              <div className="min-w-0">
                                <div className="truncate text-[13px] font-medium text-[#111827]">
                                  {e.name}
                                </div>
                                <div className="truncate text-[11px] text-gray-500">{e.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-2 align-middle text-[13px] text-gray-500">
                            <span className="line-clamp-2">{departmentName(e.departmentId)}</span>
                          </td>
                          <td className="py-3 pr-2 align-middle text-[13px] text-[#374151]">
                            <span className="line-clamp-2">{e.currentRoleTitle ?? "—"}</span>
                          </td>
                          <td className="py-3 pr-2 align-middle">
                            <div className="h-1.5 w-[80px] rounded-full bg-[#E5E7EB]">
                              <div
                                className="h-1.5 rounded-full"
                                style={{ width: barW, background: barColor }}
                              />
                            </div>
                            <div className="mt-1 text-[12px] font-semibold text-[#111827]">{fit}%</div>
                          </td>
                          <td className="py-3 pr-2 align-middle">
                            <span className="text-[12px]" style={{ color: rCell.color }}>
                              {rCell.text}
                            </span>
                          </td>
                          <td className="py-3 pr-3 align-middle">
                            <span
                              className={[
                                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                risk.className,
                              ].join(" ")}
                            >
                              {risk.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-[#E5E7EB] px-5 py-3">
              <div className="text-[12px] text-[#6B7280]">
                {total === 0 ? (
                  <>Hiển thị 0 / 0 ứng viên</>
                ) : (
                  <>
                    Hiển thị {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, total)} /{" "}
                    {total} ứng viên
                  </>
                )}
              </div>
              {total > pageSize ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[13px] text-[#374151] disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[13px] text-[#374151] disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
    </div>
  );
}

