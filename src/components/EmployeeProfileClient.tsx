"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  FileText,
  GitMerge,
  History,
  Sparkles,
  Target,
  ChevronDown,
} from "lucide-react";

import type { Assessment, Employee, IDP, Project, SuccessionEntry } from "@/data/types";
import type { KnowledgeTransferPlan } from "@/data/knowledgeTransfer";
import type { MarketIntelData } from "@/data/marketIntelligence";
import { employees } from "@/data/employees";
import { departments, positions } from "@/data/positions";
import { assessments, getRiskColor, getScoreColor } from "@/data/assessments";
import { idps, projects, successionMap } from "@/data/succession";
import { knowledgeTransferPlans } from "@/data/knowledgeTransfer";

import { useModuleContext } from "@/context/ModuleContext";
import { CareerPathTab } from "@/components/CareerPathTab";
import { TalentProfileExplorerBreadcrumb } from "@/components/talent/TalentProfileExplorerBreadcrumb";
import { TalentProfileHero } from "@/components/talent/TalentProfileHero";
import { TalentProfileNetworkSuccessionCard } from "@/components/talent/TalentProfileNetworkSuccessionCard";
import { TalentProfileRadarCard } from "@/components/talent/TalentProfileRadarCard";
import { TalentProfileZoneCRiskHrm } from "@/components/talent/TalentProfileZoneCRiskHrm";
import { MarketIntelCard } from "@/components/MarketIntelCard";
import { ReadinessBadge } from "@/components/ReadinessBadge";
import { RiskWarningBanner } from "@/components/RiskWarningBanner";
import { ScoreBar } from "@/components/ScoreBar";
import { Button } from "@/components/ui/button";

type ProfileNavPhase = "idle" | "out" | "in";

type AuditDotTone = "green" | "amber" | "red";
type AuditEntry = {
  id: string;
  timestamp: string; // "18/04/2025 14:23"
  by: string;
  role: string;
  title: string;
  details: React.ReactNode;
  reason: string;
  tone: AuditDotTone;
};

function auditDot(tone: AuditDotTone) {
  if (tone === "amber") return { dot: "bg-[#F59E0B]", ring: "ring-[#FDE68A]" };
  if (tone === "red") return { dot: "bg-[#DC2626]", ring: "ring-[#FECACA]" };
  return { dot: "bg-[#22C55E]", ring: "ring-[#BBF7D0]" };
}

function idpStatusBadge(status: string) {
  if (status === "active")
    return { label: "Đang thực hiện", className: "bg-[#F0FDF4] text-[#15803D]" };
  if (status === "review")
    return { label: "Cần review", className: "bg-[#FFFBEB] text-[#B45309]" };
  if (status === "completed")
    return { label: "Hoàn thành", className: "bg-[#EEF2FF] text-[#4F46E5]" };
  return { label: "Chưa có", className: "bg-[#F9FAFB] text-[#6B7280]" };
}

function activityTypeBadge(type: string) {
  const map: Record<string, { label: string; className: string }> = {
    training: { label: "Đào tạo", className: "bg-[#EFF6FF] text-[#1D4ED8]" },
    project: { label: "Dự án", className: "bg-[#F0FDF4] text-[#15803D]" },
    mentoring: { label: "Kèm cặp", className: "bg-[#EEF2FF] text-[#4F46E5]" },
    rotation: { label: "Luân chuyển", className: "bg-[#FFFBEB] text-[#B45309]" },
    shadowing: { label: "Quan sát", className: "bg-[#F9FAFB] text-[#374151]" },
    stretch: { label: "Thử thách", className: "bg-[#FEF2F2] text-[#DC2626]" },
  };
  return map[type] ?? { label: type, className: "bg-[#F9FAFB] text-[#6B7280]" };
}

function activityStatusBadge(status: string) {
  if (status === "completed")
    return { label: "Hoàn thành", dot: "#22C55E", className: "text-[#15803D]" };
  if (status === "in-progress")
    return { label: "Đang thực hiện", dot: "#F59E0B", className: "text-[#B45309]" };
  return { label: "Chưa bắt đầu", dot: "#9CA3AF", className: "text-[#6B7280]" };
}

function overallLabel(v: number) {
  if (v >= 90) return { label: "Xuất sắc", className: "text-[#15803D]" };
  if (v >= 80) return { label: "Tốt", className: "text-[#1D4ED8]" };
  if (v >= 70) return { label: "Khá", className: "text-[#B45309]" };
  return { label: "Cần cải thiện", className: "text-[#DC2626]" };
}

export function EmployeeProfileClient(props: {
  employee: Employee;
  assessment?: Assessment;
  idp?: IDP;
  ktp?: KnowledgeTransferPlan;
  project?: Project;
  successionEntry?: SuccessionEntry;
  marketIntelData?: MarketIntelData;
}) {
  const { isActive } = useModuleContext();

  const showAICareerPath = isActive("aiCareerPath");
  const showMarketTab = isActive("marketIntelligence");

  const [openAudit, setOpenAudit] = React.useState(false);

  const originalEmployee = props.employee;

  const [focusedEmployeeId, setFocusedEmployeeId] = React.useState(() => originalEmployee.id);
  const [navHistory, setNavHistory] = React.useState<string[]>(() => [originalEmployee.id]);
  const [phase, setPhase] = React.useState<ProfileNavPhase>("idle");

  React.useEffect(() => {
    setFocusedEmployeeId(originalEmployee.id);
    setNavHistory([originalEmployee.id]);
    setPhase("idle");
  }, [originalEmployee.id]);

  React.useEffect(() => {
    setOpenAudit(false);
  }, [focusedEmployeeId]);

  const focusedEmployee = React.useMemo(
    () => employees.find((e) => e.id === focusedEmployeeId) ?? originalEmployee,
    [focusedEmployeeId, originalEmployee],
  );

  const handleNodeClick = React.useCallback(
    (clicked: Employee) => {
      if (clicked.id === focusedEmployeeId) return;
      if (phase !== "idle") return;
      setPhase("out");
      window.setTimeout(() => {
        setNavHistory((prev) => [...prev, clicked.id]);
        setFocusedEmployeeId(clicked.id);
        setPhase("in");
        window.setTimeout(() => setPhase("idle"), 200);
      }, 180);
    },
    [focusedEmployeeId, phase],
  );

  const handleBreadcrumbClick = React.useCallback(
    (idx: number) => {
      const empId = navHistory[idx];
      if (empId == null || empId === focusedEmployeeId) return;
      if (phase !== "idle") return;
      setPhase("out");
      window.setTimeout(() => {
        setNavHistory((prev) => prev.slice(0, idx + 1));
        setFocusedEmployeeId(empId);
        setPhase("in");
        window.setTimeout(() => setPhase("idle"), 200);
      }, 180);
    },
    [navHistory, focusedEmployeeId, phase],
  );

  const handleExplorerReset = React.useCallback(() => {
    if (phase !== "idle") return;
    if (navHistory.length === 1 && focusedEmployeeId === originalEmployee.id) return;
    setPhase("out");
    window.setTimeout(() => {
      setNavHistory([originalEmployee.id]);
      setFocusedEmployeeId(originalEmployee.id);
      setPhase("in");
      window.setTimeout(() => setPhase("idle"), 200);
    }, 180);
  }, [originalEmployee.id, focusedEmployeeId, navHistory.length, phase]);

  const focusedAssessment = React.useMemo(
    () => assessments.find((a) => a.employeeId === focusedEmployee.id),
    [focusedEmployee],
  );

  const focusedIdp = React.useMemo(
    () => idps.find((i) => i.employeeId === focusedEmployee.id),
    [focusedEmployee],
  );

  const focusedKtp = React.useMemo(
    () =>
      knowledgeTransferPlans.find((k) => k.successorId === focusedEmployee.id) ??
      knowledgeTransferPlans.find((k) => k.holderId === focusedEmployee.id),
    [focusedEmployee],
  );

  const focusedSuccessionEntry = React.useMemo(
    () =>
      focusedEmployee.targetPositionId
        ? successionMap.find((s) => s.positionId === focusedEmployee.targetPositionId)
        : undefined,
    [focusedEmployee],
  );

  const focusedProject = React.useMemo(
    () =>
      focusedEmployee.currentProjectId
        ? projects.find((p) => p.id === focusedEmployee.currentProjectId)
        : undefined,
    [focusedEmployee],
  );

  const dept = departments.find((d) => d.id === focusedEmployee.departmentId);
  const position = positions.find((p) => p.id === focusedEmployee.positionId);

  const targetPosition = focusedEmployee.targetPositionId
    ? positions.find((p) => p.id === focusedEmployee.targetPositionId)
    : undefined;

  const selfCandidate = focusedSuccessionEntry?.candidates?.find((c) => c.employeeId === focusedEmployee.id);

  const isHolder = focusedKtp?.holderId === focusedEmployee.id;
  const isSuccessor = focusedKtp?.successorId === focusedEmployee.id;

  const profilePhaseClass =
    phase === "out" ? "profile-out" : phase === "in" ? "profile-in" : "profile-idle";

  return (
    <div className="space-y-6">
      <TalentProfileExplorerBreadcrumb
        navHistory={navHistory}
        employees={employees}
        originalEmployeeId={originalEmployee.id}
        onBreadcrumbClick={handleBreadcrumbClick}
        onReset={handleExplorerReset}
      />

      <div className={profilePhaseClass}>
      <RiskWarningBanner employee={focusedEmployee} />

      <TalentProfileHero
        employee={focusedEmployee}
        assessment={focusedAssessment}
        idp={focusedIdp}
        ktp={focusedKtp}
      />

      {/* Zone B — visual summary */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TalentProfileRadarCard
          employee={focusedEmployee}
          assessment={focusedAssessment}
          targetPosition={targetPosition}
          currentPosition={position}
        />
        <TalentProfileNetworkSuccessionCard
          focusedEmployee={focusedEmployee}
          navHistory={navHistory}
          positions={positions ?? []}
          onNavigate={handleNodeClick}
        />
      </div>

      <TalentProfileZoneCRiskHrm employee={focusedEmployee} marketIntelActive={showMarketTab} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* LEFT 65% */}
          <div className="lg:col-span-3 space-y-6">
            {/* Assessment */}
            <div className="so-card rounded-xl p-6">
              <div className="text-[16px] font-semibold text-[#374151]">
                Đánh giá năng lực — Chu kỳ 2024
              </div>
              <div className="mt-4 space-y-3">
                {focusedAssessment ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-[200px] text-[14px] font-medium text-[#374151]">
                        Chuyên môn kỹ thuật <span className="text-[13px] text-[#6B7280]">(40%)</span>
                      </div>
                      <div className="flex-1">
                        <ScoreBar value={focusedAssessment.technical} size="lg" showNumber={false} />
                      </div>
                      <div className="w-10 text-right text-[14px] font-semibold text-[#111827]">
                        {focusedAssessment.technical}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-[200px] text-[14px] font-medium text-[#374151]">
                        Kết quả &amp; Hiệu suất <span className="text-[13px] text-[#6B7280]">(30%)</span>
                      </div>
                      <div className="flex-1">
                        <ScoreBar value={focusedAssessment.performance} size="lg" showNumber={false} />
                      </div>
                      <div className="w-10 text-right text-[14px] font-semibold text-[#111827]">
                        {focusedAssessment.performance}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-[200px] text-[14px] font-medium text-[#374151]">
                        Hành vi &amp; Thái độ <span className="text-[13px] text-[#6B7280]">(20%)</span>
                      </div>
                      <div className="flex-1">
                        <ScoreBar value={focusedAssessment.behavior} size="lg" showNumber={false} />
                      </div>
                      <div className="w-10 text-right text-[14px] font-semibold text-[#111827]">
                        {focusedAssessment.behavior}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-[200px] text-[14px] font-medium text-[#374151]">
                        Tiềm năng phát triển <span className="text-[13px] text-[#6B7280]">(10%)</span>
                      </div>
                      <div className="flex-1">
                        <ScoreBar value={focusedAssessment.potential} size="lg" showNumber={false} />
                      </div>
                      <div className="w-10 text-right text-[14px] font-semibold text-[#111827]">
                        {focusedAssessment.potential}
                      </div>
                    </div>

                    <div className="my-4 h-px bg-[#E5E7EB]" />

                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="flex items-end gap-2">
                        <div className="text-[48px] font-extrabold text-[#111827] leading-none">
                          {focusedAssessment.overall}
                        </div>
                        <div className="pb-1 text-[14px] text-[#6B7280]">/ 100</div>
                      </div>
                      <div
                        className={`mt-2 text-[14px] font-semibold ${overallLabel(focusedAssessment.overall).className}`}
                      >
                        {overallLabel(focusedAssessment.overall).label}
                      </div>
                    </div>

                    <div className="my-4 h-px bg-[#E5E7EB]" />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <div className="flex items-center gap-2 text-[14px] font-semibold text-[#374151]">
                          <CheckCircle className="h-4 w-4 text-[#22C55E]" />
                          Điểm mạnh
                        </div>
                        <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
                          {focusedAssessment.strengths.map((s) => (
                            <li key={s} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-[14px] font-semibold text-[#374151]">
                          <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
                          Cần phát triển
                        </div>
                        {focusedAssessment.gaps.length > 0 ? (
                          <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
                            {focusedAssessment.gaps.map((g) => (
                              <li key={g} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                                <span>{g}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="mt-3 text-[13px] italic text-[#6B7280]">Không có ghi chú</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 text-[13px] italic text-[#6B7280]">
                      “Nhận xét quản lý: {focusedAssessment.managerNotes}”
                    </div>
                  </>
                ) : (
                  <div className="text-[13px] text-[#6B7280]">Chưa có đánh giá.</div>
                )}
              </div>
            </div>

            {/* IDP */}
            <div className="so-card rounded-xl p-6">
              <div className="text-[16px] font-semibold text-[#374151]">
                Kế hoạch Phát triển Cá nhân (IDP)
              </div>

              {focusedEmployee.idpStatus === "not-started" || !focusedIdp ? (
                <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-6 py-8 text-center">
                  <FileText className="h-10 w-10 text-[#9CA3AF]" />
                  <div className="text-[14px] font-semibold text-[#374151]">
                    Chưa có kế hoạch phát triển cá nhân
                  </div>
                  <Button disabled className="rounded-lg">
                    Tạo IDP mới
                  </Button>
                  <div className="text-[13px] text-[#6B7280]">Tính năng Phase 2</div>
                </div>
              ) : (
                <>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-[14px] text-[#6B7280]">
                        Vị trí mục tiêu:{" "}
                        <span className="font-semibold text-[#111827]">
                          {positions.find((p) => p.id === focusedIdp!.targetPositionId)?.titleVi ?? "—"}
                        </span>
                      </div>
                      <div className="mt-1 text-[13px] text-[#6B7280]">
                        Duyệt bởi {focusedIdp!.approvedBy} · {focusedIdp!.createdDate}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${idpStatusBadge(focusedIdp!.status).className}`}
                    >
                      {idpStatusBadge(focusedIdp!.status).label}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[14px] font-semibold text-[#374151]">Tiến độ tổng thể</div>
                      <div className="text-[14px] font-bold text-[#111827]">{focusedIdp!.progress}%</div>
                    </div>
                    <div className="mt-2 h-[12px] w-full rounded-full bg-[#E5E7EB]">
                      <div
                        className={`h-[12px] rounded-full ${getScoreColor(focusedIdp!.progress)}`}
                        style={{ width: `${focusedIdp!.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <div className="text-[14px] font-semibold text-[#374151]">Mục tiêu 12 tháng</div>
                      <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
                        {focusedIdp!.shortTermGoals.map((g) => (
                          <li key={g} className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 text-[#14B8A6] mt-0.5" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#374151]">Mục tiêu 2–3 năm</div>
                      <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
                        {focusedIdp!.midTermGoals.map((g) => (
                          <li key={g} className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-[#4F46E5] mt-0.5" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-[14px] font-semibold text-[#374151]">Hoạt động phát triển</div>
                    <div className="mt-3 rounded-xl border border-[#E5E7EB] overflow-hidden bg-white">
                      <table className="w-full text-[13px]">
                        <thead className="bg-[#F9FAFB]">
                          <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium [&>th]:text-[#6B7280]">
                            <th className="w-[110px]">Type</th>
                            <th>Tên hoạt động</th>
                            <th className="w-[110px]">Deadline</th>
                            <th className="w-[140px]">Tiến độ</th>
                            <th className="w-[140px]">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="[&>tr]:border-t [&>tr]:border-[#E5E7EB]">
                          {focusedIdp!.activities.map((a) => {
                            const t = activityTypeBadge(a.type);
                            const s = activityStatusBadge(a.status);
                            return (
                              <tr key={a.id} className="[&>td]:px-3 [&>td]:py-2">
                                <td>
                                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium ${t.className}`}>
                                    {t.label}
                                  </span>
                                </td>
                                <td className="text-[#111827] font-medium">{a.title}</td>
                                <td className="text-[#6B7280]">{a.targetDate}</td>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <ScoreBar value={a.progress} size="sm" showNumber={false} />
                                    </div>
                                    <span className="w-10 text-right text-[#6B7280]">{a.progress}%</span>
                                  </div>
                                </td>
                                <td>
                                  <span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-[12px] font-medium ${s.className}`}>
                                    <span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
                                    {s.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* KTP quick card */}
            {focusedKtp ? (
              <div className="so-card rounded-xl p-6">
                <div className="flex items-center gap-2">
                  <GitMerge className="h-4 w-4 text-[#4F46E5]" />
                  <div className="text-[16px] font-semibold text-[#374151]">Chuyển giao Tri thức</div>
                </div>

                {isHolder ? (
                  <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
                    <div className="text-[13px] text-[#6B7280]">Bạn đang transfer cho:</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-semibold text-[#111827]">
                          {employees.find((e) => e.id === focusedKtp.successorId)?.name ?? focusedKtp.successorId}
                        </div>
                        <div className="mt-1">
                          <ReadinessBadge readiness={employees.find((e) => e.id === focusedKtp.successorId)?.readiness ?? "1-2yr"} />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] text-[#6B7280]">Đã transfer</div>
                        <div className="mt-1 text-[16px] font-bold text-[#111827]">{focusedKtp.holderProgress}%</div>
                      </div>
                    </div>
                    <div className="mt-3 h-[8px] w-full rounded-full bg-[#E5E7EB]">
                      <div className="h-[8px] rounded-full bg-[#14B8A6]" style={{ width: `${focusedKtp.holderProgress}%` }} />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Link href={`/succession?tab=2&position=${focusedKtp.positionId}`} className="text-[13px] font-semibold text-[#4F46E5] hover:underline">
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>
                ) : null}

                {isSuccessor ? (
                  <div className={isHolder ? "mt-4" : "mt-4"}>
                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                      <div className="text-[13px] text-[#6B7280]">Bạn đang nhận transfer từ:</div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-semibold text-[#111827]">
                            {employees.find((e) => e.id === focusedKtp.holderId)?.name ?? focusedKtp.holderId}
                          </div>
                          <div className="mt-1 text-[13px] text-[#6B7280] truncate">
                            {employees.find((e) => e.id === focusedKtp.holderId)?.currentRoleTitle ?? "—"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[13px] text-[#6B7280]">Đã tiếp nhận</div>
                          <div className="mt-1 text-[16px] font-bold text-[#111827]">{focusedKtp.successorProgress}%</div>
                        </div>
                      </div>
                      <div className="mt-3 h-[8px] w-full rounded-full bg-[#E5E7EB]">
                        <div className="h-[8px] rounded-full bg-[#F59E0B]" style={{ width: `${focusedKtp.successorProgress}%` }} />
                      </div>
                      <div className="mt-2 text-[13px] text-[#6B7280]">
                        <span className="font-semibold text-[#111827]">{focusedKtp.knowledgeItems.length}</span> mục tri thức ·{" "}
                        <span className="font-semibold text-[#111827]">
                          {focusedKtp.sessions.filter((s) => (s.completedItems?.length ?? 0) > 0).length}
                        </span>{" "}
                        buổi hoàn thành
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Link href={`/succession?tab=2&position=${focusedKtp.positionId}`} className="text-[13px] font-semibold text-[#4F46E5] hover:underline">
                          Xem chi tiết →
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Audit trail */}
            <div className="so-card rounded-xl p-6">
              <button
                type="button"
                onClick={() => setOpenAudit((v) => !v)}
                className="w-full flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <History className="h-4 w-4 text-[#6B7280]" />
                  <div className="text-[16px] font-semibold text-[#374151]">
                    Lịch sử thay đổi
                  </div>
                </div>
                <ChevronDown
                  className={[
                    "h-4 w-4 text-[#6B7280] transition",
                    openAudit ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              {openAudit ? (
                <div className="mt-4">
                  {focusedEmployee.id !== "emp-006" ? (
                    <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-6 py-8 text-center text-[13px] text-[#6B7280]">
                      Chưa có lịch sử thay đổi
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(
                        [
                          {
                            id: "a-1",
                            timestamp: "18/04/2025 14:23",
                            by: "Lê Khiêm",
                            role: "HR Admin",
                            title: "Thay đổi tầng nhân sự",
                            details: (
                              <div className="text-[13px] text-[#374151]">
                                Tiềm năng <span className="text-[#6B7280]">→</span>{" "}
                                <span className="font-semibold">Nòng cốt</span>
                              </div>
                            ),
                            reason: "Hoàn thành KTP 68%, Block B Q3 xuất sắc",
                            tone: "green",
                          },
                          {
                            id: "a-2",
                            timestamp: "01/03/2025 09:15",
                            by: "Trần Minh Tuấn",
                            role: "Manager",
                            title: "Cập nhật Assessment 2024-Annual",
                            details: (
                              <div className="text-[13px] text-[#374151]">
                                Overall: <span className="font-semibold">88</span>{" "}
                                <span className="text-[#6B7280]">→</span>{" "}
                                <span className="font-semibold">91</span>
                              </div>
                            ),
                            reason: "Điều chỉnh sau calibration session Q1",
                            tone: "green",
                          },
                          {
                            id: "a-3",
                            timestamp: "15/12/2024 16:00",
                            by: "Hệ thống",
                            role: "Auto-computed",
                            title: "Risk factor tự động: RF001",
                            details: (
                              <div className="text-[13px] text-[#374151]">
                                “Chưa thăng chức 4 năm” được gán tự động
                                <div className="mt-1 text-[12px] text-[#6B7280]">
                                  Nguồn: system_computed từ last_promoted_at
                                </div>
                              </div>
                            ),
                            reason: "Tự động phát hiện risk factor từ dữ liệu nhân sự",
                            tone: "amber",
                          },
                          {
                            id: "a-4",
                            timestamp: "20/06/2024 10:30",
                            by: "Nguyễn Văn Đức",
                            role: "Manager",
                            title: "IDP được phê duyệt",
                            details: (
                              <div className="text-[13px] text-[#374151]">
                                Trạng thái: <span className="font-semibold">draft</span>{" "}
                                <span className="text-[#6B7280]">→</span>{" "}
                                <span className="font-semibold">active</span>
                              </div>
                            ),
                            reason: "Mục tiêu rõ ràng, phù hợp lộ trình kế thừa",
                            tone: "green",
                          },
                        ] as AuditEntry[]
                      ).map((e) => {
                        const dot = auditDot(e.tone);
                        return (
                          <div key={e.id} className="relative pl-8">
                            <div className="absolute left-3 top-2 bottom-0 w-px bg-[#E5E7EB]" />
                            <div
                              className={[
                                "absolute left-[9px] top-2 h-3 w-3 rounded-full",
                                dot.dot,
                                "ring-4",
                                dot.ring,
                              ].join(" ")}
                            />

                            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-[13px] font-semibold text-[#111827] tabular-nums">
                                  [{e.timestamp}] {e.by} ·{" "}
                                  <span className="text-[#6B7280] font-medium">{e.role}</span>
                                </div>
                              </div>
                              <div className="mt-2 text-[14px] font-semibold text-[#374151]">
                                {e.title}
                              </div>
                              <div className="mt-2">{e.details}</div>
                              <div className="mt-3 rounded-lg bg-[#F9FAFB] px-3 py-2 text-[13px] text-[#374151]">
                                <span className="font-semibold">Lý do:</span>{" "}
                                “{e.reason}”
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* RIGHT 35% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project */}
            <div className="so-card rounded-xl p-6">
              <div className="text-[16px] font-semibold text-[#374151]">Dự án hiện tại</div>
              {focusedProject ? (
                <div className="mt-4 space-y-2 text-[14px] text-[#374151]">
                  <div className="text-[14px] font-semibold text-[#111827]">{focusedProject.name}</div>
                  <div className="inline-flex items-center rounded-full bg-[#F9FAFB] px-3 py-1 text-[12px] font-semibold text-[#374151] border border-[#E5E7EB]">
                    {focusedProject.type}
                  </div>
                  <div className="mt-3 text-[13px] text-[#6B7280]">
                    Vai trò: <span className="font-medium text-[#374151]">{focusedEmployee.projectRole ?? "—"}</span>
                  </div>
                  <div className="text-[13px] text-[#6B7280]">
                    Khách hàng: <span className="font-medium text-[#374151]">{focusedProject.client}</span>
                  </div>
                  <div className="text-[13px] text-[#6B7280]">
                    Giá trị HĐ: <span className="font-medium text-[#374151]">{focusedProject.contractValue}</span>
                  </div>
                  <div className="text-[13px] text-[#6B7280]">
                    Trạng thái:{" "}
                    <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-3 py-1 text-[12px] font-semibold text-[#15803D]">
                      {focusedProject.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-[13px] text-[#6B7280]">Chưa tham gia dự án</div>
              )}
            </div>

            {/* Quick stats */}
            <div className="so-card rounded-xl p-6">
              <div className="text-[16px] font-semibold text-[#374151]">Thống kê nhanh</div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                  <div className="text-[13px] text-[#6B7280]">Giờ đào tạo/năm</div>
                  <div className="mt-2 text-[20px] font-bold text-[#111827]">{focusedEmployee.trainingHoursLastYear} giờ</div>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                  <div className="text-[13px] text-[#6B7280]">Thăng chức gần nhất</div>
                  <div className="mt-2 text-[20px] font-bold text-[#111827]">{focusedEmployee.lastPromotionYear}</div>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                  <div className="text-[13px] text-[#6B7280]">Tiến độ IDP</div>
                  <div className="mt-2 text-[20px] font-bold text-[#111827]">{focusedEmployee.idpProgress}%</div>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                  <div className="text-[13px] text-[#6B7280]">Risk Score</div>
                  <div className={`mt-2 text-[20px] font-bold ${getRiskColor(focusedEmployee.riskLevel)}`}>
                    {focusedEmployee.riskScore} / 100
                  </div>
                </div>
              </div>
            </div>

            {/* Market Intel */}
            {showMarketTab ? <MarketIntelCard employeeId={focusedEmployee.id} /> : null}
          </div>
      </div>

      {showAICareerPath ? (
        <div className="so-card rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#FAFAFF] px-5 py-3">
            <Sparkles className="h-4 w-4 text-[#4F46E5]" aria-hidden />
            <span className="text-[14px] font-semibold text-[#374151]">Lộ trình AI</span>
            <span className="ml-1 rounded-full bg-[#4F46E5] px-1.5 py-0.5 text-[10px] font-bold text-white">
              AI
            </span>
          </div>
          <div className="p-5 sm:p-6">
            <CareerPathTab employeeId={focusedEmployee.id} />
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}

