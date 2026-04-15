import * as React from "react";
import { cn } from "@/lib/utils";
import { getScoreColor } from "@/data/assessments";

export function ScoreBar({
  value,
  label,
  weight,
  showNumber = true,
  size = "md",
  className,
}: {
  value: number;
  label?: string;
  weight?: string;
  showNumber?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  const h =
    size === "sm"
      ? "h-[4px]"
      : size === "lg"
        ? "h-[8px]"
        : size === "xl"
          ? "h-[12px]"
          : "h-[6px]";

  return (
    <div className={cn("space-y-1", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-[13px] font-medium text-[#374151]">
            {label}{" "}
            {weight ? (
              <span className="text-[13px] text-[#6B7280]">{weight}</span>
            ) : null}
          </div>
          {showNumber ? (
            <div className="shrink-0 text-[13px] font-semibold text-[#111827]">
              {v} / 100
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={cn("w-full rounded-full bg-[#E5E7EB]", h)}>
        <div
          className={cn("rounded-full", h, getScoreColor(v))}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

