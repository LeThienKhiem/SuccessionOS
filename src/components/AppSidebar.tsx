"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Building2,
  ClipboardCheck,
  GitBranch,
  GitMerge,
  LayoutDashboard,
  Store,
  Target,
  Users,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    title: "Quản lý nhân tài",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Nhân tài", href: "/talent", icon: Users },
      { label: "Vị trí then chốt", href: "/positions", icon: Building2 },
      { label: "Bản đồ kế thừa", href: "/succession", icon: GitBranch },
    ],
  },
  {
    title: "Phát triển",
    items: [
      { label: "Kế hoạch IDP", href: "/idp", icon: Target },
      { label: "Đánh giá", href: "/assessment", icon: ClipboardCheck },
      { label: "Kèm cặp & Cố vấn", href: "/mentoring", icon: Users2 },
      { label: "Họp hiệu chỉnh", href: "/calibration", icon: GitMerge },
    ],
  },
  {
    title: "Phân tích",
    items: [{ label: "Báo cáo", href: "/reports", icon: BarChart2 }],
  },
  {
    title: "Hệ thống",
    items: [{ label: "Marketplace", href: "/marketplace", icon: Store }],
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-[240px] bg-white border-r border-[#E5E7EB]">
      <div className="flex h-full flex-col">
        <div className="px-6 py-6">
          <div className="text-lg font-semibold tracking-tight text-[#4F46E5]">
            SuccessionOS
          </div>
          <div className="mt-1 text-[13px] text-[#6B7280]">PTSC M&amp;C</div>
        </div>

        <nav className="px-3">
          <div className="space-y-4">
            {groups.map((g) => (
              <div key={g.title}>
                <div className="px-3 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  {g.title}
                </div>
                <ul className="mt-2 space-y-1">
                  {g.items.map((item) => {
                    const active =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname?.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium text-[#374151] hover:bg-[#F3F4F6]",
                            active && "bg-[#EEF2FF] text-[#4F46E5]"
                          )}
                        >
                          {active ? (
                            <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-[#6366F1]" />
                          ) : null}
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="mt-auto border-t border-[#E5E7EB] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#EEF2FF] text-[#4F46E5] grid place-items-center text-sm font-semibold">
              HA
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold text-[#111827]">
                HR Admin
              </div>
              <div className="truncate text-[13px] text-[#6B7280]">
                PTSC M&amp;C
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

