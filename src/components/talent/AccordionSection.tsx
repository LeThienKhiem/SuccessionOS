"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

export function AccordionSection({
  icon,
  title,
  badge,
  badgeColor = "#6B7280",
  badgeBg = "#F3F4F6",
  alert = false,
  children,
  employeeId,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  alert?: boolean;
  children: React.ReactNode;
  /** Khi đổi nhân viên (explorer), đóng accordion để không còn nội dung cũ mở. */
  employeeId?: string;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (employeeId === undefined) return;
    setOpen(false);
  }, [employeeId]);

  const borderColor = alert ? "#FECDD3" : "#E5E7EB";

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 8,
        background: alert && !open ? "#FFF8F8" : "#fff",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          borderBottom: open ? "1px solid #F3F4F6" : "none",
        }}
      >
        <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            flex: 1,
            textAlign: "left",
            color: open ? "#4F46E5" : "#1E1B4B",
          }}
        >
          {title}
        </span>
        {badge ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: badgeBg,
              color: badgeColor,
              padding: "2px 9px",
              borderRadius: 20,
              flexShrink: 0,
            }}
          >
            {badge}
          </span>
        ) : null}
        <ChevronDown
          size={14}
          style={{
            color: "#9CA3AF",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>
      {open ? (
        <div style={{ padding: "14px 16px", background: "#FAFAFA" }}>{children}</div>
      ) : null}
    </div>
  );
}
