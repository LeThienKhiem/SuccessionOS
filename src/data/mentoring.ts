import type { CareerTrack } from "./types";

export type MentoringStatus = "active" | "completed" | "paused";

export interface MentoringPair {
  id: string;
  mentorId: string;
  menteeId: string;
  track: CareerTrack; // technical | leadership
  startMonth: string; // e.g. "10/2023"
  commitmentHours: number; // total commitment for the cycle (demo)
  completedHours: number; // actual hours logged
  status: MentoringStatus;
}

export interface MentoringSession {
  id: string;
  pairId: string;
  date: string; // "05/03/2025"
  topic: string;
  durationMin: number;
  location: string;
  outcome: string;
  confirmed: boolean;
}

export const mentoringPairs: MentoringPair[] = [
  // NVĐ → NVT
  {
    id: "pair-nvd-nvt",
    mentorId: "emp-001",
    menteeId: "emp-019",
    track: "technical",
    startMonth: "10/2023",
    commitmentHours: 50,
    completedHours: 45,
    status: "active",
  },
  // LTH → NTP (over-commitment story)
  {
    id: "pair-lth-ntp",
    mentorId: "emp-003",
    menteeId: "emp-023",
    track: "leadership",
    startMonth: "01/2023",
    commitmentHours: 80,
    completedHours: 88,
    status: "active",
  },
  // VĐL → PVM (behind story)
  {
    id: "pair-vdl-pvm",
    mentorId: "emp-006",
    menteeId: "emp-022",
    track: "technical",
    startMonth: "08/2024",
    commitmentHours: 24,
    completedHours: 12,
    status: "active",
  },
];

export const mentoringSessions: MentoringSession[] = [
  // pair-nvd-nvt NVĐ → NVT
  {
    id: "s-001",
    pairId: "pair-nvd-nvt",
    date: "05/03/2025",
    topic: "Client PVN negotiation",
    durationMin: 90,
    location: "VP PTSC M&C",
    outcome: "NVT đã independent trong 2 meetings, chuẩn bị BATNA rõ ràng.",
    confirmed: true,
  },
  {
    id: "s-002",
    pairId: "pair-nvd-nvt",
    date: "10/02/2025",
    topic: "Block B risk escalation",
    durationMin: 60,
    location: "Online (Teams)",
    outcome: "Thiết lập escalation ladder và template weekly risk report.",
    confirmed: true,
  },
  {
    id: "s-003",
    pairId: "pair-nvd-nvt",
    date: "12/01/2025",
    topic: "Stakeholder mapping cho giai đoạn procurement",
    durationMin: 75,
    location: "VP PTSC M&C",
    outcome: "Hoàn thiện map 12 stakeholders, xác định 3 điểm nghẽn cần unblock.",
    confirmed: true,
  },
  {
    id: "s-004",
    pairId: "pair-nvd-nvt",
    date: "18/12/2024",
    topic: "Leadership presence — trình bày trước Ban PTNT",
    durationMin: 60,
    location: "VP PTSC M&C",
    outcome: "NVT nâng pitch deck, cải thiện narrative & Q/A handling.",
    confirmed: true,
  },

  // pair-lth-ntp LTH → NTP (vượt cam kết)
  {
    id: "s-005",
    pairId: "pair-lth-ntp",
    date: "22/03/2025",
    topic: "HSE incident investigation (case study offshore)",
    durationMin: 120,
    location: "VP + site review",
    outcome: "NTP tự dẫn dắt 1 mock investigation, mapping root-cause theo 5-Why.",
    confirmed: true,
  },
  {
    id: "s-006",
    pairId: "pair-lth-ntp",
    date: "28/02/2025",
    topic: "ISO 45001 audit readiness",
    durationMin: 90,
    location: "VP PTSC M&C",
    outcome: "Checklist audit + phân công owner cho 8 evidence packs.",
    confirmed: true,
  },
  {
    id: "s-007",
    pairId: "pair-lth-ntp",
    date: "30/01/2025",
    topic: "Crisis communication & stakeholder handling",
    durationMin: 75,
    location: "Online (Teams)",
    outcome: "NTP viết 2 kịch bản thông cáo và plan họp với client.",
    confirmed: true,
  },
  {
    id: "s-008",
    pairId: "pair-lth-ntp",
    date: "15/12/2024",
    topic: "Designing HSE training program (Q1 roadmap)",
    durationMin: 90,
    location: "VP PTSC M&C",
    outcome: "Xây 6 modules + rubric đánh giá sau đào tạo.",
    confirmed: true,
  },

  // pair-vdl-pvm VĐL → PVM (chậm tiến độ)
  {
    id: "s-009",
    pairId: "pair-vdl-pvm",
    date: "05/03/2025",
    topic: "FEA review — common pitfalls",
    durationMin: 60,
    location: "Project site (Block B)",
    outcome: "PVM giảm 30% rework do hiểu guideline kiểm tra mesh/BCs.",
    confirmed: true,
  },
  {
    id: "s-010",
    pairId: "pair-vdl-pvm",
    date: "12/02/2025",
    topic: "CAESAR II stress report walkthrough",
    durationMin: 60,
    location: "Online (Teams)",
    outcome: "PVM tự chạy 1 case đơn giản và trình bày results + assumptions.",
    confirmed: true,
  },
  {
    id: "s-011",
    pairId: "pair-vdl-pvm",
    date: "08/01/2025",
    topic: "Career roadmap: Senior → Lead (Structural)",
    durationMin: 45,
    location: "VP PTSC M&C",
    outcome: "Chốt 3 mục tiêu kỹ thuật + 2 mục tiêu leadership trong 6 tháng.",
    confirmed: true,
  },
  {
    id: "s-012",
    pairId: "pair-vdl-pvm",
    date: "18/12/2024",
    topic: "Review drawing stamps & compliance checklist",
    durationMin: 45,
    location: "VP PTSC M&C",
    outcome: "PVM nắm checklist 10 mục trước khi submit client.",
    confirmed: true,
  },
];

