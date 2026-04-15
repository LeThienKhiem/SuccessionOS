import * as React from "react";
import type { Readiness } from "@/data/types";
import { getReadinessColor } from "@/data/assessments";
import { cn } from "@/lib/utils";

function label(readiness: Readiness) {
  return readiness === "now" ? "Sẵn sàng ngay" : readiness === "1-2yr" ? "1–2 năm" : "3–5 năm";
}

export function ReadinessBadge({
  readiness,
  className,
}: {
  readiness: Readiness;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium",
        getReadinessColor(readiness),
        className
      )}
    >
      {label(readiness)}
    </span>
  );
}

