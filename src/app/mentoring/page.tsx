"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, Plus, Users2, X } from "lucide-react";

import { employees } from "@/data/employees";
import { mentoringPairs, mentoringSessions, type MentoringPair, type MentoringSession } from "@/data/mentoring";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hoursLabel(done: number, total: number) {
  return `${done}/${total}h`;
}

function pairBadge(pair: MentoringPair) {
  if (pair.completedHours > pair.commitmentHours) {
    return {
      label: "Vượt cam kết",
      className: "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]",
      sub: `${pair.completedHours}h / ${pair.commitmentHours}h`,
    };
  }
  if (pair.completedHours < pair.commitmentHours * 0.6) {
    return {
      label: "Chậm tiến độ",
      className: "bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]",
      sub: `${pair.completedHours}h / ${pair.commitmentHours}h`,
    };
  }
  return {
    label: pair.status === "paused" ? "Paused" : pair.status === "completed" ? "Completed" : "Active",
    className: "bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]",
    sub: `${pair.completedHours}h / ${pair.commitmentHours}h`,
  };
}

function statusPill(pair: MentoringPair) {
  if (pair.status === "completed") return { label: "completed", cls: "bg-[#DCFCE7] text-[#15803D]" };
  if (pair.status === "paused") return { label: "paused", cls: "bg-[#FEF9C3] text-[#854D0E]" };
  return { label: "active", cls: "bg-[#EEF2FF] text-[#4F46E5]" };
}

function progressPct(done: number, total: number) {
  if (total <= 0) return 0;
  return clamp(Math.round((done / total) * 100), 0, 120);
}

export default function MentoringPage() {
  const [selectedPairId, setSelectedPairId] = React.useState<string>("pair-002"); // LTH → NTP default for demo
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

  const selectedSessions = React.useMemo(() => {
    return sessions
      .filter((s) => s.pairId === selectedPair.id)
      .slice()
      .reverse(); // newest first for demo
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

  const [sessionForm, setSessionForm] = React.useState<{
    date: string;
    durationMin: number;
    topic: string;
    location: string;
    outcome: string;
    confirmed: boolean;
  }>({
    date: "05/04/2025",
    durationMin: 60,
    topic: "",
    location: "VP PTSC M&C",
    outcome: "",
    confirmed: true,
  });

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
      location: sessionForm.location.trim() || "—",
      outcome: sessionForm.outcome.trim(),
      confirmed: sessionForm.confirmed,
    };
    setSessions((prev) => [...prev, s]);

    const addHours = Math.round((sessionForm.durationMin / 60) * 10) / 10;
    setPairs((prev) =>
      prev.map((p) =>
        p.id === selectedPair.id
          ? { ...p, completedHours: Math.round((p.completedHours + addHours) * 10) / 10 }
          : p
      )
    );

    setSessionForm((f) => ({ ...f, topic: "", outcome: "" }));
    showToast("Đã thêm session vào log-book");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-[13px] text-[#6B7280]">Phát triển</p>
        <h1 className="text-[24px] font-semibold text-[#111827]">Kèm cặp &amp; Cố vấn</h1>
        <p className="text-[14px] text-[#6B7280]">
          Theo dõi các cặp mentor-mentee, log-book và mức độ cam kết giờ hàng tháng.
        </p>
        <hr className="border-[#E5E7EB]" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px,1fr]">
        {/* Left column */}
        <div className="so-card rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-[#EEF2FF] grid place-items-center">
                <Users2 className="h-5 w-5 text-[#4F46E5]" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#111827]">Danh sách cặp</div>
                <div className="text-[12px] text-[#6B7280]">{pairs.length} cặp đang theo dõi</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4F46E5] px-3 py-2 text-[13px] font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Tạo cặp mới
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {pairs.map((p) => {
              const m = employees.find((e) => e.id === p.mentorId);
              const t = employees.find((e) => e.id === p.menteeId);
              const selected = p.id === selectedPairId;
              const badge = pairBadge(p);
              const status = statusPill(p);
              const pct = progressPct(p.completedHours, p.commitmentHours);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPairId(p.id)}
                  className={[
                    "w-full text-left rounded-xl border p-4 transition",
                    selected ? "border-[#A5B4FC] bg-[#EEF2FF]/50" : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {m ? <EmployeeAvatar employee={m} size="sm" /> : null}
                        <ArrowRight className="h-4 w-4 text-[#6B7280]" />
                        {t ? <EmployeeAvatar employee={t} size="sm" /> : null}
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-semibold text-[#111827]">
                            {m?.initials ?? p.mentorId} kèm {t?.initials ?? p.menteeId}
                          </div>
                          <div className="truncate text-[12px] text-[#6B7280]">
                            Bắt đầu: {p.startMonth} · Tuyến: {p.track === "technical" ? "Technical" : "Leadership"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
                          <span>Cam kết giờ</span>
                          <span className="font-semibold text-[#111827]">{hoursLabel(p.completedHours, p.commitmentHours)}</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-[#E5E7EB]">
                          <div
                            className="h-2 rounded-full bg-[#22C55E]"
                            style={{ width: `${clamp(pct, 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className={["rounded-full px-2 py-0.5 text-[11px] font-semibold", status.cls].join(" ")}>
                        {status.label}
                      </span>
                      <span className={["rounded-full px-2 py-0.5 text-[11px] font-semibold", badge.className].join(" ")}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="text-[12px] text-[#6B7280]">{badge.sub}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-[#4F46E5]">Xem log</span>
                      <span className="text-[12px] text-[#6B7280]">·</span>
                      <span className="text-[12px] font-semibold text-[#374151]">Cập nhật</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="so-card rounded-xl overflow-hidden">
          <div className="border-b border-[#E5E7EB] px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-[16px] font-bold text-[#111827]">
                  {mentor?.initials ?? selectedPair.mentorId} kèm {mentee?.initials ?? selectedPair.menteeId}
                </div>
                <div className="mt-1 text-[13px] text-[#6B7280]">
                  Cam kết:{" "}
                  <span className="font-semibold text-[#111827]">{selectedPair.commitmentHours}h</span>{" "}
                  · Đã thực hiện:{" "}
                  <span className="font-semibold text-[#111827]">{selectedPair.completedHours}h</span>
                </div>
              </div>

              <div className="shrink-0">
                {(() => {
                  const b = pairBadge(selectedPair);
                  return (
                    <span className={["inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold", b.className].join(" ")}>
                      {b.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-[#E5E7EB]">
                <div
                  className="h-2 rounded-full bg-[#22C55E]"
                  style={{
                    width: `${clamp(progressPct(selectedPair.completedHours, selectedPair.commitmentHours), 0, 120)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                {selectedPair.completedHours > selectedPair.commitmentHours
                  ? "Đang vượt cam kết — mentor đầu tư nhiều hơn kỳ vọng"
                  : selectedPair.completedHours < selectedPair.commitmentHours * 0.6
                    ? "Chậm tiến độ — rủi ro thiếu thời gian mentoring"
                    : "Đúng tiến độ"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr,360px]">
            {/* Timeline */}
            <div className="min-h-0 border-r border-[#E5E7EB]">
              <div className="max-h-[520px] overflow-y-auto px-5 py-4">
                <div className="space-y-4">
                  {selectedSessions.map((s, idx) => (
                    <div key={s.id} className="relative pl-6">
                      {/* vertical line */}
                      <div className="absolute left-2 top-2 bottom-0 w-px bg-[#E5E7EB]" />
                      <div className="absolute left-1.5 top-2 h-2.5 w-2.5 rounded-full bg-[#4F46E5]" />
                      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-[#111827]">
                              Session {selectedSessions.length - idx} — {s.date}
                            </div>
                            <div className="mt-1 text-[12px] text-[#6B7280]">
                              Chủ đề: {s.topic} · Thời lượng: {s.durationMin} phút · Địa điểm: {s.location}
                            </div>
                          </div>
                          {s.confirmed ? (
                            <div className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-semibold text-[#15803D]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Đã xác nhận
                            </div>
                          ) : (
                            <div className="shrink-0 inline-flex items-center rounded-full bg-[#FEF9C3] px-2 py-0.5 text-[11px] font-semibold text-[#854D0E]">
                              Chờ xác nhận
                            </div>
                          )}
                        </div>
                        <div className="mt-3 text-[13px] text-[#374151] leading-6">
                          <span className="font-semibold">Kết quả:</span> {s.outcome}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add session */}
            <div className="px-5 py-4">
              <div className="text-[14px] font-semibold text-[#111827]">Thêm session mới</div>
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-[12px] font-semibold text-[#6B7280]">Ngày</div>
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

                <div className="space-y-1">
                  <div className="text-[12px] font-semibold text-[#6B7280]">Chủ đề</div>
                  <input
                    value={sessionForm.topic}
                    onChange={(e) => setSessionForm((f) => ({ ...f, topic: e.target.value }))}
                    placeholder="VD: Client negotiation, escalation..."
                    className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-[12px] font-semibold text-[#6B7280]">Địa điểm</div>
                  <input
                    value={sessionForm.location}
                    onChange={(e) => setSessionForm((f) => ({ ...f, location: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-[12px] font-semibold text-[#6B7280]">Kết quả đạt được</div>
                  <textarea
                    value={sessionForm.outcome}
                    onChange={(e) => setSessionForm((f) => ({ ...f, outcome: e.target.value }))}
                    placeholder="VD: Mentee đã độc lập xử lý 2 meetings..."
                    className="min-h-[110px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#6366F1]"
                  />
                </div>

                <label className="flex items-center gap-2 text-[13px] text-[#374151]">
                  <input
                    type="checkbox"
                    checked={sessionForm.confirmed}
                    onChange={(e) => setSessionForm((f) => ({ ...f, confirmed: e.target.checked }))}
                    className="h-4 w-4 rounded border-[#D1D5DB] accent-[#4F46E5]"
                  />
                  Xác nhận buổi học
                </label>

                <button
                  type="button"
                  onClick={addSession}
                  className="mt-1 w-full rounded-lg bg-[#4F46E5] py-2 text-[14px] font-semibold text-white"
                >
                  Thêm vào log-book
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create pair modal */}
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

