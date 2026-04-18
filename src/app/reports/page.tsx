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

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Legend,
  LineChart,
  Line,
  LabelList,
  ResponsiveContainer,
} from "recharts";

import { assessments } from "@/data/assessments";
import { employees } from "@/data/employees";
import { positions } from "@/data/positions";
import { successionMap } from "@/data/succession";
import { COLORS, idpTrendData, kirkData } from "@/data/reports";

type Toast = { text: string } | null;

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function formatVndBillion(n: number) {
  // demo format: 2.4 -> "2.4 tỷ"
  return `${round1(n)} tỷ`;
}

function ChartCard(props: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #E5E7EB",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ minHeight: 48 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1E1B4B", lineHeight: "1.3" }}>
          {props.title}
        </div>
        {props.subtitle ? (
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3, lineHeight: "1.4" }}>
            {props.subtitle}
          </div>
        ) : null}
      </div>
      <div style={{ marginTop: 16, flex: 1 }}>{props.children}</div>
    </div>
  );
}

function DonutTooltip(props: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
  total: number;
}) {
  if (!props.active || !props.payload?.length) return null;
  const name = props.payload[0]?.name ?? "—";
  const value = props.payload[0]?.value ?? 0;
  const pct = props.total > 0 ? Math.round((value / props.total) * 100) : 0;
  return (
    <div
      style={{
        background: "#1E1B4B",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 700 }}>{name}</div>
      <div>
        {value} người · {pct}%
      </div>
    </div>
  );
}

function RadarTooltip(props: {
  active?: boolean;
  payload?: Array<{ payload?: { subject?: string; thucTe?: number; mucTieu?: number } }>;
}) {
  if (!props.active || !props.payload?.length) return null;
  const row = props.payload[0]?.payload ?? {};
  const subject = row.subject ?? "—";
  const thucTe = row.thucTe ?? 0;
  const mucTieu = row.mucTieu ?? 0;
  const gap = Math.max(0, mucTieu - thucTe);
  return (
    <div
      style={{
        background: "#1E1B4B",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 700 }}>{subject}</div>
      <div>
        Thực tế {thucTe} / Mục tiêu {mucTieu}{" "}
        {gap > 0 ? (
          <span style={{ color: "#FBBF24" }}>(thiếu {gap}đ)</span>
        ) : (
          <span style={{ color: "#34D399" }}>(đạt)</span>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [toast, setToast] = React.useState<Toast>(null);
  const showToast = React.useCallback((text: string) => {
    setToast({ text });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  // Mock numbers per spec (giữ nguyên section cũ)
  const l1 = { score: 4.2, max: 5, responses: 23, total: 25, dist: [1, 2, 4, 7, 9] };
  const l2 = { pre: 62, post: 84, improvement: 22, pct: 35 };
  const l3 = { applied: 78, sustained: 65, assessmentImprove: 8.3 };
  const l4 = { idpFrom: 65, idpTo: 78, sucFrom: 40, sucTo: 62, fillFrom: 4.2, fillTo: 2.8 };
  const l5 = { cost: 2.4, benefit: 8.7 };
  const roi = Math.round(((l5.benefit - l5.cost) / l5.cost) * 100); // 262%

  function avg(nums: number[]) {
    if (nums.length === 0) return 0;
    return Math.round(nums.reduce((s, v) => s + v, 0) / nums.length);
  }

  // Chart 1 (REAL): tier distribution from employees
  const tierData = [
    {
      name: "Kế thừa",
      value: employees.filter((e) => e.tier === "successor").length,
      color: COLORS.violet,
    },
    {
      name: "Tiềm năng",
      value: employees.filter((e) => e.tier === "potential").length,
      color: COLORS.blue,
    },
    {
      name: "Nòng cốt",
      value: employees.filter((e) => e.tier === "core").length,
      color: COLORS.teal,
    },
  ] as const;
  const totalTalent = employees.length;

  // Chart 2 (REAL): average scores from assessments
  const radarData = (() => {
    const avgScores = {
      kyThuat: avg(assessments.map((a) => a.technical)),
      hieuSuat: avg(assessments.map((a) => a.performance)),
      hanhVi: avg(assessments.map((a) => a.behavior)),
      tiemNang: avg(assessments.map((a) => a.potential)),
      lanhDao: avg(assessments.map((a) => a.potential)),
    };
    return [
      { subject: "Kỹ thuật", thucTe: avgScores.kyThuat, mucTieu: 90 },
      { subject: "Hiệu suất", thucTe: avgScores.hieuSuat, mucTieu: 85 },
      { subject: "Hành vi", thucTe: avgScores.hanhVi, mucTieu: 88 },
      { subject: "Tiềm năng", thucTe: avgScores.tiemNang, mucTieu: 85 },
      { subject: "Lãnh đạo", thucTe: avgScores.lanhDao, mucTieu: 82 },
    ] as const;
  })();

  // Chart 3 (REAL): readiness by key positions (from succession map)
  const readinessData = (() => {
    const byPos = new Map(successionMap.map((s) => [s.positionId, s]));
    return positions.slice(0, 6).map((pos) => {
      const entry = byPos.get(pos.id);
      const list = entry?.candidates ?? [];
      const short = pos.titleVi
        .replace("Trưởng phòng", "TP")
        .replace("Giám đốc", "GĐ")
        .replace("Kỹ sư", "KS");
      return {
        position: short,
        now: list.filter((s) => s.readiness === "now").length,
        y1: list.filter((s) => s.readiness === "1-2yr").length,
        y3: list.filter((s) => s.readiness === "3-5yr").length,
      };
    });
  })();

  return (
    <div className="w-full space-y-6">
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

      <div className="flex items-center justify-end gap-2">
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

      {/* NEW: Dashboard charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 16,
          alignItems: "stretch",
        }}
      >
        <ChartCard title="Phân loại nhân tài" subtitle="Donut theo tier (mock)">
          <div className="relative">
            <div className="mx-auto" style={{ width: "100%", height: 220, maxWidth: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierData as unknown as { name: string; value: number; color: string }[]}
                    dataKey="value"
                    cx="50%"
                    cy="46%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {tierData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip total={totalTalent} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-[28px] font-extrabold text-[#1E1B4B] tabular-nums">
                {totalTalent}
              </div>
              <div className="text-[11px] text-[#6B7280]">nhân tài</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {tierData.map((t) => (
              <div
                key={t.name}
                className="inline-flex items-center gap-2 rounded-full bg-[#F9FAFB] px-3 py-1 text-[12px] text-[#374151]"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                <span className="font-semibold">{t.name}</span>
                <span className="tabular-nums text-[#6B7280]">
                  {t.value} ({totalTalent > 0 ? Math.round((t.value / totalTalent) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Năng lực trung bình" subtitle="Radar: Thực tế vs Mục tiêu (mock)">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="mx-auto" style={{ width: "100%", height: 220, maxWidth: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={radarData as unknown as { subject: string; thucTe: number; mucTieu: number }[]}
                  cx="50%"
                  cy="50%"
                  outerRadius="85%"
                >
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    tickFormatter={(value) => {
                      const s =
                        (radarData as unknown as { subject: string; thucTe: number }[]).find(
                          (d) => d.subject === value
                        )?.thucTe ?? 0;
                      return `${value} (${s})`;
                    }}
                  />
                  <Tooltip content={<RadarTooltip />} />
                  <Radar
                    name="Thực tế"
                    dataKey="thucTe"
                    stroke={COLORS.violet}
                    fill={COLORS.violet}
                    fillOpacity={0.4}
                    strokeWidth={2.5}
                  />
                  <Radar
                    name="Mục tiêu"
                    dataKey="mucTieu"
                    stroke={COLORS.blue}
                    fill={COLORS.blue}
                    fillOpacity={0.15}
                    strokeWidth={2.5}
                    strokeDasharray="4 2"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend bottom-center (custom) */}
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6B7280" }}>
                <span style={{ width: 14, height: 10, borderRadius: 3, background: COLORS.blue, opacity: 0.8 }} />
                <span>Mục tiêu</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6B7280" }}>
                <span style={{ width: 14, height: 10, borderRadius: 3, background: COLORS.violet, opacity: 0.8 }} />
                <span>Thực tế</span>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Mức độ sẵn sàng" subtitle="Theo vị trí then chốt (mock)">
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={readinessData as unknown as { position: string; now: number; y1: number; y3: number }[]}
                  margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                  <XAxis
                    type="number"
                    domain={[0, 3]}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    tickCount={4}
                    label={{
                      value: "Số ứng viên",
                      position: "insideBottomRight",
                      offset: -4,
                      fill: "#9CA3AF",
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="position"
                    tick={{ fontSize: 10, fill: "#374151" }}
                    width={95}
                  />
                  <Tooltip
                    formatter={(value, name) => [`${value} người`, name]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 6 }}
                  />
                  <Bar dataKey="now" name="Sẵn sàng ngay" fill={COLORS.teal} radius={[0, 4, 4, 0]} barSize={7}>
                    <LabelList position="right" fontSize={11} fill="#6B7280" />
                  </Bar>
                  <Bar dataKey="y1" name="1–2 năm" fill={COLORS.amber} radius={[0, 4, 4, 0]} barSize={7} />
                  <Bar dataKey="y3" name="3–5 năm" fill={COLORS.violet} radius={[0, 4, 4, 0]} barSize={7} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <ChartCard title="Tiến độ IDP theo tháng" subtitle="% hoàn thành trên tổng nhân tài (mock)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={idpTrendData as unknown as { month: string; hoanThanh: number; dangThucHien: number; chuaBatDau: number }[]}
              margin={{ left: 0, right: 16, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} unit="%" domain={[0, 80]} />
              <Tooltip
                formatter={(v, n) => [`${v}%`, n]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: 11, paddingTop: 14 }}
              />
              <Line
                type="monotone"
                dataKey="hoanThanh"
                name="Hoàn thành"
                stroke={COLORS.teal}
                strokeWidth={2.5}
                dot={{ r: 4, fill: COLORS.teal }}
              />
              <Line
                type="monotone"
                dataKey="dangThucHien"
                name="Đang thực hiện"
                stroke={COLORS.blue}
                strokeWidth={2.5}
                strokeDasharray="5 3"
                dot={{ r: 4, fill: COLORS.blue }}
              />
              <Line
                type="monotone"
                dataKey="chuaBatDau"
                name="Chưa bắt đầu"
                stroke={COLORS.pink}
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3, fill: COLORS.pink }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Kirkpatrick theo cấp độ" subtitle="L1-L4: điểm /100 · L5: ROI % (mock)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={kirkData as unknown as { level: string; label: string; score: number; color: string; unit: string; display: string }[]}
              margin={{ left: 0, right: 16, top: 24, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} domain={[0, 300]} />
              <Tooltip
                formatter={(v, _n, p) => {
                  const payload = (p?.payload ?? {}) as { unit?: string; level?: string };
                  const name = (payload.level ?? "").replace("\n", " ");
                  return [`${v}${payload.unit ?? ""}`, name];
                }}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={44}>
                <LabelList
                  dataKey="display"
                  position="top"
                  style={{ fontSize: 12, fontWeight: 700 }}
                />
                {kirkData.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Divider 1 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "28px 0 20px",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
        <span
          style={{
            fontSize: 12,
            color: "#9CA3AF",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Kirkpatrick chi tiết — 5 cấp độ
        </span>
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
      </div>

      {/* 5 level cards (GIỮ NGUYÊN) */}
      <div className="so-card rounded-xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[16px] font-semibold text-[#374151]">Kirkpatrick — 5 cấp độ</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              Tổng hợp nhanh các chỉ số thuyết phục theo từng cấp độ
            </div>
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
                      <div className="text-[13px] font-bold text-[#111827]">Level 1 — Phản ứng</div>
                      <div className="text-[12px] text-[#6B7280]">Mức độ hài lòng khóa học</div>
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
                      <div className="text-[13px] font-bold text-[#111827]">Level 2 — Học</div>
                      <div className="text-[12px] text-[#6B7280]">Kiến thức tiếp thu được</div>
                    </div>
                  </div>

                  <div className="mt-3 text-[28px] font-extrabold text-[#111827] tabular-nums">
                    +{l2.improvement}đ
                  </div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    Pre-test avg: <span className="font-semibold text-[#111827]">{l2.pre}</span> → Post-test avg:{" "}
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
                  <div className="h-2 rounded-full bg-[#14B8A6]" style={{ width: `${l2.pre}%` }} />
                </div>
                <div className="mt-3 text-[12px] text-[#6B7280]">Post</div>
                <div className="mt-1 h-2 w-full rounded-full bg-[#E5E7EB]">
                  <div className="h-2 rounded-full bg-[#14B8A6]" style={{ width: `${l2.post}%` }} />
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
                      <div className="text-[13px] font-bold text-[#111827]">Level 3 — Hành vi</div>
                      <div className="text-[12px] text-[#6B7280]">Áp dụng vào công việc</div>
                    </div>
                  </div>

                  <div className="mt-3 text-[28px] font-extrabold text-[#111827] tabular-nums">{l3.applied}%</div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    Manager-reported: <span className="font-semibold text-[#111827]">{l3.applied}%</span> đã áp dụng
                  </div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    Sau 3 tháng: <span className="font-semibold text-[#111827]">{l3.sustained}%</span> duy trì
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-[#7C3AED]">
                    Assessment score improvement: +{l3.assessmentImprove}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#F9FAFB] p-3">
                  <div className="text-[12px] text-[#6B7280]">Đã áp dụng</div>
                  <div className="mt-1 text-[16px] font-bold text-[#111827] tabular-nums">{l3.applied}%</div>
                </div>
                <div className="rounded-lg bg-[#F9FAFB] p-3">
                  <div className="text-[12px] text-[#6B7280]">Duy trì</div>
                  <div className="mt-1 text-[16px] font-bold text-[#111827] tabular-nums">{l3.sustained}%</div>
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
                      <div className="text-[13px] font-bold text-[#111827]">Level 4 — Kết quả</div>
                      <div className="text-[12px] text-[#6B7280]">Tác động đến KPI</div>
                    </div>
                  </div>

                  <div className="mt-3 text-[13px] text-[#374151] leading-6">
                    <div>
                      IDP completion rate: <span className="font-semibold text-[#111827]">{l4.idpFrom}%</span> →{" "}
                      <span className="font-semibold text-[#111827]">{l4.idpTo}%</span>
                    </div>
                    <div>
                      Succession readiness: <span className="font-semibold text-[#111827]">{l4.sucFrom}%</span> →{" "}
                      <span className="font-semibold text-[#111827]">{l4.sucTo}%</span>
                    </div>
                    <div>
                      Thời gian lấp đầy vị trí:{" "}
                      <span className="font-semibold text-[#111827] tabular-nums">{l4.fillFrom}</span> →{" "}
                      <span className="font-semibold text-[#111827] tabular-nums">{l4.fillTo}</span> tháng
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-[#F9FAFB] p-3">
                  <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
                    <span>IDP completion</span>
                    <span className="font-semibold text-[#111827]">{l4.idpTo}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-[#E5E7EB]">
                    <div className="h-2 rounded-full bg-[#F59E0B]" style={{ width: `${l4.idpTo}%` }} />
                  </div>
                </div>
                <div className="rounded-lg bg-[#F9FAFB] p-3">
                  <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
                    <span>Succession readiness</span>
                    <span className="font-semibold text-[#111827]">{l4.sucTo}%</span>
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
                      <div className="text-[13px] font-bold text-[#111827]">Level 5 — ROI</div>
                      <div className="text-[12px] text-[#6B7280]">Tỷ suất hoàn vốn</div>
                    </div>
                  </div>

                  <div className="mt-3 text-[34px] font-extrabold text-[#111827] tabular-nums">{roi}%</div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    Chi phí đào tạo: <span className="font-semibold text-[#111827]">{formatVndBillion(l5.cost)}</span> · Lợi ích ước tính:{" "}
                    <span className="font-semibold text-[#111827]">{formatVndBillion(l5.benefit)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Công thức ROI</div>
                <div className="mt-2 text-[13px] text-[#374151] leading-6 tabular-nums">
                  ROI = (Lợi ích - Chi phí) / Chi phí × 100
                  <br />= ({formatVndBillion(l5.benefit)} - {formatVndBillion(l5.cost)}) / {formatVndBillion(l5.cost)} × 100
                  <br />= {roi}%
                </div>
              </div>

              <div className="mt-3 text-[12px] text-[#6B7280]">
                Ghi chú: Bao gồm giảm cost turnover + tăng project performance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider 2 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "28px 0 20px",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
        <span
          style={{
            fontSize: 12,
            color: "#9CA3AF",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          ROI So sánh phương thức đào tạo
        </span>
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
      </div>

      {/* ROI Comparison (GIỮ NGUYÊN) */}
      <div className="so-card rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[16px] font-semibold text-[#374151]">ROI Comparison</div>
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
              <div className="text-[14px] font-medium text-[#111827]">Formal Training</div>
            </div>
            <div className="mt-3 mb-4 border-t border-[0.5px] border-[#E5E7EB]" />

            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">Chi phí</div>
                <div className="text-[15px] text-[#111827] tabular-nums">1.8 tỷ VNĐ</div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">Điểm tăng</div>
                <div className="flex items-center gap-3">
                  <div className="text-[15px] text-[#111827] tabular-nums">+12.3 điểm</div>
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
              <div className="text-[14px] font-medium text-[#16A34A]">OJD / Stretch</div>
            </div>
            <div className="mt-3 mb-4 border-t border-[#86EFAC]" />

            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-[12px] text-[#15803D]">Chi phí</div>
                <div className="text-[15px] text-[#111827] tabular-nums">0.3 tỷ VNĐ</div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">Điểm tăng</div>
                <div className="flex items-center gap-3">
                  <div className="text-[15px] text-[#111827] tabular-nums">+15.6 điểm</div>
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
              <div className="text-[14px] font-medium text-[#111827]">Mentoring</div>
            </div>
            <div className="mt-3 mb-4 border-t border-[0.5px] border-[#E5E7EB]" />

            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">Chi phí</div>
                <div className="text-[15px] text-[#111827] tabular-nums">0.3 tỷ VNĐ</div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-[12px] text-[#6B7280]">Điểm tăng</div>
                <div className="flex items-center gap-3">
                  <div className="text-[15px] text-[#111827] tabular-nums">+9.8 điểm</div>
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
          <div className="mb-2 text-[12px] text-[#6B7280]">ROI so sánh trực quan</div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-28 text-right text-[11px] text-[#6B7280]">Formal Training</div>
              <div className="relative flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#EEEDFE]" style={{ width: "35%" }} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7280]">180%</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-28 text-right text-[11px] text-[#6B7280]">OJD / Stretch</div>
              <div className="relative flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#16A34A]" style={{ width: "100%" }} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-white">520%</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-28 text-right text-[11px] text-[#6B7280]">Mentoring</div>
              <div className="relative flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#FAECE7]" style={{ width: "63%" }} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7280]">327%</div>
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
            <div className="text-[13px] font-medium text-[#15803D]">Khuyến nghị chiến lược đào tạo</div>
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

