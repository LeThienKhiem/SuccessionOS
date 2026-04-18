"use client";

import * as React from "react";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { useModuleContext } from "@/context/ModuleContext";
import { CareerPathTab } from "@/components/CareerPathTab";

type TabKey = "overview" | "ai";

export function EmployeeTabNav(props: {
  employeeId: string;
  hasCareerPath: boolean;
  overview: React.ReactNode;
}) {
  const { isActive } = useModuleContext();
  const showAI = isActive("aiCareerPath");

  const [tab, setTab] = React.useState<TabKey>("overview");

  React.useEffect(() => {
    if (!showAI && tab === "ai") setTab("overview");
  }, [showAI, tab]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setTab("overview")}
          className={[
            "inline-flex items-center gap-2 pb-3 text-[14px]",
            tab === "overview"
              ? "border-b-2 border-b-[#4F46E5] text-[#4F46E5] font-semibold"
              : "text-[#6B7280]",
          ].join(" ")}
        >
          <LayoutDashboard className="h-4 w-4" />
          Tổng quan
        </button>

        {showAI ? (
          <button
            type="button"
            onClick={() => setTab("ai")}
            className={[
              "inline-flex items-center gap-2 pb-3 text-[14px]",
              tab === "ai"
                ? "border-b-2 border-b-[#4F46E5] text-[#4F46E5] font-semibold"
                : "text-[#6B7280]",
            ].join(" ")}
          >
            <Sparkles className="h-4 w-4" />
            Lộ trình AI
            <span className="ml-1 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#4F46E5]">
              AI
            </span>
          </button>
        ) : null}
      </div>

      {tab === "overview" ? (
        <>{props.overview}</>
      ) : (
        <div className="w-full">
          <CareerPathTab employeeId={props.employeeId} />
        </div>
      )}
    </div>
  );
}

