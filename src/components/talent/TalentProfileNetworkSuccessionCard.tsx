"use client";

import * as React from "react";

import type { Employee, Position } from "@/data/types";
import { employees } from "@/data/employees";
import { assessments } from "@/data/assessments";
import { TalentProfileNetworkDiagramSvg } from "@/components/talent/TalentProfileNetworkDiagramSvg";
import {
  gapScoreForEmployee,
  resolveNetworkContext,
} from "@/components/talent/talentProfileNetworkResolve";

const LEGEND = [
  { color: "#34D399", label: "Mentor" },
  { color: "#818CF8", label: "Mục tiêu" },
  { color: "#FBBF24", label: "IDP" },
  { color: "#FB923C", label: "KTP" },
  { color: "#A78BFA", label: "Mentee" },
];

type Props = {
  /** Nhân viên đang focus trong explorer (đồng bộ với Hero / Radar / …). */
  focusedEmployee: Employee;
  navHistory: string[];
  positions?: Position[];
  onNavigate: (emp: Employee) => void;
};

/**
 * Zone B — mạng lưới SVG; state focus + navHistory do cha quản (`EmployeeProfileClient`).
 */
export function TalentProfileNetworkSuccessionCard({
  focusedEmployee,
  navHistory,
  positions,
  onNavigate,
}: Props) {
  const positionList = positions ?? [];
  const employeeList = employees ?? [];

  const resolved = React.useMemo(
    () =>
      resolveNetworkContext(
        focusedEmployee,
        navHistory ?? [],
        employeeList,
        positionList,
      ),
    [focusedEmployee, navHistory, employeeList, positionList],
  );

  const focusedAssessment = React.useMemo(
    () => assessments.find((a) => a.employeeId === focusedEmployee.id),
    [focusedEmployee.id],
  );

  const focusedCurrentPosition = React.useMemo(
    () => positionList.find((p) => p.id === focusedEmployee.positionId),
    [focusedEmployee.positionId, positionList],
  );

  const focusedGapScore = React.useMemo(
    () => gapScoreForEmployee(focusedEmployee),
    [focusedEmployee],
  );

  const loadingNetwork = !positionList.length || !employeeList.length;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #E5E7EB",
        padding: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
        <div className="min-w-0">
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1E1B4B" }}>Mạng lưới phát triển</div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Hover vào node để xem chi tiết</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "flex-end" }}>
          {LEGEND.map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {loadingNetwork ? (
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA3AF",
            fontSize: 13,
          }}
        >
          Đang tải mạng lưới...
        </div>
      ) : (
        <TalentProfileNetworkDiagramSvg
          employee={focusedEmployee}
          assessment={focusedAssessment}
          currentPosition={focusedCurrentPosition}
          selfGapScore={focusedGapScore}
          resolved={resolved}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
