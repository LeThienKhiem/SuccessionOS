"use client";

import * as React from "react";
import type { Employee } from "@/data/types";
import { assessments as allAssessments } from "@/data/assessments";
import { AccordionSection } from "@/components/talent/AccordionSection";
import { AccordionCompactRow } from "@/components/talent/AccordionCompactRow";
import {
  buildRiskFactorRows,
  riskSourceBadgeShort,
} from "@/components/talent/talentProfileRiskIdpUtils";
import {
  buildHrm360AccordionView,
  pickLatestAssessment,
} from "@/components/talent/talentProfileHrm360FromAssessment";

export function TalentProfileZoneCRiskHrm(props: {
  employee: Employee;
  marketIntelActive: boolean;
}) {
  const { employee, marketIntelActive } = props;
  const riskFactors = React.useMemo(
    () => buildRiskFactorRows(employee, marketIntelActive),
    [employee, marketIntelActive],
  );

  const latestAssessment = React.useMemo(
    () => pickLatestAssessment(allAssessments, employee.id),
    [employee.id],
  );
  const hrmView = latestAssessment ? buildHrm360AccordionView(latestAssessment) : null;

  const totalScore = hrmView?.totalScore ?? 0;
  const criteria = hrmView?.criteria ?? [];

  return (
    <div className="mt-4">
      <AccordionSection
        employeeId={employee.id}
        icon="⚠️"
        title="Yếu tố rủi ro"
        badge={`Risk ${employee.riskScore} · ${riskFactors.length} yếu tố`}
        badgeBg="#FEE2E2"
        badgeColor="#991B1B"
        alert={employee.riskScore > 50}
      >
        <div
          style={{
            fontSize: 12,
            color: "#6B7280",
            marginBottom: 12,
            padding: "6px 10px",
            background: "#FEF2F2",
            borderRadius: 8,
            borderLeft: "3px solid #EF4444",
          }}
        >
          Risk score {employee.riskScore} —{" "}
          {employee.riskScore > 50
            ? "Cao hơn 40% trung bình phòng — cần can thiệp"
            : "Trong ngưỡng bình thường"}
        </div>
        {riskFactors.length === 0 ? (
          <div style={{ fontSize: 13, color: "#9CA3AF", padding: "4px 0" }}>Chưa ghi nhận yếu tố chi tiết.</div>
        ) : (
          riskFactors.map((rf, i) => (
            <AccordionCompactRow
              key={rf.id}
              dotColor={
                rf.severity === "high" ? "#EF4444" : rf.severity === "medium" ? "#F59E0B" : "#10B981"
              }
              left={rf.label}
              sub={rf.detailNote}
              right={
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#6B7280",
                      background: "#F3F4F6",
                      padding: "1px 7px",
                      borderRadius: 20,
                    }}
                  >
                    {riskSourceBadgeShort(rf.source)}
                  </span>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>{rf.notedAt}</span>
                </div>
              }
              last={i === riskFactors.length - 1}
            />
          ))
        )}
      </AccordionSection>

      <AccordionSection
        employeeId={employee.id}
        icon="📊"
        title="Kết quả đánh giá 360°"
        badge={
          hrmView
            ? `${totalScore.toFixed(1)} điểm · ${hrmView.cycleName}`
            : "Chưa có đánh giá"
        }
        badgeBg="#EEF2FF"
        badgeColor="#4F46E5"
      >
        {hrmView && latestAssessment ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                padding: "10px 12px",
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #E5E7EB",
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                  Điểm tổng hợp — {hrmView.cycleName}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#4F46E5", marginTop: 2 }}>
                  {totalScore.toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>Nguồn đánh giá</div>
                <div style={{ display: "flex", gap: 4, marginTop: 4, justifyContent: "flex-end" }}>
                  {["QL 50%", "ĐN 30%", "CĐ 20%"].map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        background: "#EEF2FF",
                        color: "#4F46E5",
                        padding: "1px 6px",
                        borderRadius: 20,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#9CA3AF",
                fontWeight: 600,
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Chi tiết 13 tiêu chí
            </div>

            {criteria.map((c, i) => {
              const icon = c.achieveRate >= 95 ? "🟢" : c.achieveRate >= 80 ? "🟡" : "🔴";
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 0",
                    borderBottom: i < criteria.length - 1 ? "1px solid #F3F4F6" : "none",
                  }}
                >
                  <span style={{ fontSize: 12 }}>{icon}</span>
                  <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{c.name}</span>
                  <div style={{ width: 52, height: 4, background: "#F3F4F6", borderRadius: 10 }}>
                    <div
                      style={{
                        width: `${c.achieveRate}%`,
                        height: "100%",
                        borderRadius: 10,
                        background:
                          c.achieveRate >= 95 ? "#34D399" : c.achieveRate >= 80 ? "#FBBF24" : "#EF4444",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      minWidth: 32,
                      textAlign: "right",
                      color: "#374151",
                    }}
                  >
                    {c.tb.toFixed(2)}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#9CA3AF",
                      minWidth: 28,
                      textAlign: "right",
                    }}
                  >
                    /{c.required}
                  </span>
                </div>
              );
            })}

            <div
              style={{
                fontSize: 11,
                color: "#9CA3AF",
                fontWeight: 600,
                marginTop: 14,
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Từ đánh giá năng lực (HRM) — cùng chu kỳ
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Điểm mạnh</div>
            {latestAssessment.strengths.map((s, idx) => (
              <AccordionCompactRow key={`st-${idx}`} left={s} right={null} last={false} />
            ))}
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginTop: 8, marginBottom: 4 }}>
              Cần phát triển
            </div>
            {latestAssessment.gaps.length > 0 ? (
              latestAssessment.gaps.map((g, idx) => (
                <AccordionCompactRow key={`gp-${idx}`} left={g} right={null} last={false} />
              ))
            ) : (
              <div style={{ fontSize: 12, color: "#9CA3AF", paddingBottom: 8 }}>Không có ghi chú</div>
            )}
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginTop: 8, marginBottom: 4 }}>
              Nhận xét quản lý
            </div>
            <AccordionCompactRow
              left={<span style={{ fontStyle: "italic", color: "#6B7280" }}>“{latestAssessment.managerNotes}”</span>}
              right={null}
              last={false}
            />
            <AccordionCompactRow
              left="Điểm thành phần (0–100)"
              sub={`Kỹ thuật ${latestAssessment.technical} · Hiệu suất ${latestAssessment.performance} · Hành vi ${latestAssessment.behavior} · Tiềm năng ${latestAssessment.potential} · Tổng hợp ${latestAssessment.overall}`}
              right={null}
              last
            />
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#9CA3AF", fontSize: 13 }}>
            Chưa có kết quả đánh giá. Import từ HRM360 để xem.
          </div>
        )}
      </AccordionSection>
    </div>
  );
}
