import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "#6366F1",
  className,
  children,
}: {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("so-card rounded-xl p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[16px] font-semibold text-[#374151]">
            {title}
          </div>
          <div className="mt-2 text-[32px] font-bold leading-none text-[#111827]">
            {value}
          </div>
          {subtitle ? (
            <div className="mt-2 text-[13px] text-[#6B7280]">{subtitle}</div>
          ) : null}
        </div>
        <div
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ background: "#F9FAFB" }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

