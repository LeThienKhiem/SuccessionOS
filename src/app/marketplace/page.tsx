"use client";

import * as React from "react";
import {
  Award,
  BarChart2,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  CheckCircle,
  CheckSquare,
  FileCheck,
  GitBranch,
  GitFork,
  GraduationCap,
  LayoutDashboard,
  Map as MapIcon,
  MessageSquare,
  Monitor,
  Network,
  Palette,
  Plug,
  Plus,
  RefreshCw,
  AlertTriangle,
  Rocket,
  ShieldAlert,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModuleContext } from "@/context/ModuleContext";

type ModuleStatus = "active" | "available" | "enterprise";
type ModulePhase = "phase1" | "phase2" | "phase3" | "enterprise";

interface MarketplaceModule {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  group: string;
  status: ModuleStatus;
  phase: ModulePhase;
  price: number | null;
  icon: string;
  highlight?: string;
  comingSoon?: boolean;
}

const baseModules: MarketplaceModule[] = [
  // === ĐANG DÙNG (active) ===
  {
    id: "core-org",
    name: "Org & Vị trí then chốt",
    nameEn: "Org & Key Positions",
    description: "Quản lý cơ cấu tổ chức và danh sách vị trí then chốt",
    group: "Core Platform",
    status: "active",
    phase: "phase1",
    price: 0,
    icon: "Building2",
    highlight: "Bắt buộc — không thể tắt",
  },
  {
    id: "core-talent",
    name: "Hồ sơ & Tầng nhân tài",
    nameEn: "Talent Profiles & Tiers",
    description: "Quản lý hồ sơ và phân tầng 25 nhân sự trong Chuỗi",
    group: "Core Platform",
    status: "active",
    phase: "phase1",
    price: 0,
    icon: "Users",
    highlight: "Bắt buộc — không thể tắt",
  },
  {
    id: "core-succession",
    name: "Bản đồ Kế thừa (9-Box)",
    nameEn: "Succession Mapping",
    description: "Xác định và theo dõi ứng viên kế thừa cho từng vị trí",
    group: "Core Platform",
    status: "active",
    phase: "phase1",
    price: 0,
    icon: "GitBranch",
    highlight: "Bắt buộc — không thể tắt",
  },
  {
    id: "core-assessment",
    name: "Assessment Engine",
    nameEn: "Assessment Engine",
    description: "Đánh giá 4 chiều với trọng số cấu hình được",
    group: "Core Platform",
    status: "active",
    phase: "phase1",
    price: 0,
    icon: "BarChart3",
    highlight: "Bắt buộc — không thể tắt",
  },
  {
    id: "addon-idp",
    name: "IDP Builder",
    nameEn: "Individual Development Plan",
    description: "Xây dựng và theo dõi kế hoạch phát triển cá nhân",
    group: "Phát triển nhân sự",
    status: "active",
    phase: "phase1",
    price: 49,
    icon: "Target",
    highlight: "Đang sử dụng",
  },
  {
    id: "addon-dashboard",
    name: "Dashboard & KPI",
    nameEn: "Dashboard & KPI",
    description: "Tổng quan hệ thống với các chỉ số then chốt",
    group: "Phân tích & Báo cáo",
    status: "active",
    phase: "phase1",
    price: 29,
    icon: "LayoutDashboard",
    highlight: "Đang sử dụng",
  },
  {
    id: "addon-workflow",
    name: "Quy trình & Phê duyệt",
    nameEn: "Approval Workflow",
    description: "Workflow đề cử và phê duyệt tối đa 8 cấp",
    group: "Vận hành",
    status: "active",
    phase: "phase1",
    price: 39,
    icon: "CheckSquare",
    highlight: "Đang sử dụng",
  },

  // === CÓ THỂ THÊM (available) ===
  {
    id: "addon-360",
    name: "Phản hồi 360°",
    nameEn: "360° Feedback",
    description: "Thu thập phản hồi từ cấp trên, đồng nghiệp và cấp dưới",
    group: "Đánh giá nâng cao",
    status: "available",
    phase: "phase2",
    price: 59,
    icon: "RefreshCw",
    highlight: "Giảm bias trong đánh giá",
    comingSoon: true,
  },
  {
    id: "addon-competency",
    name: "Khung năng lực",
    nameEn: "Competency Framework",
    description: "Từ điển năng lực và tiêu chuẩn hành vi theo chức danh",
    group: "Đánh giá nâng cao",
    status: "available",
    phase: "phase2",
    price: 49,
    icon: "BookOpen",
    highlight: "Nền tảng cho mọi quyết định nhân sự",
    comingSoon: true,
  },
  {
    id: "addon-skillgap",
    name: "Skill Gap Heatmap",
    nameEn: "Skill Gap Heatmap",
    description: "Bản đồ nhiệt Đỏ–Vàng–Xanh về khoảng cách kỹ năng",
    group: "Đánh giá nâng cao",
    status: "available",
    phase: "phase2",
    price: 39,
    icon: "Map",
    highlight: "Nhìn ra gap kỹ năng toàn tổ chức",
    comingSoon: true,
  },
  {
    id: "addon-lms",
    name: "LMS — Quản lý đào tạo",
    nameEn: "Learning Management System",
    description: "Tổ chức khóa học, theo dõi tiến độ và đánh giá hiệu quả",
    group: "Học tập & Đào tạo",
    status: "available",
    phase: "phase2",
    price: 79,
    icon: "GraduationCap",
    highlight: "Gap analysis tự động theo chức danh",
    comingSoon: true,
  },
  {
    id: "addon-elearning",
    name: "E-Learning",
    nameEn: "E-Learning Platform",
    description: "Học trực tuyến với SCORM, H5P và MS Teams Live Class",
    group: "Học tập & Đào tạo",
    status: "available",
    phase: "phase2",
    price: 69,
    icon: "Monitor",
    highlight: "Hỗ trợ SCORM, H5P, video",
    comingSoon: true,
  },
  {
    id: "addon-exam",
    name: "Exam Engine",
    nameEn: "Secure Exam Engine",
    description: "Thi trực tuyến với chống gian lận camera ngẫu nhiên",
    group: "Học tập & Đào tạo",
    status: "available",
    phase: "phase2",
    price: 49,
    icon: "FileCheck",
    highlight: "Anti-cheat + auto-submit khi đổi tab",
    comingSoon: true,
  },
  {
    id: "addon-gamification",
    name: "Gamification",
    nameEn: "Gamification & Badges",
    description: "Huy hiệu, bảng xếp hạng và điểm tích lũy cho học viên",
    group: "Học tập & Đào tạo",
    status: "available",
    phase: "phase2",
    price: 29,
    icon: "Award",
    highlight: "Tăng tỷ lệ hoàn thành khóa học",
    comingSoon: true,
  },
  {
    id: "addon-knowledge",
    name: "Chuyển giao Tri thức",
    nameEn: "Knowledge Transfer",
    description: "Quản lý Key Knowledge Holder và kế hoạch chuyển giao",
    group: "Phát triển nhân sự",
    status: "active",
    phase: "phase2",
    price: 49,
    icon: "Brain",
    highlight: "Quản lý chuyển giao tri thức giữa Holder và Successor",
    comingSoon: false,
  },
  {
    id: "addon-dualtrack",
    name: "Lộ trình Đa tuyến",
    nameEn: "Dual Career Path",
    description: "Leadership Track và Technical Expert Track song song",
    group: "Phát triển nhân sự",
    status: "available",
    phase: "phase2",
    price: 39,
    icon: "GitFork",
    highlight: "Giữ chân chuyên gia không muốn làm sếp",
    comingSoon: true,
  },
  {
    id: "addon-compensation",
    name: "Đãi ngộ & Ràng buộc",
    nameEn: "Talent Compensation",
    description: "Phụ cấp Chuỗi và quản lý hợp đồng đào tạo nghề",
    group: "Phát triển nhân sự",
    status: "available",
    phase: "phase2",
    price: 59,
    icon: "Wallet",
    highlight: "Tách biệt phụ cấp talent khỏi lương HĐLĐ",
    comingSoon: true,
  },
  {
    id: "addon-roi",
    name: "ROI Reporting (5 cấp)",
    nameEn: "Training ROI Reports",
    description: "Đo hiệu quả đào tạo từ phản ứng đến tỷ suất hoàn vốn",
    group: "Phân tích & Báo cáo",
    status: "available",
    phase: "phase3",
    price: 69,
    icon: "TrendingUp",
    highlight: "Chứng minh ROI của đầu tư vào con người",
    comingSoon: true,
  },
  {
    id: "addon-ai-path",
    name: "AI Career Path",
    nameEn: "AI Career Path Proposal",
    description: "Đề xuất lộ trình phát triển cá nhân hóa bằng AI",
    group: "AI Intelligence",
    status: "available",
    phase: "phase3",
    price: 99,
    icon: "Sparkles",
    highlight: "IDP draft tự động trong 30 giây",
    comingSoon: false,
  },
  {
    id: "addon-ai-risk",
    name: "AI Attrition Risk",
    nameEn: "Attrition Risk Prediction",
    description: "Dự đoán nguy cơ nghỉ việc trước 3–6 tháng",
    group: "AI Intelligence",
    status: "available",
    phase: "phase3",
    price: 89,
    icon: "ShieldAlert",
    highlight: "Cảnh báo sớm trước khi mất người quan trọng",
    comingSoon: true,
  },
  {
    id: "addon-ai-query",
    name: "AI Natural Language Query",
    nameEn: "NL Query",
    description: "Hỏi dữ liệu nhân sự bằng tiếng Việt, nhận kết quả ngay",
    group: "AI Intelligence",
    status: "available",
    phase: "phase3",
    price: 79,
    icon: "MessageSquare",
    highlight: '"Ai sẵn sàng thay thế ngay VĐL?" → trả lời tức thì',
    comingSoon: true,
  },

  // === ENTERPRISE ===
  {
    id: "enterprise-hris",
    name: "HRIS Connector",
    nameEn: "HRIS Integration",
    description: "Đồng bộ dữ liệu với VnResource, SAP, Workday",
    group: "Enterprise",
    status: "enterprise",
    phase: "enterprise",
    price: null,
    icon: "Plug",
    highlight: "Tự động sync dữ liệu nhân sự mỗi ngày",
  },
  {
    id: "enterprise-whitelabel",
    name: "White-label",
    nameEn: "White-label Platform",
    description: "Tùy chỉnh logo, màu sắc và domain theo thương hiệu",
    group: "Enterprise",
    status: "enterprise",
    phase: "enterprise",
    price: null,
    icon: "Palette",
    highlight: "Deploy riêng với thương hiệu của bạn",
  },
  {
    id: "enterprise-multitenant",
    name: "Multi-company Admin",
    nameEn: "Multi-tenant Management",
    description: "Quản lý nhiều công ty trên cùng nền tảng",
    group: "Enterprise",
    status: "enterprise",
    phase: "enterprise",
    price: null,
    icon: "Network",
    highlight: "Dành cho tập đoàn và đối tác triển khai",
  },
];

const groupOrder = [
  "Core Platform",
  "Phát triển nhân sự",
  "Đánh giá nâng cao",
  "Học tập & Đào tạo",
  "Phân tích & Báo cáo",
  "AI Intelligence",
  "Enterprise",
] as const;

type Filter = "all" | "active" | "available" | "enterprise";

const iconMap = {
  Award,
  BarChart2,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  CheckSquare,
  FileCheck,
  GitBranch,
  GitFork,
  GraduationCap,
  LayoutDashboard,
  Map: MapIcon,
  MessageSquare,
  Monitor,
  Network,
  Palette,
  Plug,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  Users,
  Wallet,
} as const;

function phaseBadge(phase: MarketplaceModule["phase"]) {
  if (phase === "phase2") return { text: "Phase 2", cls: "bg-[#EFF6FF] text-[#1D4ED8]" };
  if (phase === "phase3") return { text: "Phase 3", cls: "bg-[#FEF9C3] text-[#854D0E]" };
  return { text: "Enterprise", cls: "bg-[#F3F4F6] text-[#374151]" };
}

function statusPill(m: MarketplaceModule) {
  if (m.status === "active") {
    return { text: "● Đang dùng", cls: "bg-[#DCFCE7] text-[#15803D]" };
  }
  if (m.status === "enterprise") {
    return { text: "Enterprise", cls: "bg-[#F3F4F6] text-[#374151]" };
  }
  const p = phaseBadge(m.phase);
  return { text: p.text, cls: `${p.cls}` };
}

function borderTone(m: MarketplaceModule) {
  if (m.status === "active") return "border-[#BBF7D0]";
  return "border-[#E5E7EB]";
}

function iconTone(m: MarketplaceModule) {
  if (m.status === "active") return { bg: "#EEF2FF", color: "#4F46E5" };
  if (m.status === "enterprise") return { bg: "#FEF3C7", color: "#B45309" };
  return { bg: "#F3F4F6", color: "#6B7280" };
}

/** Chỉ hiển thị cho Core (0đ) hoặc Enterprise (liên hệ). Module trả phí: ẩn giá trên UI demo. */
function priceBlock(m: MarketplaceModule): { main: string; sub: string; mainCls: string } | null {
  if (m.price === 0) return { main: "Miễn phí", sub: "Bắt buộc", mainCls: "text-[#15803D]" };
  if (m.price === null) return { main: "Liên hệ", sub: "", mainCls: "text-[#B45309]" };
  return null;
}

function overlayModal(props: {
  open: boolean;
  title: string;
  icon: React.ReactNode;
  body: React.ReactNode;
  confirmText: string;
  confirmTone?: "primary" | "danger";
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!props.open) return null;

  const confirmCls =
    props.confirmTone === "danger"
      ? "bg-[#DC2626] text-white hover:bg-[#B91C1C]"
      : "bg-[#4F46E5] text-white hover:bg-[#4338CA]";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/30"
        onClick={props.onClose}
      />
      <div className="relative mx-auto mt-24 w-[calc(100%-32px)] max-w-lg">
        <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          <div className="px-5 pt-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{props.icon}</div>
              <div className="min-w-0">
                <div className="text-[16px] font-semibold text-[#111827]">{props.title}</div>
              </div>
            </div>
            <div className="mt-4 text-[14px] leading-6 text-[#374151]">{props.body}</div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
            <Button variant="outline" className="h-9 rounded-lg px-4" onClick={props.onClose}>
              Hủy
            </Button>
            <button
              type="button"
              className={`h-9 rounded-lg px-4 text-[14px] font-semibold ${confirmCls}`}
              onClick={props.onConfirm}
            >
              {props.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { isActive, toggleModule } = useModuleContext();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [modal, setModal] = React.useState<null | "activate" | "remove">(null);
  const [toast, setToast] = React.useState<null | { text: string }>(null);
  const [selectedAddon, setSelectedAddon] = React.useState<null | "market-intel" | "ai-path">(null);

  const showToast = React.useCallback((text: string) => {
    setToast({ text });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const modules = React.useMemo<MarketplaceModule[]>(() => {
    const marketIntel: MarketplaceModule = {
      id: "addon-market-intel",
      name: "Market Intelligence",
      nameEn: "Market Intelligence",
      description:
        "Salary benchmark, market demand và engagement score tích hợp vào hồ sơ nhân viên — nguồn: Talentnet, LinkedIn, Pulse Survey",
      group: "Phân tích & Báo cáo",
      status: isActive("marketIntelligence") ? "active" : "available",
      phase: "phase2",
      price: 20,
      icon: "BarChart2",
      highlight: "Biết ai đang bị headhunt trước khi họ nghỉ",
      comingSoon: false,
    };

    const out: MarketplaceModule[] = [];
    for (const m of baseModules) {
      if (m.id === "addon-ai-path") {
        out.push({
          ...m,
          status: isActive("aiCareerPath") ? "active" : "available",
          price: 99,
          comingSoon: false,
        });
        continue;
      }
      if (m.id === "addon-dashboard") out.push(marketIntel);
      out.push(m);
    }
    return out;
  }, [isActive]);

  const filtered = React.useMemo(() => {
    if (filter === "all") return modules;
    return modules.filter((m) => m.status === filter);
  }, [filter]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, MarketplaceModule[]>();
    for (const m of filtered) {
      const arr = map.get(m.group);
      if (arr) arr.push(m);
      else map.set(m.group, [m]);
    }
    return map;
  }, [filtered]);

  const counts = React.useMemo(() => {
    const active = modules.filter((m) => m.status === "active").length;
    const available = modules.filter((m) => m.status === "available").length;
    const enterprise = modules.filter((m) => m.status === "enterprise").length;
    const total = modules.length;
    return { active, available, enterprise, total };
  }, [modules]);

  const pillClass = (active: boolean) =>
    active
      ? "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]"
      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]";

  return (
    <div className="w-full space-y-6">
      {/* PAGE HEADER */}
      <div className="space-y-2">
        <p className="text-[13px] text-[#6B7280]">Marketplace</p>
        <h1 className="text-[24px] font-semibold text-[#111827]">Module Marketplace</h1>
        <p className="text-[14px] text-[#6B7280]">
          Mở rộng hệ thống với các tính năng bổ sung theo nhu cầu thực tế
        </p>
        <hr className="border-[#E5E7EB]" />
      </div>

      {/* SUMMARY BAR */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="so-card rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[16px] font-semibold text-[#374151]">Đang sử dụng</div>
              <div className="mt-2 text-[32px] font-bold text-[#111827]">{counts.active}</div>
              <div className="mt-2 text-[13px] text-[#6B7280]">modules đã kích hoạt</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#F0FDF4] grid place-items-center">
              <CheckCircle className="h-5 w-5 text-[#22C55E]" />
            </div>
          </div>
        </div>
        <div className="so-card rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[16px] font-semibold text-[#374151]">Có thể thêm</div>
              <div className="mt-2 text-[32px] font-bold text-[#111827]">{counts.available}</div>
              <div className="mt-2 text-[13px] text-[#6B7280]">modules sẵn sàng nâng cấp</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#F0FDFA] grid place-items-center">
              <Plus className="h-5 w-5 text-[#14B8A6]" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(filter === "all")}`}
        >
          Tất cả{" "}
          <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">
            {counts.total}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFilter("active")}
          className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(filter === "active")}`}
        >
          Đang dùng{" "}
          <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">
            {counts.active}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFilter("available")}
          className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(filter === "available")}`}
        >
          Có thể thêm{" "}
          <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">
            {counts.available}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFilter("enterprise")}
          className={`rounded-lg border px-3 py-2 text-[14px] font-medium ${pillClass(filter === "enterprise")}`}
        >
          Enterprise{" "}
          <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[12px] font-semibold">
            {counts.enterprise}
          </span>
        </button>
      </div>

      {/* MODULE GROUPS */}
      <div className="space-y-6">
        {groupOrder.map((group) => {
          const list = grouped.get(group) ?? [];
          if (list.length === 0) return null;

          return (
            <div key={group} className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-semibold text-[#374151]">{group}</div>
                  <span className="rounded-full bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
                    {list.length}
                  </span>
                </div>
                <div className="h-px flex-1 bg-[#E5E7EB]" />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {list.map((m) => {
                  const Icon = iconMap[m.icon as keyof typeof iconMap] ?? Store;
                  const pill = statusPill(m);
                  const tone = iconTone(m);
                  const price = priceBlock(m);

                  const action = (() => {
                    if (m.id === "addon-market-intel") {
                      if (isActive("marketIntelligence")) {
                        return {
                          text: "Gỡ bỏ module",
                          variant: "outline" as const,
                          disabled: false,
                          title: "",
                          cls: "text-[#DC2626] border-[#FECACA]",
                          onClick: () => {
                            setSelectedAddon("market-intel");
                            setModal("remove");
                          },
                        };
                      }
                      return {
                        text: "Thêm vào gói",
                        variant: "default" as const,
                        disabled: false,
                        title: "",
                        cls: "bg-[#4F46E5] text-white",
                        onClick: () => {
                          setSelectedAddon("market-intel");
                          setModal("activate");
                        },
                      };
                    }
                    if (m.id === "addon-ai-path") {
                      if (isActive("aiCareerPath")) {
                        return {
                          text: "Gỡ bỏ module",
                          variant: "outline" as const,
                          disabled: false,
                          title: "",
                          cls: "text-[#DC2626] border-[#FECACA]",
                          onClick: () => {
                            setSelectedAddon("ai-path");
                            setModal("remove");
                          },
                        };
                      }
                      return {
                        text: "Thêm vào gói",
                        variant: "default" as const,
                        disabled: false,
                        title: "",
                        cls: "bg-[#4F46E5] text-white",
                        onClick: () => {
                          setSelectedAddon("ai-path");
                          setModal("activate");
                        },
                      };
                    }
                    if (m.status === "active" && m.price === 0) {
                      return { text: "Bắt buộc", variant: "outline" as const, disabled: true, title: "" };
                    }
                    if (m.status === "active") {
                      return {
                        text: "Gỡ bỏ",
                        variant: "outline" as const,
                        disabled: true,
                        title: "Liên hệ admin để thay đổi",
                        cls: "text-[#DC2626]",
                      };
                    }
                    if (m.status === "available" && m.comingSoon) {
                      return {
                        text: "Thêm vào gói",
                        variant: "default" as const,
                        disabled: true,
                        title: `Sắp ra mắt — ${m.phase === "phase2" ? "Phase 2" : "Phase 3"}\nLiên hệ để đăng ký trước`,
                        cls: "bg-[#4F46E5] text-white opacity-90",
                      };
                    }
                    if (m.status === "enterprise") {
                      return {
                        text: "Liên hệ tư vấn",
                        variant: "outline" as const,
                        disabled: true,
                        title: "",
                        cls: "border-[#F59E0B] text-[#B45309]",
                      };
                    }
                    return {
                      text: "Thêm vào gói",
                      variant: "default" as const,
                      disabled: true,
                      title: "Sắp ra mắt",
                      cls: "bg-[#4F46E5] text-white opacity-90",
                    };
                  })();

                  return (
                    <div
                      key={m.id}
                      className={`rounded-xl border bg-white ${borderTone(m)}`}
                    >
                      {/* STATUS INDICATOR */}
                      <div className="flex items-center justify-end p-3 pb-0">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${pill.cls}`}>
                          {pill.text}
                        </span>
                      </div>

                      {/* CARD HEADER */}
                      <div className="px-4 pt-1">
                        <div className="flex items-start gap-3">
                          <div
                            className="h-11 w-11 rounded-xl grid place-items-center"
                            style={{ background: tone.bg }}
                          >
                            <Icon className="h-6 w-6" style={{ color: tone.color }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[15px] font-semibold text-[#111827]">
                              {m.name}
                            </div>
                            <div className="mt-1 text-[12px] text-[#9CA3AF]">
                              {m.nameEn}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD BODY */}
                      <div className="px-4 pb-4">
                        <div className="mt-2 text-[13px] leading-6 text-[#6B7280]">
                          {m.description}
                        </div>
                        {m.highlight ? (
                          <div className="mt-2 flex items-start gap-2">
                            <Zap className="h-3 w-3 text-[#F59E0B] mt-1" />
                            <div className="text-[12px] italic text-[#B45309]">
                              {m.highlight}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* CARD FOOTER */}
                      <div className="border-t border-dashed border-[#E5E7EB] px-4 py-3">
                        <div
                          className={`flex items-center gap-4 ${price ? "justify-between" : "justify-end"}`}
                        >
                          {price ? (
                            <div>
                              {m.price === 0 ? (
                                <>
                                  <div className={`text-[14px] font-semibold ${price.mainCls}`}>{price.main}</div>
                                  <div className="text-[11px] text-[#6B7280]">Bắt buộc</div>
                                </>
                              ) : (
                                <div className={`text-[14px] font-semibold ${price.mainCls}`}>{price.main}</div>
                              )}
                            </div>
                          ) : null}

                          <Button
                            variant={action.variant}
                            disabled={action.disabled}
                            className={`h-8 rounded-lg px-3 ${action.cls ?? ""}`}
                            title={action.title}
                            onClick={(action as any).onClick}
                          >
                            {action.text}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {overlayModal({
        open: modal === "activate" && selectedAddon === "market-intel",
        title: "Kích hoạt Market Intelligence?",
        icon: (
          <div className="h-10 w-10 rounded-xl bg-[#EEF2FF] grid place-items-center">
            <BarChart2 className="h-5 w-5 text-[#4F46E5]" />
          </div>
        ),
        body: (
          <div className="space-y-3">
            <div className="text-[14px] text-[#374151]">
              Module này sẽ hiển thị thêm trong hồ sơ mỗi nhân viên:
            </div>
            <ul className="space-y-2 text-[14px]">
              {[
                "Salary benchmark so thị trường (Talentnet)",
                "Mức độ demand của role trên thị trường",
                "Lịch sử tiếp cận từ headhunter",
                "Engagement score từ Pulse Survey",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-[#22C55E]" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[13px] text-[#6B7280]">
              Hủy bất kỳ lúc nào
            </div>
          </div>
        ),
        confirmText: "Kích hoạt ngay",
        confirmTone: "primary",
        onClose: () => {
          setModal(null);
          setSelectedAddon(null);
        },
        onConfirm: () => {
          toggleModule("marketIntelligence");
          setModal(null);
          setSelectedAddon(null);
          showToast("✓ Market Intelligence đã được kích hoạt");
        },
      })}

      {overlayModal({
        open: modal === "remove" && selectedAddon === "market-intel",
        title: "Gỡ bỏ Market Intelligence?",
        icon: (
          <div className="h-10 w-10 rounded-xl bg-[#FFFBEB] grid place-items-center">
            <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
          </div>
        ),
        body: (
          <div className="text-[14px] text-[#374151]">
            Sau khi gỡ, thông tin market intelligence sẽ không còn hiển thị trong hồ sơ nhân viên. Dữ liệu vẫn được lưu trữ.
          </div>
        ),
        confirmText: "Xác nhận gỡ bỏ",
        confirmTone: "danger",
        onClose: () => {
          setModal(null);
          setSelectedAddon(null);
        },
        onConfirm: () => {
          toggleModule("marketIntelligence");
          setModal(null);
          setSelectedAddon(null);
          showToast("Module đã được gỡ bỏ");
        },
      })}

      {overlayModal({
        open: modal === "activate" && selectedAddon === "ai-path",
        title: "Kích hoạt AI Career Path?",
        icon: (
          <div className="h-10 w-10 rounded-xl bg-[#EEF2FF] grid place-items-center">
            <Sparkles className="h-5 w-5 text-[#4F46E5]" />
          </div>
        ),
        body: (
          <div className="space-y-3">
            <ul className="space-y-2 text-[14px]">
              {[
                "Lộ trình phát triển cá nhân hóa bằng AI",
                "Phân tích kỹ năng cần rèn luyện + mức độ ưu tiên",
                "Gợi ý chuyên gia nội bộ có thể mentoring",
                "Khóa học bên ngoài fill skill gap kèm giá + rating",
                "Milestones và timeline cụ thể",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-[#22C55E]" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[13px] text-[#6B7280]">
              Hủy bất kỳ lúc nào
            </div>
          </div>
        ),
        confirmText: "Kích hoạt ngay",
        confirmTone: "primary",
        onClose: () => {
          setModal(null);
          setSelectedAddon(null);
        },
        onConfirm: () => {
          toggleModule("aiCareerPath");
          setModal(null);
          setSelectedAddon(null);
          showToast("✓ AI Career Path đã được kích hoạt");
        },
      })}

      {overlayModal({
        open: modal === "remove" && selectedAddon === "ai-path",
        title: "Gỡ bỏ AI Career Path?",
        icon: (
          <div className="h-10 w-10 rounded-xl bg-[#FFFBEB] grid place-items-center">
            <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
          </div>
        ),
        body: (
          <div className="text-[14px] text-[#374151]">
            Sau khi gỡ, tab “Lộ trình AI” sẽ biến mất hoàn toàn khỏi hồ sơ nhân viên. Dữ liệu phân tích vẫn được lưu trữ.
          </div>
        ),
        confirmText: "Xác nhận gỡ bỏ",
        confirmTone: "danger",
        onClose: () => {
          setModal(null);
          setSelectedAddon(null);
        },
        onConfirm: () => {
          toggleModule("aiCareerPath");
          setModal(null);
          setSelectedAddon(null);
          showToast("Module đã được gỡ bỏ");
        },
      })}

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-[#111827] px-5 py-3 text-[14px] text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
          {toast.text}
        </div>
      ) : null}

      {/* BANNER CUỐI TRANG */}
      <div
        className="rounded-xl border border-[#E5E7EB] p-6 sm:p-8"
        style={{
          background: "linear-gradient(90deg, #EEF2FF 0%, #F0FDF4 100%)",
        }}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[70%,30%]">
          <div>
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6 text-[#4F46E5]" />
              <div className="text-[18px] font-bold text-[#111827]">
                Cần tư vấn gói phù hợp?
              </div>
            </div>
            <div className="mt-2 text-[14px] leading-6 text-[#374151]">
              Đội ngũ SuccessionOS sẽ giúp bạn chọn đúng các module theo quy mô và ngành nghề. Không mất phí tư vấn.
            </div>
            <button
              type="button"
              disabled
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#4F46E5] px-6 py-2.5 text-[14px] font-semibold text-white opacity-80"
              title="Prototype"
            >
              Đặt lịch tư vấn miễn phí →
            </button>
          </div>
          <div className="text-right space-y-2 text-[14px] text-[#374151]">
            <div>✓ 30+ modules sẵn sàng</div>
            <div>✓ Triển khai trong 1 ngày</div>
            <div>✓ Hủy bất kỳ lúc nào</div>
          </div>
        </div>
      </div>
    </div>
  );
}

