import type { Assessment } from "@/data/types";

export type Hrm360CriterionView = {
  id: string;
  name: string;
  achieveRate: number;
  tb: number;
  required: number;
};

export type Hrm360AccordionView = {
  id: string;
  cycleName: string;
  assessmentDate: string;
  totalScore: number;
  criteria: Hrm360CriterionView[];
};

const CRITERIA_NAMES: string[] = [
  "Tầm nhìn chiến lược & định hướng",
  "Ra quyết định & giải quyết vấn đề",
  "Giao tiếp & ảnh hưởng",
  "Làm việc nhóm & hợp tác",
  "Tính chuyên nghiệp kỹ thuật",
  "Chất lượng & an toàn công việc",
  "Tuân thủ quy trình & tiêu chuẩn",
  "Hiệu suất & kết quả đầu ra",
  "Quản lý thời gian & ưu tiên",
  "Đổi mới & cải tiến",
  "Phát triển & coaching nhân sự",
  "Tuân thủ văn hóa & hành vi",
  "Tiềm năng phát triển",
];

/** Deterministic jitter 0..1 from string id */
function hash01(seed: string, i: number): number {
  let h = 0;
  const s = `${seed}-${i}`;
  for (let j = 0; j < s.length; j++) h = (h << 5) - h + s.charCodeAt(j);
  return Math.abs(h % 997) / 997;
}

function bucketForIndex(i: number): "tech" | "perf" | "beh" | "pot" | "mix" {
  if (i <= 3) return "mix";
  if (i <= 9) return "tech";
  if (i <= 10) return "perf";
  if (i === 11) return "beh";
  return "pot";
}

/**
 * Builds a 13-criterion HRM360-style view from the existing 4-dimension Assessment
 * (demo data — preserves overall as totalScore; criteria spread around dimension scores).
 */
export function buildHrm360AccordionView(assessment: Assessment): Hrm360AccordionView {
  const { technical, performance, behavior, potential, overall } = assessment;
  const base = overall / 20; // 0–5 scale anchor
  const required = 4.5;

  const criteria: Hrm360CriterionView[] = CRITERIA_NAMES.map((name, i) => {
    const b = bucketForIndex(i);
    const dim =
      b === "tech"
        ? technical
        : b === "perf"
          ? performance
          : b === "beh"
            ? behavior
            : b === "pot"
              ? potential
              : (technical + performance + behavior) / 3;
    const jitter = (hash01(assessment.employeeId, i) - 0.5) * 0.35;
    const tb = Math.min(5, Math.max(2.5, dim / 20 + jitter));
    const achieveRate = Math.min(100, Math.round((tb / required) * 100));
    return {
      id: `hrm360-${assessment.employeeId}-${i}`,
      name,
      achieveRate,
      tb,
      required,
    };
  });

  const totalScore = Math.min(5, Math.max(2.5, overall / 20));

  return {
    id: assessment.id,
    cycleName: assessment.cycle,
    assessmentDate: assessment.assessmentDate,
    totalScore,
    criteria,
  };
}

export function pickLatestAssessment(
  assessments: Assessment[],
  employeeId: string,
): Assessment | undefined {
  const rows = assessments.filter((a) => a.employeeId === employeeId);
  if (rows.length === 0) return undefined;
  return [...rows].sort(
    (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime(),
  )[0];
}
