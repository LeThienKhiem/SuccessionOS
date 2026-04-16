import Link from "next/link";
import { AlertTriangle, ShieldCheck, Target, Users } from "lucide-react";
import { employees } from "@/data/employees";
import { positions, departments } from "@/data/positions";
import { dashboardKPI, successionMap } from "@/data/succession";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { ReadinessBadge } from "@/components/ReadinessBadge";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Home() {
  const updatedAt = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const highRisk = employees.filter(
    (e) => e.riskLevel === "high" || e.riskLevel === "critical"
  );

  const readinessRank = (r: string) =>
    r === "now" ? 3 : r === "1-2yr" ? 2 : r === "3-5yr" ? 1 : 0;

  const bestReadiness = (positionId: string) => {
    const entry = successionMap.find((s) => s.positionId === positionId);
    if (!entry || entry.candidates.length === 0) return null;
    return [...entry.candidates].sort(
      (a, b) => readinessRank(b.readiness) - readinessRank(a.readiness)
    )[0];
  };

  const headerTone = (readiness: string | null) => {
    if (readiness === "now")
      return {
        top: "border-t-[#22C55E]",
        bg: "bg-[#F0FDF4]",
      };
    if (readiness === "1-2yr")
      return {
        top: "border-t-[#F59E0B]",
        bg: "bg-[#FFFBEB]",
      };
    if (readiness === "3-5yr")
      return {
        top: "border-t-[#EF4444]",
        bg: "bg-[#FEF2F2]",
      };
    return {
      top: "border-t-[#9CA3AF]",
      bg: "bg-[#F9FAFB]",
    };
  };

  const levelLabel = (lvl: string) =>
    lvl === "director" ? "Director" : lvl === "manager" ? "Manager" : "Lead";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* SECTION 1: Page header */}
      <div className="space-y-2">
        <p className="text-[13px] text-[#6B7280]">Trang chủ</p>
        <h1 className="text-[24px] font-semibold text-[#111827]">
          Tổng quan hệ thống
        </h1>
        <p className="text-[14px] text-[#6B7280]">
          Cập nhật lần cuối: {updatedAt} · PTSC M&amp;C
        </p>
        <hr className="border-[#E5E7EB]" />
      </div>

      {/* SECTION 2: KPI cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatsCard
          icon={Users}
          iconColor="#6366F1"
          title="Nhân sự trong Chuỗi"
          value={dashboardKPI.totalTalentChain}
          className="border border-[#E0E7FF] !bg-[#EEF2FF]/35"
          subtitle={
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#6366F1]" />
                <span>8 Nòng cốt</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                <span>10 Tiềm năng</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
                <span>7 Kế thừa</span>
              </span>
            </div>
          }
        />

        <StatsCard
          icon={ShieldCheck}
          iconColor="#14B8A6"
          title="Vị trí có kế thừa"
          value={`${dashboardKPI.keyPositionsCovered} / ${dashboardKPI.keyPositionsTotal}`}
          className="border border-[#CCFBF1] !bg-[#F0FDFA]/40"
          subtitle={
            <div className="space-y-2">
              <div className="h-[6px] w-full rounded-full bg-[#E5E7EB]">
                <div
                  className="h-[6px] rounded-full bg-[#14B8A6]"
                  style={{ width: "66%" }}
                />
              </div>
              <div className="text-[13px] text-[#6B7280]">
                4 vị trí chưa đủ
              </div>
            </div>
          }
        />

        <StatsCard
          icon={AlertTriangle}
          iconColor="#EF4444"
          title="Rủi ro cao"
          value={dashboardKPI.highRiskCount}
          subtitle={<span className="text-[13px] text-[#6B7280]">cần xử lý trong 30 ngày</span>}
          className="border border-[#FECACA] !bg-[#FEF2F2]/55"
        />

        <StatsCard
          icon={Target}
          iconColor="#F59E0B"
          title="IDP đang thực hiện"
          value={dashboardKPI.idpActiveCount}
          className="border border-[#FDE68A] !bg-[#FFFBEB]/50"
          subtitle={
            <div className="space-y-2">
              <div className="h-[6px] w-full rounded-full bg-[#E5E7EB]">
                <div
                  className="h-[6px] rounded-full bg-[#F59E0B]"
                  style={{ width: `${dashboardKPI.idpAvgProgress}%` }}
                />
              </div>
              <div className="text-[13px] text-[#6B7280]">
                trung bình {dashboardKPI.idpAvgProgress}% hoàn thành
              </div>
            </div>
          }
        />
      </div>

      {/* SECTION 3: 2 columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Left 60% */}
        <div className="so-card rounded-xl p-5 lg:col-span-3 border-l-4 border-l-[#EF4444] !bg-[#FEF2F2]/25">
          <div className="mb-4">
            <div className="text-[16px] font-semibold text-[#374151]">
              Nhân sự rủi ro cao — cần xử lý ngay
            </div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              Theo dõi các trường hợp có nguy cơ nghỉ việc cao
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB]">
                  <TableHead className="text-[#6B7280] text-[13px]">
                    Nhân viên
                  </TableHead>
                  <TableHead className="text-[#6B7280] text-[13px]">
                    Risk Score
                  </TableHead>
                  <TableHead className="text-[#6B7280] text-[13px]">
                    Lý do
                  </TableHead>
                  <TableHead className="text-[#6B7280] text-[13px] text-right">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRisk.slice(0, 3).map((e) => {
                  const dept = departments.find((d) => d.id === e.departmentId);
                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar employee={e} size="sm" />
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-[#111827]">
                              {e.name}
                            </div>
                            <div className="truncate text-[13px] text-[#6B7280]">
                              {e.projectRole ?? "—"}{" "}
                              {dept?.name ? (
                                <span className="text-[#6B7280]">
                                  · {dept.name}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 py-1 text-[12px] font-semibold text-[#DC2626]">
                          {e.riskScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-[13px] text-[#6B7280]">
                        {e.internalRiskFactors?.[0] ?? "—"}
                      </TableCell>
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
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right 40% */}
        <div className="so-card rounded-xl p-5 lg:col-span-2 border border-[#E0E7FF] !bg-[#EEF2FF]/25">
          <div className="mb-4">
            <div className="text-[16px] font-semibold text-[#374151]">
              Phân bổ tầng nhân sự
            </div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              Tỷ trọng theo 3 tầng trong chuỗi phát triển
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div
              className="h-28 w-28 rounded-full"
              style={{
                background:
                  "conic-gradient(#6366F1 0 32%, #3B82F6 32% 72%, #14B8A6 72% 100%)",
              }}
            />

            <div className="space-y-3 text-[14px] text-[#374151]">
              <div className="flex items-center justify-between gap-6">
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#6366F1]" />
                  <span className="font-semibold">Nòng cốt</span>
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  8 người · 32%
                </div>
              </div>
              <div className="flex items-center justify-between gap-6">
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                  <span className="font-semibold">Tiềm năng</span>
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  10 người · 40%
                </div>
              </div>
              <div className="flex items-center justify-between gap-6">
                <div className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
                  <span className="font-semibold">Kế thừa</span>
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  7 người · 28%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Positions status */}
      <div className="so-card rounded-xl p-5 border border-[#E5E7EB] !bg-[#F9FAFB]">
        <div className="mb-4">
          <div className="text-[16px] font-semibold text-[#374151]">
            Tình trạng 12 Vị trí Then chốt
          </div>
          <div className="mt-1 text-[13px] text-[#6B7280]">
            Theo dõi độ sẵn sàng kế thừa theo từng vị trí
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {positions.map((pos) => {
            const dept = departments.find((d) => d.id === pos.departmentId);
            const holder = employees.find((e) => e.id === pos.currentHolderId);
            const entry = successionMap.find((s) => s.positionId === pos.id);
            const best = bestReadiness(pos.id);
            const tone = headerTone(best?.readiness ?? null);

            return (
              <div key={pos.id} className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
                <div className={`border-t-4 ${tone.top} ${tone.bg} px-4 py-3`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2">
                      <span className="rounded-full bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#374151] border border-[#E5E7EB]">
                        {levelLabel(pos.level)}
                      </span>
                      <span className="text-[13px] text-[#6B7280]">
                        {dept?.name ?? "—"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-[14px] font-semibold text-[#111827]">
                    {pos.titleVi}
                  </div>
                </div>

                <div className="px-4 py-3 space-y-3">
                  <div className="text-[13px] text-[#6B7280]">Đang giữ:</div>
                  {holder ? (
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar employee={holder} size="sm" />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[#111827]">
                          {holder.name}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[13px] text-[#6B7280]">
                      Đang tuyển dụng
                    </div>
                  )}

                  <div className="h-px bg-[#E5E7EB]" />

                  <div className="flex items-center justify-between gap-3">
                    {entry && entry.candidates.length > 0 && best ? (
                      <>
                        <ReadinessBadge readiness={best.readiness} />
                        <div className="text-[13px] text-[#6B7280]">
                          {entry.candidates.length} ứng viên
                        </div>
                      </>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 py-1 text-[12px] font-semibold text-[#DC2626]">
                        ⚠ Chưa có kế thừa
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
