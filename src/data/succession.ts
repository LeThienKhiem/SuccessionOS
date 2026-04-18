import type { SuccessionEntry, Project, IDP, DashboardKPI } from './types'

// ============================================================
// Succession Mapping — ai kế thừa ai
// ============================================================
export const successionMap: SuccessionEntry[] = [
  {
    positionId: 'pos-pd',
    currentHolderId: 'emp-001',
    candidates: [
      { employeeId: 'emp-006', readiness: 'now',   gapScore: 14, nominatedDate: '2024-06-01', nominatedBy: 'Ban PTNT',
        strengths: ['Lead structural xuất sắc', 'Được client Block B tin tưởng', 'Sẵn sàng mở rộng scope PM'],
        developmentNeeds: ['Hoàn thiện kinh nghiệm EPCI end-to-end', 'Đàm phán contract cấp cao'] },
      { employeeId: 'emp-019', readiness: 'now',   gapScore: 12, nominatedDate: '2024-06-01', nominatedBy: 'Ban PTNT',
        strengths: ['Đã deputy 2 năm', 'Hiểu toàn bộ scope dự án', 'Được client tin tưởng'],
        developmentNeeds: ['Cần thêm kinh nghiệm đàm phán contract cấp cao'] },
      { employeeId: 'emp-010', readiness: '1-2yr', gapScore: 35, nominatedDate: '2024-06-01', nominatedBy: 'Trần Minh Tuấn',
        strengths: ['Tư duy chiến lược tốt', 'Kỹ năng giao tiếp nổi trội'],
        developmentNeeds: ['Chưa có kinh nghiệm quản lý dự án EPCI từ đầu đến cuối', 'Cần PMP'] },
    ]
  },
  {
    positionId: 'pos-em',
    currentHolderId: 'emp-002',
    candidates: [
      { employeeId: 'emp-001', readiness: '1-2yr', gapScore: 22, nominatedDate: '2024-06-01', nominatedBy: 'Ban PTNT',
        strengths: ['Kinh nghiệm EPCI director', 'Stakeholder cấp cao', 'Risk & contract'],
        developmentNeeds: ['Deepen multi-discipline technical leadership', 'Coaching next-gen EM'] },
      { employeeId: 'emp-020', readiness: '1-2yr', gapScore: 18, nominatedDate: '2024-06-01', nominatedBy: 'Nguyễn Văn Đức',
        strengths: ['Năng lực kỹ thuật xuất sắc', 'Đang deputy EM'],
        developmentNeeds: ['Cần thêm kinh nghiệm quản lý multi-discipline team'] },
      { employeeId: 'emp-009', readiness: '1-2yr', gapScore: 28, nominatedDate: '2024-09-01', nominatedBy: 'Trần Minh Tuấn',
        strengths: ['Chuyên môn structural rất sâu', 'Tiềm năng cao'],
        developmentNeeds: ['Cần kinh nghiệm quản lý ngoài discipline structural'] },
    ]
  },
  {
    positionId: 'pos-hse',
    currentHolderId: 'emp-003',
    candidates: [
      { employeeId: 'emp-023', readiness: 'now',   gapScore: 8,  nominatedDate: '2024-03-01', nominatedBy: 'Ban PTNT',
        strengths: ['Deputy HSE Manager 1.5 năm', 'NEBOSH đạt loại A', 'Zero incident trong 2 năm'],
        developmentNeeds: ['Cần thêm kinh nghiệm quản lý crisis cấp cao'] },
      { employeeId: 'emp-012', readiness: '1-2yr', gapScore: 22, nominatedDate: '2024-06-01', nominatedBy: 'Lê Thị Hương',
        strengths: ['Tinh thần trách nhiệm cao', 'Giỏi training đội ngũ'],
        developmentNeeds: ['Cần thêm kinh nghiệm offshore HSE', 'ISO 45001 Lead Auditor'] },
    ]
  },
  {
    positionId: 'pos-cm',
    currentHolderId: 'emp-004',
    candidates: [
      { employeeId: 'emp-021', readiness: '1-2yr', gapScore: 25, nominatedDate: '2024-06-01', nominatedBy: 'Phạm Quốc Hùng',
        strengths: ['8 năm kinh nghiệm thi công', 'Quản lý subcontractor tốt'],
        developmentNeeds: ['Cần kinh nghiệm dẫn dắt team >50 người', 'Kỹ năng báo cáo lên Board'] },
    ]
  },
  {
    positionId: 'pos-lse',
    currentHolderId: 'emp-006',
    candidates: [
      { employeeId: 'emp-022', readiness: '1-2yr', gapScore: 15, nominatedDate: '2024-06-01', nominatedBy: 'Vũ Đình Long',
        strengths: ['Kỹ thuật vững, CAESAR II thành thục', 'Đang dẫn dắt sub-team 5 người'],
        developmentNeeds: ['Cần hoàn thiện PE License', 'Thêm kinh nghiệm FEED phase'] },
      { employeeId: 'emp-009', readiness: '1-2yr', gapScore: 20, nominatedDate: '2024-09-01', nominatedBy: 'Trần Minh Tuấn',
        strengths: ['FEA analysis xuất sắc', 'Học nhanh'],
        developmentNeeds: ['Kinh nghiệm detailed design còn thiếu', 'Chưa có PE License'] },
    ]
  },
  {
    positionId: 'pos-pm',
    currentHolderId: 'emp-007',
    candidates: [
      { employeeId: 'emp-025', readiness: '3-5yr', gapScore: 42, nominatedDate: '2024-06-01', nominatedBy: 'Hoàng Văn Bình',
        strengths: ['Nắm vững quy trình procurement', 'Quan hệ vendor tốt'],
        developmentNeeds: ['Cần hoàn thành CIPS', 'Kinh nghiệm international procurement', 'Contract negotiation cấp cao'] },
      { employeeId: 'emp-013', readiness: '3-5yr', gapScore: 45, nominatedDate: '2024-09-01', nominatedBy: 'Hoàng Văn Bình',
        strengths: ['Hiểu biết rộng về thị trường', 'Analytical tốt'],
        developmentNeeds: ['Cần leadership development', 'Kinh nghiệm quản lý team procurement'] },
    ]
  },
  {
    positionId: 'pos-pl',
    currentHolderId: 'emp-008',
    candidates: [
      { employeeId: 'emp-016', readiness: '1-2yr', gapScore: 18, nominatedDate: '2024-06-01', nominatedBy: 'Đỗ Thị Lan',
        strengths: ['Primavera P6 thành thục', 'Earned value management giỏi', 'IDP tiến độ tốt nhất nhóm'],
        developmentNeeds: ['Cần kinh nghiệm quản lý multiple projects đồng thời'] },
    ]
  },
]

// ============================================================
// Projects — dự án EPCI/EPCM đang triển khai
// ============================================================
export const projects: Project[] = [
  {
    id: 'proj-001',
    name: 'Block B – Gas Development Platform',
    type: 'EPCI',
    status: 'active',
    startDate: '2023-04-01',
    endDate: '2026-03-31',
    contractValue: '650M USD',
    client: 'PVN / PVEP',
    keyPersonnelIds: ['emp-001', 'emp-002', 'emp-003', 'emp-004', 'emp-005', 'emp-007', 'emp-008', 'emp-019', 'emp-020'],
  },
  {
    id: 'proj-002',
    name: 'Sao Vang Dai Nguyet – Jacket Fabrication',
    type: 'EPC',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2025-09-30',
    contractValue: '180M USD',
    client: 'Eni Vietnam',
    keyPersonnelIds: ['emp-006', 'emp-009', 'emp-011', 'emp-022'],
  },
  {
    id: 'proj-003',
    name: 'Lac Da Vang – FPSO Modifications',
    type: 'EPCM',
    status: 'planning',
    startDate: '2025-03-01',
    endDate: '2027-06-30',
    contractValue: '290M USD',
    client: 'Murphy Oil',
    keyPersonnelIds: ['emp-013', 'emp-024', 'emp-025'],
  },
]

// ============================================================
// IDP Samples — 5 IDP đại diện
// ============================================================
export const idps: IDP[] = [
  {
    id: 'idp-019',
    employeeId: 'emp-019',
    targetPositionId: 'pos-pd',
    status: 'active',
    progress: 82,
    createdDate: '2023-06-01',
    reviewDate: '2025-06-01',
    approvedBy: 'Nguyễn Văn Đức',
    shortTermGoals: [
      'Hoàn thành khóa học Advanced Contract Management (Q2 2025)',
      'Dẫn dắt độc lập 1 dự án EPC quy mô trung (<100M USD)',
      'Tham gia đàm phán hợp đồng cùng Project Director tối thiểu 3 lần',
    ],
    midTermGoals: [
      'Sẵn sàng nhận Project Director cho dự án EPCI lớn tiếp theo',
      'Xây dựng quan hệ trực tiếp với khách hàng cấp C-level',
    ],
    activities: [
      { id: 'act-1', type: 'training',  title: 'Advanced Contract Management',     targetDate: '2025-04-30', status: 'in-progress', progress: 60 },
      { id: 'act-2', type: 'stretch',   title: 'Dẫn dắt EPC project độc lập',      targetDate: '2025-09-30', status: 'in-progress', progress: 35 },
      { id: 'act-3', type: 'shadowing', title: 'Shadow client negotiation session', targetDate: '2025-03-31', status: 'completed',   progress: 100 },
      { id: 'act-4', type: 'mentoring', title: 'Bi-weekly mentoring với NVĐ',       targetDate: '2025-12-31', status: 'in-progress', progress: 80 },
    ]
  },
  {
    id: 'idp-020',
    employeeId: 'emp-020',
    targetPositionId: 'pos-em',
    status: 'active',
    progress: 75,
    createdDate: '2023-09-01',
    reviewDate: '2025-09-01',
    approvedBy: 'Trần Minh Tuấn',
    shortTermGoals: [
      'Hoàn thành khóa Multi-discipline Engineering Management (Q1 2025)',
      'Dẫn dắt engineering team 15 người trong dự án Block B',
      'Đạt PMP certification',
    ],
    midTermGoals: [
      'Sẵn sàng Engineering Manager trong 18 tháng',
      'Phát triển 2 senior engineers dưới trướng thành potential',
    ],
    activities: [
      { id: 'act-1', type: 'training',  title: 'Multi-discipline Eng Management',  targetDate: '2025-03-31', status: 'completed',   progress: 100 },
      { id: 'act-2', type: 'project',   title: 'Lead engineering team Block B',     targetDate: '2025-12-31', status: 'in-progress', progress: 65 },
      { id: 'act-3', type: 'training',  title: 'PMP Certification',                 targetDate: '2025-06-30', status: 'in-progress', progress: 40 },
      { id: 'act-4', type: 'mentoring', title: 'Weekly 1:1 với TMT',               targetDate: '2025-12-31', status: 'in-progress', progress: 75 },
    ]
  },
  {
    id: 'idp-023',
    employeeId: 'emp-023',
    targetPositionId: 'pos-hse',
    status: 'completed',
    progress: 100,
    createdDate: '2023-01-01',
    reviewDate: '2024-12-31',
    approvedBy: 'Lê Thị Hương',
    shortTermGoals: [
      'Đạt ISO 45001 Lead Auditor',
      'Dẫn dắt HSE team khi HSE Manager vắng mặt',
      'Hoàn thành incident investigation độc lập',
    ],
    midTermGoals: [
      'Sẵn sàng nhận HSE Manager — readiness: now',
    ],
    activities: [
      { id: 'act-1', type: 'training',  title: 'ISO 45001 Lead Auditor',     targetDate: '2024-06-30', status: 'completed', progress: 100 },
      { id: 'act-2', type: 'rotation',  title: 'Acting HSE Manager 3 tháng', targetDate: '2024-09-30', status: 'completed', progress: 100 },
      { id: 'act-3', type: 'stretch',   title: 'Lead incident investigation', targetDate: '2024-12-31', status: 'completed', progress: 100 },
    ]
  },
  {
    id: 'idp-006',
    employeeId: 'emp-006',
    targetPositionId: 'pos-em',   // đang xem xét leadership track
    status: 'review',
    progress: 30,
    createdDate: '2024-06-01',
    reviewDate: '2025-06-01',
    approvedBy: 'Trần Minh Tuấn',
    shortTermGoals: [
      'Quyết định rõ định hướng: Technical Expert track hay Leadership track',
      'Mentoring 2 junior structural engineers',
    ],
    midTermGoals: [
      'Nếu Technical track: đạt Principal Structural Engineer',
      'Nếu Leadership track: chuẩn bị Engineering Manager trong 3 năm',
    ],
    activities: [
      { id: 'act-1', type: 'mentoring',  title: 'Mentor TVH và PVM',          targetDate: '2025-12-31', status: 'in-progress', progress: 50 },
      { id: 'act-2', type: 'training',   title: 'Leadership Fundamentals',    targetDate: '2025-06-30', status: 'not-started', progress: 0  },
    ]
  },
  {
    id: 'idp-016',
    employeeId: 'emp-016',
    targetPositionId: 'pos-pl',
    status: 'active',
    progress: 70,
    createdDate: '2024-01-01',
    reviewDate: '2025-12-31',
    approvedBy: 'Đỗ Thị Lan',
    shortTermGoals: [
      'Đạt PMI-SP certification (Q3 2025)',
      'Quản lý planning cho 1 dự án mid-size (<$200M) độc lập',
    ],
    midTermGoals: [
      'Sẵn sàng Planning Manager trong 12–18 tháng',
    ],
    activities: [
      { id: 'act-1', type: 'training',  title: 'PMI-SP Certification',             targetDate: '2025-08-31', status: 'in-progress', progress: 55 },
      { id: 'act-2', type: 'project',   title: 'Quản lý planning Sao Vang project', targetDate: '2025-09-30', status: 'in-progress', progress: 70 },
      { id: 'act-3', type: 'mentoring', title: 'Monthly coaching với ĐTL',         targetDate: '2025-12-31', status: 'in-progress', progress: 75 },
    ]
  },
  {
    id: 'idp-009',
    employeeId: 'emp-009',
    targetPositionId: 'pos-lse',
    status: 'active',
    progress: 55,
    createdDate: '2024-03-01',
    reviewDate: '2025-09-01',
    approvedBy: 'Vũ Đình Long',
    shortTermGoals: [
      'Hoàn thành PE License (Q3 2025)',
      'Dẫn dắt sub-team 5 người trong dự án Sao Vang',
      'Hoàn thiện kỹ năng FEED phase design',
    ],
    midTermGoals: [
      'Sẵn sàng Lead Structural Engineer trong 18 tháng',
      'Phát triển 1 junior engineer thành senior',
    ],
    activities: [
      { id: 'act-1', type: 'training',  title: 'PE License preparation', targetDate: '2025-07-31', status: 'in-progress', progress: 50 },
      { id: 'act-2', type: 'stretch',   title: 'Lead sub-team Sao Vang', targetDate: '2025-09-30', status: 'in-progress', progress: 40 },
      { id: 'act-3', type: 'mentoring', title: 'Bi-weekly với VĐL',       targetDate: '2025-12-31', status: 'in-progress', progress: 65 },
    ]
  },
  {
    id: 'idp-011',
    employeeId: 'emp-011',
    targetPositionId: 'pos-lme',
    status: 'active',
    progress: 48,
    createdDate: '2024-06-01',
    reviewDate: '2025-12-01',
    approvedBy: 'Trần Minh Tuấn',
    shortTermGoals: [
      'Đạt API 510 certification (Q4 2025)',
      'Hoàn thiện kinh nghiệm ASME pressure vessel',
      'Dẫn dắt mechanical engineering cho 1 package',
    ],
    midTermGoals: [
      'Sẵn sàng Lead Mechanical Engineer trong 2 năm',
    ],
    activities: [
      { id: 'act-1', type: 'training',  title: 'API 510 Certification',               targetDate: '2025-10-31', status: 'in-progress', progress: 35 },
      { id: 'act-2', type: 'project',   title: 'Lead mechanical package Lac Da Vang', targetDate: '2026-03-31', status: 'not-started', progress: 0  },
      { id: 'act-3', type: 'mentoring', title: 'Monthly coaching với TMT',            targetDate: '2025-12-31', status: 'in-progress', progress: 55 },
    ]
  },
  {
    id: 'idp-013',
    employeeId: 'emp-013',
    targetPositionId: 'pos-pm',
    status: 'active',
    progress: 35,
    createdDate: '2024-06-01',
    reviewDate: '2025-12-01',
    approvedBy: 'Hoàng Văn Bình',
    shortTermGoals: [
      'Hoàn thành CIPS Level 4 (Q2 2026)',
      'Quản lý độc lập 1 vendor package >$5M',
      'Tham gia 3 buổi đàm phán hợp đồng quốc tế',
    ],
    midTermGoals: [
      'Sẵn sàng Procurement Manager trong 3–4 năm',
      'Xây dựng vendor database cho thị trường SEA',
    ],
    activities: [
      { id: 'act-1', type: 'training',  title: 'CIPS Level 4',                   targetDate: '2026-03-31', status: 'not-started', progress: 0  },
      { id: 'act-2', type: 'stretch',   title: 'Quản lý vendor package độc lập', targetDate: '2025-12-31', status: 'in-progress', progress: 30 },
      { id: 'act-3', type: 'shadowing', title: 'Shadow contract negotiation',    targetDate: '2025-09-30', status: 'in-progress', progress: 60 },
    ]
  },
  {
    id: 'idp-015',
    employeeId: 'emp-015',
    targetPositionId: 'pos-cm',
    status: 'active',
    progress: 28,
    createdDate: '2024-09-01',
    reviewDate: '2025-09-01',
    approvedBy: 'Phạm Quốc Hùng',
    shortTermGoals: [
      'Hoàn thiện kỹ năng quản lý team >30 người',
      'Đạt OPITO BOSIET offshore certification',
      'Tham gia Leadership Fundamentals program',
    ],
    midTermGoals: [
      'Sẵn sàng Construction Manager trong 3 năm',
      'Giảm OT team xuống dưới 10h/tuần thông qua planning tốt hơn',
    ],
    activities: [
      { id: 'act-1', type: 'training',  title: 'BOSIET Offshore Certification',     targetDate: '2025-06-30', status: 'in-progress', progress: 70 },
      { id: 'act-2', type: 'training',  title: 'Leadership Fundamentals',           targetDate: '2025-08-31', status: 'not-started', progress: 0  },
      { id: 'act-3', type: 'stretch',   title: 'Quản lý team 35 người tại Block B', targetDate: '2025-12-31', status: 'in-progress', progress: 25 },
    ]
  },
  {
    id: 'idp-017',
    employeeId: 'emp-017',
    targetPositionId: 'pos-lei',
    status: 'active',
    progress: 40,
    createdDate: '2024-03-01',
    reviewDate: '2025-09-01',
    approvedBy: 'Trần Minh Tuấn',
    shortTermGoals: [
      'Đạt CompEx certification (Q3 2025)',
      'Hoàn thành 6 tháng làm việc trên offshore platform',
      'Nắm vững SIL assessment methodology',
    ],
    midTermGoals: [
      'Sẵn sàng Lead E&I Engineer trong 3–4 năm',
    ],
    activities: [
      { id: 'act-1', type: 'training',  title: 'CompEx Certification',            targetDate: '2025-08-31', status: 'in-progress', progress: 45 },
      { id: 'act-2', type: 'rotation',  title: 'Offshore assignment 6 tháng',     targetDate: '2025-12-31', status: 'in-progress', progress: 30 },
      { id: 'act-3', type: 'training',  title: 'SIL Assessment IEC 61508',        targetDate: '2026-03-31', status: 'not-started', progress: 0  },
    ]
  },
  {
    id: 'idp-021',
    employeeId: 'emp-021',
    targetPositionId: 'pos-cm',
    status: 'active',
    progress: 60,
    createdDate: '2023-09-01',
    reviewDate: '2025-09-01',
    approvedBy: 'Phạm Quốc Hùng',
    shortTermGoals: [
      'Quản lý độc lập fabrication yard trong giai đoạn peak (500+ nhân công)',
      'Hoàn thành Welding Inspection Level 2',
      'Xây dựng subcontractor KPI system',
    ],
    midTermGoals: [
      'Sẵn sàng Construction Manager trong 12–18 tháng',
    ],
    activities: [
      { id: 'act-1', type: 'stretch',   title: 'Quản lý peak production Block B', targetDate: '2025-06-30', status: 'in-progress', progress: 65 },
      { id: 'act-2', type: 'training',  title: 'Welding Inspection Level 2',      targetDate: '2025-04-30', status: 'completed',   progress: 100 },
      { id: 'act-3', type: 'project',   title: 'Subcontractor KPI system',        targetDate: '2025-09-30', status: 'in-progress', progress: 40 },
    ]
  },
  {
    id: 'idp-024',
    employeeId: 'emp-024',
    targetPositionId: 'pos-lme',
    status: 'active',
    progress: 50,
    createdDate: '2024-03-01',
    reviewDate: '2025-09-01',
    approvedBy: 'Trần Minh Tuấn',
    shortTermGoals: [
      'Đạt API 510 Pressure Vessel Inspector (Q4 2025)',
      'Hoàn thành ASME Section VIII design project',
      'Dẫn dắt mechanical review cho 1 equipment package',
    ],
    midTermGoals: [
      'Sẵn sàng Lead Mechanical Engineer trong 2 năm',
    ],
    activities: [
      { id: 'act-1', type: 'training',  title: 'API 510 Certification',          targetDate: '2025-10-31', status: 'in-progress', progress: 40 },
      { id: 'act-2', type: 'project',   title: 'ASME Section VIII design',       targetDate: '2025-08-31', status: 'in-progress', progress: 55 },
      { id: 'act-3', type: 'stretch',   title: 'Lead equipment package review',  targetDate: '2025-12-31', status: 'not-started', progress: 0  },
    ]
  },
  {
    id: 'idp-025',
    employeeId: 'emp-025',
    targetPositionId: 'pos-pm',
    status: 'active',
    progress: 38,
    createdDate: '2024-06-01',
    reviewDate: '2025-12-01',
    approvedBy: 'Hoàng Văn Bình',
    shortTermGoals: [
      'Bắt đầu CIPS Level 3 (Q2 2025)',
      'Quản lý procurement package $2M độc lập',
      'Tham gia ít nhất 2 international RFQ process',
    ],
    midTermGoals: [
      'Sẵn sàng Procurement Manager trong 4–5 năm',
      'Hoàn thành CIPS Level 4',
    ],
    activities: [
      { id: 'act-1', type: 'training',  title: 'CIPS Level 3',                     targetDate: '2025-09-30', status: 'in-progress', progress: 35 },
      { id: 'act-2', type: 'stretch',   title: 'Procurement package $2M',          targetDate: '2025-12-31', status: 'in-progress', progress: 30 },
      { id: 'act-3', type: 'shadowing', title: 'Shadow international RFQ process', targetDate: '2025-08-31', status: 'in-progress', progress: 50 },
    ]
  },
]

// ============================================================
// Dashboard KPIs — computed from mock data
// ============================================================
export const dashboardKPI: DashboardKPI = {
  totalTalentChain:       25,
  coreCount:              8,
  potentialCount:         10,
  successorCount:         7,
  keyPositionsTotal:      12,
  keyPositionsCovered:    8,    // 8/12 có ít nhất 1 người readiness "now" hoặc "1-2yr"
  avgReadinessGap:        14,   // tháng trung bình để lấp đầy vị trí then chốt
  highRiskCount:          3,    // emp-006 (high), emp-015 (high), emp-004 (medium→ watch)
  idpActiveCount:         18,
  idpAvgProgress:         54,
}
