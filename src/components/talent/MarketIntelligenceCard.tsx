"use client";

import type { MarketIntelligence } from "@/data/types";

type MetricRow = {
  label: string;
  value: number;
  unit: string;
  sub: string;
  icon: string;
  highlight?: boolean;
};

interface Props {
  data: MarketIntelligence;
}

export function MarketIntelligenceCard({ data }: Props) {
  const metrics: MetricRow[] = [
    {
      label: "Độ nhận diện thị trường",
      value: data.profileViewsVsMarket,
      unit: "%",
      sub: "so với trung bình ngành O&G",
      icon: "👁️",
    },
    {
      label: "Mức độ được headhunt",
      value: data.headhuntFreqVsMarket,
      unit: "%",
      sub: "tần suất tiếp cận từ recruiter",
      icon: "🎯",
    },
    {
      label: "Lương so với thị trường",
      value: data.salaryGapVsMarket,
      unit: "%",
      sub:
        data.salaryGapVsMarket < 0
          ? "⚠️ Dưới market rate — rủi ro nghỉ việc"
          : "✓ Cạnh tranh so với thị trường",
      icon: "💰",
      highlight: data.salaryGapVsMarket < -8,
    },
    {
      label: "Độ khan hiếm talent",
      value: data.talentScarcity,
      unit: "%",
      sub: "ít người có profile tương đương",
      icon: "💎",
    },
  ];

  const trendLabel = {
    increasing: { text: "Nhu cầu tăng", color: "#EF4444", icon: "↑" },
    stable: { text: "Nhu cầu ổn định", color: "#F59E0B", icon: "→" },
    decreasing: { text: "Nhu cầu giảm", color: "#10B981", icon: "↓" },
  }[data.demandTrend];

  const trendBg = `${trendLabel.color}1A`;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: trendLabel.color,
            background: trendBg,
            padding: "3px 10px",
            borderRadius: 20,
          }}
        >
          {trendLabel.icon} {trendLabel.text}
        </span>
        <span style={{ fontSize: 10, color: "#9CA3AF" }}>Cập nhật {data.lastUpdated}</span>
      </div>

      {metrics.map((m, i) => {
        const isPositive = m.value > 0;
        const color = m.label.includes("Lương")
          ? m.value < 0
            ? "#EF4444"
            : "#10B981"
          : m.value >= 20
            ? "#EF4444"
            : m.value >= 10
              ? "#F59E0B"
              : "#10B981";

        const showPlus =
          isPositive && m.label !== "Độ khan hiếm talent";

        return (
          <div
            key={m.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 0",
              borderBottom: i < metrics.length - 1 ? "1px solid #F3F4F6" : "none",
              background: m.highlight ? "#FEF2F2" : "transparent",
              borderRadius: m.highlight ? 6 : 0,
              paddingLeft: m.highlight ? 6 : 0,
            }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>{m.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{m.label}</div>
              <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{m.sub}</div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 2,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color,
                  minWidth: 40,
                  textAlign: "right",
                }}
              >
                {showPlus ? `+${m.value}` : m.value}
              </span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{m.unit}</span>
            </div>
          </div>
        );
      })}

      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid #F3F4F6",
          fontSize: 10,
          color: "#9CA3AF",
          display: "flex",
          alignItems: "center",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        <span>Nguồn:</span>
        {data.sources.map((s) => (
          <span
            key={s}
            style={{
              background: "#F3F4F6",
              padding: "1px 6px",
              borderRadius: 10,
              fontSize: 10,
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
