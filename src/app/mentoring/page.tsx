"use client";

import * as React from "react";
import { ArrowRight, Plus, X } from "lucide-react";

import { employees } from "@/data/employees";
import { mentoringPairs, mentoringSessions, type MentoringPair, type MentoringSession } from "@/data/mentoring";
import type { Employee } from "@/data/types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hoursLabel(done: number, total: number) {
  return `${done}/${total}h`;
}

type PairPace = "ahead" | "on_track" | "behind";

function pairPace(pair: MentoringPair): PairPace {
  const { completedHours: done, commitmentHours: total } = pair;
  if (total <= 0) return "on_track";
  if (done > total) return "ahead";
  if (done / total < 0.7) return "behind";
  return "on_track";
}

function paceMeta(pace: PairPace) {
  if (pace === "ahead")
    return {
      label: "Vượt cam kết",
      listBar: "linear-gradient(90deg, #4ADE80, #22C55E)",
      detailBar: "linear-gradient(90deg, #4ADE80, #22C55E)",
      badgeClass: "bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]",
      listBadgeClass: "bg-[#DCFCE7] text-[#15803D]",
    };
  if (pace === "behind")
    return {
      label: "Chậm tiến độ",
      listBar: "linear-gradient(90deg, #FCA5A5, #F87171)",
      detailBar: "linear-gradient(90deg, #FCA5A5, #F87171)",
      badgeClass: "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]",
      listBadgeClass: "bg-[#FEF2F2] text-[#991B1B]",
    };
  return {
    label: "Đúng tiến độ",
    listBar: "linear-gradient(90deg, #60A5FA, #3B82F6)",
    detailBar: "linear-gradient(90deg, #60A5FA, #3B82F6)",
    badgeClass: "bg-[#EEF2FF] border-[#A5B4FC] text-[#4F46E5]",
    listBadgeClass: "bg-[#EEF2FF] text-[#4F46E5]",
  };
}

function trackBadgeClass(track: MentoringPair["track"]) {
  return track === "technical"
    ? "bg-[#EEF2FF] text-[#4F46E5]"
    : "bg-[#F0FDF4] text-[#15803D]";
}

function trackLabel(track: MentoringPair["track"]) {
  return track === "technical" ? "Technical" : "Leadership";
}

function parseSessionDate(d: string) {
  const parts = d.split("/").map(Number);
  if (parts.length !== 3) return 0;
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return 0;
  return new Date(yyyy, mm - 1, dd).getTime();
}

function monthsSinceStart(startMonth: string) {
  const parts = startMonth.split("/").map(Number);
  if (parts.length !== 2) return 0;
  const [mm, yyyy] = parts;
  if (!mm || !yyyy) return 0;
  const start = new Date(yyyy, mm - 1, 1);
  const end = new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, months);
}

function gradientStyle(seed: string): React.CSSProperties {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const pairs = [
    ["#6366F1", "#8B5CF6"],
    ["#0D9488", "#14B8A6"],
    ["#2563EB", "#38BDF8"],
    ["#DB2777", "#F472B6"],
    ["#EA580C", "#FBBF24"],
  ] as const;
  const c = pairs[h % pairs.length];
  return { background: `linear-gradient(135deg, ${c[0]}, ${c[1]})` };
}

function GradientAvatar(props: { seed: string; initials: string; size: number }) {
  const { seed, initials, size } = props;
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        ...gradientStyle(seed),
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function personBlock(props: {
  employee: Employee | undefined;
  roleLabel: string;
  labelClass: string;
  avatarSize: number;
}) {
  const e = props.employee;
  const initials = e?.initials ?? "—";
  return (
    <div className="min-w-0">
      <GradientAvatar seed={e?.id ?? props.roleLabel} initials={initials} size={props.avatarSize} />
      <div className="mt-2 truncate text-[14px] font-semibold text-[#111827]">{e?.name ?? "—"}</div>
      <div className="truncate text-[12px] text-[#6B7280]">{e?.currentRoleTitle ?? "—"}</div>
      <div className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${props.labelClass}`}>{props.roleLabel}</div>
    </div>
  );
}

function PairList(props: {
  pairs: MentoringPair[];
  selectedPairId: string;
  onSelect: (id: string) => void;
  onCreateClick: () => void;
}) {
  return (
    <div
      className="flex h-full min-h-0 flex-col bg-white"
      style={{ borderRight: "1px solid #E5E7EB" }}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-2"
        style={{ padding: "14px 16px", borderBottom: "1px solid #E5E7EB" }}
      >
        <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">
          {props.pairs.length} cặp đang theo dõi
        </div>
        <button
          type="button"
          onClick={props.onCreateClick}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#374151] hover:bg-[#F9FAFB]"
        >
          <Plus className="h-3.5 w-3.5" />
          Tạo cặp mới
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {props.pairs.map((p) => {
          const m = employees.find((e) => e.id === p.mentorId);
          const t = employees.find((e) => e.id === p.menteeId);
          const active = p.id === props.selectedPairId;
          const pace = pairPace(p);
          const meta = paceMeta(pace);
          const pct = p.commitmentHours <= 0 ? 0 : Math.min(100, (p.completedHours / p.commitmentHours) * 100);
          const barW = pace === "ahead" ? 100 : clamp(pct, 0, 100);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => props.onSelect(p.id)}
              className={[
                "w-full cursor-pointer text-left transition-colors duration-150",
                active ? "bg-[#EEF2FF]" : "bg-white hover:bg-[#F9FAFB]",
              ].join(" ")}
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #F3F4F6",
                borderLeft: active ? "3px solid #6366F1" : "3px solid transparent",
                paddingLeft: active ? 13 : 16,
              }}
            >
              <div className="flex items-center gap-2">
                <GradientAvatar seed={p.mentorId} initials={m?.initials ?? "?"} size={28} />
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
                <GradientAvatar seed={p.menteeId} initials={t?.initials ?? "?"} size={28} />
                <div
                  className="min-w-0 truncate text-[13px] font-semibold"
                  style={{ color: active ? "#4F46E5" : "#111827" }}
                >
                  {m?.initials ?? p.mentorId} kèm {t?.initials ?? p.menteeId}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${trackBadgeClass(p.track)}`}>
                  {trackLabel(p.track)}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${meta.listBadgeClass}`}>
                  {meta.label}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 min-w-0 flex-1 rounded-full bg-[#F3F4F6]">
                  <div className="h-1.5 rounded-full" style={{ width: `${barW}%`, background: meta.listBar }} />
                </div>
                <span className="shrink-0 text-right text-[11px] text-[#6B7280]">{hoursLabel(p.completedHours, p.commitmentHours)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PairDetail({
  pair,
  mentor,
  mentee,
  sessions,
  sessionForm,
  setSessionForm,
  formRef,
  onAddSession,
  onCancelForm,
  onScrollToForm,
}: {
  pair: MentoringPair;
  mentor: Employee | undefined;
  mentee: Employee | undefined;
  sessions: MentoringSession[];
  sessionForm: {
    date: string;
    durationMin: number;
    topic: string;
    outcome: string;
  };
  setSessionForm: React.Dispatch<
    React.SetStateAction<{
      date: string;
      durationMin: number;
      topic: string;
      outcome: string;
    }>
  >;
  formRef: React.RefObject<HTMLDivElement | null>;
  onAddSession: () => void;
  onCancelForm: () => void;
  onScrollToForm: () => void;
}) {
  const pace = pairPace(pair);
  const meta = paceMeta(pace);
  const done = pair.completedHours;
  const total = pair.commitmentHours;
  const pctRaw = total <= 0 ? 0 : (done / total) * 100;
  const barFillW = pace === "ahead" ? 100 : clamp(pctRaw, 0, 100);
  const overflowH = pace === "ahead" ? Math.max(0, Math.round(done - total)) : 0;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#F9FAFB] p-6">
      <div className="mb-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center lg:justify-start lg:gap-5">
            {personBlock({
              employee: mentor,
              roleLabel: "Mentor",
              labelClass: "text-[#4F46E5]",
              avatarSize: 44,
            })}
            <ArrowRight className="hidden h-6 w-6 shrink-0 text-[#6366F1] sm:block" />
            <ArrowRight className="h-5 w-5 shrink-0 rotate-90 text-[#6366F1] sm:hidden" />
            {personBlock({
              employee: mentee,
              roleLabel: "Mentee",
              labelClass: "text-[#0D9488]",
              avatarSize: 44,
            })}
          </div>

          <div className="grid shrink-0 gap-2 text-[13px] text-[#374151] lg:text-right">
            <div>
              <span className="text-[#6B7280]">Bắt đầu: </span>
              <span className="font-semibold text-[#111827]">{pair.startMonth}</span>
            </div>
            <div>
              <span className="text-[#6B7280]">Tuyến: </span>
              <span className="font-semibold text-[#111827]">{trackLabel(pair.track)}</span>
            </div>
            <div>
              <span className="text-[#6B7280]">Thời gian: </span>
              <span className="font-semibold text-[#111827]">{monthsSinceStart(pair.startMonth)} tháng</span>
            </div>
          </div>
        </div>

        <hr className="my-4 border-[#E5E7EB]" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="shrink-0">
            <div className="text-[12px] text-[#6B7280]">Cam kết giờ</div>
            <div className="mt-1 text-[20px] font-bold text-[#111827]">
              {done} / {total} giờ
            </div>
          </div>

          <div className="relative min-w-0 flex-1 px-0 pr-14 lg:px-6 lg:pr-16">
            <div className="relative h-2.5 w-full rounded-full bg-[#F3F4F6] lg:h-[10px]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${barFillW}%`,
                  background: meta.detailBar,
                }}
              />
            </div>
            {pace === "ahead" && overflowH > 0 ? (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-bold text-[#15803D]">
                +{overflowH}h
              </span>
            ) : null}
          </div>

          <div className="shrink-0">
            <span className={`inline-flex rounded-full border px-3 py-1.5 text-[12px] font-semibold ${meta.badgeClass}`}>
              {meta.label}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[15px] font-semibold text-[#111827]">Nhật ký buổi kèm cặp</div>
        <button
          type="button"
          onClick={onScrollToForm}
          className="inline-flex items-center gap-1 rounded-lg border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#374151] hover:bg-[#F9FAFB]"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm buổi mới
        </button>
      </div>

      <div className="relative pl-1">
        {sessions.length > 1 ? (
          <div
            className="absolute bottom-10 left-[11px] top-4 border-l-2 border-dashed border-[#E5E7EB]"
            aria-hidden
          />
        ) : null}
        <div className="space-y-0">
          {sessions.map((s) => (
            <div key={s.id} className="relative pb-10 last:pb-0">
              <div className="ml-5 min-w-0 rounded-xl border border-[#E5E7EB] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#14B8A6]" aria-hidden />
                    <span className="text-[12px] font-medium text-[#111827]">{s.date}</span>
                    <span className="ml-2 rounded-md bg-[#F0EFFE] px-2 py-0.5 text-[11px] font-semibold text-[#6366F1]">
                      {s.durationMin} phút
                    </span>
                  </div>
                  {s.confirmed ? (
                    <span className="shrink-0 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-semibold text-[#15803D]">
                      ✓ Đã xác nhận
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-[#FEF9C3] px-2 py-0.5 text-[11px] font-semibold text-[#92400E]">
                      Chờ xác nhận
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[13px] font-medium text-[#111827]">{s.topic}</div>
                <div className="mt-1 text-[12px] italic leading-relaxed text-[#6B7280]">{s.outcome}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={formRef} className="mt-2 rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="text-[12px] font-semibold text-[#6B7280]">Ngày buổi học</div>
            <input
              value={sessionForm.date}
              onChange={(e) => setSessionForm((f) => ({ ...f, date: e.target.value }))}
              className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
            />
          </div>
          <div className="space-y-1">
            <div className="text-[12px] font-semibold text-[#6B7280]">Thời lượng (phút)</div>
            <input
              type="number"
              value={sessionForm.durationMin}
              min={15}
              max={240}
              onChange={(e) => setSessionForm((f) => ({ ...f, durationMin: Number(e.target.value) }))}
              className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
            />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-[12px] font-semibold text-[#6B7280]">Chủ đề buổi học</div>
          <input
            value={sessionForm.topic}
            onChange={(e) => setSessionForm((f) => ({ ...f, topic: e.target.value }))}
            placeholder="VD: Client PVN negotiation strategy"
            className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
          />
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-[12px] font-semibold text-[#6B7280]">Kết quả / Ghi chú</div>
          <textarea
            value={sessionForm.outcome}
            onChange={(e) => setSessionForm((f) => ({ ...f, outcome: e.target.value }))}
            placeholder="VD: Mentee đã tự xử lý 2 meetings độc lập sau buổi này"
            className="min-h-[100px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#6366F1]"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelForm}
            className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-[13px] font-semibold text-[#374151] hover:bg-[#F9FAFB]"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onAddSession}
            className="rounded-lg bg-[#4F46E5] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#4338CA]"
          >
            ✓ Xác nhận buổi học
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MentoringPage() {
  const [selectedPairId, setSelectedPairId] = React.useState<string>("pair-lth-ntp");
  const [toast, setToast] = React.useState<null | { text: string }>(null);
  const showToast = React.useCallback((text: string) => {
    setToast({ text });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const [pairs, setPairs] = React.useState<MentoringPair[]>(mentoringPairs);
  const [sessions, setSessions] = React.useState<MentoringSession[]>(mentoringSessions);

  const selectedPair = pairs.find((p) => p.id === selectedPairId) ?? pairs[0];
  const mentor = employees.find((e) => e.id === selectedPair.mentorId);
  const mentee = employees.find((e) => e.id === selectedPair.menteeId);

  const pairSessions = React.useMemo(() => {
    return sessions
      .filter((s) => s.pairId === selectedPair.id)
      .slice()
      .sort((a, b) => parseSessionDate(b.date) - parseSessionDate(a.date));
  }, [selectedPair.id, sessions]);

  const [createModal, setCreateModal] = React.useState(false);
  const [newPair, setNewPair] = React.useState<{
    mentorId: string;
    menteeId: string;
    track: "technical" | "leadership";
    commitmentHours: number;
  }>({
    mentorId: "emp-001",
    menteeId: "emp-019",
    track: "technical",
    commitmentHours: 24,
  });

  const formRef = React.useRef<HTMLDivElement>(null);

  const defaultSessionForm = React.useCallback(
    () => ({
      date: "05/04/2025",
      durationMin: 60,
      topic: "",
      outcome: "",
    }),
    []
  );

  const [sessionForm, setSessionForm] = React.useState(defaultSessionForm);

  function addSession() {
    if (!sessionForm.topic.trim() || !sessionForm.outcome.trim()) {
      showToast("Vui lòng nhập Chủ đề và Kết quả");
      return;
    }
    const s: MentoringSession = {
      id: `s-${Math.random().toString(16).slice(2, 8)}`,
      pairId: selectedPair.id,
      date: sessionForm.date,
      durationMin: sessionForm.durationMin,
      topic: sessionForm.topic.trim(),
      location: "—",
      outcome: sessionForm.outcome.trim(),
      confirmed: true,
    };
    setSessions((prev) => [...prev, s]);

    const addHours = Math.round((sessionForm.durationMin / 60) * 10) / 10;
    setPairs((prev) =>
      prev.map((p) =>
        p.id === selectedPair.id ? { ...p, completedHours: Math.round((p.completedHours + addHours) * 10) / 10 } : p
      )
    );

    setSessionForm(defaultSessionForm());
    showToast("Đã thêm session vào log-book");
  }

  function cancelSessionForm() {
    setSessionForm(defaultSessionForm());
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <p className="text-[13px] text-[#6B7280]">Phát triển</p>
        <h1 className="text-[24px] font-semibold text-[#111827]">Kèm cặp &amp; Cố vấn</h1>
        <p className="text-[14px] text-[#6B7280]">
          Theo dõi các cặp mentor-mentee, log-book và mức độ cam kết giờ hàng tháng.
        </p>
        <hr className="border-[#E5E7EB]" />
      </div>

      <div
        className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: 0,
          minHeight: "600px",
        }}
      >
        <PairList
          pairs={pairs}
          selectedPairId={selectedPairId}
          onSelect={setSelectedPairId}
          onCreateClick={() => setCreateModal(true)}
        />
        <PairDetail
          pair={selectedPair}
          mentor={mentor}
          mentee={mentee}
          sessions={pairSessions}
          sessionForm={sessionForm}
          setSessionForm={setSessionForm}
          formRef={formRef}
          onAddSession={addSession}
          onCancelForm={cancelSessionForm}
          onScrollToForm={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })}
        />
      </div>

      {createModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] p-5">
              <div className="text-[16px] font-bold text-[#111827]">Tạo cặp mới</div>
              <button
                type="button"
                onClick={() => setCreateModal(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827]"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[12px] font-semibold text-[#6B7280]">Mentor</div>
                  <select
                    value={newPair.mentorId}
                    onChange={(e) => setNewPair((p) => ({ ...p, mentorId: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="text-[12px] font-semibold text-[#6B7280]">Mentee</div>
                  <select
                    value={newPair.menteeId}
                    onChange={(e) => setNewPair((p) => ({ ...p, menteeId: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[12px] font-semibold text-[#6B7280]">Tuyến</div>
                  <select
                    value={newPair.track}
                    onChange={(e) => setNewPair((p) => ({ ...p, track: e.target.value as "technical" | "leadership" }))}
                    className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
                  >
                    <option value="technical">Technical</option>
                    <option value="leadership">Leadership</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="text-[12px] font-semibold text-[#6B7280]">Giờ cam kết (tổng)</div>
                  <input
                    type="number"
                    min={4}
                    max={200}
                    value={newPair.commitmentHours}
                    onChange={(e) => setNewPair((p) => ({ ...p, commitmentHours: Number(e.target.value) }))}
                    className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#E5E7EB] p-5">
              <div className="text-[12px] text-[#6B7280]">Prototype demo — không lưu DB</div>
              <button
                type="button"
                onClick={() => {
                  if (newPair.mentorId === newPair.menteeId) {
                    showToast("Mentor và mentee không được trùng nhau");
                    return;
                  }
                  const id = `pair-${Math.random().toString(16).slice(2, 6)}`;
                  const p: MentoringPair = {
                    id,
                    mentorId: newPair.mentorId,
                    menteeId: newPair.menteeId,
                    track: newPair.track,
                    startMonth: "04/2025",
                    commitmentHours: newPair.commitmentHours,
                    completedHours: 0,
                    status: "active",
                  };
                  setPairs((prev) => [p, ...prev]);
                  setSelectedPairId(id);
                  setCreateModal(false);
                  showToast("Đã tạo cặp mới");
                }}
                className="h-10 rounded-lg bg-[#4F46E5] px-4 text-[14px] font-semibold text-white"
              >
                Tạo cặp
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
