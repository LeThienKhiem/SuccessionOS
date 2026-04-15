"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { employees } from "@/data/employees";
import { departments, positions } from "@/data/positions";
import { marketIntelData } from "@/data/marketIntelligence";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { ReadinessBadge } from "@/components/ReadinessBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { StatsCard } from "@/components/StatsCard";
import { TierBadge } from "@/components/TierBadge";
import { Button } from "@/components/ui/button";
import { useModuleContext } from "@/context/ModuleContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TierFilter = "all" | "core" | "potential" | "successor";
type RiskFilter = "all" | "low" | "medium" | "high" | "critical";
type ReadinessFilter = "all" | "now" | "1-2yr" | "3-5yr";
type SortBy =
  | "overall_desc"
  | "overall_asc"
  | "name_asc"
  | "risk_desc"
  | "idp_asc";

const PAGE_SIZE = 10;

function overallColor(v: number) {
  if (v >= 85) return "#15803D";
  if (v >= 70) return "#1D4ED8";
  return "#DC2626";
}

export default function TalentPage() {
  const { isActive } = useModuleContext();
  const [tier, setTier] = React.useState<TierFilter>("all");
  const [query, setQuery] = React.useState("");
  const [deptId, setDeptId] = React.useState<string>("all");
  const [risk, setRisk] = React.useState<RiskFilter>("all");
  const [readiness, setReadiness] = React.useState<ReadinessFilter>("all");
  const [sortBy, setSortBy] = React.useState<SortBy>("overall_desc");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [tier, query, deptId, risk, readiness, sortBy]);

  const counts = React.useMemo(() => {
    const core = employees.filter((e) => e.tier === "core").length;
    const potential = employees.filter((e) => e.tier === "potential").length;
    const successor = employees.filter((e) => e.tier === "successor").length;
    return { all: employees.length, core, potential, successor };
  }, []);

  const positionById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const p of positions) map.set(p.id, p.titleVi);
    return map;
  }, []);

  const marketByEmployeeId = React.useMemo(() => {
    const map = new Map<string, (typeof marketIntelData)[number]>();
    for (const d of marketIntelData) map.set(d.employeeId, d);
    return map;
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = [...employees];

    // 1) tier
    if (tier !== "all") list = list.filter((e) => e.tier === tier);

    // 2) search (name or position title)
    if (q) {
      list = list.filter((e) => {
        const pos = positionById.get(e.positionId) ?? "";
        return (
          e.name.toLowerCase().includes(q) || pos.toLowerCase().includes(q)
        );
      });
    }

    // 3) department
    if (deptId !== "all") list = list.filter((e) => e.departmentId === deptId);

    // 4) risk
    if (risk !== "all") list = list.filter((e) => e.riskLevel === risk);

    // 5) readiness
    if (readiness !== "all") list = list.filter((e) => e.readiness === readiness);

    // 6) sort
    list.sort((a, b) => {
      if (sortBy === "overall_desc") return b.overallScore - a.overallScore;
      if (sortBy === "overall_asc") return a.overallScore - b.overallScore;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name, "vi");
      if (sortBy === "risk_desc") return b.riskScore - a.riskScore;
      // idp_asc: IDP thấp nhất trước (not-started treated as 101)
      const ap = a.idpStatus === "not-started" ? 101 : a.idpProgress;
      const bp = b.idpStatus === "not-started" ? 101 : b.idpProgress;
      return ap - bp;
    });

    return list;
  }, [tier, query, deptId, risk, readiness, sortBy, positionById]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const avg = React.useMemo(() => {
    const base = employees.length || 1;
    const perf = Math.round(
      employees.reduce((s, e) => s + e.performanceScore, 0) / base
    );
    const pot = Math.round(
      employees.reduce((s, e) => s + e.potentialScore, 0) / base
    );
    const overall = Math.round(
      employees.reduce((s, e) => s + e.overallScore, 0) / base
    );
    const highRisk = employees.filter(
      (e) => e.riskLevel === "high" || e.riskLevel === "critical"
    ).length;
    const idpActive = employees.filter((e) => e.idpStatus === "active").length;
    return { perf, pot, overall, highRisk, idpActive };
  }, []);

  const pillClass = (active: boolean, tone?: "purple" | "blue" | "teal") => {
    if (active) {
      if (tone === "purple") return "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]";
      if (tone === "blue") return "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
      if (tone === "teal") return "bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]";
      return "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]";
    }
    return "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="space-y-2">
        <p className="text-[13px] text-[#6B7280]">Nhân tài</p>
        <h1 className="text-[24px] font-semibold text-[#111827]">
          Chuỗi Phát triển Nhân tài
        </h1>
        <p className="text-[14px] text-[#6B7280]">
          25 nhân sự đang trong chương trình phát triển
        </p>
        <hr className="border-[#E5E7EB]" />
      </div>

      {/* FILTER BAR */}
      <div className="sticky top-0 z-20 -mx-8 bg-[#F8F9FC] px-8 pt-4 pb-0">
        {/* Row 1: pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTier("all")}
            className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(
              tier === "all"
            )}`}
          >
            Tất cả{" "}
            <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">
              {counts.all}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTier("core")}
            className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(
              tier === "core",
              "purple"
            )}`}
          >
            Nòng cốt{" "}
            <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">
              {counts.core}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTier("potential")}
            className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(
              tier === "potential",
              "blue"
            )}`}
          >
            Tiềm năng{" "}
            <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">
              {counts.potential}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTier("successor")}
            className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(
              tier === "successor",
              "teal"
            )}`}
          >
            Kế thừa{" "}
            <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">
              {counts.successor}
            </span>
          </button>
        </div>

        {/* Row 2: controls */}
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc chức danh..."
                className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pl-10 pr-3 text-[14px] text-[#374151] outline-none focus:border-[#6366F1]"
              />
            </div>

            <select
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              className="h-10 w-full sm:w-[160px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#374151] outline-none focus:border-[#6366F1]"
            >
              <option value="all">Phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value as RiskFilter)}
              className="h-10 w-full sm:w-[140px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#374151] outline-none focus:border-[#6366F1]"
            >
              <option value="all">Rủi ro</option>
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
              <option value="critical">Nghiêm trọng</option>
            </select>

            <select
              value={readiness}
              onChange={(e) => setReadiness(e.target.value as ReadinessFilter)}
              className="h-10 w-full sm:w-[140px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#374151] outline-none focus:border-[#6366F1]"
            >
              <option value="all">Readiness</option>
              <option value="now">Sẵn sàng ngay</option>
              <option value="1-2yr">1–2 năm</option>
              <option value="3-5yr">3–5 năm</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-[13px] text-[#6B7280]">
              Hiển thị <span className="font-semibold text-[#111827]">{filtered.length}</span> / {employees.length} nhân sự
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="h-10 w-[160px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#374151] outline-none focus:border-[#6366F1]"
            >
              <option value="overall_desc">Overall Score ↓</option>
              <option value="overall_asc">Overall Score ↑</option>
              <option value="name_asc">Tên A–Z</option>
              <option value="risk_desc">Rủi ro cao nhất</option>
              <option value="idp_asc">IDP thấp nhất</option>
            </select>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-4 text-[13px]">
            <div className="flex items-baseline gap-2">
              <span className="text-[#6B7280]">Avg Performance</span>
              <span className="font-semibold text-[#111827]">{avg.perf}</span>
            </div>
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <div className="flex items-baseline gap-2">
              <span className="text-[#6B7280]">Avg Potential</span>
              <span className="font-semibold text-[#111827]">{avg.pot}</span>
            </div>
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <div className="flex items-baseline gap-2">
              <span className="text-[#6B7280]">Avg Overall</span>
              <span className="font-semibold text-[#111827]">{avg.overall}</span>
            </div>
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <div className="flex items-baseline gap-2">
              <span className="text-[#6B7280]">High Risk</span>
              <span className="font-semibold text-[#111827]">{avg.highRisk}</span>
            </div>
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <div className="flex items-baseline gap-2">
              <span className="text-[#6B7280]">IDP Active</span>
              <span className="font-semibold text-[#111827]">{avg.idpActive}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="so-card rounded-xl p-0 overflow-x-auto mt-4">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-10 bg-white">
            <TableRow className="bg-[#F9FAFB]">
              <TableHead className="text-[13px] text-[#6B7280]">
                Nhân viên
              </TableHead>
              <TableHead className="text-[13px] text-[#6B7280]">
                Phòng ban
              </TableHead>
              <TableHead className="text-[13px] text-[#6B7280]">
                Tầng
              </TableHead>
              <TableHead className="text-[13px] text-[#6B7280]">
                Điểm đánh giá
              </TableHead>
              <TableHead className="text-[13px] text-[#6B7280]">
                Overall
              </TableHead>
              <TableHead className="text-[13px] text-[#6B7280]">
                Readiness
              </TableHead>
              <TableHead className="text-[13px] text-[#6B7280]">
                Rủi ro
              </TableHead>
              <TableHead className="text-[13px] text-[#6B7280]">
                IDP
              </TableHead>
              {isActive("marketIntelligence") ? (
                <TableHead className="text-[13px] text-[#6B7280]">
                  Market Intel
                </TableHead>
              ) : null}
              <TableHead className="text-[13px] text-[#6B7280] text-right">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isActive("marketIntelligence") ? 10 : 9} className="py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="h-10 w-10 text-[#9CA3AF]" />
                    <div className="text-[14px] font-semibold text-[#374151]">
                      Không tìm thấy nhân sự phù hợp
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => {
                        setTier("all");
                        setQuery("");
                        setDeptId("all");
                        setRisk("all");
                        setReadiness("all");
                        setSortBy("overall_desc");
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((e) => {
                const dept = departments.find((d) => d.id === e.departmentId);
                const isHigh = e.riskLevel === "high" || e.riskLevel === "critical";
                const mi = marketByEmployeeId.get(e.id);

                return (
                  <TableRow
                    key={e.id}
                    className={
                      isHigh
                        ? "bg-[#FFF7ED] border-l-[3px] border-l-[#F59E0B]"
                        : undefined
                    }
                  >
                    <TableCell className="whitespace-normal">
                      <Link href={`/talent/${e.id}`} className="flex items-center gap-3">
                        <EmployeeAvatar employee={e} size="sm" />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-[#111827]">
                            {e.name}
                          </div>
                          <div className="truncate text-[12px] text-[#6B7280]">
                            {e.email}
                          </div>
                          <div className="truncate text-[12px] text-[#6B7280]">
                            {e.currentRoleTitle}
                          </div>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell className="text-[13px] text-[#374151]">
                      {dept?.name ?? "—"}
                    </TableCell>

                    <TableCell>
                      <TierBadge tier={e.tier} />
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-[11px] text-[#6B7280]">
                            Perf
                          </span>
                          <div className="flex-1">
                            <ScoreBar value={e.performanceScore} size="sm" showNumber={false} />
                          </div>
                          <span className="w-8 text-right text-[11px] font-semibold text-[#111827]">
                            {e.performanceScore}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-[11px] text-[#6B7280]">
                            Pot
                          </span>
                          <div className="flex-1">
                            <ScoreBar value={e.potentialScore} size="sm" showNumber={false} />
                          </div>
                          <span className="w-8 text-right text-[11px] font-semibold text-[#111827]">
                            {e.potentialScore}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div
                        className="text-[16px] font-bold"
                        style={{ color: overallColor(e.overallScore) }}
                      >
                        {e.overallScore}
                      </div>
                    </TableCell>

                    <TableCell>
                      <ReadinessBadge readiness={e.readiness} />
                    </TableCell>

                    <TableCell>
                      <RiskBadge level={e.riskLevel} score={e.riskScore} />
                    </TableCell>

                    <TableCell className="whitespace-normal">
                      {e.idpStatus === "not-started" ? (
                        <div className="text-[13px] text-[#6B7280]">Chưa có</div>
                      ) : e.idpStatus === "completed" ? (
                        <div className="text-[13px] font-semibold text-[#15803D]">
                          ✓ Hoàn thành
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="h-[4px] w-full rounded-full bg-[#E5E7EB]">
                            <div
                              className="h-[4px] rounded-full bg-[#6366F1]"
                              style={{ width: `${e.idpProgress}%` }}
                            />
                          </div>
                          <div className="text-[12px] text-[#6B7280]">
                            {e.idpProgress}%
                          </div>
                        </div>
                      )}
                    </TableCell>

                    {isActive("marketIntelligence") ? (
                      <TableCell className="whitespace-normal">
                        {mi ? (
                          <div className="space-y-1">
                            <div>
                              {mi.marketGapPercent < 0 ? (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                    mi.marketGapPercent < -10
                                      ? "bg-[#FEF2F2] text-[#DC2626]"
                                      : "bg-[#FFFBEB] text-[#B45309]"
                                  }`}
                                >
                                  ↓{Math.abs(mi.marketGapPercent).toFixed(1)}%
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-semibold text-[#15803D]">
                                  ↑{mi.marketGapPercent.toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  background:
                                    mi.engagementScore >= 80
                                      ? "#22C55E"
                                      : mi.engagementScore >= 60
                                        ? "#F59E0B"
                                        : "#EF4444",
                                }}
                              />
                              <span>{mi.engagementScore}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[13px] text-[#9CA3AF]">—</span>
                        )}
                      </TableCell>
                    ) : null}

                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="outline"
                        className="h-8 rounded-lg px-3 whitespace-nowrap"
                      >
                        <Link href={`/talent/${e.id}`}>Xem hồ sơ</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[13px] text-[#6B7280]">
            Trang <span className="font-semibold text-[#111827]">{currentPage}</span> / {totalPages} · Hiển thị{" "}
            <span className="font-semibold text-[#111827]">
              {filtered.length === 0 ? 0 : startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filtered.length)}
            </span>{" "}
            trong tổng số <span className="font-semibold text-[#111827]">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9 rounded-lg px-3"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              className="h-9 rounded-lg px-3"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

