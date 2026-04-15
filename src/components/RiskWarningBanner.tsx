"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BarChart2 } from "lucide-react";
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

              {!marketActive && market.length > 0 ? (
                <button
                  type="button"
                  title="Kích hoạt Market Intelligence để xem đầy đủ"
                  onClick={() => router.push("/marketplace")}
                  className="inline-flex items-center rounded-full border border-dashed border-[#D1D5DB] bg-[#F3F4F6] px-3 py-1 text-[11px] italic text-[#6B7280] hover:bg-white"
                >
                  + {market.length} yếu tố từ Market Intelligence (chưa kích hoạt)
                </button>
              ) : null}
            </div>
          ) : !marketActive && market.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                title="Kích hoạt Market Intelligence để xem đầy đủ"
                onClick={() => router.push("/marketplace")}
                className="inline-flex items-center rounded-full border border-dashed border-[#D1D5DB] bg-[#F3F4F6] px-3 py-1 text-[11px] italic text-[#6B7280] hover:bg-white"
              >
                + {market.length} yếu tố từ Market Intelligence (chưa kích hoạt)
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

