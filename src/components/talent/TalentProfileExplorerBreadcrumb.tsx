"use client";

import type { Employee } from "@/data/types";

type Props = {
  navHistory: string[];
  employees: Employee[];
  originalEmployeeId: string;
  onBreadcrumbClick: (idx: number) => void;
  onReset: () => void;
};

/**
 * Trail khi explorer đi khỏi nhân viên của URL — click segment để quay lại bước đó.
 */
export function TalentProfileExplorerBreadcrumb({
  navHistory,
  employees,
  originalEmployeeId,
  onBreadcrumbClick,
  onReset,
}: Props) {
  if (navHistory.length <= 1) return null;

  return (
    <div className="mb-1 flex flex-wrap items-center gap-1 text-[13px] text-[#6B7280]">
      <span className="font-medium text-[#374151]">Đang xem:</span>
      {navHistory.map((id, idx) => {
        const emp = employees.find((e) => e.id === id);
        const label = emp?.name ?? id;
        const isLast = idx === navHistory.length - 1;
        return (
          <span key={`${id}-${idx}`} className="flex items-center gap-1">
            {idx > 0 ? <span className="text-[#D1D5DB]">›</span> : null}
            {isLast ? (
              <span key={id} className="breadcrumb-slide-in font-semibold text-[#111827]">
                {label}
              </span>
            ) : (
              <button
                type="button"
                className="font-medium text-[#4F46E5] hover:underline"
                onClick={() => onBreadcrumbClick(idx)}
              >
                {label}
              </button>
            )}
          </span>
        );
      })}
      {navHistory[navHistory.length - 1] !== originalEmployeeId ? (
        <button
          type="button"
          className="ml-2 text-[12px] text-[#6B7280] underline hover:text-[#111827]"
          onClick={onReset}
        >
          Về hồ sơ gốc
        </button>
      ) : null}
    </div>
  );
}
