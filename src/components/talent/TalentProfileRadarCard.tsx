"use client";

import * as React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, Tooltip } from "recharts";

import type { Assessment, Employee, Position } from "@/data/types";
import { buildTalentRadarRows, countRadarPills, type TalentRadarRow } from "@/components/talent/talentRadarUtils";

export function TalentProfileRadarCard({
  employee,
  assessment,
  targetPosition,
  currentPosition,
}: {
  employee: Employee;
  assessment?: Assessment;
  targetPosition?: Position;
  currentPosition?: Position;
}) {
  const radarData = React.useMemo(
    () => buildTalentRadarRows(employee, assessment, targetPosition, currentPosition),
    [employee, assessment, targetPosition, currentPosition]
  );

  const { exceed, below } = React.useMemo(() => countRadarPills(radarData), [radarData]);

  /** Recharts ResponsiveContainer + React 19 often renders a blank SVG — measure parent instead. */
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [chartW, setChartW] = React.useState(340);
  const chartH = 240;

  React.useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const w = Math.floor(el.getBoundingClientRect().width);
      setChartW(w > 0 ? Math.max(260, w) : 340);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cx = chartW / 2;
  const cy = chartH / 2;
  const outerRadius = Math.round(Math.min(chartW, chartH) * 0.3);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-[#374151]">Hồ sơ năng lực</div>
          <div className="mt-0.5 text-[12px] text-[#9CA3AF]">So với yêu cầu vị trí mục tiêu</div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-[11px] font-semibold text-[#065F46]">
            ✓ {exceed} vượt chuẩn
          </span>
          <span className="inline-flex items-center rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-[11px] font-semibold text-[#991B1B]">
            ✗ {below} cần cải thiện
          </span>
        </div>
      </div>

      <div ref={wrapRef} className="mt-2 w-full min-w-0" style={{ height: chartH }}>
        <RadarChart
          width={chartW}
          height={chartH}
          data={radarData as TalentRadarRow[]}
          margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
          cx={cx}
          cy={cy}
          outerRadius={outerRadius}
        >
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 500 }} />
          <Radar
            name="Mục tiêu"
            dataKey="mucTieu"
            stroke="#BFDBFE"
            fill="#BFDBFE"
            fillOpacity={0.3}
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
          <Radar
            name="Thực tế"
            dataKey="thucTe"
            stroke="#A78BFA"
            fill="#A78BFA"
            fillOpacity={0.45}
            strokeWidth={2.5}
          />
          <Tooltip
            formatter={(val, name) => [`${Number(val ?? 0)}/100`, String(name)]}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
        </RadarChart>
      </div>

      {/* Legend ngoài ResponsiveContainer — không bị clip */}
      <div className="mt-2 flex justify-center gap-4 text-[11px] text-[#6B7280]">
        <div className="flex items-center gap-1">
          <div
            className="shrink-0 rounded-full"
            style={{ width: 10, height: 10, background: "#A78BFA" }}
          />
          Thực tế
        </div>
        <div className="flex items-center gap-1">
          <div
            className="shrink-0"
            style={{ width: 14, height: 2, borderTop: "2px dashed #BFDBFE" }}
          />
          Mục tiêu
        </div>
      </div>

      {/* Bảng điểm + gap — ngoài SVG, không overlap */}
      <div
        className="grid w-full min-w-0"
        style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))", marginTop: 8, gap: 4 }}
      >
        {radarData.map((d) => {
          const gap = d.thucTe - d.mucTieu;
          const color = gap >= 0 ? "#10B981" : "#EF4444";
          return (
            <div key={d.subject} className="min-w-0 text-center">
              <div className="flex min-h-[2.5rem] items-center justify-center px-0.5 text-center text-[10px] font-semibold leading-snug text-[#9CA3AF]">
                {d.subject}
              </div>
              <div className="text-[13px] font-bold text-[#374151]">{d.thucTe}</div>
              <div className="text-[10px] font-bold" style={{ color }}>
                {gap >= 0 ? `+${gap}` : gap}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
