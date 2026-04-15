"use client";

import * as React from "react";
import { AlertTriangle, BarChart2, CheckCircle, Info } from "lucide-react";
import { marketIntelData } from "@/data/marketIntelligence";

function fmtDate(d: string) {
  // YYYY-MM-DD -> DD/MM/YYYY (simple)
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

function gapBadge(gap: number) {
  if (gap < -10) return { cls: "bg-[#FEF2F2] text-[#DC2626]", text: `↓ ${Math.abs(gap).toFixed(1)}% dưới thị trường — Rủi ro cao` };
  if (gap < 0) return { cls: "bg-[#FEF9C3] text-[#854D0E]", text: `↓ ${Math.abs(gap).toFixed(1)}% dưới thị trường` };
  return { cls: "bg-[#F0FDF4] text-[#15803D]", text: `↑ ${gap.toFixed(1)}% trên thị trường` };
}

function demandBadge(v: "low" | "medium" | "high" | "very-high") {
  if (v === "very-high") return { cls: "bg-[#FEF2F2] text-[#DC2626]", text: "🔴 Rất cao" };
  if (v === "high") return { cls: "bg-[#FEF9C3] text-[#B45309]", text: "🟠 Cao" };
  if (v === "medium") return { cls: "bg-[#F0FDF4] text-[#15803D]", text: "🟡 Trung bình" };
  return { cls: "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]", text: "⚪ Thấp" };
}

function trendText(v: "decreasing" | "stable" | "increasing") {
  if (v === "increasing") return { cls: "text-[#15803D]", text: "↑ Đang tăng" };
  if (v === "decreasing") return { cls: "text-[#DC2626]", text: "↓ Đang giảm" };
  return { cls: "text-[#6B7280]", text: "→ Ổn định" };
}

function timeToFillTone(days: number) {
  if (days > 90) return "#DC2626";
  if (days > 60) return "#B45309";
  return "#15803D";
}

function engagementTone(score: number) {
  if (score >= 80) return "#15803D";
  if (score >= 60) return "#B45309";
  return "#DC2626";
}

function engagementLabel(score: number) {
  if (score >= 80) return "Gắn kết cao";
  if (score >= 60) return "Trung bình";
  return "Có dấu hiệu rời bỏ";
}

function flightRiskBadge(v: "low" | "medium" | "high") {
  if (v === "high") return { cls: "bg-[#FEF2F2] text-[#DC2626]", text: "Cao" };
  if (v === "medium") return { cls: "bg-[#FFFBEB] text-[#B45309]", text: "Trung bình" };
  return { cls: "bg-[#F0FDF4] text-[#15803D]", text: "Thấp" };
}

export function MarketIntelCard({ employeeId }: { employeeId: string }) {
  const data = React.useMemo(() => {
    return marketIntelData.find((d) => d.employeeId === employeeId);
  }, [employeeId]);

  if (!data) {
    return (
      <div className="so-card rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-[#4F46E5]" />
            <div className="text-[14px] font-semibold text-[#374151]">Market Intelligence</div>
            <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-semibold text-[#15803D]">
              LIVE
            </span>
          </div>
          <div className="text-right text-[11px] italic text-[#6B7280]">
            Nguồn: Talentnet · LinkedIn · Pulse Survey
          </div>
        </div>
        <div className="mt-4 h-px bg-[#E5E7EB]" />
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <Info className="h-4 w-4 text-[#9CA3AF] mt-0.5" />
          <div className="text-[13px] text-[#6B7280]">
            Chưa có dữ liệu Market Intelligence cho nhân viên này
          </div>
        </div>
      </div>
    );
  }

  const maxSalary = Math.max(data.currentSalary, data.marketMedian, 1);
  const gap = gapBadge(data.marketGapPercent);
  const demand = demandBadge(data.marketDemand);
  const trend = trendText(data.demandTrend);

  return (
    <div className="so-card rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-[#4F46E5]" />
          <div className="text-[14px] font-semibold text-[#374151]">Market Intelligence</div>
          <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-semibold text-[#15803D]">
            LIVE
          </span>
        </div>
        <div className="text-right text-[11px] italic text-[#6B7280]">
          Nguồn: Talentnet · LinkedIn · Pulse Survey
        </div>
      </div>

      <div className="mt-4 h-px bg-[#E5E7EB]" />

      {/* Section 1: Salary */}
      <div className="mt-4">
        <div className="text-[13px] font-medium text-[#374151]">So sánh lương thị trường</div>

        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-[110px] text-[12px] text-[#6B7280]">Lương hiện tại</div>
            <div className="flex-1">
              <div className="h-[8px] w-full rounded-full bg-[#E5E7EB]">
                <div
                  className="h-[8px] rounded-full bg-[#6366F1]"
                  style={{ width: `${Math.round((data.currentSalary / maxSalary) * 100)}%` }}
                />
              </div>
            </div>
            <div className="w-[96px] text-right text-[12px] font-semibold text-[#111827]">
              {data.currentSalary} tr
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[110px] text-[12px] text-[#6B7280]">Trung vị thị trường</div>
            <div className="flex-1">
              <div className="h-[8px] w-full rounded-full bg-[#E5E7EB]">
                <div
                  className="h-[8px] rounded-full bg-[#9CA3AF]"
                  style={{ width: `${Math.round((data.marketMedian / maxSalary) * 100)}%` }}
                />
              </div>
            </div>
            <div className="w-[96px] text-right text-[12px] font-semibold text-[#111827]">
              {data.marketMedian} tr
            </div>
          </div>
        </div>

        <div className="mt-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${gap.cls}`}>
            {gap.text}
          </span>
        </div>

        <div className="mt-2 text-[11px] italic text-[#6B7280]">
          Cập nhật: {fmtDate(data.benchmarkUpdated)} · {data.salaryBenchmarkSource}
        </div>
      </div>

      <div className="mt-4 border-t border-dashed border-[#E5E7EB]" />

      {/* Section 2: Demand */}
      <div className="mt-4">
        <div className="text-[13px] font-medium text-[#374151]">Nhu cầu tuyển dụng trên thị trường</div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="text-[12px] text-[#6B7280]">Mức độ demand:</div>
            <div className="mt-2">
              <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-[12px] font-semibold ${demand.cls}`}>
                {demand.text}
              </span>
            </div>
            <div className={`mt-2 text-[12px] ${trend.cls}`}>{trend.text}</div>
          </div>
          <div>
            <div className="text-[12px] text-[#6B7280]">Thời gian tuyển trung bình:</div>
            <div className="mt-2 text-[20px] font-bold" style={{ color: timeToFillTone(data.avgTimeToFill) }}>
              {data.avgTimeToFill} ngày
            </div>
            <div className="text-[11px] text-[#6B7280]">để tìm được người thay thế</div>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-dashed border-[#E5E7EB]" />

      {/* Section 3: Headhunter */}
      <div className="mt-4">
        <div className="text-[13px] font-medium text-[#374151]">Hoạt động headhunter (12 tháng)</div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div>
            <div
              className="text-[28px] font-bold leading-none"
              style={{
                color:
                  data.headhunterApproaches >= 2
                    ? "#DC2626"
                    : data.headhunterApproaches === 1
                      ? "#B45309"
                      : "#6B7280",
              }}
            >
              {data.headhunterApproaches}
            </div>
            <div className="mt-1 text-[12px] text-[#6B7280]">lần được tiếp cận</div>
          </div>

          {data.headhunterApproaches > 0 ? (
            <>
              <div className="h-10 w-px bg-[#E5E7EB]" />
              <div className="min-w-0">
                <div className="text-[13px] text-[#111827]">
                  Gần nhất: <span className="font-semibold">{data.lastApproachDate ? fmtDate(data.lastApproachDate) : "—"}</span>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                      data.approachSource === "self-reported"
                        ? "bg-[#EFF6FF] text-[#1D4ED8]"
                        : data.approachSource === "manager-noted"
                          ? "bg-[#FFFBEB] text-[#B45309]"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}
                  >
                    {data.approachSource === "self-reported"
                      ? "Tự khai báo"
                      : data.approachSource === "manager-noted"
                        ? "Manager ghi nhận"
                        : "—"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-[13px] italic text-[#6B7280]">Không có ghi nhận</div>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-dashed border-[#E5E7EB]" />

      {/* Section 4: Engagement */}
      <div className="mt-4">
        <div className="text-[13px] font-medium text-[#374151]">Engagement Score (Pulse Survey)</div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div>
            <div
              className="text-[32px] font-extrabold leading-none"
              style={{ color: engagementTone(data.engagementScore) }}
            >
              {data.engagementScore}
              <span className="text-[14px] font-semibold text-[#6B7280]">/100</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[#111827]">
              {engagementLabel(data.engagementScore)}
            </div>
            <div className="mt-1 text-[12px]">
              {data.engagementTrend === "up" ? (
                <span className="text-[#15803D]">↑ Tăng</span>
              ) : data.engagementTrend === "down" ? (
                <span className="text-[#DC2626]">↓ Giảm đáng lo ngại</span>
              ) : (
                <span className="text-[#6B7280]">→ Ổn định</span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[12px] text-[#6B7280]">
              <span>Nguy cơ nghỉ (survey):</span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  flightRiskBadge(data.flightRiskFromSurvey).cls
                }`}
              >
                {flightRiskBadge(data.flightRiskFromSurvey).text}
              </span>
            </div>
            <div className="mt-2 text-[11px] italic text-[#6B7280]">
              Khảo sát ẩn danh · {fmtDate(data.lastSurveyDate)}
            </div>
          </div>

          {data.flightRiskFromSurvey === "high" ? (
            <div className="ml-auto flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-[#DC2626] mt-0.5" />
              <div className="text-[12px] text-[#DC2626]">
                Survey báo nguy cơ nghỉ cao
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

