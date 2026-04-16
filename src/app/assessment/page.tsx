"use client";

import * as React from "react";
import {
  ClipboardCheck,
  SlidersHorizontal,
  Save,
  Send,
  CheckCircle,
  Info,
} from "lucide-react";

import { employees } from "@/data/employees";

type CycleType = "annual" | "milestone" | "adhoc";
type SourceKey = "line" | "project" | "degree360";

type DimScores = {
  tech: number;
  perf: number;
  beh: number;
  pot: number;
};

type SourceForm = DimScores & {
  strengths: string;
  development: string;
  notes: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function overallFromDims(d: DimScores) {
  // overallScore = technical*0.4 + performance*0.3 + behavior*0.2 + potential*0.1
  return d.tech * 0.4 + d.perf * 0.3 + d.beh * 0.2 + d.pot * 0.1;
}

function labelFromOverall(o: number) {
  if (o >= 90) return { label: "Xuất sắc", tone: "text-[#15803D]" };
  if (o >= 80) return { label: "Tốt", tone: "text-[#4F46E5]" };
  if (o >= 70) return { label: "Khá", tone: "text-[#B45309]" };
  return { label: "Cần cải thiện", tone: "text-[#DC2626]" };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function SliderRow(props: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  const { label, value, onChange } = props;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[13px] font-semibold text-[#374151]">{label}</div>
        <div className="text-[13px] font-semibold text-[#111827] tabular-nums">{value}</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-[6px] accent-[#4F46E5]"
      />
    </div>
  );
}

function WeightSlider(props: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  const { label, value, onChange } = props;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[13px] font-semibold text-[#374151]">{label}</div>
        <div className="text-[13px] font-semibold text-[#111827] tabular-nums">{value}%</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-[6px] accent-[#4F46E5]"
      />
    </div>
  );
}

export default function AssessmentPage() {
  const [employeeId, setEmployeeId] = React.useState("emp-006");
  const [cycleType, setCycleType] = React.useState<CycleType>("annual");
  const [sourceTab, setSourceTab] = React.useState<SourceKey>("line");

  const [toast, setToast] = React.useState<null | { text: string }>(null);
  const showToast = React.useCallback((text: string) => {
    setToast({ text });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const [weights, setWeights] = React.useState<Record<SourceKey, number>>({
    line: 40,
    project: 40,
    degree360: 20,
  });

  const [forms, setForms] = React.useState<Record<SourceKey, SourceForm>>({
    line: {
      tech: 85,
      perf: 78,
      beh: 82,
      pot: 90,
      strengths: "",
      development: "",
      notes: "",
    },
    project: {
      tech: 80,
      perf: 76,
      beh: 79,
      pot: 84,
      strengths: "",
      development: "",
      notes: "",
    },
    degree360: {
      tech: 75,
      perf: 72,
      beh: 78,
      pot: 80,
      strengths: "",
      development: "",
      notes: "",
    },
  });

  const employee = employees.find((e) => e.id === employeeId) ?? employees[0];

  const sourceOverall = React.useMemo(() => {
    return {
      line: overallFromDims(forms.line),
      project: overallFromDims(forms.project),
      degree360: overallFromDims(forms.degree360),
    };
  }, [forms]);

  function updateForm(source: SourceKey, patch: Partial<SourceForm>) {
    setForms((prev) => ({ ...prev, [source]: { ...prev[source], ...patch } }));
  }

  function setDim(source: SourceKey, key: keyof DimScores, value: number) {
    updateForm(source, { [key]: clamp(value, 0, 100) } as Partial<SourceForm>);
  }

  function adjustWeights(changed: SourceKey, nextValue: number) {
    const next = clamp(Math.round(nextValue), 0, 100);
    const others = (["line", "project", "degree360"] as const).filter((k) => k !== changed);
    const remaining = 100 - next;

    const a = others[0];
    const b = others[1];
    const currA = weights[a];
    const currB = weights[b];
    const sum = currA + currB;

    let nextA = 0;
    let nextB = 0;

    if (remaining === 0) {
      nextA = 0;
      nextB = 0;
    } else if (sum <= 0) {
      nextA = Math.round(remaining / 2);
      nextB = remaining - nextA;
    } else {
      nextA = Math.round((remaining * currA) / sum);
      nextB = remaining - nextA;
    }

    setWeights({ ...weights, [changed]: next, [a]: nextA, [b]: nextB });
  }

  const activeForm = forms[sourceTab];
  const activeOverall = sourceOverall[sourceTab];
  const activeMeta = labelFromOverall(activeOverall);

  const merged = React.useMemo(() => {
    const wLine = weights.line / 100;
    const wProj = weights.project / 100;
    const w360 = weights.degree360 / 100;

    const mergedDims: DimScores = {
      tech: forms.line.tech * wLine + forms.project.tech * wProj + forms.degree360.tech * w360,
      perf: forms.line.perf * wLine + forms.project.perf * wProj + forms.degree360.perf * w360,
      beh: forms.line.beh * wLine + forms.project.beh * wProj + forms.degree360.beh * w360,
      pot: forms.line.pot * wLine + forms.project.pot * wProj + forms.degree360.pot * w360,
    };

    const mergedOverall =
      sourceOverall.line * wLine + sourceOverall.project * wProj + sourceOverall.degree360 * w360;

    const formula = {
      a: round1(sourceOverall.line),
      b: round1(sourceOverall.project),
      c: round1(sourceOverall.degree360),
      wA: weights.line,
      wB: weights.project,
      wC: weights.degree360,
      pA: round1(round1(sourceOverall.line) * (weights.line / 100)),
      pB: round1(round1(sourceOverall.project) * (weights.project / 100)),
      pC: round1(round1(sourceOverall.degree360) * (weights.degree360 / 100)),
    };

    return {
      mergedDims,
      mergedOverall,
      formula,
      meta: labelFromOverall(mergedOverall),
    };
  }, [forms, sourceOverall, weights]);

  const weightSum = weights.line + weights.project + weights.degree360;
  const cycleLabel =
    cycleType === "annual"
      ? "Đánh giá thường niên"
      : cycleType === "milestone"
        ? "Đánh giá theo mốc dự án"
        : "Đánh giá đột xuất";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-[13px] text-[#6B7280]">Phát triển · Đánh giá</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold text-[#111827]">
              Đánh giá năng lực — Chu kỳ 2024
            </h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Nhập điểm theo 3 nguồn (Line / Project / 360°) và xem điểm tổng hợp cuối.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2">
              <ClipboardCheck className="h-4 w-4 text-[#4F46E5]" />
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="bg-transparent text-[13px] text-[#111827] outline-none"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2">
              <SlidersHorizontal className="h-4 w-4 text-[#6B7280]" />
              <select
                value={cycleType}
                onChange={(e) => setCycleType(e.target.value as CycleType)}
                className="bg-transparent text-[13px] text-[#111827] outline-none"
              >
                <option value="annual">Đánh giá thường niên</option>
                <option value="milestone">Đánh giá theo mốc dự án</option>
                <option value="adhoc">Đánh giá đột xuất</option>
              </select>
            </div>
          </div>
        </div>
        <hr className="border-[#E5E7EB]" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr,320px]">
        {/* Left: form */}
        <div className="so-card rounded-xl p-6">
          {/* Employee summary */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-[#111827] truncate">
                {employee?.name ?? "—"}
              </div>
              <div className="text-[13px] text-[#6B7280] truncate">
                {employee?.currentRoleTitle ?? "—"} · {cycleLabel}
              </div>
            </div>
            <div className="text-[12px] text-[#6B7280]">
              Trọng số hiện tại: Line {weights.line}% · Project {weights.project}% · 360°{" "}
              {weights.degree360}%
            </div>
          </div>

          {/* Source tabs */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {(
              [
                { key: "line", label: "Quản lý trực tiếp (Line)", w: weights.line },
                { key: "project", label: "Dự án (Project)", w: weights.project },
                { key: "degree360", label: "360° Feedback", w: weights.degree360 },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSourceTab(t.key)}
                className={[
                  "rounded-full px-4 py-2 text-[13px] font-semibold border transition",
                  sourceTab === t.key
                    ? "border-[#A5B4FC] bg-[#EEF2FF] text-[#4F46E5]"
                    : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]",
                ].join(" ")}
              >
                {t.label} — {t.w}%
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr,260px]">
            <div className="space-y-5">
              <SliderRow
                label="Chuyên môn kỹ thuật"
                value={activeForm.tech}
                onChange={(v) => setDim(sourceTab, "tech", v)}
              />
              <SliderRow
                label="Kết quả & Hiệu suất"
                value={activeForm.perf}
                onChange={(v) => setDim(sourceTab, "perf", v)}
              />
              <SliderRow
                label="Hành vi & Thái độ"
                value={activeForm.beh}
                onChange={(v) => setDim(sourceTab, "beh", v)}
              />
              <SliderRow
                label="Tiềm năng phát triển"
                value={activeForm.pot}
                onChange={(v) => setDim(sourceTab, "pot", v)}
              />

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-[13px] font-semibold text-[#374151]">Điểm mạnh nổi bật</div>
                  <textarea
                    value={activeForm.strengths}
                    onChange={(e) => updateForm(sourceTab, { strengths: e.target.value })}
                    className="min-h-[110px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#A5B4FC]"
                    placeholder="Nhập các điểm mạnh chính..."
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[13px] font-semibold text-[#374151]">Cần phát triển</div>
                  <textarea
                    value={activeForm.development}
                    onChange={(e) => updateForm(sourceTab, { development: e.target.value })}
                    className="min-h-[110px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#A5B4FC]"
                    placeholder="Nhập các khoảng trống năng lực..."
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[13px] font-semibold text-[#374151]">Nhận xét</div>
                  <textarea
                    value={activeForm.notes}
                    onChange={(e) => updateForm(sourceTab, { notes: e.target.value })}
                    className="min-h-[110px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#A5B4FC]"
                    placeholder="Nhận xét tổng quan..."
                  />
                </div>
              </div>
            </div>

            {/* Computed overall card */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Điểm tổng hợp (readonly)
              </div>
              <div className="mt-3 grid place-items-center rounded-xl bg-[#EEF2FF] px-4 py-6 text-center">
                <div className="text-[34px] font-extrabold text-[#111827] tabular-nums">
                  {round1(activeOverall)} / 100
                </div>
                <div className={["mt-1 text-[14px] font-semibold", activeMeta.tone].join(" ")}>
                  {activeMeta.label}
                </div>
              </div>
              <div className="mt-4 text-[13px] text-[#6B7280] leading-6">
                <span className="font-semibold text-[#374151]">Công thức:</span>{" "}
                tech×0.4 + perf×0.3 + beh×0.2 + pot×0.1
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                <div className="rounded-lg bg-[#F9FAFB] px-3 py-2">
                  <div className="text-[#6B7280]">Tech</div>
                  <div className="font-semibold text-[#111827] tabular-nums">{activeForm.tech}</div>
                </div>
                <div className="rounded-lg bg-[#F9FAFB] px-3 py-2">
                  <div className="text-[#6B7280]">Perf</div>
                  <div className="font-semibold text-[#111827] tabular-nums">{activeForm.perf}</div>
                </div>
                <div className="rounded-lg bg-[#F9FAFB] px-3 py-2">
                  <div className="text-[#6B7280]">Behavior</div>
                  <div className="font-semibold text-[#111827] tabular-nums">{activeForm.beh}</div>
                </div>
                <div className="rounded-lg bg-[#F9FAFB] px-3 py-2">
                  <div className="text-[#6B7280]">Potential</div>
                  <div className="font-semibold text-[#111827] tabular-nums">{activeForm.pot}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Merged score highlight */}
          <div className="mt-6 rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-[#111827]">Điểm tổng hợp cuối (Merged)</div>
                <div className="mt-1 text-[13px] text-[#374151]">
                  Merged = (Line {merged.formula.a} × {merged.formula.wA}%) + (Project {merged.formula.b} ×{" "}
                  {merged.formula.wB}%) + (360° {merged.formula.c} × {merged.formula.wC}%)
                </div>
                <div className="mt-1 text-[13px] text-[#374151] tabular-nums">
                  = {merged.formula.pA} + {merged.formula.pB} + {merged.formula.pC} ={" "}
                  <span className="font-bold">{round1(merged.mergedOverall)}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[34px] font-extrabold text-[#111827] tabular-nums">
                  {round1(merged.mergedOverall)} / 100
                </div>
                <div className={["text-[14px] font-semibold", merged.meta.tone].join(" ")}>
                  {merged.meta.label}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  { k: "tech", label: "Tech" },
                  { k: "perf", label: "Perf" },
                  { k: "beh", label: "Behavior" },
                  { k: "pot", label: "Potential" },
                ] as const
              ).map((x) => (
                <div key={x.k} className="rounded-lg bg-white/70 px-3 py-2">
                  <div className="text-[12px] text-[#6B7280]">{x.label}</div>
                  <div className="text-[14px] font-bold text-[#111827] tabular-nums">
                    {round1(merged.mergedDims[x.k])}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-[#A5B4FC] bg-white px-4 py-2 text-[14px] font-semibold text-[#4F46E5]"
                onClick={() => showToast("Đã lưu nháp")}
              >
                <Save className="h-4 w-4" />
                Lưu nháp
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2 text-[14px] font-semibold text-white"
                onClick={() => showToast("Đã gửi phê duyệt (mock)")}
              >
                <Send className="h-4 w-4" />
                Gửi phê duyệt
              </button>
              <div className="inline-flex items-center gap-2 text-[13px] text-[#6B7280]">
                <Info className="h-4 w-4" />
                Demo prototype — không gọi API, không lưu DB
              </div>
            </div>
          </div>
        </div>

        {/* Right: weight config */}
        <div className="so-card rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[14px] font-bold text-[#111827]">Cấu hình trọng số</div>
              <div className="mt-1 text-[13px] text-[#6B7280]">
                Tổng phải = 100%. Kéo 1 slider sẽ tự cân phần còn lại.
              </div>
            </div>
            <div
              className={[
                "shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold",
                weightSum === 100 ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#DC2626]",
              ].join(" ")}
            >
              {weightSum === 100 ? <CheckCircle className="h-4 w-4" /> : null}
              Tổng: {weightSum}%
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <WeightSlider
              label="Quản lý trực tiếp"
              value={weights.line}
              onChange={(v) => adjustWeights("line", v)}
            />
            <WeightSlider
              label="Dự án"
              value={weights.project}
              onChange={(v) => adjustWeights("project", v)}
            />
            <WeightSlider
              label="360° Feedback"
              value={weights.degree360}
              onChange={(v) => adjustWeights("degree360", v)}
            />

            <button
              type="button"
              className="mt-2 w-full rounded-lg bg-[#4F46E5] py-2 text-[14px] font-semibold text-white"
              onClick={() => showToast("Đã lưu trọng số")}
            >
              Lưu cấu hình
            </button>
          </div>

          <div className="mt-5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">
              Gợi ý cho demo
            </div>
            <div className="mt-2 text-[13px] text-[#374151] leading-6">
              - Kéo trọng số để thấy{" "}
              <span className="font-semibold text-[#111827]">Merged Score</span> thay đổi realtime
              <br />
              - Dùng 3 tabs để nhập điểm theo từng nguồn
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[60] rounded-lg bg-[#111827] px-5 py-3 text-[14px] text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

