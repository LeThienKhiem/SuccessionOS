"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ChevronDown, Clock, Search, Target } from "lucide-react";

import { employees } from "@/data/employees";
import { positions } from "@/data/positions";
import { idps } from "@/data/succession";
import { getScoreColor, getTierColor, getTierLabel } from "@/data/assessments";

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

export default function IDPPage() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [tier, setTier] = React.useState<TierFilter>("all");
  const [sortBy, setSortBy] = React.useState<SortBy>("progress_asc");
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

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
  }, [query, status, tier, sortBy, positionTitleById]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
                              {positionTitleById.get(emp.positionId) ?? "—"}
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
                                    <div className="text-[14px] font-semibold text-[#374151]">
                                      Hoạt động phát triển
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
                                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${t.className}`}>
                                            {t.label}
                                          </span>
                                          <div className="min-w-0 flex-1">
                                            <div className="truncate text-[13px] font-medium text-[#111827]">
                                              {a.title}
                                            </div>
                                            <div className="text-[12px] text-[#6B7280]">
                                              {a.targetDate}
                                            </div>
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

                                  <div className="mt-4 flex items-center justify-between gap-3">
                                    <div className="text-[13px] text-[#6B7280]">
                                      Duyệt bởi {idp.approvedBy} · Tạo {idp.createdDate}
                                    </div>
                                    <Link
                                      href={`/talent/${emp.id}`}
                                      className="text-[13px] font-semibold text-[#4F46E5] hover:underline"
                                    >
                                      Xem IDP đầy đủ →
                                    </Link>
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
    </div>
  );
}

