"use client";

import * as React from "react";
import {
  BarChart2,
  BookOpen,
  DollarSign,
  FileDown,
  Smile,
  Target,
  TrendingUp,
  Users2,
} from "lucide-react";

type Toast = { text: string } | null;

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function formatVndBillion(n: number) {
  // demo format: 2.4 -> "2.4 tỷ"
  return `${round1(n)} tỷ`;
}

export default function ReportsPage() {
  const [toast, setToast] = React.useState<Toast>(null);
  const showToast = React.useCallback((text: string) => {
    setToast({ text });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  // Mock numbers per spec
  const l1 = { score: 4.2, max: 5, responses: 23, total: 25, dist: [1, 2, 4, 7, 9] };
  const l2 = { pre: 62, post: 84, improvement: 22, pct: 35 };
  const l3 = { applied: 78, sustained: 65, assessmentImprove: 8.3 };
  const l4 = { idpFrom: 65, idpTo: 78, sucFrom: 40, sucTo: 62, fillFrom: 4.2, fillTo: 2.8 };
  const l5 = { cost: 2.4, benefit: 8.7 };
  const roi = Math.round(((l5.benefit - l5.cost) / l5.cost) * 100); // 262%

  const roiComparison = [
    { method: "Formal Training", cost: 1.8, improve: 12.3, roi: 180 },
    { method: "OJD / Stretch", cost: 0.3, improve: 15.6, roi: 520 },
    { method: "Mentoring", cost: 0.3, improve: 9.8, roi: 327 },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-[13px] text-[#6B7280]">Phân tích</p>
        <h1 className="text-[24px] font-semibold text-[#111827]">
          Báo cáo Hiệu quả Đào tạo
        </h1>
        <p className="text-[14px] text-[#6B7280]">
          Mô hình Kirkpatrick 5 cấp độ — tập trung trả lời ROI cho CFO/BOD
        </p>
        <hr className="border-[#E5E7EB]" />
      </div>

      {/* 5 level cards */}
      <div className="so-card rounded-xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[16px] font-semibold text-[#374151]">
              Kirkpatrick — 5 cấp độ
            </div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              Tổng hợp nhanh các chỉ số thuyết phục theo từng cấp độ
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast("Xuất PDF (mock)")}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#374151] hover:bg-[#F9FAFB]"
            >
              <FileDown className="h-4 w-4" />
              Xuất PDF
            </button>
            <button
              type="button"
              onClick={() => showToast("Xuất Excel (mock)")}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4F46E5] px-3 py-2 text-[13px] font-semibold text-white"
            >
              <FileDown className="h-4 w-4" />
              Xuất Excel
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="flex min-w-[1040px] gap-4">
            {/* L1 */}
            <div className="w-[320px] rounded-xl border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-[#F0FDF4] grid place-items-center">
                      <Smile className="h-5 w-5 text-[#22C55E]" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#111827]">
                        Level 1 — Phản ứng
                      </div>
                      <div className="text-[12px] text-[#6B7280]">
                        Mức độ hài lòng khóa học
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <div className="text-[28px] font-extrabold text-[#111827] tabular-nums">
                      {l1.score}/{l1.max}
                    </div>
                    <div className="text-[14px] font-semibold text-[#F59E0B]">★</div>
                  </div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    Responses:{" "}
                    <span className="font-semibold text-[#111827]">
                      {l1.responses}/{l1.total}
                    </span>
                  </div>
                </div>
                <BarChart2 className="h-5 w-5 text-[#22C55E]" />
              </div>

              <div className="mt-4">
                <div className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide">
                  Rating distribution (1–5)
                </div>
                <div className="mt-2 flex items-end gap-2">
                  {l1.dist.map((v, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-6 rounded-md bg-[#22C55E]"
                        style={{ height: `${10 + v * 6}px` }}
                        title={`${i + 1}★: ${v}`}
                      />
                      <div className="text-[11px] text-[#6B7280]">{i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* L2 */}
            <div className="w-[320px] rounded-xl border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-[#F0FDFA] grid place-items-center">
                      <BookOpen className="h-5 w-5 text-[#14B8A6]" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#111827]">
                        Level 2 — Học
                      </div>
                      <div className="text-[12px] text-[#6B7280]">
                        Kiến thức tiếp thu được
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[28px] font-extrabold text-[#111827] tabular-nums">
                    +{l2.improvement}đ
                  </div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    Pre-test avg:{" "}
                    <span className="font-semibold text-[#111827]">{l2.pre}</span>{" "}
                    → Post-test avg:{" "}
                    <span className="font-semibold text-[#111827]">{l2.post}</span>
                  </div>
                  <div className="mt-1 text-[13px] text-[#14B8A6] font-semibold">
                    Improvement: +{l2.improvement} điểm (+{l2.pct}%)
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-[#F9FAFB] p-3">
                <div className="text-[12px] text-[#6B7280]">Pre</div>
                <div className="mt-1 h-2 w-full rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-2 rounded-full bg-[#14B8A6]"
                    style={{ width: `${l2.pre}%` }}
                  />
                </div>
                <div className="mt-3 text-[12px] text-[#6B7280]">Post</div>
                <div className="mt-1 h-2 w-full rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-2 rounded-full bg-[#14B8A6]"
                    style={{ width: `${l2.post}%` }}
                  />
                </div>
              </div>
            </div>

            {/* L3 */}
            <div className="w-[320px] rounded-xl border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-[#F5F3FF] grid place-items-center">
                      <TrendingUp className="h-5 w-5 text-[#7C3AED]" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#111827]">
                        Level 3 — Hành vi
                      </div>
                      <div className="text-[12px] text-[#6B7280]">
                        Áp dụng vào công việc
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[28px] font-extrabold text-[#111827] tabular-nums">
                    {l3.applied}%
                  </div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    Manager-reported:{" "}
                    <span className="font-semibold text-[#111827]">{l3.applied}%</span>{" "}
                    đã áp dụng
                  </div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    Sau 3 tháng:{" "}
                    <span className="font-semibold text-[#111827]">{l3.sustained}%</span>{" "}
                    duy trì
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-[#7C3AED]">
                    Assessment score improvement: +{l3.assessmentImprove}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#F9FAFB] p-3">
                  <div className="text-[12px] text-[#6B7280]">Đã áp dụng</div>
                  <div className="mt-1 text-[16px] font-bold text-[#111827] tabular-nums">
                    {l3.applied}%
                  </div>
                </div>
                <div className="rounded-lg bg-[#F9FAFB] p-3">
                  <div className="text-[12px] text-[#6B7280]">Duy trì</div>
                  <div className="mt-1 text-[16px] font-bold text-[#111827] tabular-nums">
                    {l3.sustained}%
                  </div>
                </div>
              </div>
            </div>

            {/* L4 */}
            <div className="w-[320px] rounded-xl border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-[#FFFBEB] grid place-items-center">
                      <Target className="h-5 w-5 text-[#F59E0B]" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#111827]">
                        Level 4 — Kết quả
                      </div>
                      <div className="text-[12px] text-[#6B7280]">
                        Tác động đến KPI
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[13px] text-[#374151] leading-6">
                    <div>
                      IDP completion rate:{" "}
                      <span className="font-semibold text-[#111827]">{l4.idpFrom}%</span>{" "}
                      →{" "}
                      <span className="font-semibold text-[#111827]">{l4.idpTo}%</span>
                    </div>
                    <div>
                      Succession readiness:{" "}
                      <span className="font-semibold text-[#111827]">{l4.sucFrom}%</span>{" "}
                      →{" "}
                      <span className="font-semibold text-[#111827]">{l4.sucTo}%</span>
                    </div>
                    <div>
                      Thời gian lấp đầy vị trí:{" "}
                      <span className="font-semibold text-[#111827] tabular-nums">
                        {l4.fillFrom}
                      </span>{" "}
                      →{" "}
                      <span className="font-semibold text-[#111827] tabular-nums">
                        {l4.fillTo}
                      </span>{" "}
                      tháng
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-[#F9FAFB] p-3">
                  <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
                    <span>IDP completion</span>
                    <span className="font-semibold text-[#111827]">
                      {l4.idpTo}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-[#E5E7EB]">
                    <div className="h-2 rounded-full bg-[#F59E0B]" style={{ width: `${l4.idpTo}%` }} />
                  </div>
                </div>
                <div className="rounded-lg bg-[#F9FAFB] p-3">
                  <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
                    <span>Succession readiness</span>
                    <span className="font-semibold text-[#111827]">
                      {l4.sucTo}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-[#E5E7EB]">
                    <div className="h-2 rounded-full bg-[#F59E0B]" style={{ width: `${l4.sucTo}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* L5 */}
            <div className="w-[340px] rounded-xl border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-[#F0FDF4] grid place-items-center">
                      <DollarSign className="h-5 w-5 text-[#16A34A]" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#111827]">
                        Level 5 — ROI
                      </div>
                      <div className="text-[12px] text-[#6B7280]">
                        Tỷ suất hoàn vốn
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[34px] font-extrabold text-[#111827] tabular-nums">
                    {roi}%
                  </div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    Chi phí đào tạo:{" "}
                    <span className="font-semibold text-[#111827]">{formatVndBillion(l5.cost)}</span>{" "}
                    · Lợi ích ước tính:{" "}
                    <span className="font-semibold text-[#111827]">{formatVndBillion(l5.benefit)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  Công thức ROI
                </div>
                <div className="mt-2 text-[13px] text-[#374151] leading-6 tabular-nums">
                  ROI = (Lợi ích - Chi phí) / Chi phí × 100
                  <br />
                  = ({formatVndBillion(l5.benefit)} - {formatVndBillion(l5.cost)}) / {formatVndBillion(l5.cost)} × 100
                  <br />
                  = {roi}%
                </div>
              </div>

              <div className="mt-3 text-[12px] text-[#6B7280]">
                Ghi chú: Bao gồm giảm cost turnover + tăng project performance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Comparison */}
      <div className="so-card rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[16px] font-semibold text-[#374151]">
              ROI Comparison
            </div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              So sánh giữa đào tạo formal vs OJD/Stretch vs mentoring
            </div>
          </div>
        </div>

        {/* Part 1: 3 cards */}
        <div className="mt-4 grid grid-cols-3 gap-4 mb-6">
          {/* Card 1: Formal */}
          <div className="rounded-xl border border-[0.5px] border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#7F77DD]" />
              <div className="text-[14px] font-medium text-[#111827]">
                Formal Training
              </div>
            </div>
            <div className="mt-3 mb-4 border-t border-[0.5px] border-[#E5E7EB]" />

            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">Chi phí</div>
                <div className="text-[15px] text-[#111827] tabular-nums">
                  1.8 tỷ VNĐ
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">Điểm tăng</div>
                <div className="flex items-center gap-3">
                  <div className="text-[15px] text-[#111827] tabular-nums">
                    +12.3 điểm
                  </div>
                  <div className="h-2 w-20 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div className="h-2 rounded-full bg-[#EEEDFE]" style={{ width: "50%" }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">ROI</div>
                <div className="text-[20px] font-medium tabular-nums">
                  <span className="inline-block rounded-[20px] bg-[#EEEDFE] px-[10px] py-[2px] text-[#3C3489]">
                    180%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: OJD / Stretch (highlight) */}
          <div className="relative rounded-xl border-[1.5px] border-[#22C55E] bg-[#F0FDF4] p-5">
            <div className="absolute top-0 right-0 rounded-tr-[12px] rounded-bl-[8px] bg-[#22C55E] px-2 py-[2px] text-[10px] text-white">
              Hiệu quả nhất
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#16A34A]" />
              <div className="text-[14px] font-medium text-[#16A34A]">
                OJD / Stretch
              </div>
            </div>
            <div className="mt-3 mb-4 border-t border-[#86EFAC]" />

            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-[12px] text-[#15803D]">Chi phí</div>
                <div className="text-[15px] text-[#111827] tabular-nums">
                  0.3 tỷ VNĐ
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">Điểm tăng</div>
                <div className="flex items-center gap-3">
                  <div className="text-[15px] text-[#111827] tabular-nums">
                    +15.6 điểm
                  </div>
                  <div className="h-2 w-20 rounded-full bg-[#DCFCE7] overflow-hidden">
                    <div className="h-2 rounded-full bg-[#86EFAC]" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">ROI</div>
                <div className="text-[24px] font-medium tabular-nums">
                  <span className="inline-block rounded-[20px] bg-[#16A34A] px-[14px] py-1 text-white">
                    520%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Mentoring */}
          <div className="rounded-xl border border-[0.5px] border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 text-[#D85A30]" />
              <div className="text-[14px] font-medium text-[#111827]">
                Mentoring
              </div>
            </div>
            <div className="mt-3 mb-4 border-t border-[0.5px] border-[#E5E7EB]" />

            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">Chi phí</div>
                <div className="text-[15px] text-[#111827] tabular-nums">
                  0.3 tỷ VNĐ
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">Điểm tăng</div>
                <div className="flex items-center gap-3">
                  <div className="text-[15px] text-[#111827] tabular-nums">
                    +9.8 điểm
                  </div>
                  <div className="h-2 w-20 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div className="h-2 rounded-full bg-[#FAECE7]" style={{ width: "63%" }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">ROI</div>
                <div className="text-[20px] font-medium tabular-nums">
                  <span className="inline-block rounded-[20px] bg-[#FAECE7] px-[10px] py-[2px] text-[#712B13]">
                    327%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Horizontal bar chart */}
        <div>
          <div className="mb-2 text-[12px] text-[#6B7280]">
            ROI so sánh trực quan
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-28 text-right text-[11px] text-[#6B7280]">
                Formal Training
              </div>
              <div className="relative flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#EEEDFE]" style={{ width: "35%" }} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7280]">
                  180%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-28 text-right text-[11px] text-[#6B7280]">
                OJD / Stretch
              </div>
              <div className="relative flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#16A34A]" style={{ width: "100%" }} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-white">
                  520%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-28 text-right text-[11px] text-[#6B7280]">
                Mentoring
              </div>
              <div className="relative flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#FAECE7]" style={{ width: "63%" }} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7280]">
                  327%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 3: Insight box */}
        <div className="mt-4 flex items-start gap-[10px] rounded-xl border border-[0.5px] border-[#86EFAC] bg-[#F0FDF4] px-4 py-[14px]">
          <div className="h-8 w-8 rounded-lg bg-[#22C55E] grid place-items-center shrink-0">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-[13px] font-medium text-[#15803D]">
              Khuyến nghị chiến lược đào tạo
            </div>
            <div className="mt-1 text-[13px] text-[#166534] leading-6">
              OJD cho ROI cao nhất (520%) với chi phí thấp nhất. Tăng tỷ trọng Stretch Assignment trong IDP 2025.
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[60] rounded-lg bg-[#111827] px-5 py-3 text-[14px] text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

