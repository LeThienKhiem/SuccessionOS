export const COLORS = {
  violet: "#A78BFA",
  pink: "#F472B6",
  amber: "#FBBF24",
  teal: "#34D399",
  blue: "#60A5FA",
  coral: "#FB923C",
  indigo: "#818CF8",
  rose: "#FB7185",
} as const;

export const idpTrendData = [
  { month: "T10/24", hoanThanh: 45, dangThucHien: 32, chuaBatDau: 23 },
  { month: "T11/24", hoanThanh: 52, dangThucHien: 28, chuaBatDau: 20 },
  { month: "T12/24", hoanThanh: 58, dangThucHien: 25, chuaBatDau: 17 },
  { month: "T1/25", hoanThanh: 62, dangThucHien: 22, chuaBatDau: 16 },
  { month: "T2/25", hoanThanh: 67, dangThucHien: 20, chuaBatDau: 13 },
  { month: "T3/25", hoanThanh: 72, dangThucHien: 18, chuaBatDau: 10 },
] as const;

export const kirkData = [
  { level: "L1\nPhản ứng", label: "L1", score: 84, color: COLORS.violet, unit: "/100", display: "84/100" },
  { level: "L2\nHọc", label: "L2", score: 78, color: COLORS.blue, unit: "/100", display: "78/100" },
  { level: "L3\nHành vi", label: "L3", score: 72, color: COLORS.teal, unit: "/100", display: "72/100" },
  { level: "L4\nKết quả", label: "L4", score: 65, color: COLORS.amber, unit: "/100", display: "65/100" },
  { level: "L5\nROI", label: "L5", score: 262, color: COLORS.coral, unit: "%", display: "262%" },
] as const;

