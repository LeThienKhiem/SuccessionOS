"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ChevronDown, Clock, Plus, Search, Send, Target, X, Zap } from "lucide-react";

import { employees } from "@/data/employees";
import { positions } from "@/data/positions";
import { idps } from "@/data/succession";
import { getScoreColor, getTierLabel } from "@/data/assessments";

import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { ReadinessBadge } from "@/components/ReadinessBadge";
import { TierBadge } from "@/components/TierBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScoreBar } from "@/components/ScoreBar";

type StatusFilter = "all" | "active" | "review" | "completed" | "not-started";
type TierFilter = "all" | "core" | "potential" | "successor";
type SortBy = "progress_asc" | "progress_desc" | "name_asc" | "deadline_asc";
type DevTab = "70" | "20" | "10";

type StretchType = "stretch" | "rotation" | "shadowing";
type StretchStatus = "not-started" | "in-progress" | "completed";
type StretchTask = {
  id: string;
  title: string;
  type: StretchType;
  deadline: string;
  progress: number;
  status: StretchStatus;
  description?: string;
  competencyGoal?: string;
};

type MentorSession = {
  id: string;
  date: string;
  topic: string;
  durationMin: number;
  outcome: string;
};

function statusLabel(status: string) {
  return status === "active"
    ? "Đang thực hiện"
    : status === "review"
      ? "Cần review"
      : status === "completed"
        ? "Hoàn thành"
        : "Chưa có IDP";
}

function statusStyle(status: string) {
  if (status === "active") return "bg-[#DCFCE7] text-[#15803D]";
  if (status === "review") return "bg-[#FEF9C3] text-[#854D0E]";
  if (status === "completed") return "bg-[#EDE9FE] text-[#6D28D9]";
  return "bg-[#F3F4F6] text-[#6B7280]";
}

function statusDot(status: string) {
  if (status === "active") return "#22C55E";
  if (status === "review") return "#F59E0B";
  if (status === "completed") return "#7C3AED";
  return "#EF4444";
}

function formatReviewDate(iso: string) {
  // expects YYYY-MM-DD
  const [y, m] = iso.split("-").slice(0, 2);
  if (!y || !m) return "—";
  return `${m}/${y}`;
}

function toDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function activityTypeBadge(type: string) {
  const map: Record<string, { label: string; className: string }> = {
    training: { label: "Đào tạo", className: "bg-[#DBEAFE] text-[#1D4ED8]" },
    project: { label: "Dự án", className: "bg-[#DCFCE7] text-[#15803D]" },
    mentoring: { label: "Kèm cặp", className: "bg-[#EDE9FE] text-[#6D28D9]" },
    rotation: { label: "Luân chuyển", className: "bg-[#FEF3C7] text-[#B45309]" },
    shadowing: { label: "Quan sát", className: "bg-[#F3F4F6] text-[#374151]" },
    stretch: { label: "Thử thách", className: "bg-[#FEE2E2] text-[#DC2626]" },
  };
  return map[type] ?? { label: type, className: "bg-[#F3F4F6] text-[#374151]" };
}

function statusDotColor(status: string) {
  if (status === "completed") return "#22C55E";
  if (status === "in-progress") return "#F59E0B";
  return "#9CA3AF";
}

function stretchStatusLabel(s: StretchStatus) {
  if (s === "completed") return "Hoàn thành";
  if (s === "in-progress") return "Đang thực hiện";
  return "Chưa bắt đầu";
}

function humanDeadline(iso: string) {
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }
  return iso;
}

export default function IDPPage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [tier, setTier] = React.useState<TierFilter>("all");
  const [sortBy, setSortBy] = React.useState<SortBy>("progress_asc");
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [devTabByEmp, setDevTabByEmp] = React.useState<Record<string, DevTab>>({});

  const [toast, setToast] = React.useState<null | { text: string }>(null);
  const showToast = React.useCallback((text: string) => {
    setToast({ text });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const [stretchModal, setStretchModal] = React.useState<{
    open: boolean;
    employeeId: string | null;
  }>({ open: false, employeeId: null });

  const [approvalModal, setApprovalModal] = React.useState<{
    open: boolean;
    employeeId: string | null;
  }>({ open: false, employeeId: null });

  const [stretchTasks, setStretchTasks] = React.useState<Record<string, StretchTask[]>>({
    "emp-019": [
      {
        id: "st-1",
        title: "Dẫn dắt đàm phán hợp đồng Block B ($5M)",
        type: "stretch",
        deadline: "2025-06-30",
        progress: 45,
        status: "in-progress",
        description: "Chuẩn bị agenda, dẫn dắt 2 phiên họp với vendor, chốt điều khoản chính.",
        competencyGoal: "Contract negotiation, stakeholder management",
      },
      {
        id: "st-2",
        title: "Acting Project Director 2 tuần khi NVĐ đi công tác",
        type: "rotation",
        deadline: "2025-07-15",
        progress: 0,
        status: "not-started",
        description: "Chịu trách nhiệm điều phối họp daily, escalation và báo cáo tuần.",
        competencyGoal: "Leadership under pressure, decision making",
      },
    ],
    "emp-010": [
      {
        id: "st-3",
        title: "Shadow client negotiation session (PVN) — 3 buổi",
        type: "shadowing",
        deadline: "2025-05-25",
        progress: 20,
        status: "in-progress",
        description: "Quan sát + ghi lại framework đàm phán; trình bày lại bài học.",
        competencyGoal: "Negotiation framework, communication",
      },
    ],
  });

  const mentoringSessions = React.useMemo<Record<string, MentorSession[]>>(
    () => ({
      "emp-019": [
        {
          id: "ms-1",
          date: "15/03/2025",
          topic: "Contract negotiation strategy",
          durationMin: 90,
          outcome: "Nắm được framework đàm phán và cách chuẩn bị BATNA",
        },
        {
          id: "ms-2",
          date: "02/04/2025",
          topic: "Escalation & stakeholder mapping",
          durationMin: 60,
          outcome: "Tự lập stakeholder map cho Block B và đề xuất 3 phương án escalation",
        },
      ],
      "emp-020": [
        {
          id: "ms-3",
          date: "10/02/2025",
          topic: "Multi-discipline team leadership",
          durationMin: 75,
          outcome: "Xác định 2 action để cải thiện phối hợp giữa Structural và Piping",
        },
      ],
    }),
    []
  );

  const stats = React.useMemo(() => {
    const active = employees.filter((e) => e.idpStatus === "active").length;
    const review = employees.filter((e) => e.idpStatus === "review").length;
    const completed = employees.filter((e) => e.idpStatus === "completed").length;
    const none = employees.filter((e) => e.idpStatus === "not-started").length;
    return { active, review, completed, none };
  }, []);

  const positionTitleById = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const p of positions) m.set(p.id, p.titleVi);
    return m;
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...employees];

    if (q) list = list.filter((e) => e.name.toLowerCase().includes(q));
    if (status !== "all") list = list.filter((e) => e.idpStatus === status);
    if (tier !== "all") list = list.filter((e) => e.tier === tier);

    list.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name, "vi");
      if (sortBy === "progress_desc") return b.idpProgress - a.idpProgress;
      if (sortBy === "progress_asc") return a.idpProgress - b.idpProgress;

      // deadline_asc: use detailed idp.reviewDate if available; else far future
      const ida = idps.find((i) => i.employeeId === a.id);
      const idb = idps.find((i) => i.employeeId === b.id);
      const da = ida?.reviewDate ? toDate(ida.reviewDate)?.getTime() ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      const db = idb?.reviewDate ? toDate(idb.reviewDate)?.getTime() ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      return da - db;
    });

    return list;
  }, [query, status, tier, sortBy]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        setDevTabByEmp((tabs) => (tabs[id] ? tabs : { ...tabs, [id]: "70" }));
      }
      return next;
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="space-y-2">
        <p className="text-[13px] text-[#6B7280]">Kế hoạch IDP</p>
        <h1 className="text-[24px] font-semibold text-[#111827]">
          Kế hoạch Phát triển Cá nhân
        </h1>
        <p className="text-[14px] text-[#6B7280]">
          Theo dõi tiến độ phát triển của 25 nhân sự trong Chuỗi
        </p>
        <hr className="border-[#E5E7EB]" />
      </div>

      {/* SUMMARY STATS */}
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[14px]">
          <span className="h-2 w-2 rounded-full" style={{ background: statusDot("active") }} />
          <span className="text-[#374151]">Đang thực hiện:</span>
          <span className="font-semibold text-[#111827]">{stats.active}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[14px]">
          <span className="h-2 w-2 rounded-full" style={{ background: statusDot("review") }} />
          <span className="text-[#374151]">Cần review:</span>
          <span className="font-semibold text-[#111827]">{stats.review}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[14px]">
          <span className="h-2 w-2 rounded-full" style={{ background: statusDot("completed") }} />
          <span className="text-[#374151]">Hoàn thành:</span>
          <span className="font-semibold text-[#111827]">{stats.completed}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[14px]">
          <span className="h-2 w-2 rounded-full" style={{ background: statusDot("not-started") }} />
          <span className="text-[#374151]">Chưa có IDP:</span>
          <span className="font-semibold text-[#111827]">{stats.none}</span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="so-card rounded-xl px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên..."
                className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pl-10 pr-3 text-[14px] text-[#374151] outline-none focus:border-[#6366F1]"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="h-10 w-full sm:w-[150px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#374151] outline-none focus:border-[#6366F1]"
            >
              <option value="all">Trạng thái</option>
              <option value="active">Đang thực hiện</option>
              <option value="review">Cần review</option>
              <option value="completed">Hoàn thành</option>
              <option value="not-started">Chưa có IDP</option>
            </select>

            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as TierFilter)}
              className="h-10 w-full sm:w-[140px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#374151] outline-none focus:border-[#6366F1]"
            >
              <option value="all">Tầng nhân sự</option>
              <option value="core">{getTierLabel("core")}</option>
              <option value="potential">{getTierLabel("potential")}</option>
              <option value="successor">{getTierLabel("successor")}</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="h-10 w-full sm:w-[180px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#374151] outline-none focus:border-[#6366F1]"
            >
              <option value="progress_asc">Tiến độ thấp nhất ↑</option>
              <option value="progress_desc">Tiến độ cao nhất ↓</option>
              <option value="name_asc">Tên A–Z</option>
              <option value="deadline_asc">Deadline gần nhất</option>
            </select>
          </div>

          <div className="text-[13px] text-[#6B7280]">
            Hiển thị{" "}
            <span className="font-semibold text-[#111827]">{filtered.length}</span> /{" "}
            {employees.length}
          </div>
        </div>
      </div>

      {/* TABLE */}
      {filtered.length === 0 ? (
        <div className="so-card rounded-xl px-6 py-14">
          <div className="flex flex-col items-center gap-3 text-center">
            <Target className="h-12 w-12 text-[#9CA3AF]" />
            <div className="text-[14px] font-semibold text-[#374151]">
              Không có nhân sự phù hợp
            </div>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                setQuery("");
                setStatus("all");
                setTier("all");
                setSortBy("progress_asc");
                setExpanded(new Set());
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      ) : (
        <div className="so-card rounded-xl p-0 overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow className="bg-[#F9FAFB]">
                <TableHead className="w-[200px] text-[13px] text-[#6B7280]">
                  Nhân viên
                </TableHead>
                <TableHead className="w-[90px] text-[13px] text-[#6B7280]">
                  Tầng
                </TableHead>
                <TableHead className="w-[180px] text-[13px] text-[#6B7280]">
                  Vị trí mục tiêu
                </TableHead>
                <TableHead className="w-[130px] text-[13px] text-[#6B7280]">
                  Trạng thái
                </TableHead>
                <TableHead className="w-[160px] text-[13px] text-[#6B7280]">
                  Tiến độ
                </TableHead>
                <TableHead className="w-[120px] text-[13px] text-[#6B7280]">
                  Deadline review
                </TableHead>
                <TableHead className="w-[110px] text-[13px] text-[#6B7280]">
                  Hoạt động
                </TableHead>
                <TableHead className="w-[48px] text-[13px] text-[#6B7280] text-right">
                  Mở rộng
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((emp) => {
                const idp = idps.find((i) => i.employeeId === emp.id);

                const targetId =
                  idp?.targetPositionId ?? emp.targetPositionId ?? undefined;
                const targetTitle = targetId
                  ? positionTitleById.get(targetId) ?? "—"
                  : "—";

                const isOverdue = (() => {
                  if (!idp?.reviewDate) return false;
                  const d = toDate(idp.reviewDate);
                  if (!d) return false;
                  return d.getTime() < Date.now();
                })();

                const completedCount = idp
                  ? idp.activities.filter((a) => a.status === "completed").length
                  : 0;
                const totalCount = idp ? idp.activities.length : 0;

                const isExpanded = expanded.has(emp.id);

                const rowTone =
                  emp.idpStatus === "review"
                    ? "border-l-[3px] border-l-[#F59E0B] bg-[#FFFBEB]/40"
                    : emp.idpStatus === "completed"
                      ? "border-l-[3px] border-l-[#7C3AED] bg-[#F5F3FF]/60"
                      : "";

                return (
                  <React.Fragment key={emp.id}>
                    <TableRow className={rowTone}>
                      <TableCell className="whitespace-normal">
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar employee={emp} size="sm" />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-[#111827]">
                              {emp.name}
                            </div>
                            <div className="truncate text-[12px] text-[#6B7280]">
                              {emp.currentRoleTitle ?? "—"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <TierBadge tier={emp.tier} />
                        </div>
                      </TableCell>

                      <TableCell className="text-[13px] text-[#374151]">
                        {targetTitle === "—" ? (
                          <span className="text-[#6B7280]">—</span>
                        ) : (
                          targetTitle
                        )}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${statusStyle(
                            emp.idpStatus
                          )}`}
                        >
                          {statusLabel(emp.idpStatus)}
                        </span>
                      </TableCell>

                      <TableCell className="whitespace-normal">
                        {emp.idpStatus === "not-started" ? (
                          <span className="text-[13px] italic text-[#6B7280]">
                            —
                          </span>
                        ) : emp.idpStatus === "completed" ? (
                          <span className="text-[13px] font-semibold text-[#6D28D9]">
                            ✓ 100%
                          </span>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="h-[6px] w-full rounded-full bg-[#E5E7EB]">
                                <div
                                  className={`h-[6px] rounded-full ${getScoreColor(
                                    emp.idpProgress
                                  )}`}
                                  style={{ width: `${emp.idpProgress}%` }}
                                />
                              </div>
                            </div>
                            <div className="w-10 text-right text-[13px] font-semibold text-[#111827]">
                              {emp.idpProgress}%
                            </div>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-[13px]">
                        {idp?.reviewDate ? (
                          <div
                            className={`inline-flex items-center gap-2 ${
                              isOverdue ? "text-[#DC2626]" : "text-[#374151]"
                            }`}
                          >
                            {isOverdue ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : null}
                            {formatReviewDate(idp.reviewDate)}
                          </div>
                        ) : (
                          <span className="text-[#6B7280]">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-[13px]">
                        {idp ? (
                          <span
                            className={
                              completedCount === totalCount
                                ? "text-[#15803D] font-semibold"
                                : "text-[#6B7280]"
                            }
                          >
                            {completedCount}/{totalCount}
                          </span>
                        ) : (
                          <span className="text-[#6B7280]">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => toggleExpand(emp.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"
                          aria-label="Toggle expand"
                        >
                          <ChevronDown
                            className={`h-4 w-4 text-[#6B7280] transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </TableCell>
                    </TableRow>

                    {isExpanded ? (
                      <TableRow>
                        <TableCell colSpan={8} className="p-0">
                          <div className="bg-[#F8F9FC] border-t border-b border-dashed border-[#E5E7EB] px-6 py-5">
                            {idp ? (
                              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[30%,30%,40%]">
                                <div>
                                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[#374151]">
                                    <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
                                    Mục tiêu 12 tháng
                                  </div>
                                  <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
                                    {idp.shortTermGoals.map((g) => (
                                      <li key={g} className="flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#14B8A6]" />
                                        <span>{g}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[#374151]">
                                    <span className="h-2 w-2 rounded-full bg-[#4F46E5]" />
                                    Mục tiêu 2–3 năm
                                  </div>
                                  <ul className="mt-3 space-y-2 text-[13px] text-[#374151]">
                                    {idp.midTermGoals.map((g) => (
                                      <li key={g} className="flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />
                                        <span>{g}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-[14px] font-semibold text-[#374151]">
                                      <div className="h-8 w-8 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] grid place-items-center">
                                        <Zap className="h-4 w-4 text-[#F59E0B]" />
                                      </div>
                                      Giao việc thử thách (70-20-10)
                                    </div>
                                    <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
                                      {completedCount}/{totalCount} hoàn thành
                                    </span>
                                  </div>

                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {(
                                      [
                                        { key: "70", label: "70% Thực tế" },
                                        { key: "20", label: "20% Kèm cặp" },
                                        { key: "10", label: "10% Đào tạo" },
                                      ] as const
                                    ).map((t) => {
                                      const active = (devTabByEmp[emp.id] ?? "70") === t.key;
                                      return (
                                        <button
                                          key={t.key}
                                          type="button"
                                          onClick={() =>
                                            setDevTabByEmp((prev) => ({ ...prev, [emp.id]: t.key }))
                                          }
                                          className={[
                                            "rounded-full px-3 py-1.5 text-[12px] font-semibold border transition",
                                            active
                                              ? "border-[#A5B4FC] bg-[#EEF2FF] text-[#4F46E5]"
                                              : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]",
                                          ].join(" ")}
                                        >
                                          {t.label}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {(devTabByEmp[emp.id] ?? "70") === "70" ? (
                                    <div className="mt-4">
                                      <div className="space-y-2">
                                        {(stretchTasks[emp.id] ?? []).length === 0 ? (
                                          <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 py-4 text-[13px] text-[#6B7280]">
                                            Chưa có nhiệm vụ thử thách. Thêm nhiệm vụ để tạo trải nghiệm 70-20-10.
                                          </div>
                                        ) : (
                                          (stretchTasks[emp.id] ?? []).map((t) => {
                                            const badge = activityTypeBadge(t.type);
                                            return (
                                              <div
                                                key={t.id}
                                                className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3"
                                              >
                                                <div className="flex items-start justify-between gap-3">
                                                  <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                      <span
                                                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}
                                                      >
                                                        {badge.label}
                                                      </span>
                                                      <div className="truncate text-[13px] font-semibold text-[#111827]">
                                                        {t.title}
                                                      </div>
                                                    </div>
                                                    <div className="mt-1 text-[12px] text-[#6B7280]">
                                                      Loại: {t.type} · Deadline: {humanDeadline(t.deadline)} · Progress:{" "}
                                                      <span className="font-semibold text-[#111827]">
                                                        {t.progress}%
                                                      </span>{" "}
                                                      · Status: {stretchStatusLabel(t.status)}
                                                    </div>
                                                  </div>
                                                  <div className="shrink-0 flex items-center gap-2">
                                                    <button
                                                      type="button"
                                                      onClick={() => showToast("Xem chi tiết (mock)")}
                                                      className="h-8 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold text-[#374151] hover:bg-[#F9FAFB]"
                                                    >
                                                      Xem chi tiết
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => showToast("Cập nhật tiến độ (mock)")}
                                                      className="h-8 rounded-lg bg-[#4F46E5] px-3 text-[13px] font-semibold text-white"
                                                    >
                                                      Cập nhật tiến độ
                                                    </button>
                                                  </div>
                                                </div>

                                                <div className="mt-3 flex items-center gap-3">
                                                  <div className="flex-1">
                                                    <ScoreBar value={t.progress} size="sm" showNumber={false} />
                                                  </div>
                                                  <span
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ background: statusDotColor(t.status) }}
                                                  />
                                                </div>
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => setStretchModal({ open: true, employeeId: emp.id })}
                                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#4F46E5] px-3 py-2 text-[13px] font-semibold text-white"
                                      >
                                        <Plus className="h-4 w-4" />
                                        + Thêm nhiệm vụ thử thách
                                      </button>
                                    </div>
                                  ) : (devTabByEmp[emp.id] ?? "70") === "20" ? (
                                    <div className="mt-4 space-y-2">
                                      {(mentoringSessions[emp.id] ?? []).length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 py-4 text-[13px] text-[#6B7280]">
                                          Chưa có buổi kèm cặp nào.
                                        </div>
                                      ) : (
                                        (mentoringSessions[emp.id] ?? []).map((s) => (
                                          <div
                                            key={s.id}
                                            className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3"
                                          >
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="min-w-0">
                                                <div className="text-[13px] font-semibold text-[#111827]">
                                                  Buổi mentoring — {s.date}
                                                </div>
                                                <div className="mt-1 text-[12px] text-[#6B7280]">
                                                  Chủ đề: {s.topic} · Thời lượng: {s.durationMin} phút
                                                </div>
                                                <div className="mt-2 text-[13px] text-[#374151]">
                                                  Kết quả: {s.outcome}
                                                </div>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => showToast("Thêm buổi kèm cặp (mock)")}
                                                className="h-8 shrink-0 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold text-[#374151] hover:bg-[#F9FAFB]"
                                              >
                                                Thêm buổi kèm cặp
                                              </button>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  ) : (
                                    <div className="mt-4">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="text-[13px] font-semibold text-[#374151]">
                                          10% Đào tạo (Formal)
                                        </div>
                                        <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
                                          {completedCount}/{totalCount} hoàn thành
                                        </span>
                                      </div>

                                      <div className="mt-3 space-y-2">
                                        {idp.activities.map((a) => {
                                          const t = activityTypeBadge(a.type);
                                          return (
                                            <div
                                              key={a.id}
                                              className="flex items-center gap-3 border-b border-dashed border-[#E5E7EB] py-2"
                                            >
                                              <span
                                                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${t.className}`}
                                              >
                                                {t.label}
                                              </span>
                                              <div className="min-w-0 flex-1">
                                                <div className="truncate text-[13px] font-medium text-[#111827]">
                                                  {a.title}
                                                </div>
                                                <div className="text-[12px] text-[#6B7280]">{a.targetDate}</div>
                                              </div>
                                              <div className="w-[80px]">
                                                <ScoreBar value={a.progress} size="sm" showNumber={false} />
                                              </div>
                                              <span
                                                className="h-2 w-2 rounded-full"
                                                style={{ background: statusDotColor(a.status) }}
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  <div className="mt-4 flex items-center justify-between gap-3">
                                    <div className="text-[13px] text-[#6B7280]">
                                      Duyệt bởi {idp.approvedBy} · Tạo {idp.createdDate}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          showToast("Đã lưu nháp · Có thể tiếp tục chỉnh sửa")
                                        }
                                        className="h-8 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold text-[#374151] hover:bg-[#F9FAFB]"
                                      >
                                        Lưu nháp
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setApprovalModal({ open: true, employeeId: emp.id })
                                        }
                                        className="h-8 rounded-lg bg-[#4F46E5] px-3 text-[13px] font-semibold text-white"
                                      >
                                        Gửi phê duyệt
                                      </button>
                                      <Link
                                        href={`/talent/${emp.id}`}
                                        className="text-[13px] font-semibold text-[#4F46E5] hover:underline"
                                      >
                                        Xem IDP đầy đủ →
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : emp.idpStatus === "active" || emp.idpStatus === "review" ? (
                              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="flex gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] grid place-items-center">
                                    <Clock className="h-5 w-5 text-[#F59E0B]" />
                                  </div>
                                  <div>
                                    <div className="text-[14px] font-semibold text-[#374151]">
                                      IDP đang được xây dựng
                                    </div>
                                    <div className="mt-1 text-[13px] text-[#6B7280]">
                                      Kế hoạch chi tiết sẽ được cập nhật sau buổi review với quản lý trực tiếp
                                    </div>
                                    <Button
                                      asChild
                                      variant="outline"
                                      className="mt-3 h-8 rounded-lg px-3"
                                    >
                                      <Link href={`/talent/${emp.id}`}>Xem hồ sơ →</Link>
                                    </Button>
                                  </div>
                                </div>

                                {emp.targetPositionId ? (
                                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                                    <div className="text-[13px] text-[#6B7280]">
                                      Vị trí đang nhắm tới:
                                    </div>
                                    <div className="mt-2 text-[14px] font-semibold text-[#111827]">
                                      {positionTitleById.get(emp.targetPositionId) ?? "—"}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-3">
                                      <ReadinessBadge readiness={emp.readiness} />
                                      <div className="text-[13px] text-[#6B7280]">
                                        Tiến độ hiện tại:{" "}
                                        <span className="font-semibold text-[#111827]">
                                          {emp.idpProgress}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="mt-3">
                                      <div className="h-[6px] w-[120px] rounded-full bg-[#E5E7EB]">
                                        <div
                                          className={`h-[6px] rounded-full ${getScoreColor(emp.idpProgress)}`}
                                          style={{ width: `${emp.idpProgress}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="flex gap-4">
                                  <div className="h-8 w-8 rounded-lg bg-white border border-[#E5E7EB] grid place-items-center text-[#6B7280]">
                                    📄
                                  </div>
                                  <div>
                                    <div className="text-[14px] font-semibold text-[#374151]">
                                      Chưa có kế hoạch phát triển chi tiết
                                    </div>
                                    <div className="mt-1 text-[13px] text-[#6B7280]">
                                      IDP sẽ được xây dựng dựa trên kết quả đánh giá và định hướng kế thừa
                                    </div>
                                    <Button
                                      asChild
                                      variant="outline"
                                      className="mt-3 h-8 rounded-lg px-3"
                                    >
                                      <Link href={`/talent/${emp.id}`}>
                                        Xem hồ sơ nhân viên →
                                      </Link>
                                    </Button>
                                  </div>
                                </div>

                                {emp.targetPositionId ? (
                                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                                    <div className="text-[13px] text-[#6B7280]">
                                      Vị trí mục tiêu:
                                    </div>
                                    <div className="mt-2 text-[14px] font-semibold text-[#111827]">
                                      {positionTitleById.get(emp.targetPositionId) ?? "—"}
                                    </div>
                                    <div className="mt-3">
                                      <ReadinessBadge readiness={emp.readiness} />
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <StretchTaskModal
        open={stretchModal.open}
        employeeId={stretchModal.employeeId}
        onClose={() => setStretchModal({ open: false, employeeId: null })}
        onAdd={(employeeId, task) => {
          setStretchTasks((prev) => ({
            ...prev,
            [employeeId]: [task, ...(prev[employeeId] ?? [])],
          }));
          showToast("Đã thêm nhiệm vụ thử thách");
        }}
      />

      <ApprovalWorkflowModal
        open={approvalModal.open}
        employeeId={approvalModal.employeeId}
        onClose={() => setApprovalModal({ open: false, employeeId: null })}
        onSaveDraft={() => showToast("Đã lưu nháp · Có thể tiếp tục chỉnh sửa")}
        onSubmit={() => {
          showToast("IDP đã gửi phê duyệt · Chờ xác nhận từ Trần Minh Tuấn");
          setApprovalModal({ open: false, employeeId: null });
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

function ApprovalWorkflowModal(props: {
  open: boolean;
  employeeId: string | null;
  onClose: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  const { open, onClose, onSaveDraft, onSubmit } = props;
  const [note, setNote] = React.useState("");
  const [consent, setConsent] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setNote("");
    setConsent(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="text-[16px] font-bold text-[#111827]">Quy trình phê duyệt</div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827]"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Stepper */}
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="text-[13px] font-semibold text-[#374151]">Quy trình</div>
            <div className="mt-3 space-y-3">
              {[
                { t: "Nhân viên gửi", s: "done", meta: "✅ Hoàn thành · 18/04/2025" },
                { t: "Manager trực tiếp", s: "pending", meta: "⏳ Đang chờ · TMT" },
                { t: "Trưởng phòng TCNS", s: "blocked", meta: "⏳ Chờ bước trước" },
                { t: "Ban PTNT phê duyệt", s: "blocked", meta: "⏳ Chờ bước trước" },
                { t: "Giám đốc ký duyệt", s: "blocked", meta: "⏳ Chờ bước trước" },
              ].map((step, idx, arr) => (
                <div key={step.t} className="relative pl-8">
                  {idx !== arr.length - 1 ? (
                    <div className="absolute left-[13px] top-[18px] h-[calc(100%-6px)] w-px bg-[#E5E7EB]" />
                  ) : null}
                  <div
                    className={[
                      "absolute left-[9px] top-[6px] h-3 w-3 rounded-full",
                      step.s === "done"
                        ? "bg-[#22C55E]"
                        : step.s === "pending"
                          ? "bg-[#F59E0B]"
                          : "bg-[#D1D5DB]",
                    ].join(" ")}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[13px] font-semibold text-[#111827]">{step.t}</div>
                    <div className="text-[12px] text-[#6B7280]">{step.meta}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-[13px] text-[#374151]">
              <div>
                Người duyệt tiếp:{" "}
                <span className="font-semibold text-[#111827]">Trần Minh Tuấn</span>{" "}
                <span className="text-[#6B7280]">(Manager)</span>
              </div>
              <div>
                Deadline:{" "}
                <span className="font-semibold text-[#111827]">25/04/2025</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <div className="text-[13px] font-semibold text-[#374151]">Ghi chú gửi kèm:</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú cho người duyệt..."
              className="min-h-[90px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#6366F1]"
            />
          </div>

          {/* Consent */}
          <label className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#D1D5DB] accent-[#4F46E5]"
            />
            <div className="text-[13px] text-[#374151] leading-5">
              Tôi xác nhận đã đọc và đồng ý với điều khoản xử lý dữ liệu cá nhân theo Điều 21
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
          <button
            type="button"
            onClick={onSaveDraft}
            className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold text-[#374151] hover:bg-[#F9FAFB]"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            disabled={!consent}
            onClick={onSubmit}
            className="inline-flex items-center gap-2 h-9 rounded-lg bg-[#4F46E5] px-3 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Gửi phê duyệt
          </button>
        </div>
      </div>
    </div>
  );
}

function StretchTaskModal(props: {
  open: boolean;
  employeeId: string | null;
  onClose: () => void;
  onAdd: (employeeId: string, task: StretchTask) => void;
}) {
  const { open, employeeId, onClose, onAdd } = props;

  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<StretchType>("stretch");
  const [deadline, setDeadline] = React.useState("2025-06-30");
  const [desc, setDesc] = React.useState("");
  const [goal, setGoal] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setTitle("");
    setType("stretch");
    setDeadline("2025-06-30");
    setDesc("");
    setGoal("");
  }, [open, employeeId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-5">
          <div className="text-[16px] font-bold text-[#111827]">Thêm nhiệm vụ thử thách</div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827]"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="text-[13px] font-semibold text-[#374151]">Tên nhiệm vụ</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Dẫn dắt đàm phán hợp đồng Block B ($5M)"
              className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-[13px] font-semibold text-[#374151]">Loại</div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as StretchType)}
                className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
              >
                <option value="stretch">stretch</option>
                <option value="rotation">rotation</option>
                <option value="shadowing">shadowing</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="text-[13px] font-semibold text-[#374151]">Deadline</div>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[13px] font-semibold text-[#374151]">Mô tả</div>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Mô tả ngắn về nhiệm vụ, deliverables..."
              className="min-h-[90px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#6366F1]"
            />
          </div>

          <div className="space-y-2">
            <div className="text-[13px] font-semibold text-[#374151]">Mục tiêu năng lực cần đạt</div>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="VD: Contract negotiation, leadership under pressure..."
              className="min-h-[70px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#6366F1]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#E5E7EB] p-5">
          <div className="text-[12px] text-[#6B7280]">Prototype demo — task lưu trong session</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold text-[#374151]"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!employeeId || title.trim().length === 0}
              onClick={() => {
                if (!employeeId) return;
                const task: StretchTask = {
                  id: `st-${Math.random().toString(16).slice(2, 8)}`,
                  title: title.trim(),
                  type,
                  deadline,
                  progress: 0,
                  status: "not-started",
                  description: desc.trim() || undefined,
                  competencyGoal: goal.trim() || undefined,
                };
                onAdd(employeeId, task);
                onClose();
              }}
              className="h-9 rounded-lg bg-[#4F46E5] px-3 text-[13px] font-semibold text-white disabled:opacity-40"
            >
              Thêm nhiệm vụ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

