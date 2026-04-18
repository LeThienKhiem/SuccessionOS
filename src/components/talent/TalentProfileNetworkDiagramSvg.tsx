"use client";

import * as React from "react";

import type { Assessment, Employee, Position, Readiness, TalentTier } from "@/data/types";
import { employees as allEmployees } from "@/data/employees";
import { buildTalentRadarRows } from "@/components/talent/talentRadarUtils";
import { getAvatarGradientPair } from "@/components/talent/talentProfileAvatarGradient";
import type { NetworkResolvedContext } from "@/components/talent/talentProfileNetworkResolve";

const W = 560;
const H = 340;

/** Tối đa 2 ký tự — tránh tràn khỏi node mục tiêu (vd. GĐDÁ → GD). */
function roleShortCode(title: string): string {
  const parts = title.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PD";
  return parts
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function readinessVi(r: Readiness): string {
  if (r === "now") return "Sẵn sàng ngay";
  if (r === "1-2yr") return "1–2 năm";
  return "3–5 năm";
}

function tierVi(t: TalentTier): string {
  if (t === "successor") return "Kế thừa";
  if (t === "potential") return "Tiềm năng";
  return "Nòng cốt";
}

function idpStatusVi(status: string): string {
  if (status === "active") return "Đang thực hiện";
  if (status === "review") return "Cần review";
  if (status === "completed") return "Hoàn thành";
  return "Chưa bắt đầu";
}

function gradId(raw: string): string {
  return `g${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
}

function menteeX(index: number, total: number): number {
  if (total <= 0) return W / 2;
  if (total === 1) return W / 2;
  if (total === 2) return W / 2 + (index === 0 ? -90 : 90);
  const span = 200;
  const step = span / (total - 1);
  return W / 2 - span / 2 + index * step;
}

/** TOP — mục tiêu (người giữ vị trí focused đang hướng tới). */
const TOP_TARGET_X = W / 2;
const TOP_TARGET_Y = 56;
/** Phải — mentor. */
const MENTOR_NODE_X = W - 72;
const MENTOR_NODE_Y = H / 2 - 10;
/** Trái — KTP. */
const KTP_NODE_X = 72;
const KTP_NODE_Y = H / 2 - 10;

export type NetworkTooltip = {
  title: string;
  lines: string[];
  color: string;
};

export type SvgNode = {
  id: string;
  x: number;
  y: number;
  size: number;
  gradient: [string, string];
  label: string;
  ring?: boolean;
  isRect?: boolean;
  tooltip: NetworkTooltip | null;
  /** Khi có người gắn node (vd. người đang giữ PD) — click để focus explorer. */
  clickable?: boolean;
  clickTarget?: Employee;
};

function nodeRadius(n: SvgNode): number {
  if (n.isRect) return Math.min(n.size / 2, (n.size * 0.72) / 2) * 1.05;
  return n.size / 2;
}

function lineBetween(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const d = Math.hypot(dx, dy) || 1;
  const ux = dx / d;
  const uy = dy / d;
  return {
    x1: ax + ux * ar,
    y1: ay + uy * ar,
    x2: bx - ux * br,
    y2: by - uy * br,
  };
}

export function TalentProfileNetworkDiagramSvg({
  employee,
  assessment,
  currentPosition,
  selfGapScore,
  resolved,
  onNavigate,
}: {
  employee: Employee;
  assessment?: Assessment;
  currentPosition?: Position;
  selfGapScore?: number;
  resolved: NetworkResolvedContext;
  /** Click node có `clickTarget` (vd. người giữ vị trí mục tiêu) — chuyển focus trong explorer. */
  onNavigate?: (emp: Employee) => void;
}) {
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  const {
    pairAsMentee,
    mentor,
    targetPosition,
    targetPositionHolder,
    idp,
    ktp,
    positionSuccessors,
    successorNames,
  } = resolved;

  const radarRows = React.useMemo(
    () => buildTalentRadarRows(employee, assessment, targetPosition, currentPosition),
    [employee, assessment, targetPosition, currentPosition],
  );
  const avgDimGap =
    radarRows.length > 0
      ? Math.round(radarRows.reduce((s, r) => s + (r.thucTe - r.mucTieu), 0) / radarRows.length)
      : 0;
  const successionGap = typeof selfGapScore === "number" ? selfGapScore : null;
  const gapScore = successionGap ?? avgDimGap;

  const ktpProgress =
    ktp?.holderId === employee.id
      ? ktp.holderProgress
      : ktp?.successorId === employee.id
        ? ktp.successorProgress
        : null;

  const ktpPeerName =
    ktp?.holderId === employee.id
      ? allEmployees.find((e) => e.id === ktp.successorId)?.name
      : ktp?.successorId === employee.id
        ? allEmployees.find((e) => e.id === ktp.holderId)?.name
        : undefined;

  const idpProgress = idp?.progress ?? employee.idpProgress;
  const idpInProgress = idp?.activities.filter((a) => a.status === "in-progress").length ?? 0;

  const targetTitle = targetPosition?.titleVi ?? targetPosition?.title ?? "Chưa xác định";
  const targetSubtitle =
    targetPosition?.titleVi && targetPosition.title !== targetPosition.titleVi
      ? targetPosition.title
      : "";

  const mentorTrack = pairAsMentee?.track === "leadership" ? "Leadership" : "Technical";

  const successorInitials =
    positionSuccessors.length > 0
      ? positionSuccessors.map((s) => s.employee.initials).join(", ")
      : "—";

  const nodes: SvgNode[] = React.useMemo(() => {
    const center: SvgNode = {
      id: "center",
      x: W / 2,
      y: H / 2 - 10,
      size: 52,
      gradient: ["#A78BFA", "#7C3AED"],
      label: employee.initials,
      ring: true,
      tooltip: {
        title: employee.name,
        lines: [
          employee.currentRoleTitle,
          `Điểm: ${employee.overallScore}/100`,
          `Tầng: ${tierVi(employee.tier)}`,
          `Rủi ro: ${employee.riskScore}`,
        ],
        color: "#A78BFA",
      },
    };

    const holder = targetPositionHolder;
    const targetClickable = Boolean(holder && holder.id !== employee.id && onNavigate);
    const targetNode: SvgNode = {
      id: "target",
      x: TOP_TARGET_X,
      y: TOP_TARGET_Y,
      size: 40,
      gradient:
        holder || targetPosition ? (["#818CF8", "#4F46E5"] as [string, string]) : (["#E5E7EB", "#D1D5DB"] as [string, string]),
      label: holder
        ? holder.initials.slice(0, 3)
        : targetPosition
          ? roleShortCode(targetPosition.title ?? targetPosition.titleVi)
          : "—",
      isRect: true,
      clickable: targetClickable,
      clickTarget: targetClickable && holder ? holder : undefined,
      tooltip: holder
        ? {
            title: holder.name,
            lines: [
              `Đang giữ: ${targetTitle}`,
              holder.currentRoleTitle,
              `Tầng: ${tierVi(holder.tier)}`,
              `Điểm: ${holder.overallScore}/100`,
              ...(targetClickable ? (["→ Click để xem hồ sơ"] as const) : []),
            ],
            color: "#4F46E5",
          }
        : targetPosition
          ? {
              title: targetTitle,
              lines: [
                targetSubtitle,
                `Readiness (ứng viên): ${readinessVi(employee.readiness)}`,
                `GAP tổng: ${gapScore >= 0 ? "+" : ""}${gapScore}${successionGap != null ? "/100" : " (TB 5 chiều)"}`,
                successorNames.length ? `Ứng viên kế thừa vị trí hiện tại: ${successorNames.join(", ")}` : "",
              ].filter(Boolean),
              color: "#4F46E5",
            }
          : {
              title: "Chưa có vị trí mục tiêu",
              lines: ["Thiết lập target position trong hồ sơ nhân tài."],
              color: "#9CA3AF",
            },
    };

    const mentorClickable = Boolean(mentor && mentor.id !== employee.id && onNavigate);
    const mentorNode: SvgNode = {
      id: "mentor",
      x: MENTOR_NODE_X,
      y: MENTOR_NODE_Y,
      size: 36,
      gradient: mentor ? (["#34D399", "#059669"] as [string, string]) : (["#D1D5DB", "#9CA3AF"] as [string, string]),
      label: mentor?.initials ?? "—",
      clickable: mentorClickable,
      clickTarget: mentorClickable && mentor ? mentor : undefined,
      tooltip: mentor
        ? {
            title: mentor.name,
            lines: [
              `Mentor · ${mentorTrack}`,
              `Bắt đầu: ${pairAsMentee?.startMonth ?? "—"}`,
              pairAsMentee
                ? `Giờ kèm cặp: ${pairAsMentee.completedHours}/${pairAsMentee.commitmentHours}h`
                : "Chưa có log giờ mentoring",
              ...(mentorClickable ? (["→ Click để xem hồ sơ"] as const) : []),
            ],
            color: "#059669",
          }
        : {
            title: "Chưa có mentor",
            lines: ["Gán mentor trong HRM hoặc tạo cặp mentoring."],
            color: "#9CA3AF",
          },
    };

    const idpNode: SvgNode = {
      id: "idp",
      x: W / 2,
      y: H - 72,
      size: 38,
      gradient: ["#FBBF24", "#D97706"],
      label: "IDP",
      tooltip: {
        title: "Kế hoạch phát triển",
        lines: idp
          ? [
              `Tiến độ: ${idp.progress}%`,
              `${idpInProgress} hoạt động đang chạy`,
              `Trạng thái: ${idpStatusVi(idp.status)}`,
              `Phê duyệt: ${idp.approvedBy}`,
            ]
          : [
              `Tiến độ (hồ sơ): ${employee.idpProgress}%`,
              "Chưa có bản IDP chi tiết trong hệ thống.",
            ],
        color: "#D97706",
      },
    };

    const ktpNode: SvgNode = {
      id: "ktp",
      x: KTP_NODE_X,
      y: KTP_NODE_Y,
      size: 38,
      gradient:
        ktp && ktpProgress != null ? (["#FB923C", "#EA580C"] as [string, string]) : (["#D1D5DB", "#9CA3AF"] as [string, string]),
      label: ktp && ktpProgress != null ? "KTP" : "—",
      tooltip:
        ktp && ktpProgress != null
          ? {
              title: "Chuyển giao tri thức",
              lines: [
                `Tiến độ: ${ktpProgress}%`,
                `Đối tác: ${ktpPeerName ?? "—"}`,
                `Trạng thái KTP: ${ktp.status === "active" ? "Đang thực hiện" : ktp.status}`,
                `Ứng viên kế thừa vị trí hiện tại: ${successorInitials}`,
              ],
              color: "#EA580C",
            }
          : {
              title: "Chưa có KTP",
              lines: [
                "Chưa gắn kế hoạch chuyển giao tri thức cho hồ sơ này.",
                positionSuccessors.length
                  ? `Ứng viên kế thừa vị trí hiện tại: ${successorInitials}`
                  : "",
              ].filter(Boolean),
              color: "#9CA3AF",
            },
    };

    const successorNodes: SvgNode[] = positionSuccessors.map((row, i) => {
      const m = row.employee;
      const succClickable = Boolean(onNavigate && m.id !== employee.id);
      const [g0, g1] = getAvatarGradientPair(m.id);
      return {
        id: `successor-${m.id}`,
        x: menteeX(i, positionSuccessors.length),
        y: H - 50,
        size: 32,
        gradient: [g0, g1] as [string, string],
        label: m.initials,
        clickable: succClickable,
        clickTarget: succClickable ? m : undefined,
        tooltip: {
          title: m.name,
          lines: [
            m.currentRoleTitle,
            `Kế thừa vị trí: ${employee.currentRoleTitle}`,
            `Điểm: ${m.overallScore}/100`,
            `Sẵn sàng: ${readinessVi(row.readiness)}`,
            ...(succClickable ? (["→ Click để xem hồ sơ"] as const) : []),
          ],
          color: "#7C3AED",
        },
      };
    });

    return [center, targetNode, mentorNode, idpNode, ktpNode, ...successorNodes];
  }, [
    employee,
    mentor,
    mentorTrack,
    pairAsMentee,
    targetPosition,
    targetPositionHolder,
    targetTitle,
    targetSubtitle,
    employee.readiness,
    gapScore,
    successionGap,
    successorNames,
    successorInitials,
    idp,
    idpInProgress,
    idpProgress,
    ktp,
    ktpProgress,
    ktpPeerName,
    positionSuccessors,
    onNavigate,
  ]);

  const lines = React.useMemo(() => {
    const get = (id: string) => nodes.find((n) => n.id === id);
    const base: {
      from: string;
      to: string;
      stroke: string;
      dash?: string;
      opacity: number;
      arrow?: boolean;
    }[] = [
      { from: "center", to: "target", stroke: "#818CF8", opacity: 0.65, arrow: true },
      { from: "center", to: "mentor", stroke: "#34D399", dash: "6 3", opacity: 0.55 },
      { from: "center", to: "ktp", stroke: "#FB923C", dash: "6 3", opacity: 0.55 },
      { from: "center", to: "idp", stroke: "#FBBF24", dash: "4 3", opacity: 0.55 },
    ];

    const successorLines = positionSuccessors.map((row) => ({
      from: "idp",
      to: `successor-${row.employee.id}`,
      stroke: "#A78BFA",
      dash: "3 3",
      opacity: 0.5,
    }));

    return [...base, ...successorLines]
      .map((spec) => {
        const a = get(spec.from);
        const b = get(spec.to);
        if (!a || !b) return null;
        const ra = nodeRadius(a);
        const rb = nodeRadius(b);
        const { x1, y1, x2, y2 } = lineBetween(a.x, a.y, ra, b.x, b.y, rb);
        return { ...spec, x1, y1, x2, y2 };
      })
      .filter(Boolean) as Array<
      typeof base[0] & { x1: number; y1: number; x2: number; y2: number }
    >;
  }, [nodes, positionSuccessors]);

  const hoveredNode = hovered ? nodes.find((n) => n.id === hovered) : undefined;
  const tip = hoveredNode?.tooltip;

  return (
    <div
      style={{ position: "relative", width: "100%" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
      onMouseLeave={() => setHovered(null)}
    >
      <svg
        key={employee.id}
        className="node-pop-in"
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Mạng lưới phát triển"
      >
        <defs>
          <marker id="arrow-net" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <polygon points="0,0 7,3.5 0,7" fill="#818CF8" opacity={0.75} />
          </marker>
          <filter id="glow-center" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {nodes.map((n) => (
            <linearGradient key={n.id} id={gradId(n.id)} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={n.gradient[0]} />
              <stop offset="100%" stopColor={n.gradient[1]} />
            </linearGradient>
          ))}
        </defs>

        {lines.map((l) => (
          <line
            key={`${l.from}-${l.to}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={l.stroke}
            strokeWidth={1.5}
            strokeDasharray={l.dash}
            strokeOpacity={l.opacity}
            markerEnd={l.arrow ? "url(#arrow-net)" : undefined}
          />
        ))}

        <text x={W / 2} y={24} textAnchor="middle" fill="#6B7280" fontSize={10} fontWeight={600} fontFamily="system-ui,sans-serif">
          Mục tiêu
        </text>
        <text
          x={W - 8}
          y={MENTOR_NODE_Y}
          textAnchor="end"
          dominantBaseline="middle"
          fill="#6B7280"
          fontSize={10}
          fontWeight={600}
          fontFamily="system-ui,sans-serif"
        >
          Mentor
        </text>
        <text x={KTP_NODE_X - 28} y={KTP_NODE_Y} textAnchor="end" dominantBaseline="middle" fill="#6B7280" fontSize={10} fontWeight={600} fontFamily="system-ui,sans-serif">
          Tri thức
        </text>

        {nodes.map((n) => {
          const gid = gradId(n.id);
          const scale = hovered === n.id ? 1.08 : 1;
          const tf =
            n.id === "center"
              ? undefined
              : `translate(${n.x},${n.y}) scale(${scale}) translate(${-n.x},${-n.y})`;

          return (
            <g
              key={n.id}
              style={{ cursor: n.clickable || n.tooltip ? "pointer" : "default" }}
              transform={tf}
              onMouseEnter={() => setHovered(n.id)}
              onClick={(e) => {
                e.preventDefault();
                if (n.clickable && n.clickTarget && onNavigate) {
                  onNavigate(n.clickTarget);
                }
              }}
            >
              {n.ring ? (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.size / 2 + 9}
                  fill="none"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  strokeOpacity={0.28}
                />
              ) : null}
              {hovered === n.id ? (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.size / 2 + (n.isRect ? 6 : 5)}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  strokeOpacity={0.45}
                />
              ) : null}

              {n.isRect ? (
                <rect
                  x={n.x - n.size / 2}
                  y={n.y - (n.size * 0.72) / 2}
                  width={n.size}
                  height={n.size * 0.72}
                  rx={9}
                  fill={`url(#${gid})`}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ) : (
                <circle cx={n.x} cy={n.y} r={n.size / 2} fill={`url(#${gid})`} stroke="#fff" strokeWidth={2} />
              )}

              <text
                x={n.x}
                y={n.y + (n.isRect ? 0 : 1)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize={n.size >= 48 ? 14 : 10}
                fontWeight={800}
                fontFamily="system-ui,sans-serif"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {n.label}
              </text>

              {n.id === "idp" && (() => {
                const bw = 36;
                const bh = 14;
                const rx = 7;
                const bx = n.x + n.size / 2 - bw + 2;
                const by = n.y - n.size / 2 - 24;
                return (
                  <>
                    <rect x={bx} y={by} width={bw} height={bh} rx={rx} fill={n.gradient[1]} />
                    <text
                      x={bx + bw / 2}
                      y={by + bh / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize={9}
                      fontWeight={800}
                      fontFamily="system-ui,sans-serif"
                      style={{ pointerEvents: "none" }}
                    >
                      {idpProgress}%
                    </text>
                  </>
                );
              })()}
              {n.id === "ktp" && ktpProgress != null && (() => {
                const bw = 36;
                const bh = 14;
                const rx = 7;
                const bx = n.x - n.size / 2 - 6 - bw;
                const by = n.y - n.size / 2 - 16;
                return (
                  <>
                    <rect x={bx} y={by} width={bw} height={bh} rx={rx} fill={n.gradient[1]} />
                    <text
                      x={bx + bw / 2}
                      y={by + bh / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize={9}
                      fontWeight={800}
                      fontFamily="system-ui,sans-serif"
                      style={{ pointerEvents: "none" }}
                    >
                      {ktpProgress}%
                    </text>
                  </>
                );
              })()}
            </g>
          );
        })}

        {positionSuccessors.map((row, i) => {
          const m = row.employee;
          const nx = menteeX(i, positionSuccessors.length);
          return (
            <text
              key={`lbl-${m.id}`}
              x={nx}
              y={H - 20}
              textAnchor="middle"
              fill="#6B7280"
              fontSize={9}
              fontWeight={600}
              fontFamily="system-ui,sans-serif"
              style={{ pointerEvents: "none" }}
            >
              {m.initials} · {tierVi(m.tier)}
            </text>
          );
        })}
      </svg>

      {hovered && tip
        ? (() => {
            const offsetX = mousePos.x > 300 ? -180 : 16;
            const offsetY = mousePos.y > 200 ? -120 : 16;
            const lines = tip.lines.filter(Boolean);
            return (
              <div
                style={{
                  position: "absolute",
                  left: mousePos.x + offsetX,
                  top: mousePos.y + offsetY,
                  background: "#1E1B4B",
                  color: "#fff",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                  lineHeight: 1.6,
                  minWidth: 160,
                  maxWidth: 220,
                  zIndex: 50,
                  pointerEvents: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                  borderTop: `3px solid ${tip.color}`,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4, color: tip.color }}>{tip.title}</div>
                {lines.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      color:
                        i === lines.length - 1 && l.startsWith("→") ? "#A5B4FC" : "#C7D2FE",
                      fontSize: 11,
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
            );
          })()
        : null}
    </div>
  );
}
