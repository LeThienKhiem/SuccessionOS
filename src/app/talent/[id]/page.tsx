import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  FileText,
  GitMerge,
  Target,
} from "lucide-react";

import { employees } from "@/data/employees";
import { departments, positions } from "@/data/positions";
import { idps, projects, successionMap } from "@/data/succession";
import { assessments, getRiskColor, getScoreColor } from "@/data/assessments";
import { knowledgeTransferPlans } from "@/data/knowledgeTransfer";

import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { RiskWarningBanner } from "@/components/RiskWarningBanner";
import { MarketIntelSection } from "@/components/MarketIntelSection";
import { ReadinessBadge } from "@/components/ReadinessBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { TierBadge } from "@/components/TierBadge";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
};

function careerTrackBadge(track: string) {
  if (track === "leadership")
    return {
      label: "Tuyến Lãnh đạo",
      className: "bg-[#EEF2FF] text-[#4F46E5]",
    };
  return { label: "Tuyến Chuyên gia", className: "bg-[#F0FDFA] text-[#0F766E]" };
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

export default async function TalentProfilePage({ params }: PageProps) {
  const { id } = await params;
  const employee = employees.find((e) => e.id === id);
  if (!employee) redirect("/talent");

  const dept = departments.find((d) => d.id === employee.departmentId);
  const position = positions.find((p) => p.id === employee.positionId);
  const project = employee.currentProjectId
    ? projects.find((p) => p.id === employee.currentProjectId)
    : undefined;

  const assessment = assessments.find((a) => a.employeeId === employee.id);
  const idp = idps.find((i) => i.employeeId === employee.id);

  const career = careerTrackBadge(employee.careerTrack);

  const ktpAsSuccessor = knowledgeTransferPlans.find((k) => k.successorId === employee.id);
  const ktpAsHolder = knowledgeTransferPlans.find((k) => k.holderId === employee.id);

  // Succession target (gap score from successionMap if exists)
  const targetPosition = employee.targetPositionId
    ? positions.find((p) => p.id === employee.targetPositionId)
    : undefined;
  const targetEntry = employee.targetPositionId
    ? successionMap.find((s) => s.positionId === employee.targetPositionId)
    : undefined;
  const selfCandidate = targetEntry?.candidates.find((c) => c.employeeId === employee.id);

  const mentor = employee.mentorId ? employees.find((e) => e.id === employee.mentorId) : undefined;
  const mentees = (employee.menteeIds ?? [])
    .map((mid) => employees.find((e) => e.id === mid))
    .filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
        <Link href="/talent" className="hover:underline">
          Nhân tài
        </Link>
        <span>&gt;</span>
        <span className="text-[#374151] font-medium">{employee.name}</span>
      </div>

      <RiskWarningBanner employee={employee} />

      {/* 2 columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* LEFT 65% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Card 1: Profile Header */}
          <div className="so-card rounded-xl p-6">
            <div className="flex items-center gap-5">
              <EmployeeAvatar employee={employee} size="lg" />
              <div className="min-w-0">
                <div className="text-[22px] font-bold text-[#111827] truncate">
                  {employee.name}
                </div>
                <div className="mt-1 text-[15px] text-[#6B7280] truncate">
                  {position?.titleVi ?? "—"}
                </div>
                <div className="mt-1 text-[14px] text-[#6B7280] truncate">
                  {dept?.name ?? "—"}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <TierBadge tier={employee.tier} />
                  <ReadinessBadge readiness={employee.readiness} />
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${career.className}`}
                  >
                    {career.label}
                  </span>
                  {employee.isKeyKnowledgeHolder ? (
                    <span className="inline-flex items-center rounded-full bg-[#FFFBEB] px-3 py-1 text-[12px] font-semibold text-[#B45309]">
                      🔑 Key Knowledge Holder
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] text-[#6B7280]">
                  <span>
                    Năm công tác:{" "}
                    <span className="font-semibold text-[#111827]">
                      {employee.yearsAtCompany}
                    </span>{" "}
                    năm
                  </span>
                  <span className="h-4 w-px bg-[#E5E7EB]" />
                  <span>
                    Tuổi:{" "}
                    <span className="font-semibold text-[#111827]">{employee.age}</span>
                  </span>
                  <span className="h-4 w-px bg-[#E5E7EB]" />
                  <span className="truncate">
                    Dự án:{" "}
                    <span className="font-semibold text-[#111827]">
                      {project?.name ?? "—"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Assessment */}
          <div className="so-card rounded-xl p-6">
            <div className="text-[16px] font-semibold text-[#374151]">
              Đánh giá năng lực — Chu kỳ 2024
            </div>
            <div className="mt-4 space-y-3">
              {assessment ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-[200px] text-[14px] font-medium text-[#374151]">
                      Chuyên môn kỹ thuật{" "}
                      <span className="text-[13px] text-[#6B7280]">(40%)</span>
                    </div>
                    <div className="flex-1">
                      <ScoreBar value={assessment.technical} size="lg" showNumber={false} />
                    </div>
                    <div className="w-10 text-right text-[14px] font-semibold text-[#111827]">
                      {assessment.technical}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-[200px] text-[14px] font-medium text-[#374151]">
                      Kết quả &amp; Hiệu suất{" "}
                      <span className="text-[13px] text-[#6B7280]">(30%)</span>
                    </div>
                    <div className="flex-1">
                      <ScoreBar value={assessment.performance} size="lg" showNumber={false} />
                    </div>
                    <div className="w-10 text-right text-[14px] font-semibold text-[#111827]">
                      {assessment.performance}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-[200px] text-[14px] font-medium text-[#374151]">
                      Hành vi &amp; Thái độ{" "}
                      <span className="text-[13px] text-[#6B7280]">(20%)</span>
                    </div>
                    <div className="flex-1">
                      <ScoreBar value={assessment.behavior} size="lg" showNumber={false} />
                    </div>
                    <div className="w-10 text-right text-[14px] font-semibold text-[#111827]">
                      {assessment.behavior}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-[200px] text-[14px] font-medium text-[#374151]">
                      Tiềm năng phát triển{" "}
                      <span className="text-[13px] text-[#6B7280]">(10%)</span>
                    </div>
                    <div className="flex-1">
                      <ScoreBar value={assessment.potential} size="lg" showNumber={false} />
                    </div>
                    <div className="w-10 text-right text-[14px] font-semibold text-[#111827]">
                      {assessment.potential}
                    </div>
                  </div>

                  <div className="my-4 h-px bg-[#E5E7EB]" />

                  <div className="flex flex-col items-center justify-center py-2">
                    <div className="flex items-end gap-2">
                      <div className="text-[48px] font-extrabold text-[#111827] leading-none">
                        {assessment.overall}
                      </div>
                      <div className="pb-1 text-[14px] text-[#6B7280]">/ 100</div>
                    </div>
                    <div className={`mt-2 text-[14px] font-semibold ${overallLabel(assessment.overall).className}`}>
                      {overallLabel(assessment.overall).label}
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
                        {assessment.strengths.map((s) => (
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
                      {assessment.gaps.length > 0 ? (
                        <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
                          {assessment.gaps.map((g) => (
                            <li key={g} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-3 text-[13px] italic text-[#6B7280]">
                          Không có ghi chú
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 text-[13px] italic text-[#6B7280]">
                    “Nhận xét quản lý: {assessment.managerNotes}”
                  </div>
                </>
              ) : (
                <div className="text-[13px] text-[#6B7280]">Chưa có đánh giá.</div>
              )}
            </div>
          </div>

          {/* Card 3: IDP */}
          <div className="so-card rounded-xl p-6">
            <div className="text-[16px] font-semibold text-[#374151]">
              Kế hoạch Phát triển Cá nhân (IDP)
            </div>

            {employee.idpStatus === "not-started" || !idp ? (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-6 py-8 text-center">
                <FileText className="h-10 w-10 text-[#9CA3AF]" />
                <div className="text-[14px] font-semibold text-[#374151]">
                  Chưa có kế hoạch phát triển cá nhân
                </div>
                <Button disabled className="rounded-lg">
                  Tạo IDP mới
                </Button>
                <div className="text-[13px] text-[#6B7280]">
                  Tính năng Phase 2
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-[14px] text-[#6B7280]">
                      Vị trí mục tiêu:{" "}
                      <span className="font-semibold text-[#111827]">
                        {positions.find((p) => p.id === idp.targetPositionId)?.titleVi ?? "—"}
                      </span>
                    </div>
                    <div className="mt-1 text-[13px] text-[#6B7280]">
                      Duyệt bởi {idp.approvedBy} · {idp.createdDate}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${idpStatusBadge(
                      idp.status
                    ).className}`}
                  >
                    {idpStatusBadge(idp.status).label}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[14px] font-semibold text-[#374151]">
                      Tiến độ tổng thể
                    </div>
                    <div className="text-[14px] font-bold text-[#111827]">
                      {idp.progress}%
                    </div>
                  </div>
                  <div className="mt-2 h-[12px] w-full rounded-full bg-[#E5E7EB]">
                    <div
                      className={`h-[12px] rounded-full ${getScoreColor(idp.progress)}`}
                      style={{ width: `${idp.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <div className="text-[14px] font-semibold text-[#374151]">
                      Mục tiêu 12 tháng
                    </div>
                    <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
                      {idp.shortTermGoals.map((g) => (
                        <li key={g} className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-[#14B8A6] mt-0.5" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-[#374151]">
                      Mục tiêu 2–3 năm
                    </div>
                    <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
                      {idp.midTermGoals.map((g) => (
                        <li key={g} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-[#4F46E5] mt-0.5" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-[14px] font-semibold text-[#374151]">
                    Hoạt động phát triển
                  </div>

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
                        {idp.activities.map((a) => {
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

          {/* Card 3.5: Knowledge Transfer */}
          {ktpAsHolder || ktpAsSuccessor ? (
            <div className="so-card rounded-xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <GitMerge className="h-4 w-4 text-[#4F46E5]" />
                  <div className="text-[16px] font-semibold text-[#374151]">
                    Chuyển giao Tri thức
                  </div>
                </div>
              </div>

              {ktpAsHolder ? (
                <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
                  <div className="text-[13px] text-[#6B7280]">Bạn đang transfer cho:</div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold text-[#111827]">
                        {employees.find((e) => e.id === ktpAsHolder.successorId)?.name ?? ktpAsHolder.successorId}
                      </div>
                      <div className="mt-1">
                        <ReadinessBadge readiness={employees.find((e) => e.id === ktpAsHolder.successorId)?.readiness ?? "1-2yr"} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] text-[#6B7280]">Đã transfer</div>
                      <div className="mt-1 text-[16px] font-bold text-[#111827]">
                        {ktpAsHolder.holderProgress}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-[8px] w-full rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-[8px] rounded-full bg-[#14B8A6]"
                      style={{ width: `${ktpAsHolder.holderProgress}%` }}
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link
                      href={`/succession?tab=2&position=${ktpAsHolder.positionId}`}
                      className="text-[13px] font-semibold text-[#4F46E5] hover:underline"
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                </div>
              ) : null}

              {ktpAsSuccessor ? (
                <div className={ktpAsHolder ? "mt-4" : "mt-4"}>
                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                    <div className="text-[13px] text-[#6B7280]">Bạn đang nhận transfer từ:</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-semibold text-[#111827]">
                          {employees.find((e) => e.id === ktpAsSuccessor.holderId)?.name ?? ktpAsSuccessor.holderId}
                        </div>
                        <div className="mt-1 text-[13px] text-[#6B7280] truncate">
                          {positions.find((p) => p.id === employees.find((e) => e.id === ktpAsSuccessor.holderId)?.positionId)?.titleVi ?? "—"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] text-[#6B7280]">Đã tiếp nhận</div>
                        <div className="mt-1 text-[16px] font-bold text-[#111827]">
                          {ktpAsSuccessor.successorProgress}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-[8px] w-full rounded-full bg-[#E5E7EB]">
                      <div
                        className="h-[8px] rounded-full bg-[#F59E0B]"
                        style={{ width: `${ktpAsSuccessor.successorProgress}%` }}
                      />
                    </div>
                    <div className="mt-2 text-[13px] text-[#6B7280]">
                      <span className="font-semibold text-[#111827]">
                        {ktpAsSuccessor.knowledgeItems.length}
                      </span>{" "}
                      mục tri thức ·{" "}
                      <span className="font-semibold text-[#111827]">
                        {ktpAsSuccessor.sessions.filter((s) => (s.completedItems?.length ?? 0) > 0).length}
                      </span>{" "}
                      buổi hoàn thành
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Link
                        href={`/succession?tab=2&position=${ktpAsSuccessor.positionId}`}
                        className="text-[13px] font-semibold text-[#4F46E5] hover:underline"
                      >
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* RIGHT 35% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 4: Succession info */}
          <div className="so-card rounded-xl p-6">
            <div className="text-[16px] font-semibold text-[#374151]">
              Thông tin kế thừa
            </div>

            <div className="mt-4 text-[14px] font-semibold text-[#374151]">
              Vị trí đang nhắm tới:
            </div>

            {employee.targetPositionId && targetPosition ? (
              <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-[#F8F9FC] p-4">
                <div className="text-[14px] font-semibold text-[#111827]">
                  {targetPosition.title}
                </div>
                <div className="mt-1 text-[13px] text-[#6B7280]">
                  {targetPosition.titleVi}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <ReadinessBadge readiness={employee.readiness} />
                  <div className="text-[13px] text-[#6B7280]">
                    Gap:{" "}
                    <span className="font-semibold text-[#111827]">
                      {selfCandidate?.gapScore ?? "—"}
                    </span>
                    /100
                  </div>
                </div>

                {typeof selfCandidate?.gapScore === "number" ? (
                  <div className="mt-3">
                    <div className="h-[8px] w-full rounded-full bg-[#E5E7EB]">
                      <div
                        className="h-[8px] rounded-full bg-[#14B8A6]"
                        style={{ width: `${Math.max(0, Math.min(100, 100 - selfCandidate.gapScore))}%` }}
                      />
                    </div>
                    <div className="mt-2 text-[13px] text-[#6B7280]">
                      {selfCandidate.gapScore <= 20
                        ? "Gần sẵn sàng"
                        : selfCandidate.gapScore <= 40
                          ? "Đang phát triển tốt"
                          : selfCandidate.gapScore <= 60
                            ? "Cần thêm thời gian"
                            : "Gap còn lớn"}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-2 text-[13px] italic text-[#6B7280]">
                Chưa xác định
              </div>
            )}

            <div className="my-5 h-px bg-[#E5E7EB]" />

            {mentor ? (
              <div>
                <div className="text-[14px] font-semibold text-[#374151]">
                  Người cố vấn:
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <EmployeeAvatar employee={mentor} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[#111827]">
                      {mentor.name}
                    </div>
                    <div className="truncate text-[13px] text-[#6B7280]">
                      {positions.find((p) => p.id === mentor.positionId)?.titleVi ?? "—"}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {mentees.length > 0 ? (
              <div className={mentor ? "mt-5" : ""}>
                <div className="text-[14px] font-semibold text-[#374151]">
                  Đang kèm cặp:
                </div>
                <div className="mt-3 space-y-3">
                  {mentees.map((m) => (
                    <div key={m!.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <EmployeeAvatar employee={m!} size="sm" />
                        <div className="truncate font-medium text-[#111827]">
                          {m!.name}
                        </div>
                      </div>
                      <TierBadge tier={m!.tier} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Card 5: Current project */}
          <div className="so-card rounded-xl p-6">
            <div className="text-[16px] font-semibold text-[#374151]">
              Dự án hiện tại
            </div>

            {project ? (
              <div className="mt-4 space-y-2 text-[14px] text-[#374151]">
                <div className="text-[14px] font-semibold text-[#111827]">
                  {project.name}
                </div>
                <div className="inline-flex items-center rounded-full bg-[#F9FAFB] px-3 py-1 text-[12px] font-semibold text-[#374151] border border-[#E5E7EB]">
                  {project.type}
                </div>
                <div className="mt-3 text-[13px] text-[#6B7280]">
                  Vai trò: <span className="font-medium text-[#374151]">{employee.projectRole ?? "—"}</span>
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  Khách hàng: <span className="font-medium text-[#374151]">{project.client}</span>
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  Giá trị HĐ: <span className="font-medium text-[#374151]">{project.contractValue}</span>
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  Trạng thái:{" "}
                  <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-3 py-1 text-[12px] font-semibold text-[#15803D]">
                    {project.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-[13px] text-[#6B7280]">
                Chưa tham gia dự án
              </div>
            )}
          </div>

          {/* Card 6: Quick stats */}
          <div className="so-card rounded-xl p-6">
            <div className="text-[16px] font-semibold text-[#374151]">
              Thống kê nhanh
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                <div className="text-[13px] text-[#6B7280]">Giờ đào tạo/năm</div>
                <div className="mt-2 text-[20px] font-bold text-[#111827]">
                  {employee.trainingHoursLastYear} giờ
                </div>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                <div className="text-[13px] text-[#6B7280]">Thăng chức gần nhất</div>
                <div className="mt-2 text-[20px] font-bold text-[#111827]">
                  {employee.lastPromotionYear}
                </div>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                <div className="text-[13px] text-[#6B7280]">Tiến độ IDP</div>
                <div className="mt-2 text-[20px] font-bold text-[#111827]">
                  {employee.idpProgress}%
                </div>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                <div className="text-[13px] text-[#6B7280]">Risk Score</div>
                <div className={`mt-2 text-[20px] font-bold ${getRiskColor(employee.riskLevel)}`}>
                  {employee.riskScore} / 100
                </div>
              </div>
            </div>
          </div>

          <MarketIntelSection employeeId={employee.id} />
        </div>
      </div>

      <div className="h-2" />
    </div>
  );
}

