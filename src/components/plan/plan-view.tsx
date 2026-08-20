"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlanCtx } from "@/components/plan/plan-context";
import { PlanSectionView } from "@/components/plan/plan-blocks";
import { PlanToc } from "@/components/plan/plan-toc";
import { addHistory } from "@/lib/history-store";
import { Pill } from "@/components/ui/pill";
import { exportPlanPdf, savePlanEdits, type PlanEdit } from "@/lib/api";
import type { Block, InlineNode, PlanDocument, PlanLabel } from "@/types/plan";
import type { School } from "@/types/school";

interface TipTarget {
  ids: string[];
  rect: DOMRect;
}

/** draft = 보기 / editing = 본문 직접 수정 */
type Mode = "draft" | "editing";

const BTN_GHOST =
  "rounded-[0.6875rem] border border-line bg-surface px-[1rem] py-[0.625rem] text-[0.84375rem] font-medium hover:border-faint";
const BTN_PRIMARY =
  "rounded-[0.6875rem] bg-indigo px-[1.125rem] py-[0.6875rem] text-[0.875rem] font-bold text-white hover:bg-indigo-deep";

/** 블록의 원래 문구. DOM 에서 읽은 값과 비교해 무엇이 바뀌었는지 가린다. */
function blockPlainText(block: Block): string | null {
  const flatten = (nodes: InlineNode[]) =>
    nodes
      .map((n) => (typeof n === "string" ? n : "unknown" in n ? n.unknown : n.text))
      .join("");

  switch (block.kind) {
    case "h3":
      return block.text;
    case "p":
    case "note":
    case "notice":
    case "highlight":
      return flatten(block.text);
    default:
      // 표·정의목록 등 구조 블록은 편집 대상이 아니다
      return null;
  }
}

/** 눈에 보이는 공백 차이만으로 "수정됨" 처리되지 않게 정규화한다 */
const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

export function PlanView({ school, plan: initialPlan }: { school: School; plan: PlanDocument }) {
  const [plan, setPlan] = useState(initialPlan);
  const [mode, setMode] = useState<Mode>("draft");
  const [showEvidence, setShowEvidence] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tip, setTip] = useState<TipTarget | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  /**
   * 취소 시 이 값을 올려 본문을 다시 마운트한다.
   * 편집은 DOM에서 직접 일어나므로, 원본 데이터로 새로 그리는 것이 되돌리기다.
   */
  const [resetKey, setResetKey] = useState(0);

  const editing = mode === "editing";

  const evidenceById = useMemo(
    () => Object.fromEntries(plan.evidence.map((e) => [e.id, e])),
    [plan.evidence],
  );

  const closeTip = useCallback(() => {
    setTip(null);
    setPos(null);
  }, []);

  const openTip = useCallback(
    (ids: string[], el: HTMLElement) => {
      const known = ids.filter((id) => evidenceById[id]);
      if (!known.length) return;
      setPos(null);
      setTip({ ids: known, rect: el.getBoundingClientRect() });
    },
    [evidenceById],
  );

  // 툴팁 폭을 잰 뒤 화면 안쪽으로 위치를 보정한다 (보정 전에는 opacity 0)
  useEffect(() => {
    if (!tip || !tipRef.current) return;
    const width = tipRef.current.offsetWidth;
    const centered = tip.rect.left + tip.rect.width / 2 - width / 2;
    const left = Math.max(12, Math.min(centered, window.innerWidth - width - 12));
    setPos({ left: left + window.scrollX, top: tip.rect.bottom + window.scrollY + 8 });
  }, [tip]);

  const startEdit = () => {
    closeTip();
    setMode("editing");
  };

  const cancelEdit = () => {
    setResetKey((k) => k + 1);
    setMode("draft");
  };

  /**
   * 편집한 문단을 서버에 저장한다.
   *
   * <p>contentEditable 은 DOM 에서만 바뀌므로, 저장하지 않으면 페이지를 벗어나는 순간 사라진다.
   * 바뀐 문단만 골라 보내고, 서버는 원본 스냅샷을 그대로 둔 채 덮어쓸 문단만 보관한다.
   */
  const saveEdit = async () => {
    const edits: PlanEdit[] = [];
    plan.sections.forEach((section) => {
      const root = document.querySelector(`[data-section-id="${section.id}"]`);
      if (!root) return;
      section.blocks.forEach((block, index) => {
        const original = blockPlainText(block);
        if (original === null) return;
        const el = root.querySelector<HTMLElement>(`[data-block-index="${index}"]`);
        if (!el) return;
        const current = el.innerText ?? "";
        if (normalize(current) !== normalize(original) && normalize(current).length > 0) {
          edits.push({ sectionId: section.id, blockIndex: index, text: normalize(current) });
        }
      });
    });

    if (edits.length === 0) {
      setMode("draft");
      return;
    }

    setSaving(true);
    try {
      setPlan(await savePlanEdits(plan.id, edits));
      setResetKey((k) => k + 1);   // 서버 응답으로 다시 그린다
      setMode("draft");
    } catch {
      setSaveError("수정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const labels: PlanLabel[] = editing
    ? [{ text: "수정 중", tone: "solid" }, ...plan.labels.slice(1)]
    : plan.labels;

  return (
    <PlanCtx.Provider value={{ showEvidence, editing, evidenceById, openTip, closeTip }}>
      <main className="mx-auto max-w-[71.25rem] px-[1.75rem] pt-[2.25rem] pb-[3.5rem] leading-[1.65]">
        <p className="mb-[1.125rem] text-[0.8125rem] text-muted">
          <Link href="/" className="hover:text-ink">
            홈
          </Link>{" "}
          / <span>{school.name}</span> / <b className="font-semibold text-ink">활용계획안</b>
        </p>

        {/* 결과 헤더 */}
        <div className="mb-[1.5rem] flex items-start justify-between gap-[1.5rem] rounded-[1.125rem] bg-surface px-[1.875rem] py-[1.75rem]">
          <div>
            <div className="mb-[0.75rem] flex flex-wrap gap-[0.375rem]">
              {labels.map((l) => (
                <Pill key={l.text} tone={l.tone}>
                  {l.text}
                </Pill>
              ))}
            </div>
            <h1 className="text-[1.4375rem] leading-[1.35] font-bold tracking-[-0.02em]">
              {plan.title}
            </h1>
            <div className="mt-[0.5rem] text-[0.875rem] text-muted">
              {school.name} · {school.address} · 생성일 {plan.createdAt}
            </div>
            {saveError && (
              <div className="mt-[0.625rem] text-[0.8125rem] font-medium text-amber">
                {saveError}
              </div>
            )}
            {editing && (
              <div className="mt-[0.625rem] text-[0.8125rem] font-medium text-indigo-deep">
                수정 모드입니다. 본문을 클릭해 내용을 직접 고칠 수 있습니다.
              </div>
            )}
          </div>

          <div className="flex flex-none gap-[0.5rem]">
            {editing ? (
              <>
                <button type="button" onClick={cancelEdit} className={BTN_GHOST}>
                  취소
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveEdit()}
                  className={BTN_PRIMARY}
                >
                  {saving ? "저장 중…" : "수정 완료"}
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={startEdit} className={BTN_GHOST}>
                  수정하기
                </button>
                <button
                  type="button"
                  disabled={exporting}
                  onClick={async () => {
                    setExporting(true);
                    try {
                      await exportPlanPdf(plan.id, plan.title);
                      await addHistory({
                        title: school.name,
                        sub: `보고서 내보내기 · ${plan.title}`,
                        href: `/plans/${school.id}`,
                      });
                    } catch {
                      // 실패해도 화면은 유지한다
                    } finally {
                      setExporting(false);
                    }
                  }}
                  className={BTN_PRIMARY}
                >
                  {exporting ? "만드는 중…" : "보고서로 내보내기"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* 검토자료 현황 + 근거 표시 토글 */}
        <div className="mb-[1.75rem] flex items-center gap-[1.375rem] rounded-[0.875rem] bg-surface px-[1.375rem] py-[0.875rem] text-[0.8125rem]">
          <span className="text-[0.78125rem] font-bold text-muted">검토자료</span>
          {plan.coverage.map((item) => (
            <span key={item.label} className="flex items-center gap-[0.375rem]">
              <span
                className={`size-[0.375rem] rounded-full ${item.covered ? "bg-indigo" : "bg-amber"}`}
              />
              {item.label}
            </span>
          ))}
          <button
            type="button"
            onClick={() => setShowEvidence((v) => !v)}
            aria-pressed={showEvidence}
            className="ml-auto flex cursor-pointer items-center gap-[0.5rem] text-[0.8125rem] text-muted select-none"
          >
            근거 표시
            <span
              className={`relative h-[1.25rem] w-[2.125rem] rounded-[0.625rem] transition-colors ${
                showEvidence ? "bg-indigo" : "bg-switch-off"
              }`}
            >
              <span
                className={`absolute top-[0.125rem] size-[1rem] rounded-full bg-white transition-[left] ${
                  showEvidence ? "left-[1rem]" : "left-[0.125rem]"
                }`}
              />
            </span>
          </button>
        </div>

        <div className="grid grid-cols-[13.75rem_1fr] items-start gap-[1.75rem]">
          <PlanToc sections={plan.sections} />

          <div key={resetKey} className="min-w-0">
            {plan.sections.map((section) => (
              <PlanSectionView
                key={section.id}
                section={section}
                evidence={plan.evidence}
                editing={editing}
              />
            ))}
            <p className="mt-[1.25rem] text-[0.78125rem] text-faint">{plan.footNote}</p>
          </div>
        </div>
      </main>

      {/* 근거 툴팁 */}
      {tip && (
        <div
          ref={tipRef}
          style={{ left: pos?.left ?? 0, top: pos?.top ?? 0 }}
          className={`pointer-events-none absolute z-10 max-w-[20rem] rounded-[0.625rem] bg-ink px-[0.9375rem] py-[0.75rem] text-[0.78125rem] leading-[1.55] text-white shadow-[0_0.5rem_1.5rem_rgba(20,20,40,0.18)] transition-opacity ${
            pos ? "opacity-100" : "opacity-0"
          }`}
        >
          {tip.ids.map((id, i) => (
            <div
              key={id}
              className={i > 0 ? "mt-[0.625rem] border-t border-white/15 pt-[0.625rem]" : ""}
            >
              <div className="mb-[0.1875rem] text-[0.65625rem] font-bold tabular-nums text-tip-id">
                근거 · {id}
              </div>
              {evidenceById[id].desc}
              <div className="mt-[0.25rem] text-[0.71875rem] text-tip-src">
                {evidenceById[id].source} · {evidenceById[id].asOf}
              </div>
            </div>
          ))}
        </div>
      )}
    </PlanCtx.Provider>
  );
}
