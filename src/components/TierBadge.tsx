import * as React from "react";
import type { TalentTier } from "@/data/types";
import { getTierColor, getTierLabel } from "@/data/assessments";
import { cn } from "@/lib/utils";

export function TierBadge({ tier, className }: { tier: TalentTier; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold border",
        getTierColor(tier),
        className
      )}
    >
      {getTierLabel(tier)}
    </span>
  );
}

