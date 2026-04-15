import * as React from "react";
import type { RiskLevel } from "@/data/types";
import { cn } from "@/lib/utils";

function riskStyle(level: RiskLevel) {
  if (level === "low")
    return "bg-[#F0FDF4] text-[#15803D] border-[#22C55E]/30";
  if (level === "medium")
    return "bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]/30";
  return "bg-[#FEF2F2] text-[#DC2626] border-[#EF4444]/30";
}

function label(level: RiskLevel) {
  if (level === "low") return "Low";
  if (level === "medium") return "Med";
  if (level === "high") return "High";
  return "Critical";
}

export function RiskBadge({
  level,
  score,
  className,
}: {
  level: RiskLevel;
  score: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        riskStyle(level),
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label(level)} • {score}
    </span>
  );
}

