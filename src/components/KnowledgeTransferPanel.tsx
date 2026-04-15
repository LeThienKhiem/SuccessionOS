"use client";

import * as React from "react";
import { Clock, GitMerge } from "lucide-react";
import { employees } from "@/data/employees";
import {
  knowledgeTransferPlans,
  type KnowledgeCategory,
  type KnowledgeTransferPlan,
  type TransferMethod,
} from "@/data/knowledgeTransfer";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import { Button } from "@/components/ui/button";

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

function statusBadge(s: KnowledgeTransferPlan["status"]) {
  if (s === "active") return { text: "Đang thực hiện", cls: "bg-[#DCFCE7] text-[#15803D]" };
  if (s === "completed") return { text: "Hoàn thành", cls: "bg-[#EDE9FE] text-[#6D28D9]" };
  return { text: "Chưa bắt đầu", cls: "bg-[#F3F4F6] text-[#6B7280]" };
}

function categoryTone(c: KnowledgeCategory) {
  const map: Record<KnowledgeCategory, string> = {
    technical: "bg-[#EFF6FF] text-[#1D4ED8]",
    process: "bg-[#F0FDF4] text-[#15803D]",
    relationship: "bg-[#FEF9C3] text-[#854D0E]",
    tacit: "bg-[#F5F3FF] text-[#6D28D9]",
  };
  return map[c];
}

function categoryLabel(c: KnowledgeCategory) {
  const map: Record<KnowledgeCategory, string> = {
    technical: "Technical",
    process: "Process",
    relationship: "Relationship",
    tacit: "Tacit",
  };
  return map[c];
}

function criticalityBar(c: "critical" | "high" | "medium") {
  if (c === "critical") return "#DC2626";
  if (c === "high") return "#F59E0B";
  return "#6B7280";
}

function criticalityBadge(c: "critical" | "high" | "medium") {
  if (c === "critical") return { text: "🔴 Cốt lõi", cls: "text-[#DC2626]" };
  if (c === "high") return { text: "🟠 Quan trọng", cls: "text-[#B45309]" };
  return { text: "⚪ Trung bình", cls: "text-[#6B7280]" };
}

function methodBadge(m: TransferMethod) {
  const map: Record<TransferMethod, string> = {
    shadowing: "👁 Quan sát",
    "co-leading": "🤝 Cùng làm",
    documentation: "📄 Tài liệu hóa",
    mentoring: "💬 Kèm cặp",
    "handover-session": "📋 Bàn giao",
  };
  return map[m] ?? m;
}

export function KnowledgeTransferPanel(props: {
  positionId: string;
  holderId: string;
  successorId: string;
}) {
  const ktp = React.useMemo(() => {
    return knowledgeTransferPlans.find(
      (k) =>
        k.positionId === props.positionId &&
        k.holderId === props.holderId &&
        k.successorId === props.successorId
    );
  }, [props.positionId, props.holderId, props.successorId]);

  const [cat, setCat] = React.useState<KnowledgeCategory | "all">("all");

  if (!ktp) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <GitMerge className="h-8 w-8 text-[#9CA3AF]" />
          <div className="text-[14px] font-semibold text-[#374151]">
            Chưa có kế hoạch chuyển giao tri thức
          </div>
          <div className="text-[13px] text-[#6B7280]">
            KTP cần được thiết lập giữa người đang giữ vị trí và người kế thừa đã xác định
          </div>
          <Button disabled variant="outline" className="rounded-lg">
            Tạo KTP mới (Phase 2)
          </Button>
        </div>
      </div>
    );
  }

  const holder = employees.find((e) => e.id === ktp.holderId);
  const successor = employees.find((e) => e.id === ktp.successorId);
  const items = ktp.knowledgeItems;
  const filtered = cat === "all" ? items : items.filter((i) => i.category === cat);

  const sessionsDone = ktp.sessions.filter((s) => (s.completedItems?.length ?? 0) > 0).length;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <GitMerge className="h-4 w-4 text-[#4F46E5]" />
          <div className="text-[14px] font-semibold text-[#374151]">
            Kế hoạch Chuyển giao Tri thức (KTP)
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${statusBadge(ktp.status).cls}`}
        >
          {statusBadge(ktp.status).text}
        </span>
      </div>
      <div className="text-[12px] text-[#6B7280]">
        {fmtDate(ktp.startDate)} → {fmtDate(ktp.targetDate)}
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="text-[12px] text-[#6B7280]">Tổng tiến độ</div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <div className="text-[16px] font-bold text-[#111827]">{ktp.overallProgress}%</div>
          </div>
          <div className="mt-2 h-[10px] w-full rounded-full bg-[#E5E7EB]">
            <div
              className="h-[10px] rounded-full bg-[#6366F1]"
              style={{ width: `${ktp.overallProgress}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="text-[12px] text-[#6B7280]">Holder đã transfer</div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="text-[16px] font-bold text-[#111827]">{ktp.holderProgress}%</div>
            <div className="text-[12px] text-[#6B7280] truncate max-w-[120px]">
              {holder?.name ?? "—"}
            </div>
          </div>
          <div className="mt-2 h-[8px] w-full rounded-full bg-[#E5E7EB]">
            <div
              className="h-[8px] rounded-full bg-[#14B8A6]"
              style={{ width: `${ktp.holderProgress}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="text-[12px] text-[#6B7280]">Successor đã tiếp nhận</div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="text-[16px] font-bold text-[#111827]">{ktp.successorProgress}%</div>
            <div className="text-[12px] text-[#6B7280] truncate max-w-[120px]">
              {successor?.name ?? "—"}
            </div>
          </div>
          <div className="mt-2 h-[8px] w-full rounded-full bg-[#E5E7EB]">
            <div
              className="h-[8px] rounded-full bg-[#F59E0B]"
              style={{ width: `${ktp.successorProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Knowledge items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="text-[14px] font-semibold text-[#374151]">Danh mục Tri thức</div>
            <span className="rounded-full bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
              {items.length}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "technical", "process", "relationship", "tacit"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setCat(k)}
              className={[
                "rounded-lg border px-3 py-2 text-[13px] font-medium",
                k === cat
                  ? "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]"
                  : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]",
              ].join(" ")}
            >
              {k === "all" ? "Tất cả" : categoryLabel(k)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filtered.map((it) => (
            <div key={it.id} className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
              <div className="h-full border-l-[3px]" style={{ borderLeftColor: criticalityBar(it.criticality) }}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${categoryTone(it.category)}`}>
                      {categoryLabel(it.category)}
                    </span>
                    <span className={`text-[11px] font-semibold ${criticalityBadge(it.criticality).cls}`}>
                      {criticalityBadge(it.criticality).text}
                    </span>
                  </div>

                  <div className="mt-2 text-[13px] font-semibold text-[#111827]">
                    {it.title}
                  </div>
                  <div className="mt-1 text-[12px] text-[#6B7280] line-clamp-2">
                    {it.description}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="inline-flex rounded-md bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-medium text-[#374151] border border-[#E5E7EB]">
                      {methodBadge(it.transferMethod)}
                    </span>

                    {it.status === "completed" ? (
                      <span className="text-[12px] font-semibold text-[#15803D]">✓ 100%</span>
                    ) : it.status === "not-started" ? (
                      <span className="text-[12px] text-[#6B7280]">Chưa bắt đầu</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-[4px] w-[80px] rounded-full bg-[#E5E7EB]">
                          <div
                            className="h-[4px] rounded-full bg-[#6366F1]"
                            style={{ width: `${it.completionPercent}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-semibold text-[#374151]">
                          {it.completionPercent}%
                        </span>
                      </div>
                    )}
                  </div>

                  {it.notes ? (
                    <div className="mt-2 text-[12px] italic text-[#6B7280]">
                      {it.notes}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="text-[14px] font-semibold text-[#374151]">
            Lịch sử buổi chuyển giao
          </div>
          <span className="rounded-full bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280] border border-[#E5E7EB]">
            {ktp.sessions.length} buổi
          </span>
        </div>

        {ktp.nextSession ? (
          <div className="rounded-xl border border-dashed border-[#6366F1] bg-[#EEF2FF] p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-[#6366F1] mt-0.5" />
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#111827]">
                  Buổi tiếp theo: {fmtDate(ktp.nextSession.date)}
                </div>
                <div className="mt-1 text-[13px] text-[#374151]">{ktp.nextSession.topic}</div>
                <div className="mt-2">
                  <span className="inline-flex rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-[#374151] border border-[#C7D2FE]">
                    {methodBadge(ktp.nextSession.type)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {ktp.sessions.map((s, idx) => (
            <div key={s.id} className="flex gap-3">
              <div className="w-[20px] flex flex-col items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6366F1]" />
                {idx < ktp.sessions.length - 1 ? (
                  <span className="mt-1 w-px flex-1 bg-[#E5E7EB]" />
                ) : null}
              </div>
              <div className="flex-1 rounded-xl border border-[#E5E7EB] bg-white p-4">
                <div className="text-[12px] text-[#6B7280]">
                  {fmtDate(s.date)} · {s.duration}
                </div>
                <div className="mt-1 text-[13px] font-medium text-[#111827]">{s.topic}</div>
                <div className="mt-2">
                  <span className="inline-flex rounded-md bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-medium text-[#374151] border border-[#E5E7EB]">
                    {methodBadge(s.type)}
                  </span>
                </div>
                <div className="mt-2 text-[13px] italic text-[#6B7280]">{s.outcome}</div>
                {s.completedItems.length > 0 ? (
                  <div className="mt-2 text-[12px] text-[#15803D] font-semibold">
                    ✓ Hoàn thành {s.completedItems.length} mục tri thức
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {sessionsDone > 0 ? (
          <div className="text-[12px] text-[#6B7280]">
            Tổng: <span className="font-semibold text-[#111827]">{sessionsDone}</span> buổi có mục tri thức đã hoàn thành
          </div>
        ) : null}
      </div>
    </div>
  );
}

