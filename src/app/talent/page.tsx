"use client";

import * as React from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import { employees } from "@/data/employees";
import { departments, positions } from "@/data/positions";
import { marketIntelData } from "@/data/marketIntelligence";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { ReadinessBadge } from "@/components/ReadinessBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { ScoreBar } from "@/components/ScoreBar";
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
type IdpFilter = "all" | "active" | "not-started";

const PAGE_SIZE = 10;

function overallColor(v: number) {
  if (v >= 85) return "#15803D";
  if (v >= 70) return "#1D4ED8";
  return "#DC2626";
}

export default function TalentPage() {
  const { isActive } = useModuleContext();
  const [query, setQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortBy>("overall_desc");
  const [page, setPage] = React.useState(1);

  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<{
    tier: TierFilter;
    readiness: ReadinessFilter;
    department: string;
    risk: RiskFilter;
    idp: IdpFilter;
  }>({
    tier: "all",
    readiness: "all",
    department: "all",
    risk: "all",
    idp: "all",
  });

  const activeFilterCount = React.useMemo(() => {
    return Object.values(filters).filter((v) => v !== "all").length;
  }, [filters]);
  const hasActiveFilters = activeFilterCount > 0;

  const resetFilters = React.useCallback(() => {
    setFilters({
      tier: "all",
      readiness: "all",
      department: "all",
      risk: "all",
      idp: "all",
    });
  }, []);

  React.useEffect(() => {
    setPage(1);
  }, [filters, query, sortBy]);

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
    if (filters.tier !== "all") list = list.filter((e) => e.tier === filters.tier);

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
    if (filters.department !== "all")
      list = list.filter((e) => e.departmentId === filters.department);

    // 4) risk
    if (filters.risk !== "all") list = list.filter((e) => e.riskLevel === filters.risk);

    // 5) readiness
    if (filters.readiness !== "all")
      list = list.filter((e) => e.readiness === filters.readiness);

    // 6) idp status
    if (filters.idp === "active") list = list.filter((e) => e.idpStatus === "active");
    if (filters.idp === "not-started") list = list.filter((e) => e.idpStatus === "not-started");

    // 7) sort
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
  }, [filters, query, sortBy, positionById]);

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

  return (
    <div className="w-full space-y-6">
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
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 320, minWidth: 180 }}>
            <Search
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 14,
                height: 14,
                color: "#9CA3AF",
              }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm nhân viên..."
              style={{
                width: "100%",
                height: 36,
                paddingLeft: 32,
                paddingRight: 12,
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 13,
                background: "#F9FAFB",
                outline: "none",
              }}
            />
          </div>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            style={{
              height: 36,
              padding: "0 14px",
              border: "1px solid",
              borderColor: hasActiveFilters ? "#6366F1" : "#E5E7EB",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: hasActiveFilters ? "#EEF2FF" : "#fff",
              color: hasActiveFilters ? "#4F46E5" : "#374151",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <SlidersHorizontal style={{ width: 14, height: 14 }} />
            Bộ lọc
            {activeFilterCount > 0 ? (
              <span
                style={{
                  background: "#6366F1",
                  color: "#fff",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 6px",
                  marginLeft: 2,
                }}
              >
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            style={{
              height: 36,
              padding: "0 28px 0 10px",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 13,
              color: "#374151",
              background: "#fff",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <option value="overall_desc">Overall Score ↓</option>
            <option value="risk_desc">Risk ↓</option>
            <option value="name_asc">Tên A-Z</option>
            <option value="idp_asc">IDP %</option>
            <option value="overall_asc">Overall Score ↑</option>
          </select>

          {/* Stats pills */}
          <div className="hidden lg:flex" style={{ marginLeft: "auto", display: "flex", gap: 6, flexShrink: 0 }}>
            {[
              { label: "Avg", val: String(avg.overall), color: "#374151" },
              { label: "Rủi ro cao", val: String(avg.highRisk), color: "#EF4444" },
              { label: "IDP active", val: String(avg.idpActive), color: "#6366F1" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  height: 36,
                  padding: "0 10px",
                  border: "1px solid #F3F4F6",
                  borderRadius: 8,
                  background: "#F9FAFB",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                }}
              >
                <span style={{ color: "#9CA3AF" }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {filterOpen ? (
          <>
            <div
              onClick={() => setFilterOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 10 }}
            />

            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                zIndex: 20,
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #E5E7EB",
                boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                padding: "20px",
                width: 480,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* Left col */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      marginBottom: 8,
                    }}
                  >
                    Tầng nhân sự
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {(
                      [
                        { label: "Tất cả", value: "all" },
                        { label: "Nòng cốt", value: "core" },
                        { label: "Tiềm năng", value: "potential" },
                        { label: "Kế thừa", value: "successor" },
                      ] as const
                    ).map((t) => (
                      <label
                        key={t.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          color: "#374151",
                          padding: "4px 0",
                        }}
                      >
                        <input
                          type="radio"
                          name="tier"
                          checked={filters.tier === t.value}
                          onChange={() => setFilters((f) => ({ ...f, tier: t.value }))}
                          style={{ accentColor: "#6366F1" }}
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      marginBottom: 8,
                    }}
                  >
                    Mức sẵn sàng
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {(
                      [
                        { label: "Tất cả", value: "all" },
                        { label: "Sẵn sàng ngay", value: "now" },
                        { label: "1–2 năm", value: "1-2yr" },
                        { label: "3–5 năm", value: "3-5yr" },
                      ] as const
                    ).map((r) => (
                      <label
                        key={r.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          color: "#374151",
                          padding: "4px 0",
                        }}
                      >
                        <input
                          type="radio"
                          name="readiness"
                          checked={filters.readiness === r.value}
                          onChange={() => setFilters((f) => ({ ...f, readiness: r.value }))}
                          style={{ accentColor: "#6366F1" }}
                        />
                        {r.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right col */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      marginBottom: 8,
                    }}
                  >
                    Phòng ban
                  </div>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
                    style={{
                      width: "100%",
                      height: 34,
                      border: "1px solid #E5E7EB",
                      borderRadius: 8,
                      fontSize: 13,
                      padding: "0 8px",
                      background: "#F9FAFB",
                    }}
                  >
                    <option value="all">Tất cả phòng ban</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      marginBottom: 8,
                    }}
                  >
                    Mức rủi ro
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {(
                      [
                        { label: "Tất cả", value: "all" as const },
                        { label: "Cao", value: "high" as const, color: "#EF4444" },
                        { label: "Trung bình", value: "medium" as const, color: "#F59E0B" },
                        { label: "Thấp", value: "low" as const, color: "#10B981" },
                      ] as const
                    ).map((r) => (
                      <label
                        key={r.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          color: "#374151",
                          padding: "4px 0",
                        }}
                      >
                        <input
                          type="radio"
                          name="risk"
                          checked={filters.risk === r.value}
                          onChange={() => setFilters((f) => ({ ...f, risk: r.value }))}
                          style={{ accentColor: "#6366F1" }}
                        />
                        {"color" in r && r.color ? (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: r.color,
                              flexShrink: 0,
                            }}
                          />
                        ) : null}
                        {r.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      marginBottom: 8,
                    }}
                  >
                    Trạng thái IDP
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {(
                      [
                        { label: "Tất cả", value: "all" as const },
                        { label: "Đang thực hiện", value: "active" as const },
                        { label: "Chưa có IDP", value: "not-started" as const },
                      ] as const
                    ).map((s) => (
                      <label
                        key={s.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          color: "#374151",
                          padding: "4px 0",
                        }}
                      >
                        <input
                          type="radio"
                          name="idp"
                          checked={filters.idp === s.value}
                          onChange={() => setFilters((f) => ({ ...f, idp: s.value }))}
                          style={{ accentColor: "#6366F1" }}
                        />
                        {s.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                  borderTop: "1px solid #F3F4F6",
                  paddingTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    setFilterOpen(false);
                  }}
                  style={{
                    fontSize: 13,
                    color: "#9CA3AF",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Xóa bộ lọc
                </button>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  style={{
                    height: 34,
                    padding: "0 20px",
                    background: "#6366F1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </>
        ) : null}
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
                        setQuery("");
                        resetFilters();
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

