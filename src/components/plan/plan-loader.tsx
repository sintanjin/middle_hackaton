"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlanView } from "@/components/plan/plan-view";
import { ApiError, fetchLatestPlan, generatePlan } from "@/lib/api";
import type { PlanDocument } from "@/types/plan";
import type { School } from "@/types/school";

/**
 * 기획안을 불러오거나 새로 만든다.
 *
 * <p>생성은 AI 종합 때문에 20초 안팎 걸린다. 서버 컴포넌트에서 그대로 기다리면
 * 그 시간 동안 화면이 비어 있으므로, 클라이언트에서 진행 상태를 보여준다.
 * 이미 만들어 둔 기획안이 있으면 즉시 그것을 쓴다.
 */
export function PlanLoader({ school, initialPlan }: { school: School; initialPlan: PlanDocument | null }) {
  const [plan, setPlan] = useState<PlanDocument | null>(initialPlan);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const started = useRef(false);

  const create = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      setPlan(await generatePlan(school.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "기획안을 만들지 못했습니다.");
    } finally {
      setGenerating(false);
    }
  }, [school.id]);

  // 저장된 기획안이 없으면 자동으로 한 번 만든다 (StrictMode 이중 실행 방지)
  useEffect(() => {
    if (initialPlan || started.current) return;
    started.current = true;
    void create();
  }, [initialPlan, create]);

  if (plan) return <PlanView school={school} plan={plan} />;

  return (
    <main className="mx-auto max-w-[47.5rem] px-[1.75rem] pt-[6rem] pb-[6rem] text-center">
      {generating ? (
        <>
          <div
            className="mx-auto mb-[1.5rem] h-[2.25rem] w-[2.25rem] animate-spin rounded-full border-[3px] border-line border-t-ink"
            role="status"
            aria-label="기획안 생성 중"
          />
          <h1 className="text-[1.25rem] font-bold tracking-[-0.02em]">활용기획안을 만들고 있습니다</h1>
          <p className="mt-[0.75rem] text-[0.875rem] text-muted">
            {school.name}의 공간·지역·정책·사례 자료를 종합하는 중입니다.
            <br />
            20초 안팎 걸립니다.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-[1.25rem] font-bold tracking-[-0.02em]">
            {error ?? "기획안이 아직 없습니다"}
          </h1>
          <button
            type="button"
            onClick={() => void create()}
            className="mt-[1.5rem] rounded-[0.625rem] bg-ink px-[1.25rem] py-[0.625rem] text-[0.875rem] font-medium text-surface"
          >
            {error ? "다시 시도" : "활용기획안 만들기"}
          </button>
        </>
      )}
    </main>
  );
}
