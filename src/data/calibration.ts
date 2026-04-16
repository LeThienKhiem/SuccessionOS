import { employees } from "./employees";

export type CalibrationEmployee = (typeof employees)[number];

export const calibrationSession = {
  id: "calib-q4-2024",
  title: "Phiên Hiệu chỉnh 9-Box — Q4 2024",
  status: "in-progress" as const,
  facilitator: "Lê Khiêm",
  committeeSize: 5,
};

// Override scores for demo placement in 9-Box
// Goal:
// - Ô 9: NVT (emp-019), NTP (emp-023)
export const calibrationScoreOverrides: Record<
  string,
  Partial<Pick<CalibrationEmployee, "performanceScore" | "potentialScore">>
> = {
  "emp-019": { performanceScore: 92, potentialScore: 88 }, // NVT -> cell 9
  "emp-023": { performanceScore: 88, potentialScore: 85 }, // NTP -> cell 9
};

export function getCalibrationEmployees(): CalibrationEmployee[] {
  return employees.map((e) => {
    const ov = calibrationScoreOverrides[e.id];
    return ov ? { ...e, ...ov } : e;
  });
}

