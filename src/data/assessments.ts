import type { Assessment } from './types'
import { employees } from './employees'

// ============================================================
// Assessments — chu kỳ 2024-Annual
// Trọng số PTSC M&C: technical 40% · performance 30% · behavior 20% · potential 10%
// ============================================================
export const assessments: Assessment[] = employees.map(emp => ({
  id:             `asmnt-${emp.id}-2024`,
  employeeId:     emp.id,
  cycle:          '2024-Annual',
  assessedBy:     getManagerName(emp.departmentId),
  assessmentDate: '2024-12-15',
  technical:      emp.technicalScore,
  performance:    emp.performanceScore,
  behavior:       emp.behaviorScore,
  potential:      emp.potentialScore,
  overall:        emp.overallScore,
  strengths:      getStrengths(emp.id),
  gaps:           emp.internalRiskFactors,
  managerNotes:   getManagerNotes(emp.id),
}))

function getManagerName(deptId: string): string {
  const map: Record<string, string> = {
    'dept-pm':   'Nguyễn Văn Đức',
    'dept-eng':  'Trần Minh Tuấn',
    'dept-hse':  'Lê Thị Hương',
    'dept-con':  'Phạm Quốc Hùng',
    'dept-fin':  'Nguyễn Thị Mai',
    'dept-pro':  'Hoàng Văn Bình',
    'dept-plan': 'Đỗ Thị Lan',
    'dept-bd':   'Ban PTNT',
  }
  return map[deptId] ?? 'Ban PTNT'
}

function getStrengths(id: string): string[] {
  const map: Record<string, string[]> = {
    'emp-001': ['Lãnh đạo dự án EPCI xuất sắc', 'Quan hệ khách hàng chiến lược', 'Quản trị rủi ro dày dặn'],
    'emp-002': ['Năng lực kỹ thuật multi-discipline hàng đầu', 'Xây dựng đội ngũ hiệu quả', 'Tiêu chuẩn chất lượng cao'],
    'emp-003': ['Zero incident record 5 năm liên tiếp', 'Hệ thống HSE được client đánh giá cao', 'Đào tạo đội ngũ xuất sắc'],
    'emp-004': ['Kinh nghiệm thi công offshore sâu', 'Quản lý subcontractor hiệu quả', 'Xử lý tình huống khủng hoảng tốt'],
    'emp-005': ['Kiểm soát chi phí dự án chính xác', 'Báo cáo tài chính minh bạch', 'Compliance tốt'],
    'emp-006': ['FEA analysis ở đẳng cấp quốc tế', 'Đầu ra thiết kế không có lỗi major', 'Mentor hiệu quả'],
    'emp-007': ['Vendor network rộng', 'Đàm phán giá tốt', 'Quy trình mua sắm chuẩn hóa cao'],
    'emp-008': ['Primavera P6 master', 'EVM giỏi', 'Báo cáo tiến độ rõ ràng cho management'],
    'emp-019': ['Hiểu sâu toàn bộ lifecycle EPCI', 'Client trust cao', 'Sẵn sàng nhận Project Director'],
    'emp-020': ['Kỹ thuật xuất sắc + leadership đang phát triển tốt', 'Được đội ngũ engineering tôn trọng'],
    'emp-023': ['HSE Management System class-A', 'Zero incident trong nhiệm kỳ', 'Sẵn sàng nhận HSE Manager'],
    'emp-016': ['Primavera P6 thành thục', 'IDP tiến độ tốt nhất nhóm', 'Tư duy hệ thống tốt'],
  }
  return map[id] ?? ['Hoàn thành tốt nhiệm vụ được giao', 'Tinh thần học hỏi tốt', 'Làm việc nhóm hiệu quả']
}

function getManagerNotes(id: string): string {
  const map: Record<string, string> = {
    'emp-001': 'Nhân sự then chốt không thể thiếu cho dự án Block B. Cần kế hoạch chuyển giao tri thức chi tiết trong 12 tháng tới.',
    'emp-002': 'Rủi ro nghỉ việc ở mức cần theo dõi. Đề xuất xem xét điều chỉnh lương và lộ trình thăng tiến rõ hơn trong Q1 2025.',
    'emp-003': 'Nhân sự xuất sắc, đã chuẩn bị kế thừa tốt (NTP). Có thể cân nhắc vai trò mở rộng tại cấp tập đoàn.',
    'emp-006': 'Cần quyết định nhanh về career track. Rủi ro mất người cao nếu không có lộ trình rõ. Principal Engineer là con đường phù hợp nhất.',
    'emp-019': 'Sẵn sàng nhận Project Director. Chỉ cần thêm 1 lần đàm phán contract độc lập để hoàn thiện.',
    'emp-023': 'Đã hoàn thành IDP 100%. Đề xuất bổ nhiệm Deputy HSE Manager chính thức và xếp vào danh sách kế thừa tier 1.',
  }
  return map[id] ?? 'Nhân viên đang phát triển tốt theo kế hoạch. Tiếp tục theo dõi trong chu kỳ tiếp theo.'
}

// ============================================================
// Utility helpers — dùng trong components
// ============================================================

/** Tính 9-Box quadrant từ performance và potential score */
export function getNineBoxQuadrant(performance: number, potential: number): {
  row: 1 | 2 | 3,    // 3=top, 1=bottom
  col: 1 | 2 | 3,    // 1=left, 3=right
  label: string,
  color: string,
} {
  const p = performance >= 87 ? 3 : performance >= 77 ? 2 : 1
  const q = potential  >= 83 ? 3 : potential  >= 72 ? 2 : 1

  const labels: Record<string, string> = {
    '3-3': 'Star',          '2-3': 'Future Star',   '1-3': 'Enigma',
    '3-2': 'High Performer','2-2': 'Core Player',   '1-2': 'Inconsistent',
    '3-1': 'Expert',        '2-1': 'Reliable',      '1-1': 'Under Performer',
  }
  const colors: Record<string, string> = {
    '3-3': 'bg-purple-100 border-purple-400',
    '2-3': 'bg-purple-50 border-purple-300',
    '1-3': 'bg-blue-50 border-blue-300',
    '3-2': 'bg-green-100 border-green-400',
    '2-2': 'bg-green-50 border-green-300',
    '1-2': 'bg-yellow-50 border-yellow-300',
    '3-1': 'bg-teal-50 border-teal-300',
    '2-1': 'bg-gray-50 border-gray-300',
    '1-1': 'bg-red-50 border-red-300',
  }

  const key = `${p}-${q}`
  return { row: p as 1|2|3, col: q as 1|2|3, label: labels[key], color: colors[key] }
}

/** Màu badge theo tier */
export function getTierColor(tier: string): string {
  return {
    core:      'bg-purple-100 text-purple-800 border-purple-300',
    potential: 'bg-blue-100 text-blue-800 border-blue-300',
    successor: 'bg-teal-100 text-teal-800 border-teal-300',
  }[tier] ?? 'bg-gray-100 text-gray-800'
}

/** Label tiếng Việt theo tier */
export function getTierLabel(tier: string): string {
  return { core: 'Nòng cốt', potential: 'Tiềm năng', successor: 'Kế thừa' }[tier] ?? tier
}

/** Màu badge readiness */
export function getReadinessColor(readiness: string): string {
  return {
    'now':   'bg-green-100 text-green-800',
    '1-2yr': 'bg-yellow-100 text-yellow-800',
    '3-5yr': 'bg-orange-100 text-orange-800',
  }[readiness] ?? 'bg-gray-100 text-gray-600'
}

/** Màu risk level */
export function getRiskColor(level: string): string {
  return {
    low:      'text-green-600',
    medium:   'text-yellow-600',
    high:     'text-orange-600',
    critical: 'text-red-600',
  }[level] ?? 'text-gray-500'
}

/** Score → màu bar */
export function getScoreColor(score: number): string {
  if (score >= 85) return 'bg-green-500'
  if (score >= 70) return 'bg-blue-500'
  if (score >= 55) return 'bg-yellow-500'
  return 'bg-red-400'
}
