import type { Assessment, Employee, Position, PositionLevel } from "@/data/types";

const BENCH: Record<
  PositionLevel,
  { tech: number; perf: number; beh: number; pot: number; lead: number }
> = {
  director: { tech: 92, perf: 90, beh: 88, pot: 88, lead: 90 },
  manager: { tech: 88, perf: 86, beh: 85, pot: 82, lead: 85 },
  lead: { tech: 86, perf: 84, beh: 82, pot: 80, lead: 78 },
  senior: { tech: 84, perf: 82, beh: 80, pot: 85, lead: 72 },
};

export type TalentRadarRow = {
  subject: string;
  thucTe: number;
  mucTieu: number;
};

function benchLevel(targetPos: Position | undefined, currentPos: Position | undefined): PositionLevel {
  return targetPos?.level ?? currentPos?.level ?? "manager";
}

/** Thực tế vs mục tiêu theo vị trí mục tiêu (hoặc cấp hiện tại). */
export function buildTalentRadarRows(
  employee: Employee,
  assessment: Assessment | undefined,
  targetPosition: Position | undefined,
  currentPosition: Position | undefined
): TalentRadarRow[] {
  const tech = assessment?.technical ?? employee.technicalScore;
  const perf = assessment?.performance ?? employee.performanceScore;
  const beh = assessment?.behavior ?? employee.behaviorScore;
  const pot = assessment?.potential ?? employee.potentialScore;
  const lead = Math.round((perf + beh + pot) / 3);

  const b = BENCH[benchLevel(targetPosition, currentPosition)];

  return [
    { subject: "Kỹ thuật", thucTe: tech, mucTieu: b.tech },
    { subject: "Hiệu suất", thucTe: perf, mucTieu: b.perf },
    { subject: "Hành vi", thucTe: beh, mucTieu: b.beh },
    { subject: "Tiềm năng", thucTe: pot, mucTieu: b.pot },
    { subject: "Lãnh đạo", thucTe: lead, mucTieu: b.lead },
  ];
}

export function countRadarPills(rows: TalentRadarRow[]): { exceed: number; below: number } {
  let exceed = 0;
  let below = 0;
  for (const r of rows) {
    if (r.thucTe >= r.mucTieu) exceed += 1;
    else below += 1;
  }
  return { exceed, below };
}
