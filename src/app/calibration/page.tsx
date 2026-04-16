"use client";

import * as React from "react";
import {
  ArrowUpDown,
  Check,
  GitMerge,
  Info,
  Lock,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

import { getCalibrationEmployees } from "@/data/calibration";
import { getNineBoxQuadrant } from "@/data/assessments";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";

type Cell = { row: 1 | 2 | 3; col: 1 | 2 | 3 }; // row=potential, col=performance

type Comment = { by: string; at: string; text: string };

type DiscussionItem = {
  employeeId: string;
  fromCell: number;
  toCell: number;
  reason: string;
  comments: Comment[];
};

type AuditLog = { at: string; text: string };

function cellStyle(row: 1 | 2 | 3, col: 1 | 2 | 3) {
  const key = `${row}-${col}`;
  const map: Record<string, { label: string; bg: string; border: string }> = {
    // Potential high (row 3)
    "3-1": { label: "Enigma", bg: "bg-[#EFF6FF]", border: "border-[#BFDBFE]" },
    "3-2": { label: "Future Star", bg: "bg-[#EEF2FF]", border: "border-[#C7D2FE]" },
    "3-3": { label: "Star ⭐", bg: "bg-[#EDE9FE]", border: "border-[#A5B4FC]" },
    // Potential mid (row 2)
    "2-1": { label: "Inconsistent", bg: "bg-[#FFFBEB]", border: "border-[#FDE68A]" },
    "2-2": { label: "Core Player", bg: "bg-[#F0FDF4]", border: "border-[#BBF7D0]" },
    "2-3": { label: "High Performer", bg: "bg-[#DCFCE7]", border: "border-[#86EFAC]" },
    // Potential low (row 1)
    "1-1": { label: "Under Performer", bg: "bg-[#FEF2F2]", border: "border-[#FECACA]" },
    "1-2": { label: "Reliable", bg: "bg-[#F9FAFB]", border: "border-[#E5E7EB]" },
    "1-3": { label: "Expert", bg: "bg-[#F0FDFA]", border: "border-[#99F6E4]" },
  };
  return map[key];
}

function cellToNum(row: 1 | 2 | 3, col: 1 | 2 | 3) {
  // 1..9 where 5 = middle, 9 = top-right, 1 = bottom-left
  const rowIndex = row === 3 ? 2 : row === 2 ? 1 : 0; // top=2
  const colIndex = col - 1; // left=0
  return rowIndex * 3 + colIndex + 1;
}

function numToCell(n: number): Cell {
  const nn = Math.max(1, Math.min(9, n));
  const rowIndex = Math.floor((nn - 1) / 3); // 0 bottom row1, 1 row2, 2 top row3 (we'll map)
  const colIndex = (nn - 1) % 3; // 0..2
  const row = (rowIndex === 2 ? 3 : rowIndex === 1 ? 2 : 1) as 1 | 2 | 3;
  const col = (colIndex + 1) as 1 | 2 | 3;
  return { row, col };
}

function chipTone(isDiscussion: boolean) {
  return isDiscussion
    ? "bg-[#FEF9C3] text-[#854D0E] border-[#F59E0B]"
    : "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]";
}

function calibrationQuadrantLabel(cellNum: number) {
  const map: Record<number, string> = {
    9: "⭐ Ngôi sao — Kế thừa ngay",
    8: "🚀 Tiềm năng cao",
    7: "🌟 Ngôi sao tương lai",
    6: "🏆 Hiệu suất cao",
    5: "💎 Nòng cốt ổn định",
    4: "🔧 Đang phát triển",
    3: "🧠 Chuyên gia",
    2: "📌 Ổn định",
    1: "⚠ Cần hỗ trợ",
  };
  return map[cellNum] ?? `Ô ${cellNum}`;
}

export default function CalibrationPage() {
  const people = getCalibrationEmployees();
  const [tab, setTab] = React.useState<"discussion" | "confirmed">("discussion");
  const [lockModal, setLockModal] = React.useState(false);
  const [locked, setLocked] = React.useState(false);
  const [toast, setToast] = React.useState<null | { text: string }>(null);
  const showToast = React.useCallback((text: string) => {
    setToast({ text });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const [discussion, setDiscussion] = React.useState<DiscussionItem[]>([
    {
      employeeId: "emp-006", // VĐL
      fromCell: 5,
      toCell: 8,
      reason: "Performance tăng sau Block B Q3, KTP 68%",
      comments: [
        { by: "LK", text: "Đồng ý — KTP progress đủ căn cứ", at: "14:23" },
        { by: "TMT", text: "Cần thêm 1 cycle để confirm leadership", at: "14:15" },
      ],
    },
    {
      employeeId: "emp-010", // NĐT
      fromCell: 4,
      toCell: 7,
      reason: "IDP 42% còn thấp nhưng potential 87",
      comments: [{ by: "BA1", text: "IDP chưa đủ — giữ nguyên kỳ này", at: "13:50" }],
    },
  ]);

  const [confirmedMoves, setConfirmedMoves] = React.useState<Record<string, number>>({});
  const [audit, setAudit] = React.useState<AuditLog[]>([
    { at: "14:23", text: "LK xác nhận NVT → Ô 9" },
    { at: "14:15", text: "TMT đề xuất di chuyển VĐL Ô 5 → 8" },
    { at: "13:50", text: "BA1 comment NĐT: giữ nguyên" },
  ]);

  const [commentDraft, setCommentDraft] = React.useState<Record<string, string>>({});

  const confirmedCount = 25 - discussion.length;
  const discussionCount = discussion.length;

  const participants = (() => {
    const list = people.slice(0, 25);
    const out = new Map<string, Cell>();

    for (const e of list) {
      const q = getNineBoxQuadrant(e.performanceScore, e.potentialScore);
      // Page spec: row=Potential, col=Performance
      const row = q.col;
      const col = q.row;
      out.set(e.id, { row, col });
    }

    // override initial discussion cells
    out.set("emp-006", numToCell(5));
    out.set("emp-010", numToCell(4));

    // apply confirmed moves
    for (const [empId, cellNum] of Object.entries(confirmedMoves)) {
      out.set(empId, numToCell(cellNum));
    }

    return out;
  })();

  const groupedByCell = (() => {
    const m = new Map<string, string[]>();
    for (const [empId, cell] of participants.entries()) {
      const key = `${cell.row}-${cell.col}`;
      const arr = m.get(key) ?? [];
      arr.push(empId);
      m.set(key, arr);
    }
    return m;
  })();

  function confirmMove(empId: string) {
    const item = discussion.find((d) => d.employeeId === empId);
    if (!item) return;

    setConfirmedMoves((prev) => ({ ...prev, [empId]: item.toCell }));
    setDiscussion((prev) => prev.filter((d) => d.employeeId !== empId));
    setAudit((prev) => [
      { at: "14:30", text: `LK xác nhận ${empId === "emp-006" ? "VĐL" : "NĐT"} → Ô ${item.toCell}` },
      ...prev,
    ]);
    showToast("Đã xác nhận di chuyển (mock)");
    setTab("confirmed");
  }

  function keepAsIs(empId: string) {
    setAudit((prev) => [{ at: "14:28", text: `Giữ nguyên ${empId === "emp-006" ? "VĐL" : "NĐT"}` }, ...prev]);
    showToast("Đã giữ nguyên (mock)");
  }

  function addComment(empId: string) {
    const text = (commentDraft[empId] ?? "").trim();
    if (!text) return;
    setDiscussion((prev) =>
      prev.map((d) =>
        d.employeeId === empId
          ? { ...d, comments: [{ by: "LK", at: "14:31", text }, ...d.comments] }
          : d
      )
    );
    setCommentDraft((prev) => ({ ...prev, [empId]: "" }));
    setAudit((prev) => [{ at: "14:31", text: `LK comment ${empId === "emp-006" ? "VĐL" : "NĐT"}` }, ...prev]);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-[13px] text-[#6B7280]">Phát triển · Họp hiệu chỉnh</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold text-[#111827]">
              Phiên Hiệu chỉnh 9-Box — Q4 2024
            </h1>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              Chủ trì: <span className="font-semibold text-[#111827]">Lê Khiêm</span> · Hội đồng: 5 thành viên
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[#FFFBEB] px-3 py-1.5 text-[12px] font-semibold text-[#B45309] border border-[#FDE68A]">
              ĐANG DIỄN RA
            </span>
            <button
              type="button"
              disabled={locked}
              onClick={() => setLockModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-40"
            >
              <Lock className="h-4 w-4" />
              🔒 Khóa kết quả
            </button>
          </div>
        </div>
        <hr className="border-[#E5E7EB]" />
      </div>

      {/* Explanation card */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
          <Info className="h-5 w-5 shrink-0 text-[#6366F1]" />
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-[#111827]">Mục đích buổi họp</div>
            <div className="mt-1 text-[13px] text-[#6B7280] leading-6">
              Hội đồng review kết quả đánh giá từ managers và điều chỉnh để đảm bảo công bằng giữa các
              phòng ban. Chips màu vàng đang cần thảo luận. Sau khi đồng thuận → Khóa kết quả để công bố.
            </div>
          </div>
          <div className="sm:ml-2 sm:pl-4 sm:border-l sm:border-[#E5E7EB]">
            <div className="text-[14px] font-semibold text-[#111827]">Quy trình:</div>
            <div className="mt-1 text-[12px] text-[#6B7280] leading-6">
              <span className="font-semibold text-[#4F46E5]">①</span> Manager submit điểm →{" "}
              <span className="font-semibold text-[#4F46E5]">②</span> Họp review →{" "}
              <span className="font-semibold text-[#4F46E5]">③</span> Điều chỉnh →{" "}
              <span className="font-semibold text-[#4F46E5]">④</span> Khóa &amp; Công bố
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[60%,40%]">
        {/* Left: 9-Box */}
        <div className="so-card rounded-xl p-0 overflow-hidden" style={{ background: "#FAFAF5" }}>
          <div className="p-6">
            <div className="rounded-lg border border-[#F59E0B] bg-[#FEF9C3] px-4 py-3">
              <div className="text-[13px] font-semibold text-[#854D0E] leading-5">
                🔒 Phiên họp đang diễn ra — mọi thay đổi được ghi nhận vào Audit Log
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[16px] font-semibold text-[#374151]">Interactive 9-Box</div>
            <div className="text-[13px] text-[#6B7280]">
              23 đã xác nhận ✅ · 2 đang thảo luận 💬
            </div>
          </div>

          <div className="mt-4 flex items-stretch gap-2">
            <div className="flex items-center justify-center w-[20px] shrink-0">
              <span className="rotate-[-90deg] whitespace-nowrap text-[12px] text-[#6B7280] origin-center">
                Tiềm năng →
              </span>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-3 gap-3">
                {([3, 2, 1] as const).map((row) =>
                  ([1, 2, 3] as const).map((col) => {
                    const meta = cellStyle(row, col);
                    const key = `${row}-${col}`;
                    const cellNum = cellToNum(row, col);
                    const list = groupedByCell.get(key) ?? [];
                    return (
                      <div
                        key={key}
                        className={[
                          "min-h-[150px] rounded-lg border p-3",
                          meta.bg,
                          meta.border,
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[11px] font-semibold text-[#6B7280]">
                            {calibrationQuadrantLabel(cellNum)}
                          </div>
                          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
                            Ô {cellNum}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {list.map((empId) => {
                            const e = people.find((x) => x.id === empId);
                            const isDiscussion = discussion.some((d) => d.employeeId === empId);
                            return (
                              <button
                                key={empId}
                                type="button"
                                disabled={locked}
                                onClick={() => setTab(isDiscussion ? "discussion" : "confirmed")}
                                className={[
                                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold transition pr-2",
                                  isDiscussion ? "hover:bg-[#FEFCE8] animate-pulse" : "hover:bg-[#F0FDF4] opacity-80",
                                  chipTone(isDiscussion),
                                  isDiscussion ? "border-dashed" : "border-solid",
                                ].join(" ")}
                                aria-label={isDiscussion ? "Đang thảo luận — click để xem trong panel phải" : "Đã xác nhận"}
                                title={
                                  isDiscussion
                                    ? "⚠ Đang thảo luận — Click để xem ý kiến hội đồng bên phải"
                                    : "✓ Đã xác nhận bởi hội đồng"
                                }
                              >
                                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-extrabold">
                                  {e?.initials ?? empId.slice(-3)}
                                </span>
                                <span className="max-w-[120px] truncate">{e?.name ?? empId}</span>
                                <span className="ml-auto flex-shrink-0">
                                  {isDiscussion ? (
                                    <ArrowUpDown className="h-3.5 w-3.5 text-[#F59E0B]" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 text-[#15803D]" />
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex mt-2 ml-[28px] items-center gap-4 text-[12px] text-[#6B7280]">
                <span>Performance →</span>
                <div className="flex flex-1 justify-between max-w-[520px]">
                  <span>Thấp</span>
                  <span>Trung bình</span>
                  <span>Cao</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-3 py-1 text-[12px] font-semibold text-[#15803D]">
                  {confirmedCount} đã xác nhận ✅
                </span>
                <span className="inline-flex items-center rounded-full bg-[#FEF9C3] px-3 py-1 text-[12px] font-semibold text-[#854D0E]">
                  {discussionCount} đang thảo luận 💬
                </span>
                {locked ? (
                  <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] font-semibold text-[#6B7280]">
                    Kết quả đã khóa
                  </span>
                ) : null}
              </div>

              <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white/70 px-4 py-3">
                <div className="flex flex-wrap items-center gap-4 text-[13px]">
                  <div className="inline-flex items-center gap-2 text-[#854D0E] font-semibold">
                    <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
                    🟡 Đang thảo luận ({discussionCount})
                  </div>
                  <div className="inline-flex items-center gap-2 text-[#15803D] font-semibold">
                    <span className="h-3 w-3 rounded-full bg-[#22C55E]" />
                    🟢 Đã xác nhận ({confirmedCount})
                  </div>
                </div>
                <div className="mt-2 text-[13px] text-[#6B7280]">
                  Hướng dẫn: Click vào chip vàng để xem và quyết định trong panel phải →
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Right: Discussion Panel */}
        <div className="so-card rounded-xl overflow-hidden">
          <div className="border-b border-[#E5E7EB] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GitMerge className="h-4 w-4 text-[#4F46E5]" />
                <div className="text-[16px] font-semibold text-[#374151]">Discussion Panel</div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab("discussion")}
                className={[
                  "rounded-full px-3 py-1.5 text-[12px] font-semibold border",
                  tab === "discussion"
                    ? "border-[#A5B4FC] bg-[#EEF2FF] text-[#4F46E5]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]",
                ].join(" ")}
              >
                Thảo luận ({discussion.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("confirmed")}
                className={[
                  "rounded-full px-3 py-1.5 text-[12px] font-semibold border",
                  tab === "confirmed"
                    ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]",
                ].join(" ")}
              >
                Đã xác nhận ({Object.keys(confirmedMoves).length + 23})
              </button>
            </div>
          </div>

          <div className="min-h-0 flex flex-col">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {tab === "discussion" ? (
                discussion.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-6 py-10 text-center text-[13px] text-[#6B7280]">
                    Không còn case thảo luận.
                  </div>
                ) : (
                  discussion.map((d) => {
                    const e = people.find((x) => x.id === d.employeeId);
                    const from = d.fromCell;
                    const to = d.toCell;
                    return (
                      <div key={d.employeeId} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              {e ? <EmployeeAvatar employee={e} size="sm" /> : null}
                              <div className="min-w-0">
                                <div className="truncate text-[14px] font-semibold text-[#111827]">
                                  {e?.name ?? d.employeeId}
                                </div>
                                <div className="truncate text-[12px] text-[#6B7280]">
                                  {e?.currentRoleTitle ?? "—"}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 text-[13px] text-[#374151]">
                              <span className="font-semibold">Đề xuất:</span> Ô {from} → Ô {to}
                            </div>
                            <div className="mt-1 text-[13px] text-[#6B7280]">
                              <span className="font-semibold text-[#374151]">Lý do đề xuất:</span>{" "}
                              “{d.reason}”
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {d.comments.map((c, idx) => (
                            <div key={idx} className="rounded-lg bg-[#F9FAFB] px-3 py-2">
                              <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
                                <div className="font-semibold text-[#374151]">[{c.by}]</div>
                                <div className="tabular-nums">{c.at}</div>
                              </div>
                              <div className="mt-1 text-[13px] text-[#374151]">{c.text}</div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <div className="relative flex-1">
                            <MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                            <input
                              value={commentDraft[d.employeeId] ?? ""}
                              onChange={(ev) =>
                                setCommentDraft((prev) => ({ ...prev, [d.employeeId]: ev.target.value }))
                              }
                              placeholder="Thêm ý kiến..."
                              className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] outline-none focus:border-[#6366F1]"
                              disabled={locked}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => addComment(d.employeeId)}
                            disabled={locked}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#4F46E5] px-3 py-2 text-[13px] font-semibold text-white disabled:opacity-40"
                          >
                            <Send className="h-4 w-4" />
                            Gửi
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => keepAsIs(d.employeeId)}
                            disabled={locked}
                            className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold text-[#374151] disabled:opacity-40"
                          >
                            Giữ nguyên
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmMove(d.employeeId)}
                            disabled={locked}
                            className="h-9 rounded-lg bg-[#22C55E] px-3 text-[13px] font-semibold text-white disabled:opacity-40"
                          >
                            ✓ Xác nhận di chuyển
                          </button>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                  <div className="text-[14px] font-semibold text-[#111827]">
                    Đã xác nhận ({Object.keys(confirmedMoves).length + 23})
                  </div>
                  <div className="mt-2 text-[13px] text-[#6B7280]">
                    Các case đã xác nhận sẽ được khóa khi kết thúc phiên.
                  </div>
                  <div className="mt-4 space-y-2">
                    {Object.entries(confirmedMoves).length === 0 ? (
                      <div className="text-[13px] text-[#6B7280]">Chưa xác nhận case nào trong phiên này.</div>
                    ) : (
                      Object.entries(confirmedMoves).map(([empId, cellNum]) => {
                        const e = people.find((x) => x.id === empId);
                        return (
                          <div key={empId} className="flex items-center justify-between gap-3 rounded-lg bg-[#F0FDF4] px-3 py-2">
                            <div className="flex items-center gap-3 min-w-0">
                              {e ? <EmployeeAvatar employee={e} size="sm" /> : null}
                              <div className="truncate text-[13px] font-semibold text-[#111827]">
                                {e?.name ?? empId}
                              </div>
                            </div>
                            <span className="text-[12px] font-semibold text-[#15803D]">
                              → Ô {cellNum}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Audit log */}
            <div className="border-t border-[#E5E7EB] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-[#374151]">Audit log</div>
                <button
                  type="button"
                  className="text-[12px] font-semibold text-[#6B7280] hover:text-[#111827]"
                  onClick={() => showToast("Export audit log (mock)")}
                >
                  Export
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {audit.slice(0, 3).map((a, idx) => (
                  <div key={idx} className="text-[12px] text-[#6B7280]">
                    <span className="font-semibold tabular-nums">{a.at}</span> · {a.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lock confirm modal */}
      {lockModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <div className="text-[16px] font-bold text-[#111827]">Khóa kết quả</div>
              <button
                type="button"
                onClick={() => setLockModal(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827]"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4 text-[13px] text-[#374151] leading-6">
              Kết quả sẽ bị khóa và không thể chỉnh sửa. Tiếp tục?
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
              <button
                type="button"
                onClick={() => setLockModal(false)}
                className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold text-[#374151]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocked(true);
                  setLockModal(false);
                  showToast("Kết quả đã khóa — không thể chỉnh sửa");
                }}
                className="h-9 rounded-lg bg-[#4F46E5] px-3 text-[13px] font-semibold text-white"
              >
                Khóa kết quả
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[60] rounded-lg bg-[#111827] px-5 py-3 text-[14px] text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

