"use client";

import * as React from "react";

export function AccordionCompactRow({
  left,
  right,
  sub,
  dotColor,
  last = false,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  sub?: React.ReactNode;
  dotColor?: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
        borderBottom: last ? "none" : "1px solid #F3F4F6",
      }}
    >
      {dotColor ? (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
          }}
        />
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "#374151" }}>{left}</div>
        {sub ? <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{sub}</div> : null}
      </div>
      {right != null ? <div style={{ flexShrink: 0 }}>{right}</div> : null}
    </div>
  );
}
