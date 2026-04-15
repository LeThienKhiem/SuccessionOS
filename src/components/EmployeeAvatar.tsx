import * as React from "react";
import type { Employee } from "@/data/types";
import { cn } from "@/lib/utils";

const tierBg: Record<Employee["tier"], string> = {
  core: "bg-[#EEF2FF] text-[#4F46E5]",
  potential: "bg-[#EFF6FF] text-[#1D4ED8]",
  successor: "bg-[#F0FDFA] text-[#0F766E]",
};

export function EmployeeAvatar({
  employee,
  size = "sm",
  className,
}: {
  employee: Employee;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "sm" ? "h-9 w-9 text-[12px]" : size === "md" ? "h-12 w-12 text-[14px]" : "h-16 w-16 text-[16px]";

  return (
    <div
      className={cn(
        "grid place-items-center rounded-full font-semibold",
        dim,
        tierBg[employee.tier],
        className
      )}
      aria-label={employee.name}
      title={employee.name}
    >
      {employee.initials}
    </div>
  );
}

