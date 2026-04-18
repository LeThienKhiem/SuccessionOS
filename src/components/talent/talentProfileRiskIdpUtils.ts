import type { Employee, IDP } from "@/data/types";
import { employees } from "@/data/employees";

export type RiskFactorRow = {
  id: string;
  label: string;
  severity: "high" | "medium" | "low";
  source: "system_computed" | "manager_noted" | "hr_noted";
  notedAt: string;
  detailNote?: string;
};

function inferSeverity(label: string, riskScore: number): "high" | "medium" | "low" {
  const t = label.toLowerCase();
  if (t.includes("headhunter") || t.includes("lương") || riskScore >= 60) return "high";
  if (t.includes("năm") || t.includes("idp") || riskScore >= 45) return "medium";
  return "low";
}

function inferSource(label: string, isMarket: boolean): RiskFactorRow["source"] {
  if (isMarket) return "hr_noted";
  if (/tự|hệ thống|auto|năm|thăng chức/i.test(label)) return "system_computed";
  return "manager_noted";
}

function sourceLabel(s: RiskFactorRow["source"]): string {
  if (s === "system_computed") return "Tự động";
  if (s === "manager_noted") return "Manager";
  return "HR ghi nhận";
}

/** Badge text trong Zone C (theo spec HRM360 risk row) */
export function riskSourceBadgeShort(s: RiskFactorRow["source"]): string {
  if (s === "system_computed") return "Tự động";
  if (s === "manager_noted") return "Manager";
  return "HR";
}

export function buildRiskFactorRows(employee: Employee, marketIntelActive: boolean): RiskFactorRow[] {
  const rows: RiskFactorRow[] = [];
  let i = 0;
  for (const label of employee.internalRiskFactors ?? []) {
    rows.push({
      id: `in-${i++}`,
      label,
      severity: inferSeverity(label, employee.riskScore),
      source: inferSource(label, false),
      notedAt: label.includes("năm") ? `Từ ${employee.lastPromotionYear}` : "Q1/2025",
      detailNote: label.includes("thăng chức")
        ? `Lần thăng chức gần nhất: ${employee.lastPromotionYear}`
        : label.toLowerCase().includes("idp")
          ? "Theo nhật ký IDP / review chu kỳ"
          : undefined,
    });
  }
  if (marketIntelActive) {
    for (const label of employee.marketRiskFactors ?? []) {
      rows.push({
        id: `mk-${i++}`,
        label,
        severity: inferSeverity(label, employee.riskScore),
        source: "hr_noted",
        notedAt: "Tháng 2/25",
        detailNote: "Theo báo cáo Market Intelligence",
      });
    }
  }
  return rows;
}

export { sourceLabel };

export function avgDeptRiskScore(departmentId: string): number {
  const same = employees.filter((e) => e.departmentId === departmentId);
  if (same.length === 0) return 40;
  return same.reduce((s, e) => s + e.riskScore, 0) / same.length;
}

export function riskInsightLine(employee: Employee, deptName: string): string {
  const avg = avgDeptRiskScore(employee.departmentId);
  const diff = employee.riskScore - avg;
  const pct = avg > 0 ? Math.round((diff / avg) * 100) : 0;
  const cmp =
    diff > 0
      ? `cao hơn ~${Math.max(5, Math.abs(pct))}% so với trung bình phòng ${deptName}`
      : diff < 0
        ? `thấp hơn trung bình phòng ${deptName}`
        : `tương đương trung bình phòng ${deptName}`;
  return `Risk score ${employee.riskScore} — ${cmp}`;
}

export type IdpBucketKey = "70" | "20" | "10";

export function idpBucketProgress(activities: IDP["activities"]): {
  p70: number;
  p20: number;
  p10: number;
} {
  let s70 = 0,
    c70 = 0,
    s20 = 0,
    c20 = 0,
    s10 = 0,
    c10 = 0;
  for (const a of activities) {
    if (a.type === "mentoring") {
      s20 += a.progress;
      c20 += 1;
    } else if (a.type === "training") {
      s10 += a.progress;
      c10 += 1;
    } else {
      s70 += a.progress;
      c70 += 1;
    }
  }
  return {
    p70: c70 ? Math.round(s70 / c70) : 0,
    p20: c20 ? Math.round(s20 / c20) : 0,
    p10: c10 ? Math.round(s10 / c10) : 0,
  };
}

export function activityBucketLabel(type: string): "70%" | "20%" | "10%" {
  if (type === "mentoring") return "20%";
  if (type === "training") return "10%";
  return "70%";
}

export function activityTypeBadgeStyle(type: string): { bg: string; fg: string } {
  if (type === "stretch" || type === "project" || type === "rotation" || type === "shadowing") {
    return { bg: "#EDE9FE", fg: "#5B21B6" };
  }
  if (type === "mentoring") return { bg: "#DCFCE7", fg: "#065F46" };
  return { bg: "#DBEAFE", fg: "#1D4ED8" };
}
