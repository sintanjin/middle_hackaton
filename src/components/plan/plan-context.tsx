"use client";

import { createContext, useContext } from "react";
import type { Evidence } from "@/types/plan";

export interface PlanCtxValue {
  /** "근거 표시" 토글 상태 — 끄면 점선 밑줄과 툴팁이 모두 사라진다 */
  showEvidence: boolean;
  /** 편집 모드 — 근거 밑줄을 흐리게 두고 툴팁을 띄우지 않는다 */
  editing: boolean;
  evidenceById: Record<string, Evidence>;
  openTip: (ids: string[], el: HTMLElement) => void;
  closeTip: () => void;
}

export const PlanCtx = createContext<PlanCtxValue>({
  showEvidence: true,
  editing: false,
  evidenceById: {},
  openTip: () => {},
  closeTip: () => {},
});

export const usePlan = () => useContext(PlanCtx);

/**
 * 근거가 연결된 요소에 붙이는 스타일·핸들러.
 * 문장(span)과 지표 카드(div) 양쪽에서 쓰기 위해 컴포넌트가 아닌 훅으로 둔다.
 */
export function useClaim(ev?: string[]) {
  const { showEvidence, editing, openTip, closeTip } = usePlan();

  if (!showEvidence || !ev || ev.length === 0) {
    return { className: "", handlers: {} };
  }

  // 편집 중에는 밑줄만 흐리게 남기고 툴팁은 띄우지 않는다
  if (editing) {
    return {
      className: "cursor-text border-b-[1.5px] border-dashed border-claim-edit",
      handlers: {},
    };
  }

  return {
    className:
      "cursor-help border-b-[1.5px] border-dashed border-claim transition-colors hover:border-solid hover:border-indigo hover:bg-lavender",
    handlers: {
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => openTip(ev, e.currentTarget),
      onMouseLeave: closeTip,
    },
  };
}
