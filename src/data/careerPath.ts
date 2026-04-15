export type SkillCategory = "technical" | "leadership" | "process" | "soft";

export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5;
// 0=Chưa có · 1=Cơ bản · 2=Đang phát triển · 3=Thành thục · 4=Nâng cao · 5=Master

export interface InternalExpert {
  employeeId: string;
  level: 4 | 5;
  availableForMentoring: boolean;
  notes: string;
}

export interface ExternalCourse {
  name: string;
  provider: string;
  type: "certification" | "online" | "classroom";
  duration: string;
  cost: string;
  language: "Vietnamese" | "English";
  rating: number; // 1–5
  highlight: string;
}

export interface SkillRequirement {
  id: string;
  name: string;
  category: SkillCategory;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  gap: number; // requiredLevel - currentLevel
  priority: "critical" | "high" | "medium";
  why: string;
  internalExperts: InternalExpert[];
  externalCourses: ExternalCourse[];
}

export interface Milestone {
  id: string;
  timeframe: string;
  title: string;
  description: string;
  keyActions: string[];
  successCriteria: string[];
  status: "current" | "next" | "future";
}

export interface LearningPhase {
  phase: string;
  duration: string;
  focus: string;
  activities: string[];
}

export interface AICareerPath {
  employeeId: string;
  generatedDate: string;
  targetPositionId: string;
  alternativePositionId?: string;

  aiSummary: string;
  strengthsHighlighted: string[];
  mainChallenges: string[];
  estimatedTimeToReady: string;
  confidenceScore: number; // 0–100

  milestones: Milestone[];
  skills: SkillRequirement[];
  learningPath: LearningPhase[];
}

export const aiCareerPaths: AICareerPath[] = [
  {
    employeeId: "emp-019",
    generatedDate: "2025-04-10",
    targetPositionId: "pos-pd",
    alternativePositionId: undefined,
    aiSummary:
      "Nguyễn Văn Tùng có nền tảng kỹ thuật và kinh nghiệm dự án vững chắc. Điểm mạnh nổi bật là khả năng phối hợp đội ngũ và được lòng tin của client. Khoảng cách lớn nhất với vị trí Project Director là kinh nghiệm đàm phán hợp đồng cấp cao và kỹ năng quản lý khủng hoảng độc lập. Với tốc độ phát triển hiện tại, ước tính sẵn sàng trong 12–18 tháng.",
    strengthsHighlighted: [
      "Hiểu sâu toàn bộ lifecycle EPCI từ FEED đến commissioning",
      "Client trust cao — PVN/PVEP đánh giá tốt trong 3 lần tương tác",
      "Đang deputy 2 năm — thực chiến đủ để tiếp nhận",
      "Leadership style được đội ngũ engineering tôn trọng",
    ],
    mainChallenges: [
      "Chưa từng đàm phán variation order >$10M độc lập",
      "Crisis communication với media/cơ quan chưa có kinh nghiệm",
      "Network C-level client chủ yếu qua NVĐ, chưa tự xây dựng",
    ],
    estimatedTimeToReady: "12–18 tháng",
    confidenceScore: 82,
    milestones: [
      {
        id: "ms-1",
        timeframe: "0–6 tháng",
        status: "current",
        title: "Củng cố kỹ năng đàm phán",
        description: "Tham gia trực tiếp tối thiểu 3 cuộc đàm phán contract cùng NVĐ",
        keyActions: [
          "Co-lead variation order negotiation Block B ($5M)",
          "Tự soạn thảo 1 contract amendment, NVĐ review",
          "Hoàn thành khóa Advanced Contract Management",
        ],
        successCriteria: [
          "Client chấp nhận ít nhất 1 negotiation position do NVT propose",
          "Contract amendment được pháp lý duyệt không cần sửa major",
        ],
      },
      {
        id: "ms-2",
        timeframe: "6–12 tháng",
        status: "next",
        title: "Dẫn dắt dự án độc lập",
        description: "Quản lý EPC project quy mô <$100M không cần NVĐ can thiệp hằng ngày",
        keyActions: [
          "Nhận Project Manager cho Lac Da Vang EPCM phase",
          "Xây dựng quan hệ trực tiếp với Murphy Oil representative",
          "Chủ trì Steering Committee meeting lần đầu tiên",
        ],
        successCriteria: [
          "Dự án đúng tiến độ tháng 6, 9, 12",
          "Client satisfaction score ≥8/10 trong mid-term review",
        ],
      },
      {
        id: "ms-3",
        timeframe: "12–18 tháng",
        status: "future",
        title: "Sẵn sàng nhận Project Director",
        description: "Đủ năng lực và sự tín nhiệm để tiếp nhận EPCI >$300M",
        keyActions: [
          "Thực hiện 1 crisis management tình huống thực tế",
          "Hoàn thành KTP với NVĐ — tất cả items critical",
          "Được BOD và PVN chính thức giới thiệu là người kế nhiệm",
        ],
        successCriteria: ["Confidence score KTP ≥85%", "Internal vote: ≥4/5 stakeholders ủng hộ bổ nhiệm"],
      },
    ],
    skills: [
      {
        id: "sk-1",
        name: "EPCI Contract Management",
        category: "technical",
        currentLevel: 3,
        requiredLevel: 5,
        gap: 2,
        priority: "critical",
        why: "Project Director phải ký và chịu trách nhiệm pháp lý về toàn bộ hợp đồng. Thiếu kỹ năng này là rủi ro kinh doanh lớn nhất.",
        internalExperts: [
          {
            employeeId: "emp-001",
            level: 5,
            availableForMentoring: true,
            notes: "NVĐ sẵn sàng mentoring 2h/tuần trong 6 tháng tới",
          },
        ],
        externalCourses: [
          {
            name: "Advanced EPCI Contract Management",
            provider: "IACCM (now World Commerce & Contracting)",
            type: "certification",
            duration: "3 tháng online",
            cost: "$1,200",
            language: "English",
            rating: 4.8,
            highlight: "Được công nhận quốc tế · Case studies từ dự án offshore thực tế",
          },
          {
            name: "Oil & Gas Contract Law",
            provider: "CMS Law (Singapore)",
            type: "classroom",
            duration: "5 ngày",
            cost: "$3,500",
            language: "English",
            rating: 4.5,
            highlight: "Networking với legal counsel từ các IOC trong khu vực",
          },
        ],
      },
      {
        id: "sk-2",
        name: "Crisis Management & Communication",
        category: "leadership",
        currentLevel: 2,
        requiredLevel: 4,
        gap: 2,
        priority: "critical",
        why: "Dự án EPCI luôn có rủi ro sự cố lớn. Project Director phải xử lý khủng hoảng với cả nội bộ, client, media và cơ quan nhà nước.",
        internalExperts: [
          {
            employeeId: "emp-003",
            level: 5,
            availableForMentoring: true,
            notes: "LTH có kinh nghiệm crisis communication trong 2 sự cố offshore lớn",
          },
          {
            employeeId: "emp-001",
            level: 4,
            availableForMentoring: false,
            notes: "NVĐ bận dự án, chỉ hỗ trợ tư vấn khi cần",
          },
        ],
        externalCourses: [
          {
            name: "Crisis Communication for Executives",
            provider: "Ragan Communications",
            type: "online",
            duration: "8 giờ",
            cost: "$299",
            language: "English",
            rating: 4.3,
            highlight: "Media training + simulation exercises",
          },
          {
            name: "Crisis Management in Oil & Gas",
            provider: "Energy Institute (London)",
            type: "classroom",
            duration: "2 ngày",
            cost: "$2,800",
            language: "English",
            rating: 4.6,
            highlight: "Tabletop exercises với tình huống offshore thực tế",
          },
        ],
      },
      {
        id: "sk-3",
        name: "Stakeholder Management — C-level",
        category: "leadership",
        currentLevel: 3,
        requiredLevel: 5,
        gap: 2,
        priority: "high",
        why: "Quan hệ với C-level client là tài sản chiến lược giúp thắng thầu và giải quyết xung đột. Hiện tại NVT chủ yếu tiếp xúc qua NVĐ.",
        internalExperts: [
          {
            employeeId: "emp-001",
            level: 5,
            availableForMentoring: true,
            notes: "NVĐ sẽ giới thiệu trực tiếp các mối quan hệ PVN trong 6 tháng",
          },
        ],
        externalCourses: [
          {
            name: "Executive Stakeholder Engagement",
            provider: "Heidrick & Struggles Academy",
            type: "classroom",
            duration: "2 ngày",
            cost: "$2,200",
            language: "English",
            rating: 4.4,
            highlight: "Role-play với C-level scenarios · Feedback từ executive coaches",
          },
        ],
      },
      {
        id: "sk-4",
        name: "Project Controls & EVM",
        category: "process",
        currentLevel: 3,
        requiredLevel: 4,
        gap: 1,
        priority: "high",
        why: "Project Director phải đọc và ra quyết định từ Earned Value Management reports hằng tuần. Gap nhỏ nhưng cần chuẩn hóa.",
        internalExperts: [
          {
            employeeId: "emp-008",
            level: 5,
            availableForMentoring: true,
            notes: "ĐTL sẵn sàng training 4 buổi Primavera P6 EVM nâng cao",
          },
        ],
        externalCourses: [
          {
            name: "PMI Earned Value Professional (EVP)",
            provider: "PMI",
            type: "certification",
            duration: "2 tháng tự học",
            cost: "$595",
            language: "English",
            rating: 4.5,
            highlight: "Chứng chỉ quốc tế · Được client và partners công nhận",
          },
        ],
      },
      {
        id: "sk-5",
        name: "Presentation & Executive Communication",
        category: "soft",
        currentLevel: 3,
        requiredLevel: 4,
        gap: 1,
        priority: "medium",
        why: "Trình bày trước Board và Steering Committee đòi hỏi kỹ năng storytelling và xử lý câu hỏi khó khác với báo cáo kỹ thuật thông thường.",
        internalExperts: [],
        externalCourses: [
          {
            name: "Executive Presence & Presentation Skills",
            provider: "Dale Carnegie Vietnam",
            type: "classroom",
            duration: "2 ngày",
            cost: "15,000,000 VNĐ",
            language: "Vietnamese",
            rating: 4.2,
            highlight: "Giảng dạy tiếng Việt · Phù hợp văn hóa giao tiếp Việt Nam",
          },
          {
            name: "Storytelling for Leaders",
            provider: "Coursera (Northwestern)",
            type: "online",
            duration: "4 tuần",
            cost: "$79",
            language: "English",
            rating: 4.6,
            highlight: "Tự học linh hoạt · Certificate từ Northwestern University",
          },
        ],
      },
    ],
    learningPath: [
      {
        phase: "Phase 1",
        duration: "0–6 tháng",
        focus: "Contract & Negotiation",
        activities: [
          "Enroll Advanced EPCI Contract Management (IACCM)",
          "Co-lead tối thiểu 3 negotiation sessions cùng NVĐ",
          "Hoàn thành Oil & Gas Contract Law (Singapore)",
          "Weekly debrief với NVĐ sau mỗi cuộc đàm phán",
        ],
      },
      {
        phase: "Phase 2",
        duration: "6–12 tháng",
        focus: "Independent Leadership",
        activities: [
          "Nhận PM role cho Lac Da Vang project",
          "Tham gia Crisis Management in Oil & Gas course",
          "Monthly stakeholder lunch với PVN representatives (NVĐ dẫn dắt)",
          "Đạt PMI EVP certification",
        ],
      },
      {
        phase: "Phase 3",
        duration: "12–18 tháng",
        focus: "Readiness & Transition",
        activities: [
          "Complete KTP với NVĐ — tất cả critical items",
          "Chủ trì toàn bộ Steering Committee cho Lac Da Vang",
          "Executive Presence training (Dale Carnegie)",
          "Shadow NVĐ trong Tender process cho dự án mới",
        ],
      },
    ],
  },

  {
    employeeId: "emp-006",
    generatedDate: "2025-04-10",
    targetPositionId: "pos-lse",
    alternativePositionId: "pos-em",
    aiSummary:
      'Vũ Đình Long có năng lực kỹ thuật structural engineering thuộc top 5% trong ngành dầu khí khu vực Đông Nam Á. AI khuyến nghị mạnh mẽ theo Tuyến Chuyên gia (Technical Track) thay vì Leadership Track — vì đây là nơi ông tạo ra giá trị lớn nhất và khó thay thế nhất. Rủi ro nghỉ việc ở mức cao — cần điều chỉnh chế độ đãi ngộ và tạo title "Principal Structural Engineer" để giữ chân.',
    strengthsHighlighted: [
      "FEA analysis cho offshore jacket structures ở đẳng cấp quốc tế",
      "Đầu ra thiết kế zero major defects trong 11 năm",
      "Mentor hiệu quả — PVM và TVH đều tiến bộ nhanh",
      "Phương pháp FEA độc quyền không có ai trong công ty có thể thay thế ngay",
    ],
    mainChallenges: [
      "Rủi ro nghỉ việc cao (62/100) — lương thấp hơn thị trường ~15%",
      "Chưa được thăng chức 4 năm — cảm giác career stagnation",
      "Nếu chọn Leadership Track: thiếu kinh nghiệm quản lý multi-discipline team",
    ],
    estimatedTimeToReady: "Đã sẵn sàng Principal Engineer — cần tạo title ngay",
    confidenceScore: 91,
    milestones: [
      {
        id: "ms-1",
        timeframe: "Ngay lập tức",
        status: "current",
        title: "Chính thức hóa Principal Structural Engineer",
        description: "Tạo chức danh và chế độ đãi ngộ phù hợp để giữ chân",
        keyActions: [
          'HR tạo chức danh "Principal Structural Engineer" trong hệ thống',
          "Điều chỉnh lương về ngang thị trường (salary gap ~15%)",
          "Công bố nội bộ về Technical Expert Track và vai trò Principal",
        ],
        successCriteria: ["VĐL chính thức ký nhận chức danh mới", "Risk score giảm về dưới 40 sau 3 tháng"],
      },
      {
        id: "ms-2",
        timeframe: "0–12 tháng",
        status: "next",
        title: "Tài liệu hóa phương pháp FEA độc quyền",
        description: "Chuyển tri thức từ trong đầu thành tài sản công ty",
        keyActions: [
          "Viết FEA Analysis Handbook cho offshore jacket structures",
          "Tạo internal training course 3 buổi × 4 giờ cho team",
          "Review và validate methodology với DNV GL consultant",
        ],
        successCriteria: [
          "Handbook được 3 senior engineers áp dụng độc lập thành công",
          "DNV GL xác nhận methodology đạt chuẩn offshore",
        ],
      },
      {
        id: "ms-3",
        timeframe: "12–36 tháng",
        status: "future",
        title: "Industry Recognition — Senior Expert",
        description: "Xây dựng danh tiếng bên ngoài để tăng giá trị thương hiệu PTSC M&C",
        keyActions: [
          "Present paper tại OTC (Offshore Technology Conference) Houston",
          "Tham gia Technical Committee của ISO hoặc DNV GL",
          "Co-author ít nhất 1 technical paper được peer-review",
        ],
        successCriteria: [
          "Paper được chấp nhận tại OTC hoặc tương đương",
          "Được mời làm Technical Reviewer cho 1 external project",
        ],
      },
    ],
    skills: [
      {
        id: "sk-1",
        name: "Advanced FEA for Offshore Structures",
        category: "technical",
        currentLevel: 5,
        requiredLevel: 5,
        gap: 0,
        priority: "critical",
        why: "Đây là kỹ năng master — VĐL là người dạy lại, không cần học.",
        internalExperts: [{ employeeId: "emp-006", level: 5, availableForMentoring: true, notes: "VĐL là internal expert duy nhất ở level 5" }],
        externalCourses: [],
      },
      {
        id: "sk-2",
        name: "Knowledge Documentation & Technical Writing",
        category: "process",
        currentLevel: 2,
        requiredLevel: 4,
        gap: 2,
        priority: "critical",
        why: "Principal Engineer phải tài liệu hóa tri thức để công ty không phụ thuộc vào 1 người. Đây là trách nhiệm quan trọng nhất của vai trò này.",
        internalExperts: [],
        externalCourses: [
          { name: "Technical Writing for Engineers", provider: "Coursera (Georgia Tech)", type: "online", duration: "6 tuần", cost: "$49", language: "English", rating: 4.7, highlight: "Tự học · Certificate từ Georgia Tech · Nhiều engineers đánh giá cao" },
          { name: "Engineering Documentation Best Practices", provider: "IChemE", type: "online", duration: "2 ngày", cost: "$450", language: "English", rating: 4.3, highlight: "Chuẩn industry cho Oil & Gas documentation" },
        ],
      },
      {
        id: "sk-3",
        name: "DNV GL / API Code Updates (2024–2025)",
        category: "technical",
        currentLevel: 4,
        requiredLevel: 5,
        gap: 1,
        priority: "high",
        why: "Các tiêu chuẩn offshore cập nhật liên tục. Principal Engineer phải là người đầu tiên trong công ty nắm được thay đổi mới nhất.",
        internalExperts: [{ employeeId: "emp-006", level: 4, availableForMentoring: false, notes: "VĐL cần update thêm — cùng nhau học" }],
        externalCourses: [
          { name: "DNV-ST-0119 Revision Updates", provider: "DNV GL Academy", type: "online", duration: "1 ngày", cost: "$380", language: "English", rating: 4.8, highlight: "Trực tiếp từ DNV GL · Cập nhật nhất · Có Q&A với standard committee" },
          { name: "API RP 2A-WSD 24th Edition Changes", provider: "API", type: "online", duration: "4 giờ", cost: "$195", language: "English", rating: 4.5, highlight: "Official API training · Certificate" },
        ],
      },
      {
        id: "sk-4",
        name: "Mentoring & Knowledge Transfer Skills",
        category: "soft",
        currentLevel: 3,
        requiredLevel: 4,
        gap: 1,
        priority: "high",
        why: "Giỏi một mình chưa đủ — Principal Engineer phải tạo được thế hệ kế tiếp. Kỹ năng mentoring cần được chuẩn hóa.",
        internalExperts: [{ employeeId: "emp-003", level: 4, availableForMentoring: true, notes: "LTH có kinh nghiệm mentoring xuất sắc — có thể chia sẻ methodology" }],
        externalCourses: [{ name: "Coaching and Mentoring Certificate", provider: "ICF (International Coaching Federation)", type: "online", duration: "3 tháng", cost: "$890", language: "English", rating: 4.6, highlight: "Globally recognized · Structured mentoring methodology" }],
      },
      {
        id: "sk-5",
        name: "Industry Conference Presentation",
        category: "soft",
        currentLevel: 1,
        requiredLevel: 3,
        gap: 2,
        priority: "medium",
        why: "Principal Engineer đại diện cho thương hiệu kỹ thuật của PTSC M&C. Việc present tại OTC, ISOPE tạo credibility cho cả công ty khi đấu thầu quốc tế.",
        internalExperts: [],
        externalCourses: [{ name: "Technical Presentation for Engineers", provider: "SPE (Society of Petroleum Engineers)", type: "online", duration: "8 giờ", cost: "$150", language: "English", rating: 4.2, highlight: "SPE membership included · Access to paper submission guidelines" }],
      },
    ],
    learningPath: [
      { phase: "Phase 1", duration: "Ngay — tháng 3", focus: "Giữ chân & Chính thức hóa", activities: ["HR tạo chức danh Principal Structural Engineer", "Điều chỉnh lương về market rate", "Bắt đầu Technical Writing course (Coursera)", "Lên outline FEA Handbook — phê duyệt với Engineering Manager"] },
      { phase: "Phase 2", duration: "Tháng 3–12", focus: "Knowledge Codification", activities: ["Viết FEA Handbook — 12 chapters", "Deliver 3 internal training sessions cho team", "Hoàn thành DNV GL + API code update courses", "Đăng ký ICF Mentoring Certificate"] },
      { phase: "Phase 3", duration: "Năm 2–3", focus: "Industry Recognition", activities: ["Viết technical paper về offshore FEA methodology của PTSC", "Submit đến OTC Houston hoặc ISOPE", "Tham gia DNV GL Technical Committee nếu được mời", "Present tại ít nhất 1 regional conference"] },
    ],
  },

  {
    employeeId: "emp-016",
    generatedDate: "2025-04-10",
    targetPositionId: "pos-pl",
    alternativePositionId: "pos-pcm",
    aiSummary:
      "Bùi Thị Linh là ứng viên kế thừa mạnh nhất trong nhóm Tiềm năng — IDP tiến độ tốt nhất, kỹ năng Primavera P6 thành thục, tư duy hệ thống tốt. Khoảng cách chính là kinh nghiệm quản lý multiple projects đồng thời và kỹ năng giao tiếp với lãnh đạo cấp cao. Có thể sẵn sàng trong 12–18 tháng nếu được giao thêm responsibility.",
    strengthsHighlighted: [
      "Primavera P6 ở level nâng cao — không cần đào tạo thêm",
      "EVM (Earned Value Management) thành thục",
      "Tư duy hệ thống: nhìn được big picture của schedule",
      "Tinh thần học hỏi cao nhất nhóm — IDP 70% chỉ sau 15 tháng",
    ],
    mainChallenges: [
      "Chưa quản lý schedule cho >1 project lớn cùng lúc",
      "Giao tiếp với C-level và client trong review meetings còn thiếu tự tin",
      "Chưa có PMI-SP certification — cần cho tín nhiệm quốc tế",
    ],
    estimatedTimeToReady: "12–18 tháng",
    confidenceScore: 78,
    milestones: [
      {
        id: "ms-1",
        timeframe: "0–6 tháng",
        status: "current",
        title: "PMI-SP Certification",
        description: "Đạt chứng chỉ quốc tế làm nền tảng credibility",
        keyActions: ["Hoàn thành PMI-SP prep course", "Pass PMI-SP exam lần đầu (target Q3 2025)", "Đăng ký làm Planning lead cho Sao Vang project"],
        successCriteria: ["PMI-SP certificate in hand", "Planning lead role được chính thức giao"],
      },
      {
        id: "ms-2",
        timeframe: "6–12 tháng",
        status: "next",
        title: "Quản lý 2 projects đồng thời",
        description: "Chứng minh khả năng multi-project management",
        keyActions: ["Planning lead đồng thời cho Sao Vang + Lac Da Vang (planning phase)", "Present schedule to Steering Committee độc lập lần đầu", "Xây dựng planning team 3 người bên dưới"],
        successCriteria: ["2 projects đều green schedule sau 6 tháng", "ĐTL delegate ≥50% planning responsibilities"],
      },
      {
        id: "ms-3",
        timeframe: "12–18 tháng",
        status: "future",
        title: "Sẵn sàng Planning Manager",
        description: "Vận hành planning function độc lập",
        keyActions: ["Acting Planning Manager khi ĐTL đi công tác/nghỉ phép", "Chuẩn hóa planning process cho toàn bộ PTSC M&C", "Đào tạo 2 junior planners mới"],
        successCriteria: ["Zero escalation issues trong 3 tháng acting", "Planning process documentation được approve bởi Engineering Manager"],
      },
    ],
    skills: [
      {
        id: "sk-1",
        name: "PMI Scheduling Professional (PMI-SP)",
        category: "technical",
        currentLevel: 3,
        requiredLevel: 5,
        gap: 2,
        priority: "critical",
        why: "Chứng chỉ quốc tế là điều kiện tiên quyết cho Planning Manager — client quốc tế và lenders yêu cầu.",
        internalExperts: [{ employeeId: "emp-008", level: 4, availableForMentoring: true, notes: "ĐTL có PMI-SP — sẵn sàng coaching exam prep" }],
        externalCourses: [
          { name: "PMI-SP Exam Prep Course", provider: "Simplilearn", type: "online", duration: "6 tuần", cost: "$299", language: "English", rating: 4.5, highlight: "3 mock exams · Pass guarantee · Flexible schedule" },
          { name: "PMI-SP Certification Exam", provider: "PMI", type: "certification", duration: "1 ngày thi", cost: "$520", language: "English", rating: 5.0, highlight: "Official PMI exam · Valid 3 years" },
        ],
      },
      {
        id: "sk-2",
        name: "Multi-project Schedule Management",
        category: "process",
        currentLevel: 2,
        requiredLevel: 4,
        gap: 2,
        priority: "critical",
        why: "Planning Manager phải quản lý schedule của tất cả projects đồng thời, phân bổ resource và identify conflicts giữa các dự án.",
        internalExperts: [{ employeeId: "emp-008", level: 5, availableForMentoring: true, notes: "ĐTL sẽ gradually delegate multi-project oversight cho BTL" }],
        externalCourses: [
          { name: "Multi-Project Management with Primavera", provider: "Oracle University", type: "online", duration: "3 ngày", cost: "$1,200", language: "English", rating: 4.6, highlight: "Official Oracle training · Advanced P6 portfolio management" },
        ],
      },
      {
        id: "sk-3",
        name: "Executive Communication & Reporting",
        category: "soft",
        currentLevel: 2,
        requiredLevel: 4,
        gap: 2,
        priority: "high",
        why: "Planning Manager trình bày schedule health cho BOD và client hằng tháng. Cần kỹ năng đơn giản hóa thông tin kỹ thuật phức tạp thành insight rõ ràng.",
        internalExperts: [{ employeeId: "emp-008", level: 4, availableForMentoring: true, notes: "ĐTL sẽ pair với BTL trong 6 lần Steering Committee meetings đầu tiên" }],
        externalCourses: [
          { name: "Data Storytelling for Project Managers", provider: "LinkedIn Learning", type: "online", duration: "4 giờ", cost: "$30/tháng (subscription)", language: "English", rating: 4.4, highlight: "Practical · Immediate application · Short modules" },
          { name: "Effective Project Status Reporting", provider: "PM World", type: "online", duration: "6 giờ", cost: "$199", language: "English", rating: 4.3, highlight: "Templates included · Executive dashboard design" },
        ],
      },
    ],
    learningPath: [
      { phase: "Phase 1", duration: "0–6 tháng", focus: "Certification & Foundation", activities: ["Complete Simplilearn PMI-SP prep course", "Pass PMI-SP exam (target tháng 8/2025)", "Enroll Multi-project Management with Primavera", "Co-present với ĐTL trong 2 Steering Committee meetings"] },
      { phase: "Phase 2", duration: "6–12 tháng", focus: "Hands-on Multi-project", activities: ["Nhận planning lead cho 2 projects đồng thời", "Present độc lập trong Steering Committee", "LinkedIn Learning Data Storytelling course", "Xây dựng team 3 junior planners"] },
      { phase: "Phase 3", duration: "12–18 tháng", focus: "Transition to Manager", activities: ["Acting Planning Manager ít nhất 3 tháng", "Viết Planning Process Handbook cho PTSC M&C", "Mentor 2 junior planners mới join", "Đề xuất ĐTL về bổ nhiệm chính thức"] },
    ],
  },
];

