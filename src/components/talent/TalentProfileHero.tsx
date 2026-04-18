"use client";

import * as React from "react";

import type { Assessment, Employee, IDP, Position } from "@/data/types";
import type { KnowledgeTransferPlan } from "@/data/knowledgeTransfer";
import { employees } from "@/data/employees";
import { departments, positions } from "@/data/positions";
import { successionMap } from "@/data/succession";
import { mentoringPairs } from "@/data/mentoring";
import { ReadinessBadge } from "@/components/ReadinessBadge";
import { TierBadge } from "@/components/TierBadge";
import { cn } from "@/lib/utils";

type PositionLevel = Position["level"];

function positionLevelVi(level: PositionLevel): string {
  const m: Record<PositionLevel, string> = {
    director: "Giám đốc",
    manager: "Quản lý",
    lead: "Lead",
    senior: "Senior",
  };
  return m[level];
}

function idGradientStyle(id: string): React.CSSProperties {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i) * (i + 3)) % 360;
  }
  const h2 = (h + 48) % 360;
  return {
    background: `linear-gradient(135deg, hsl(${h}, 72%, 52%), hsl(${h2}, 68%, 42%))`,
  };
}

/** Ngày vào ước lượng từ thâm niên (mốc 18/04/2026) */
function approxJoinDate(emp: Employee): string {
  const ref = new Date(2026, 3, 18);
  const jd = new Date(ref);
  jd.setFullYear(jd.getFullYear() - emp.yearsAtCompany);
  const d = String(jd.getDate()).padStart(2, "0");
  const m = String(jd.getMonth() + 1).padStart(2, "0");
  const y = jd.getFullYear();
  return `${d}/${m}/${y}`;
}

function tenureVi(emp: Employee): string {
  return `${emp.yearsAtCompany} năm`;
}

function readinessTimeCardMain(readiness: Employee["readiness"]): string {
  if (readiness === "now") return "Sẵn sàng ngay";
  if (readiness === "1-2yr") return "~12–24 tháng";
  if (readiness === "3-5yr") return "~36–60 tháng";
  return "Chưa xác định";
}

function findSuccessorNominatedPosition(employeeId: string): Position | undefined {
  for (const entry of successionMap) {
    if (entry.candidates.some((c) => c.employeeId === employeeId)) {
      return positions.find((p) => p.id === entry.positionId);
    }
  }
  return undefined;
}

function companyRankLabel(overall: number): string {
  const n = employees.length;
  if (n === 0) return "—";
  const better = employees.filter((e) => e.overallScore > overall).length;
  const topPct = (better / n) * 100;
  if (topPct <= 5) return "Top 5% toàn công ty";
  if (topPct <= 15) return "Top 15% toàn công ty";
  if (topPct <= 30) return "Top 30% toàn công ty";
  if (topPct <= 50) return "Top 50% toàn công ty";
  return "Trên trung bình toàn công ty";
}

function riskSubLabel(score: number): string {
  if (score > 70) return "Rất cao — ưu tiên xử lý";
  if (score > 50) return "Cao — cần chú ý";
  if (score > 35) return "Trung bình — theo dõi";
  return "Thấp — ổn định";
}

function idpPill(employee: Employee, idp?: IDP) {
  if (employee.idpStatus === "not-started" && !idp) {
    return {
      label: "IDP: —",
      className: "bg-gray-50 text-gray-600 border-gray-200",
    };
  }
  const pct = idp?.progress ?? employee.idpProgress;
  const status = idp?.status ?? employee.idpStatus;
  const up = status === "active" && pct > 0;
  if (employee.idpStatus === "active" || status === "active") {
    return {
      label: `IDP: ${pct}%${up ? " ↑" : ""}`,
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
  }
  if (status === "review") {
    return { label: `IDP: ${pct}%`, className: "bg-amber-50 text-amber-900 border-amber-200" };
  }
  if (status === "completed") {
    return { label: "IDP: 100%", className: "bg-indigo-50 text-indigo-800 border-indigo-200" };
  }
  return { label: `IDP: ${pct}%`, className: "bg-gray-50 text-gray-600 border-gray-200" };
}

function ktpProgressForEmployee(ktp: KnowledgeTransferPlan | undefined, employeeId: string): number | null {
  if (!ktp) return null;
  if (ktp.holderId === employeeId) return ktp.holderProgress;
  if (ktp.successorId === employeeId) return ktp.successorProgress;
  return null;
}

function mentorContext(employee: Employee) {
  const pair =
    mentoringPairs.find((p) => p.menteeId === employee.id && p.status === "active") ??
    mentoringPairs.find((p) => p.menteeId === employee.id);

  const fromField = employee.mentorId ? employees.find((e) => e.id === employee.mentorId) : undefined;
  const fromPair = pair ? employees.find((e) => e.id === pair.mentorId) : undefined;
  const mentor = fromField ?? fromPair;
  const hoursDone = pair?.completedHours;
  const hoursTarget = pair?.commitmentHours;
  const hoursLabel =
    hoursDone != null && hoursTarget != null ? `${hoursDone}/${hoursTarget}h` : null;
  const barPct =
    hoursTarget && hoursTarget > 0
      ? Math.min(100, Math.round(((hoursDone ?? 0) / hoursTarget) * 100))
      : 0;

  return { mentor, hoursLabel, barPct };
}

function MiniMetricBar({
  label,
  valueLabel,
  pct,
  gradient,
}: {
  label: string;
  valueLabel: string;
  pct: number;
  gradient: string;
}) {
  const w = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-[#6B7280]">
        <span>{label}</span>
        <span className="font-bold text-[#374151]">{valueLabel}</span>
      </div>
      <div className="h-[5px] overflow-hidden rounded-full bg-[#F3F4F6]">
        <div className="h-full rounded-full" style={{ width: `${w}%`, background: gradient }} />
      </div>
    </div>
  );
}

type MiniCardProps = {
  borderLeftClass: string;
  bg?: string;
  children: React.ReactNode;
};

function MiniStatCard({ borderLeftClass, bg, children }: MiniCardProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[90px] flex-col rounded-lg border border-gray-200 border-l-[3px] p-3 shadow-sm",
        borderLeftClass,
        bg ?? "bg-white"
      )}
    >
      {children}
    </div>
  );
}

export function TalentProfileHero({
  employee,
  assessment,
  idp,
  ktp,
}: {
  employee: Employee;
  assessment?: Assessment;
  idp?: IDP;
  ktp?: KnowledgeTransferPlan;
}) {
  const dept = departments.find((d) => d.id === employee.departmentId);
  const position = positions.find((p) => p.id === employee.positionId);
  const fromEmployee = employee.targetPositionId
    ? positions.find((p) => p.id === employee.targetPositionId)
    : undefined;
  const fromIdp =
    !fromEmployee && idp?.targetPositionId
      ? positions.find((p) => p.id === idp.targetPositionId)
      : undefined;
  const fromSuccession =
    !fromEmployee && !fromIdp ? findSuccessorNominatedPosition(employee.id) : undefined;

  const resolvedTarget = fromEmployee ?? fromIdp ?? fromSuccession;
  const targetHeadline = resolvedTarget?.title ?? resolvedTarget?.titleVi ?? "Chưa xác định";
  const targetSub =
    fromEmployee != null
      ? "Kế thừa ưu tiên"
      : fromIdp != null
        ? "Theo IDP"
        : fromSuccession != null
          ? "Ứng viên kế thừa"
          : "Chưa có mục tiêu";

  const overall = assessment?.overall ?? employee.overallScore;
  const risk = employee.riskScore;
  const idpP = idpPill(employee, idp);
  const perf = assessment?.performance ?? employee.performanceScore;
  const pot = assessment?.potential ?? employee.potentialScore;
  const idpPct = idp?.progress ?? employee.idpProgress;
  const ktpPct = ktpProgressForEmployee(ktp, employee.id);

  const riskCardBg = risk > 50 ? "bg-[#FFF1F2]" : undefined;
  const hasConcreteTarget = Boolean(fromEmployee ?? fromIdp ?? fromSuccession);

  const { mentor, hoursLabel, barPct } = mentorContext(employee);
  const mentorInitials = mentor?.initials?.slice(0, 3) ?? "—";

  const metaRows = [
    { label: "Ngày vào", value: approxJoinDate(employee) },
    { label: "Thâm niên", value: tenureVi(employee) },
    { label: "Email", value: employee.email },
  ];

  return (
    <div className="so-card rounded-xl p-6">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:gap-6">
        {/* ZONE 1 — Identity */}
        <div className="flex h-full min-w-0 flex-col gap-3 lg:w-[240px]">
          <div className="flex items-center gap-3">
            <div
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white shadow-md"
              style={idGradientStyle(employee.id)}
              aria-hidden
            >
              {employee.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[18px] font-bold leading-tight text-gray-900">{employee.name}</div>
              <div className="mt-0.5 truncate text-[13px] text-[#6B7280]">
                {employee.currentRoleTitle || position?.titleVi || "—"}
              </div>
              <div className="mt-0.5 truncate text-[12px] text-[#9CA3AF]">
                {[dept?.name, position ? positionLevelVi(position.level) : null].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>

          <div className="h-px bg-[#F3F4F6]" />

          <div className="flex flex-col gap-2">
            {metaRows.map((row) => (
              <div key={row.label} className="flex justify-between gap-2 text-[12px]">
                <span className="shrink-0 text-[#9CA3AF]">{row.label}</span>
                <span className="min-w-0 truncate text-right font-medium text-[#374151]" title={row.value}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ZONE 2 — Quick metrics (fills middle) */}
        <div className="flex h-full min-h-0 min-w-0 flex-col justify-between gap-4 border-0 border-[#F3F4F6] py-1 lg:border-x lg:px-4">
          <div className="flex flex-wrap gap-1.5">
            <TierBadge tier={employee.tier} />
            <ReadinessBadge readiness={employee.readiness} />
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-semibold",
                idpP.className
              )}
            >
              {idpP.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
            <MiniMetricBar
              label="Hiệu suất"
              valueLabel={`${perf}/100`}
              pct={perf}
              gradient="linear-gradient(90deg,#A78BFA,#7C3AED)"
            />
            <MiniMetricBar
              label="Tiềm năng"
              valueLabel={`${pot}/100`}
              pct={pot}
              gradient="linear-gradient(90deg,#60A5FA,#2563EB)"
            />
            <MiniMetricBar
              label="IDP"
              valueLabel={`${idpPct}%`}
              pct={idpPct}
              gradient="linear-gradient(90deg,#FBBF24,#D97706)"
            />
            <MiniMetricBar
              label="KTP"
              valueLabel={ktpPct != null ? `${ktpPct}%` : "—"}
              pct={ktpPct ?? 0}
              gradient="linear-gradient(90deg,#34D399,#059669)"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-[#F9FAFB] px-2.5 py-2 text-[12px]">
            {mentor ? (
              <>
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={idGradientStyle(mentor.id)}
                >
                  {mentorInitials}
                </div>
                <span className="text-[#6B7280]">Mentor:</span>
                <span className="min-w-0 truncate font-semibold text-[#374151]">{mentor.name}</span>
                {hoursLabel ? (
                  <span className="ml-auto shrink-0 text-[#9CA3AF]">{hoursLabel}</span>
                ) : (
                  <span className="ml-auto shrink-0 text-[#9CA3AF]">—</span>
                )}
                <div className="h-1 w-10 shrink-0 overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div className="h-full rounded-full bg-[#34D399]" style={{ width: `${barPct}%` }} />
                </div>
              </>
            ) : (
              <span className="text-[#9CA3AF]">Chưa có mentor được gán</span>
            )}
          </div>
        </div>

        {/* ZONE 3 — Stat cards */}
        <div className="grid h-full w-full shrink-0 grid-cols-2 gap-2 auto-rows-[minmax(90px,1fr)] lg:w-[300px]">
          <MiniStatCard borderLeftClass="border-l-[#6366F1]">
            <div className="text-[26px] font-extrabold leading-none tracking-tight text-gray-900">{overall}</div>
            <div className="mt-1 text-[11px] font-semibold text-[#6B7280]">Điểm tổng hợp</div>
            <div className="mt-auto pt-1.5 text-[10px] leading-snug text-gray-500">{companyRankLabel(overall)}</div>
          </MiniStatCard>

          <MiniStatCard borderLeftClass="border-l-[#EF4444]" bg={riskCardBg}>
            <div
              className={cn(
                "text-[26px] font-extrabold leading-none tracking-tight",
                risk > 50 ? "text-red-600" : "text-gray-900"
              )}
            >
              {risk}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-[#6B7280]">Rủi ro</div>
            <div className="mt-auto pt-1.5 text-[10px] leading-snug text-gray-500">{riskSubLabel(risk)}</div>
          </MiniStatCard>

          <MiniStatCard borderLeftClass="border-l-[#34D399]">
            <div
              className={cn(
                "line-clamp-2 text-[16px] font-bold leading-snug",
                hasConcreteTarget ? "text-[#065F46]" : "text-[#9CA3AF]"
              )}
            >
              {targetHeadline}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-[#6B7280]">Vị trí mục tiêu</div>
            <div
              className={cn(
                "mt-auto pt-1.5 text-[11px] leading-snug",
                fromEmployee != null ? "text-[#6B7280]" : "text-[#9CA3AF]"
              )}
            >
              {targetSub}
            </div>
          </MiniStatCard>

          <MiniStatCard borderLeftClass="border-l-[#FBBF24]">
            <div className="text-[16px] font-bold leading-snug text-[#92400E]">
              {readinessTimeCardMain(employee.readiness)}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-[#6B7280]">Thời gian còn lại</div>
            <div className="mt-auto pt-1.5 text-[11px] text-[#6B7280]">Đến readiness</div>
          </MiniStatCard>
        </div>
      </div>
    </div>
  );
}
