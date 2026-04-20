"use client";

import type { MarketIntelligence } from "@/data/types";

interface Props {
  data?: MarketIntelligence | null;
}

/** % fill cung = |value|/100 (value đã là % so với benchmark / khan hiếm 0–100) */
function GaugeChart(props: {
  value: number;
  label: string;
  sub: string;
  color: string;
  /** false = không dấu + (vd. khan hiếm 89%) */
  signed?: boolean;
}) {
  const { value, label, sub, color, signed = true } = props;
  const r = 34;
  const cx = 44;
  const cy = 52;
  const rotation = -135;
  const circ = 2 * Math.PI * r;
  const ARC_FRACTION = 0.72;
  const arcLength = circ * ARC_FRACTION;
  const fillPct = Math.min(Math.max(Math.abs(value) / 100, 0), 1);
  const dashFill = fillPct * arcLength;
  const dashGap = circ - dashFill;

  const valueText = signed
    ? value > 0
      ? `+${value}`
      : `${value}`
    : `${Math.abs(value)}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        textAlign: "center",
      }}
    >
      <svg width="88" height="60" viewBox="0 0 88 60">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circ - arcLength}`}
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dashFill} ${dashGap}`}
          transform={`rotate(${rotation} ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        <text x={cx} y="48" textAnchor="middle" fontSize="12" fontWeight="800" fill={color}>
          {valueText}%
        </text>
      </svg>
      <div style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 10, color: "#9CA3AF" }}>{sub}</div>
    </div>
  );
}

export function MarketIntelligenceCard({ data }: Props) {
  if (!data) return null;

  const headhuntColor =
    data.headhuntFreqVsMarket >= 35 ? "#EF4444" : data.headhuntFreqVsMarket >= 20 ? "#F59E0B" : "#10B981";

  const salaryColor =
    data.salaryGapVsMarket < -8 ? "#EF4444" : data.salaryGapVsMarket < 0 ? "#F59E0B" : "#10B981";

  const trendConfig = {
    increasing: { text: "Nhu cầu thị trường tăng", color: "#EF4444", icon: "↑" },
    stable: { text: "Nhu cầu thị trường ổn định", color: "#F59E0B", icon: "→" },
    decreasing: { text: "Nhu cầu thị trường giảm", color: "#10B981", icon: "↓" },
  }[data.demandTrend];

  const trendBg = `${trendConfig.color}26`;

  const salaryAbs = Math.min(Math.abs(data.salaryGapVsMarket), 20);
  const salaryBarPct = (salaryAbs / 20) * 50;
  const salaryBarLeft =
    data.salaryGapVsMarket < 0 ? `${50 - salaryBarPct}%` : data.salaryGapVsMarket > 0 ? "50%" : "50%";
  const salaryBarWidth =
    data.salaryGapVsMarket === 0 ? "0%" : `${Math.max(salaryBarPct, 6)}%`;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: trendConfig.color,
            background: trendBg,
            padding: "3px 10px",
            borderRadius: 20,
          }}
        >
          {trendConfig.icon} {trendConfig.text}
        </span>
        <span style={{ fontSize: 10, color: "#9CA3AF" }}>Cập nhật {data.lastUpdated}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          alignItems: "flex-start",
          marginBottom: 20,
          padding: "12px 8px",
          background: "#FAFAFA",
          borderRadius: 10,
          border: "1px solid #F3F4F6",
        }}
      >
        <GaugeChart
          value={data.profileViewsVsMarket}
          label="Nhận diện"
          sub="vs thị trường"
          color="#6366F1"
        />
        <GaugeChart
          value={data.headhuntFreqVsMarket}
          label="Headhunt"
          sub="tần suất"
          color={headhuntColor}
        />
        <GaugeChart
          value={data.talentScarcity}
          label="Khan hiếm"
          sub="độ hiếm"
          color="#8B5CF6"
          signed={false}
        />
      </div>

      <div
        style={{
          padding: "12px 14px",
          background: data.salaryGapVsMarket < -8 ? "#FEF2F2" : "#F9FAFB",
          borderRadius: 10,
          marginBottom: 12,
          border: `1px solid ${salaryColor}40`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1E1B4B" }}>💰 Lương so với thị trường</div>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>
              {data.salaryGapVsMarket < 0
                ? "⚠️ Dưới market rate — rủi ro nghỉ việc"
                : "✓ Cạnh tranh so với thị trường"}
            </div>
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, color: salaryColor }}>
            {data.salaryGapVsMarket > 0 ? `+${data.salaryGapVsMarket}` : data.salaryGapVsMarket}%
          </span>
        </div>
        <div style={{ position: "relative", height: 8, background: "#E5E7EB", borderRadius: 10 }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -3,
              bottom: -3,
              width: 2,
              background: "#9CA3AF",
              transform: "translateX(-50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: salaryBarLeft,
              width: salaryBarWidth,
              height: "100%",
              borderRadius: 10,
              background: salaryColor,
              transition: "all 0.6s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 9, color: "#9CA3AF" }}>Thấp hơn thị trường</span>
          <span style={{ fontSize: 9, color: "#9CA3AF" }}>Cao hơn thị trường</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "#9CA3AF" }}>Nguồn:</span>
        {data.sources.map((s) => (
          <span
            key={s}
            style={{
              fontSize: 10,
              background: "#F3F4F6",
              color: "#6B7280",
              padding: "1px 8px",
              borderRadius: 20,
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
