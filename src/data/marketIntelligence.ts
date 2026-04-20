import type { Employee, MarketIntelligence } from "./types";
import { marketIntelligenceData } from "./marketIntelligenceData";

/** Fallback khi không có trong `marketIntelligenceData` (vd. nhân viên mới) */
export const DEFAULT_MARKET_INTELLIGENCE: MarketIntelligence = {
  profileViewsVsMarket: 8,
  headhuntFreqVsMarket: 10,
  salaryGapVsMarket: -3,
  talentScarcity: 72,
  demandTrend: "stable",
  lastUpdated: "03/2026",
  sources: ["LinkedIn Talent Insights"],
};

export function getMarketIntelligence(employee: Employee): MarketIntelligence {
  return (
    marketIntelligenceData[employee.id] ??
    employee.marketIntelligence ??
    DEFAULT_MARKET_INTELLIGENCE
  );
}

/** Chuỗi mock cũ đã thay bằng % từ Market Intelligence */
function isLegacyMarketIntelRedundant(text: string): boolean {
  const t = text.toLowerCase();
  if (t.includes("headhunter")) return true;
  if (t.includes("lần") && (t.includes("tiếp cận") || t.includes("tiep can"))) return true;
  if (t.includes("lương") && (t.includes("thị trường") || t.includes("thi truong"))) return true;
  return false;
}

/** Yếu tố thị trường định tính (giữ), không trùng với headhunt/lương % */
export function filterQualitativeMarketRiskFactors(employee: Employee): string[] {
  return (employee.marketRiskFactors ?? []).filter((f) => !isLegacyMarketIntelRedundant(f));
}

export function marketIntelligenceRiskHeadhuntLabel(mi: MarketIntelligence): string {
  return `+${mi.headhuntFreqVsMarket}% tần suất tiếp cận từ recruiter vs thị trường`;
}

export function marketIntelligenceRiskSalaryLabel(mi: MarketIntelligence): string {
  return mi.salaryGapVsMarket >= 0
    ? `+${mi.salaryGapVsMarket}% lương vs thị trường`
    : `${mi.salaryGapVsMarket}% lương vs thị trường`;
}

export interface MarketIntelData {
  employeeId: string;

  // Salary benchmark (nguồn: Talentnet VN Survey)
  currentSalary: number; // triệu VND/tháng (ẩn, chỉ HR thấy)
  marketMedian: number; // triệu VND/tháng
  marketGapPercent: number; // âm = thấp hơn thị trường
  salaryBenchmarkSource: string;
  benchmarkUpdated: string; // ngày cập nhật

  // Market demand (nguồn: LinkedIn Talent Insights)
  marketDemand: "low" | "medium" | "high" | "very-high";
  demandTrend: "decreasing" | "stable" | "increasing";
  avgTimeToFill: number; // ngày trung bình để tuyển role này

  // Headhunter activity (nguồn: Stay interview / 1-on-1)
  headhunterApproaches: number; // số lần được tiếp cận (12 tháng)
  lastApproachDate: string | null;
  approachSource: "self-reported" | "manager-noted" | "none";

  // Engagement (nguồn: Pulse survey ẩn danh)
  engagementScore: number; // 0-100
  engagementTrend: "down" | "stable" | "up";
  lastSurveyDate: string;
  flightRiskFromSurvey: "low" | "medium" | "high";
}

export const marketIntelData: MarketIntelData[] = [
  {
    employeeId: "emp-001",
    currentSalary: 85,
    marketMedian: 82,
    marketGapPercent: +3.7,
    salaryBenchmarkSource: "Talentnet VN Survey 2024",
    benchmarkUpdated: "2024-12-01",
    marketDemand: "high",
    demandTrend: "increasing",
    avgTimeToFill: 94,
    headhunterApproaches: 0,
    lastApproachDate: null,
    approachSource: "none",
    engagementScore: 82,
    engagementTrend: "stable",
    lastSurveyDate: "2025-01-15",
    flightRiskFromSurvey: "low",
  },
  {
    employeeId: "emp-002",
    currentSalary: 72,
    marketMedian: 85,
    marketGapPercent: -15.3,
    salaryBenchmarkSource: "Talentnet VN Survey 2024",
    benchmarkUpdated: "2024-12-01",
    marketDemand: "very-high",
    demandTrend: "increasing",
    avgTimeToFill: 120,
    headhunterApproaches: 2,
    lastApproachDate: "2025-02-10",
    approachSource: "self-reported",
    engagementScore: 58,
    engagementTrend: "down",
    lastSurveyDate: "2025-01-15",
    flightRiskFromSurvey: "high",
  },
  {
    employeeId: "emp-003",
    currentSalary: 68,
    marketMedian: 65,
    marketGapPercent: +4.6,
    salaryBenchmarkSource: "Talentnet VN Survey 2024",
    benchmarkUpdated: "2024-12-01",
    marketDemand: "high",
    demandTrend: "stable",
    avgTimeToFill: 75,
    headhunterApproaches: 0,
    lastApproachDate: null,
    approachSource: "none",
    engagementScore: 88,
    engagementTrend: "up",
    lastSurveyDate: "2025-01-15",
    flightRiskFromSurvey: "low",
  },
  {
    employeeId: "emp-004",
    currentSalary: 70,
    marketMedian: 72,
    marketGapPercent: -2.8,
    salaryBenchmarkSource: "Talentnet VN Survey 2024",
    benchmarkUpdated: "2024-12-01",
    marketDemand: "high",
    demandTrend: "stable",
    avgTimeToFill: 88,
    headhunterApproaches: 1,
    lastApproachDate: "2024-11-20",
    approachSource: "manager-noted",
    engagementScore: 61,
    engagementTrend: "down",
    lastSurveyDate: "2025-01-15",
    flightRiskFromSurvey: "medium",
  },
  {
    employeeId: "emp-005",
    currentSalary: 75,
    marketMedian: 74,
    marketGapPercent: +1.4,
    salaryBenchmarkSource: "Talentnet VN Survey 2024",
    benchmarkUpdated: "2024-12-01",
    marketDemand: "medium",
    demandTrend: "stable",
    avgTimeToFill: 65,
    headhunterApproaches: 0,
    lastApproachDate: null,
    approachSource: "none",
    engagementScore: 79,
    engagementTrend: "stable",
    lastSurveyDate: "2025-01-15",
    flightRiskFromSurvey: "low",
  },
  {
    employeeId: "emp-006",
    currentSalary: 58,
    marketMedian: 68,
    marketGapPercent: -14.7,
    salaryBenchmarkSource: "Talentnet VN Survey 2024",
    benchmarkUpdated: "2024-12-01",
    marketDemand: "very-high",
    demandTrend: "increasing",
    avgTimeToFill: 135,
    headhunterApproaches: 2,
    lastApproachDate: "2025-03-01",
    approachSource: "self-reported",
    engagementScore: 52,
    engagementTrend: "down",
    lastSurveyDate: "2025-01-15",
    flightRiskFromSurvey: "high",
  },
  {
    employeeId: "emp-007",
    currentSalary: 62,
    marketMedian: 60,
    marketGapPercent: +3.3,
    salaryBenchmarkSource: "Talentnet VN Survey 2024",
    benchmarkUpdated: "2024-12-01",
    marketDemand: "medium",
    demandTrend: "stable",
    avgTimeToFill: 58,
    headhunterApproaches: 0,
    lastApproachDate: null,
    approachSource: "none",
    engagementScore: 74,
    engagementTrend: "stable",
    lastSurveyDate: "2025-01-15",
    flightRiskFromSurvey: "low",
  },
  {
    employeeId: "emp-008",
    currentSalary: 60,
    marketMedian: 58,
    marketGapPercent: +3.4,
    salaryBenchmarkSource: "Talentnet VN Survey 2024",
    benchmarkUpdated: "2024-12-01",
    marketDemand: "medium",
    demandTrend: "increasing",
    avgTimeToFill: 70,
    headhunterApproaches: 0,
    lastApproachDate: null,
    approachSource: "none",
    engagementScore: 85,
    engagementTrend: "up",
    lastSurveyDate: "2025-01-15",
    flightRiskFromSurvey: "low",
  },
  {
    employeeId: "emp-019",
    currentSalary: 78,
    marketMedian: 75,
    marketGapPercent: +4.0,
    salaryBenchmarkSource: "Talentnet VN Survey 2024",
    benchmarkUpdated: "2024-12-01",
    marketDemand: "high",
    demandTrend: "increasing",
    avgTimeToFill: 94,
    headhunterApproaches: 1,
    lastApproachDate: "2025-01-05",
    approachSource: "self-reported",
    engagementScore: 80,
    engagementTrend: "stable",
    lastSurveyDate: "2025-01-15",
    flightRiskFromSurvey: "low",
  },
  {
    employeeId: "emp-023",
    currentSalary: 55,
    marketMedian: 52,
    marketGapPercent: +5.8,
    salaryBenchmarkSource: "Talentnet VN Survey 2024",
    benchmarkUpdated: "2024-12-01",
    marketDemand: "high",
    demandTrend: "stable",
    avgTimeToFill: 75,
    headhunterApproaches: 0,
    lastApproachDate: null,
    approachSource: "none",
    engagementScore: 91,
    engagementTrend: "up",
    lastSurveyDate: "2025-01-15",
    flightRiskFromSurvey: "low",
  },
];

