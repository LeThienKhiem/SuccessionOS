"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BarChart2, Store } from "lucide-react";
import type { Employee } from "@/data/types";
import { useModuleContext } from "@/context/ModuleContext";

export function RiskWarningBanner({ employee }: { employee: Employee }) {
  const router = useRouter();
  const { isActive } = useModuleContext();
  const marketActive = isActive("marketIntelligence");

  const riskHigh = employee.riskLevel === "high" || employee.riskLevel === "critical";
  if (!riskHigh) return null;

  const internal = employee.internalRiskFactors ?? [];
  const market = employee.marketRiskFactors ?? [];

  const visible = marketActive ? [...internal, ...market] : [...internal];

  const marketLockedPill =
    !marketActive && market.length > 0 ? (
      <button
        type="button"
        title={`${market.length} yếu tố Market Intelligence chưa kích hoạt — mở Marketplace để kích hoạt module và xem đầy đủ chi tiết.`}
        onClick={() => router.push("/marketplace")}
        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-[#D1D5DB] bg-white/60 px-2 py-[3px] text-[11px] text-[#9CA3AF] hover:bg-white"
      >
        <Store className="h-3 w-3 shrink-0" aria-hidden />
        +{market.length}
      </button>
    ) : null;

  return (
    <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-[#DC2626] mt-0.5" />
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-[#111827]">
            Nhân sự rủi ro cao — {employee.riskScore}/100
          </div>

          {visible.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {internal.map((f) => (
                <span
                  key={`in-${f}`}
                  className="inline-flex items-center rounded-full border border-[#FECACA] bg-[#FEE2E2] px-3 py-1 text-[12px] font-medium text-[#DC2626]"
                >
                  {f}
                </span>
              ))}

              {marketActive
                ? market.map((f) => (
                    <span
                      key={`mk-${f}`}
                      title="Nguồn: Market Intelligence"
                      className="inline-flex items-center gap-1 rounded-full border border-[#FECACA] bg-[#FEE2E2] px-3 py-1 text-[12px] font-medium text-[#DC2626]"
                    >
                      <BarChart2 className="h-3 w-3" />
                      {f}
                    </span>
                  ))
                : null}

              {marketLockedPill}
            </div>
          ) : marketLockedPill ? (
            <div className="mt-2 flex flex-wrap gap-2">{marketLockedPill}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

