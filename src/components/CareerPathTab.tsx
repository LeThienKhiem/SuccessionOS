"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle,
  GitFork,
  Info,
  LayoutDashboard,
  Monitor,
  Quote,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { employees } from "@/data/employees";
import { positions } from "@/data/positions";
import { aiCareerPaths, type SkillCategory, type SkillRequirement } from "@/data/careerPath";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

function toneByScore(v: number) {
  if (v >= 80) return { color: "#15803D", bg: "bg-[#F0FDF4]" };
  if (v >= 60) return { color: "#B45309", bg: "bg-[#FFFBEB]" };
  return { color: "#DC2626", bg: "bg-[#FEF2F2]" };
}

function priorityTone(p: "critical" | "high" | "medium") {
  if (p === "critical") return { bar: "#DC2626", pill: "bg-[#FEE2E2] text-[#DC2626]", label: "🔴 Cốt lõi" };
  if (p === "high") return { bar: "#F59E0B", pill: "bg-[#FEF9C3] text-[#854D0E]", label: "🟠 Quan trọng" };
  return { bar: "#9CA3AF", pill: "bg-[#F3F4F6] text-[#6B7280]", label: "⚪ Trung bình" };
}

function categoryPill(c: SkillCategory) {
  if (c === "technical") return { cls: "bg-[#DBEAFE] text-[#1D4ED8]", text: "Technical" };
  if (c === "leadership") return { cls: "bg-[#EDE9FE] text-[#6D28D9]", text: "Leadership" };
  if (c === "process") return { cls: "bg-[#DCFCE7] text-[#15803D]", text: "Process" };
  return { cls: "bg-[#FEF9C3] text-[#854D0E]", text: "Soft" };
}

function courseIcon(type: "certification" | "online" | "classroom") {
  if (type === "certification") return { Icon: Award, color: "#6366F1" };
  if (type === "online") return { Icon: Monitor, color: "#14B8A6" };
  return { Icon: Users, color: "#F59E0B" };
}

function languageBadge(l: "Vietnamese" | "English") {
  return l === "Vietnamese" ? "🇻🇳 tiếng Việt" : "🇬🇧 English";
}

function sortSkills(a: SkillRequirement, b: SkillRequirement) {
  const pr = (p: SkillRequirement["priority"]) => (p === "critical" ? 3 : p === "high" ? 2 : 1);
  if (b.gap !== a.gap) return b.gap - a.gap;
  return pr(b.priority) - pr(a.priority);
}

function SkillDots(props: { current: number; required: number; tone: string }) {
  const dots = [1, 2, 3, 4, 5] as const;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        {dots.map((n) => {
          const filled = n <= props.current;
          const inReq = n > props.current && n <= props.required;
          return (
            <span
              key={n}
              className="h-3 w-3 rounded-full"
              style={{
                background: filled ? props.tone : inReq ? "#FECACA" : "#E5E7EB",
              }}
              title={`Level ${n}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export function CareerPathTab({ employeeId }: { employeeId: string }) {
  const path = React.useMemo(() => aiCareerPaths.find((p) => p.employeeId === employeeId), [employeeId]);
  const [msOpen, setMsOpen] = React.useState<Record<string, boolean>>({});
  const [prio, setPrio] = React.useState<"all" | "critical" | "high" | "medium">("all");

  if (!path) {
    return (
      <div className="so-card rounded-xl p-6">
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Sparkles className="h-8 w-8 text-[#9CA3AF]" />
          <div className="text-[14px] font-semibold text-[#374151]">
            AI chưa phân tích lộ trình cho nhân viên này
          </div>
          <div className="text-[13px] text-[#6B7280] max-w-xl">
            AI Career Path sử dụng assessment score và succession data để tạo đề xuất cá nhân hóa. Cần có đủ dữ liệu đánh giá mới phân tích được.
          </div>
        </div>
      </div>
    );
  }

  const conf = toneByScore(path.confidenceScore);
  const target = positions.find((p) => p.id === path.targetPositionId);
  const alt = path.alternativePositionId ? positions.find((p) => p.id === path.alternativePositionId) : undefined;

  const skills = [...path.skills]
    .filter((s) => (prio === "all" ? true : s.priority === prio))
    .sort(sortSkills);

  const pillClass = (active: boolean) =>
    active
      ? "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]"
      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]";

  return (
    <div className="space-y-6">
      <div className="so-card rounded-xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#4F46E5]" />
            <div className="text-[14px] font-semibold text-[#374151]">AI Career Path Analysis</div>
            <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#4F46E5]">
              AI Generated
            </span>
          </div>
          <div className="text-[11px] italic text-[#6B7280]">Phân tích ngày {fmtDate(path.generatedDate)}</div>
        </div>

        {/* Summary box */}
        <div className="mt-4 rounded-lg border border-[#C7D2FE] bg-[#F8F9FF] p-4">
          <div className="flex items-start gap-3">
            <Quote className="h-4 w-4 text-[#6366F1] mt-0.5" />
            <div className="text-[14px] italic text-[#374151] leading-6">{path.aiSummary}</div>
          </div>
        </div>

        {/* Confidence + time */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 w-full sm:w-[240px]">
            <div className="text-[12px] text-[#6B7280]">Độ tin cậy AI</div>
            <div className="mt-2 text-[24px] font-extrabold" style={{ color: conf.color }}>
              {path.confidenceScore}%
            </div>
            <div className="mt-2 h-[6px] w-[120px] rounded-full bg-[#E5E7EB]">
              <div className="h-[6px] rounded-full" style={{ width: `${path.confidenceScore}%`, background: conf.color }} />
            </div>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 flex-1">
            <div className="text-[12px] text-[#6B7280]">Thời gian dự kiến</div>
            <div className="mt-2 text-[14px] font-semibold text-[#111827]">{path.estimatedTimeToReady}</div>
            <div className="mt-2 text-[13px] text-[#6B7280]">
              Vị trí mục tiêu: <span className="font-semibold text-[#111827]">{target?.titleVi ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Strengths & challenges */}
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-[#374151]">
              <CheckCircle className="h-4 w-4 text-[#22C55E]" />
              Điểm mạnh AI ghi nhận
            </div>
            <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
              {path.strengthsHighlighted.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-[#374151]">
              <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
              Thách thức chính
            </div>
            <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
              {path.mainChallenges.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="so-card rounded-xl p-6">
        <div className="text-[16px] font-semibold text-[#374151]">Lộ trình theo thời gian</div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {path.milestones.map((m, idx) => {
            const circle =
              m.status === "current"
                ? "bg-[#4F46E5] text-white"
                : m.status === "next"
                  ? "bg-[#E0E7FF] text-[#4F46E5]"
                  : "bg-[#F3F4F6] text-[#6B7280]";
            return (
              <div key={m.id} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full grid place-items-center text-[14px] font-bold ${circle}`}>
                    {idx + 1}
                  </div>
                  <span className="rounded-full bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
                    {m.timeframe}
                  </span>
                </div>
                <div className="mt-3 text-[14px] font-semibold text-[#111827]">{m.title}</div>
                <div className="mt-1 text-[13px] text-[#6B7280]">{m.description}</div>
                <button
                  type="button"
                  onClick={() => setMsOpen((p) => ({ ...p, [m.id]: !p[m.id] }))}
                  className="mt-3 text-[13px] font-semibold text-[#4F46E5] hover:underline"
                >
                  Xem chi tiết
                </button>
                {msOpen[m.id] ? (
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-[13px] font-semibold text-[#374151]">Key Actions</div>
                      <ul className="mt-2 space-y-1 text-[13px] text-[#374151]">
                        {m.keyActions.map((a) => (
                          <li key={a} className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 text-[#14B8A6] mt-0.5" />
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-[#374151]">Success Criteria</div>
                      <ul className="mt-2 space-y-1 text-[13px] text-[#374151]">
                        {m.successCriteria.map((a) => (
                          <li key={a} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-[#22C55E] mt-0.5" />
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div className="so-card rounded-xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-[16px] font-semibold text-[#374151]">Kỹ năng cần phát triển</div>
          <div className="flex flex-wrap gap-2">
            {(["all", "critical", "high", "medium"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setPrio(k)}
                className={`rounded-lg border px-3 py-2 text-[13px] font-medium ${pillClass(prio === k)}`}
              >
                {k === "all" ? "Tất cả" : k[0].toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {skills.map((s) => {
            const pr = priorityTone(s.priority);
            const cat = categoryPill(s.category);
            return (
              <div key={s.id} className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
                <div className="border-l-[3px] p-5" style={{ borderLeftColor: pr.bar }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${cat.cls}`}>
                          {cat.text}
                        </span>
                        <div className="text-[14px] font-semibold text-[#111827]">{s.name}</div>
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${pr.pill}`}>
                      {pr.label}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-[12px] text-[#6B7280]">Mức độ hiện tại vs Yêu cầu</div>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <SkillDots current={s.currentLevel} required={s.requiredLevel} tone={pr.bar} />
                      <div className="text-[12px] text-[#6B7280]">
                        Hiện tại: <span className="font-semibold text-[#111827]">{s.currentLevel}/5</span> · Cần đạt:{" "}
                        <span className="font-semibold text-[#111827]">{s.requiredLevel}/5</span> · Gap:{" "}
                        <span className="font-semibold text-[#111827]">{s.gap}</span> bậc
                      </div>
                    </div>
                    <div className="mt-2 flex items-start gap-2 text-[13px] italic text-[#6B7280]">
                      <Info className="h-3.5 w-3.5 mt-0.5 text-[#9CA3AF]" />
                      <span>{s.why}</span>
                    </div>
                  </div>

                  {/* Internal experts */}
                  <div className="mt-4">
                    <div className="text-[13px] font-semibold text-[#374151]">Chuyên gia nội bộ có thể hỗ trợ:</div>
                    {s.internalExperts.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {s.internalExperts.map((ex) => {
                          const emp = employees.find((e) => e.id === ex.employeeId);
                          return (
                            <Link
                              key={ex.employeeId}
                              href={`/talent/${ex.employeeId}`}
                              className="block rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 hover:bg-white"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  {emp ? <EmployeeAvatar employee={emp} size="sm" /> : null}
                                  <div className="min-w-0">
                                    <div className="truncate text-[13px] font-semibold text-[#111827]">
                                      {emp?.name ?? ex.employeeId}
                                    </div>
                                    <div className="mt-1 text-[12px] text-[#6B7280] italic">{ex.notes}</div>
                                  </div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <div className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
                                    Level {ex.level}/5
                                  </div>
                                  <div className="mt-1">
                                    {ex.availableForMentoring ? (
                                      <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-semibold text-[#15803D]">
                                        Sẵn sàng mentoring
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280]">
                                        Hạn chế thời gian
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-2 text-[13px] italic text-[#6B7280]">
                        Chưa có chuyên gia nội bộ cho kỹ năng này — cần tìm bên ngoài
                      </div>
                    )}
                  </div>

                  {/* External courses */}
                  <div className="mt-4">
                    <div className="text-[13px] font-semibold text-[#374151]">Khóa học / Chứng chỉ bên ngoài:</div>
                    {s.externalCourses.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {s.externalCourses.map((c) => {
                          const { Icon, color } = courseIcon(c.type);
                          return (
                            <div key={c.name} className="rounded-xl border border-[#E5E7EB] bg-white p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                  <div className="h-8 w-8 rounded-xl bg-[#F9FAFB] grid place-items-center border border-[#E5E7EB]">
                                    <Icon className="h-4 w-4" style={{ color }} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[13px] font-medium text-[#111827]">{c.name}</div>
                                    <div className="mt-1 text-[12px] text-[#6B7280]">{c.provider}</div>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-[12px] text-[#B45309] font-semibold">
                                    {c.rating} ★
                                  </div>
                                  <div className="mt-1 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[12px] font-semibold text-[#374151]">
                                    {c.cost}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
                                  {c.duration}
                                </span>
                                <span className="rounded-full bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
                                  {languageBadge(c.language)}
                                </span>
                                <span className="ml-auto flex items-center gap-1 text-[12px] italic text-[#0F766E]">
                                  <Zap className="h-3 w-3 text-[#14B8A6]" />
                                  {c.highlight}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-2 text-[13px] italic text-[#6B7280]">Không có gợi ý khóa học bên ngoài</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning path */}
      <div className="so-card rounded-xl p-6">
        <div className="text-[16px] font-semibold text-[#374151]">Kế hoạch học tập theo giai đoạn</div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {path.learningPath.map((ph) => {
            const tone =
              ph.phase === "Phase 1"
                ? { bg: "bg-[#EEF2FF]", border: "border-[#6366F1]" }
                : ph.phase === "Phase 2"
                  ? { bg: "bg-[#F0FDF4]", border: "border-[#16A34A]" }
                  : { bg: "bg-[#FEF9C3]", border: "border-[#F59E0B]" };
            return (
              <div key={ph.phase} className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
                <div className={`border-b ${tone.border} ${tone.bg} px-4 py-3`}>
                  <div className="text-[13px] font-semibold text-[#111827]">
                    {ph.phase} · {ph.duration}
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-[#374151]">{ph.focus}</div>
                </div>
                <div className="p-4">
                  <ul className="space-y-2 text-[13px] text-[#374151]">
                    {ph.activities.map((a) => (
                      <li key={a} className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-[#14B8A6] mt-0.5" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alternative path */}
      {alt ? (
        <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-5">
          <div className="flex items-start gap-3">
            <GitFork className="h-4 w-4 text-[#B45309] mt-0.5" />
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-[#111827]">Có thể xem xét thêm:</div>
              <div className="mt-1 text-[14px] font-semibold text-[#B45309]">
                {alt.titleVi}
              </div>
              <div className="mt-1 text-[13px] text-[#6B7280]">
                Nếu bạn muốn khám phá hướng khác, đây là lựa chọn thay thế phù hợp với profile hiện tại của bạn.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

