// ============================================================
// SuccessionOS — Core Types
// ============================================================

export type TalentTier = 'core' | 'potential' | 'successor'
export type Readiness  = 'now' | '1-2yr' | '3-5yr'
export type CareerTrack = 'leadership' | 'technical'
export type RiskLevel  = 'low' | 'medium' | 'high' | 'critical'
export type IDPStatus  = 'active' | 'review' | 'completed' | 'not-started'
export type ProjectType = 'EPCI' | 'EPCM' | 'EPC'
export type PositionLevel = 'director' | 'manager' | 'lead' | 'senior'

// ── Department ───────────────────────────────────────────────
export interface Department {
  id: string
  name: string           // Vietnamese
  nameEn: string         // English
  headId: string         // employee id
  color: string          // tailwind color class e.g. 'blue'
}

// ── Key Position ─────────────────────────────────────────────
export interface Position {
  id: string
  title: string          // e.g. "Project Director"
  titleVi: string        // e.g. "Giám đốc Dự án"
  departmentId: string
  level: PositionLevel
  isKeyPosition: boolean
  currentHolderId: string
  requiredCertifications: string[]
  keySkills: string[]
  replacementDifficulty: 'high' | 'very-high' | 'critical'
  minReadinessRequired: Readiness
}

// ── Employee ─────────────────────────────────────────────────
export interface Employee {
  id: string
  name: string
  initials: string       // e.g. "NVD" for Nguyễn Văn Đức
  email: string
  departmentId: string
  positionId: string
  currentRoleTitle: string  // Chức danh thực tế hiện tại — dùng để hiển thị (khác positionId dùng cho org chart)
  tier: TalentTier
  careerTrack: CareerTrack

  // Personal
  yearsAtCompany: number
  age: number

  // Assessment scores (0–100 each)
  technicalScore: number
  performanceScore: number
  behaviorScore: number
  potentialScore: number
  overallScore: number   // weighted: tech 40% + perf 30% + behav 20% + potential 10%

  // Succession
  readiness: Readiness
  targetPositionId?: string   // vị trí kế thừa mục tiêu
  isKeyKnowledgeHolder: boolean

  // Attrition risk (0–100, higher = more likely to leave)
  riskScore: number
  riskLevel: RiskLevel
  internalRiskFactors: string[] // thông tin nội bộ, luôn hiển thị
  marketRiskFactors: string[]   // thông tin thị trường, chỉ hiển thị khi Market Intelligence active

  // Current project
  currentProjectId?: string
  projectRole?: string

  // Development
  idpStatus: IDPStatus
  idpProgress: number    // 0–100
  trainingHoursLastYear: number
  lastPromotionYear: number

  // Relationships
  mentorId?: string
  menteeIds?: string[]
}

// ── Assessment detail (per employee per cycle) ───────────────
export interface Assessment {
  id: string
  employeeId: string
  cycle: string          // e.g. "2024-Annual"
  assessedBy: string     // manager name
  assessmentDate: string

  technical: number      // 0–100
  performance: number
  behavior: number
  potential: number
  overall: number        // weighted

  strengths: string[]
  gaps: string[]
  managerNotes: string
}

// ── Succession mapping ────────────────────────────────────────
export interface SuccessionEntry {
  positionId: string
  currentHolderId: string
  candidates: SuccessionCandidate[]
}

export interface SuccessionCandidate {
  employeeId: string
  readiness: Readiness
  gapScore: number       // 0–100, lower = closer to ready
  strengths: string[]
  developmentNeeds: string[]
  nominatedDate: string
  nominatedBy: string
}

// ── IDP ──────────────────────────────────────────────────────
export interface IDP {
  id: string
  employeeId: string
  targetPositionId: string
  status: IDPStatus
  progress: number       // 0–100
  createdDate: string
  reviewDate: string
  approvedBy: string

  shortTermGoals: string[]   // 12 months
  midTermGoals: string[]     // 2–3 years

  activities: IDPActivity[]
}

export interface IDPActivity {
  id: string
  type: 'training' | 'project' | 'mentoring' | 'rotation' | 'shadowing' | 'stretch'
  title: string
  targetDate: string
  status: 'not-started' | 'in-progress' | 'completed'
  progress: number       // 0–100
}

// ── Project ──────────────────────────────────────────────────
export interface Project {
  id: string
  name: string
  type: ProjectType
  status: 'planning' | 'active' | 'completed'
  startDate: string
  endDate: string
  contractValue: string  // e.g. "450M USD"
  client: string
  keyPersonnelIds: string[]
}

// ── Dashboard KPIs ────────────────────────────────────────────
export interface DashboardKPI {
  totalTalentChain: number
  coreCount: number
  potentialCount: number
  successorCount: number
  keyPositionsTotal: number
  keyPositionsCovered: number  // has ≥1 successor ready now
  avgReadinessGap: number      // months average to fill all key positions
  highRiskCount: number        // riskLevel = high | critical
  idpActiveCount: number
  idpAvgProgress: number
}
