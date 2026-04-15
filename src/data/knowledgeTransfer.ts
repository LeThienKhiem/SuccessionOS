export type KnowledgeCategory = "technical" | "process" | "relationship" | "tacit";

export type TransferMethod =
  | "shadowing"
  | "co-leading"
  | "documentation"
  | "mentoring"
  | "handover-session";

export type ItemStatus = "completed" | "in-progress" | "not-started";

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  title: string;
  description: string;
  criticality: "critical" | "high" | "medium";
  status: ItemStatus;
  transferMethod: TransferMethod;
  completionPercent: number;
  targetDate: string;
  notes?: string;
}

export interface TransferSession {
  id: string;
  date: string;
  type: TransferMethod;
  duration: string;
  topic: string;
  outcome: string;
  completedItems: string[];
}

export interface KnowledgeTransferPlan {
  id: string;
  positionId: string;
  holderId: string;
  successorId: string;
  status: "active" | "completed" | "not-started";
  startDate: string;
  targetDate: string;
  overallProgress: number;
  holderProgress: number;
  successorProgress: number;
  knowledgeItems: KnowledgeItem[];
  sessions: TransferSession[];
  nextSession?: {
    date: string;
    topic: string;
    type: TransferMethod;
  };
}

export const knowledgeTransferPlans: KnowledgeTransferPlan[] = [
  // ── KTP 1: NVĐ → NVT (Project Director) ──
  {
    id: "ktp-001",
    positionId: "pos-pd",
    holderId: "emp-001",
    successorId: "emp-019",
    status: "active",
    startDate: "2024-06-01",
    targetDate: "2025-12-31",
    overallProgress: 68,
    holderProgress: 72,
    successorProgress: 64,
    nextSession: {
      date: "2025-04-25",
      topic: "Client PVN negotiation strategy",
      type: "mentoring",
    },
    knowledgeItems: [
      {
        id: "ki-001",
        category: "technical",
        title: "EPCI Contract Templates & Standards",
        description:
          "Bộ template hợp đồng EPCI chuẩn, điều khoản rủi ro và cơ chế variation order",
        criticality: "critical",
        status: "completed",
        transferMethod: "documentation",
        completionPercent: 100,
        targetDate: "2024-09-30",
        notes: "NVT đã review và ký xác nhận hiểu",
      },
      {
        id: "ki-002",
        category: "technical",
        title: "Block B Risk Register & Mitigation Plans",
        description: "Toàn bộ risk register dự án Block B, lịch sử xử lý và bài học kinh nghiệm",
        criticality: "critical",
        status: "completed",
        transferMethod: "handover-session",
        completionPercent: 100,
        targetDate: "2024-10-31",
      },
      {
        id: "ki-003",
        category: "relationship",
        title: "Client Relationship — PVN/PVEP C-level",
        description:
          "Quan hệ với các lãnh đạo cấp cao PVN/PVEP, phong cách làm việc, kỳ vọng và điểm nhạy cảm",
        criticality: "critical",
        status: "in-progress",
        transferMethod: "co-leading",
        completionPercent: 60,
        targetDate: "2025-06-30",
        notes: "NVT đang tham dự các cuộc họp cùng NVĐ",
      },
      {
        id: "ki-004",
        category: "relationship",
        title: "Subcontractor Network & Vendor Relationships",
        description: "Mạng lưới nhà thầu phụ tin cậy, điều khoản ưu đãi và cơ chế escalation",
        criticality: "high",
        status: "in-progress",
        transferMethod: "shadowing",
        completionPercent: 45,
        targetDate: "2025-09-30",
      },
      {
        id: "ki-005",
        category: "process",
        title: "Tender & Bid Management Process",
        description: "Quy trình đấu thầu nội bộ, ma trận quyết định và kinh nghiệm win strategy",
        criticality: "critical",
        status: "in-progress",
        transferMethod: "co-leading",
        completionPercent: 50,
        targetDate: "2025-08-31",
      },
      {
        id: "ki-006",
        category: "process",
        title: "Crisis Management Playbook",
        description: "Quy trình xử lý khủng hoảng dự án: escalation, communication, damage control",
        criticality: "high",
        status: "not-started",
        transferMethod: "documentation",
        completionPercent: 0,
        targetDate: "2025-10-31",
      },
      {
        id: "ki-007",
        category: "tacit",
        title: "Reading Client Signals & Unspoken Expectations",
        description:
          "Kinh nghiệm đọc tín hiệu không lời từ client, biết khi nào cần escalate vs handle locally",
        criticality: "high",
        status: "in-progress",
        transferMethod: "mentoring",
        completionPercent: 40,
        targetDate: "2025-12-31",
        notes: "Tacit knowledge — chỉ học được qua quan sát thực tế",
      },
      {
        id: "ki-008",
        category: "tacit",
        title: "Stakeholder Politics & Internal Navigation",
        description: "Hiểu dynamics nội bộ PTSC, ai quyết định thật sự, cách navigate conflict",
        criticality: "medium",
        status: "in-progress",
        transferMethod: "mentoring",
        completionPercent: 55,
        targetDate: "2025-12-31",
      },
    ],
    sessions: [
      {
        id: "ses-001",
        date: "2024-07-15",
        type: "handover-session",
        duration: "3 giờ",
        topic: "Block B Risk Register walkthrough",
        outcome: "NVT đã nắm toàn bộ risk matrix và mitigation plans",
        completedItems: ["ki-002"],
      },
      {
        id: "ses-002",
        date: "2024-09-20",
        type: "documentation",
        duration: "2 buổi × 2 giờ",
        topic: "EPCI Contract Templates review",
        outcome: "Template được chuẩn hóa và NVT ký xác nhận",
        completedItems: ["ki-001"],
      },
      {
        id: "ses-003",
        date: "2025-01-10",
        type: "co-leading",
        duration: "Cả ngày",
        topic: "PVN Steering Committee Meeting",
        outcome: "NVT trình bày 2 agenda items độc lập, được client đánh giá tốt",
        completedItems: [],
      },
      {
        id: "ses-004",
        date: "2025-03-05",
        type: "mentoring",
        duration: "90 phút",
        topic: "Stakeholder dynamics và cách xử lý conflict PVN vs PVEP",
        outcome: "NVT hiểu rõ hơn về dynamics, cần thêm 2–3 buổi thực hành",
        completedItems: [],
      },
    ],
  },

  // ── KTP 2: LTH → NTP (HSE Manager) ──
  {
    id: "ktp-002",
    positionId: "pos-hse",
    holderId: "emp-003",
    successorId: "emp-023",
    status: "active",
    startDate: "2023-09-01",
    targetDate: "2025-06-30",
    overallProgress: 88,
    holderProgress: 92,
    successorProgress: 85,
    nextSession: {
      date: "2025-04-22",
      topic: "Major incident crisis communication drill",
      type: "co-leading",
    },
    knowledgeItems: [
      {
        id: "ki-009",
        category: "technical",
        title: "HSE Management System Documentation",
        description: "Toàn bộ hệ thống tài liệu HSE, quy trình và checklist",
        criticality: "critical",
        status: "completed",
        transferMethod: "documentation",
        completionPercent: 100,
        targetDate: "2024-03-31",
      },
      {
        id: "ki-010",
        category: "process",
        title: "Incident Investigation Methodology",
        description: "Quy trình điều tra sự cố, root cause analysis và báo cáo",
        criticality: "critical",
        status: "completed",
        transferMethod: "co-leading",
        completionPercent: 100,
        targetDate: "2024-06-30",
        notes: "NTP đã lead 2 investigations độc lập",
      },
      {
        id: "ki-011",
        category: "process",
        title: "Regulatory Authority Relations",
        description: "Quan hệ với cơ quan quản lý nhà nước, quy trình báo cáo và audit",
        criticality: "critical",
        status: "completed",
        transferMethod: "shadowing",
        completionPercent: 100,
        targetDate: "2024-09-30",
      },
      {
        id: "ki-012",
        category: "tacit",
        title: "Crisis Communication Under Pressure",
        description:
          "Kỹ năng giao tiếp trong tình huống khủng hoảng với client, media và cơ quan quản lý",
        criticality: "critical",
        status: "in-progress",
        transferMethod: "co-leading",
        completionPercent: 70,
        targetDate: "2025-06-30",
      },
    ],
    sessions: [
      {
        id: "ses-005",
        date: "2024-02-10",
        type: "documentation",
        duration: "1 tuần",
        topic: "HSE Management System full review",
        outcome: "NTP co-authored updated HSM version 3.0",
        completedItems: ["ki-009"],
      },
      {
        id: "ses-006",
        date: "2024-05-22",
        type: "co-leading",
        duration: "2 ngày",
        topic: "Lost Time Incident investigation Block B",
        outcome: "NTP lead toàn bộ investigation, LTH chỉ review cuối",
        completedItems: ["ki-010"],
      },
    ],
  },

  // ── KTP 3: VĐL → PVM (Lead Structural Engineer) ──
  {
    id: "ktp-003",
    positionId: "pos-lse",
    holderId: "emp-006",
    successorId: "emp-022",
    status: "active",
    startDate: "2024-09-01",
    targetDate: "2026-03-31",
    overallProgress: 35,
    holderProgress: 40,
    successorProgress: 30,
    nextSession: {
      date: "2025-05-01",
      topic: "FEED phase structural design review",
      type: "co-leading",
    },
    knowledgeItems: [
      {
        id: "ki-013",
        category: "technical",
        title: "Proprietary FEA Analysis Methods",
        description: "Phương pháp FEA độc quyền của VĐL cho offshore jacket structures",
        criticality: "critical",
        status: "in-progress",
        transferMethod: "mentoring",
        completionPercent: 40,
        targetDate: "2025-09-30",
      },
      {
        id: "ki-014",
        category: "technical",
        title: "DNV/API Code Interpretation — Edge Cases",
        description:
          "Kinh nghiệm diễn giải code trong các trường hợp biên không có hướng dẫn rõ ràng",
        criticality: "critical",
        status: "in-progress",
        transferMethod: "co-leading",
        completionPercent: 25,
        targetDate: "2025-12-31",
      },
      {
        id: "ki-015",
        category: "process",
        title: "Design Review & QA Process",
        description: "Quy trình peer review nội bộ và checklist đảm bảo chất lượng thiết kế",
        criticality: "high",
        status: "completed",
        transferMethod: "documentation",
        completionPercent: 100,
        targetDate: "2024-12-31",
      },
      {
        id: "ki-016",
        category: "tacit",
        title: "Engineering Judgment for Novel Problems",
        description: "Khả năng đưa ra quyết định kỹ thuật trong tình huống chưa có precedent",
        criticality: "high",
        status: "not-started",
        transferMethod: "shadowing",
        completionPercent: 0,
        targetDate: "2026-03-31",
        notes: "Cần ít nhất 2 năm quan sát thực tế",
      },
    ],
    sessions: [
      {
        id: "ses-007",
        date: "2024-11-15",
        type: "documentation",
        duration: "3 ngày",
        topic: "Design Review Process documentation",
        outcome: "Tạo được runbook chuẩn cho design QA process",
        completedItems: ["ki-015"],
      },
    ],
  },
];

