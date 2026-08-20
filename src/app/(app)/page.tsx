import type { Metadata } from "next";
import { SchoolReviewBoard } from "@/components/school/school-review-board";
import { MOCK_SCHOOLS } from "@/lib/mock-schools";

export const metadata: Metadata = { title: "홈" };

export default function HomePage() {
  // TODO: 백엔드 폐교 목록 API 연결 시 MOCK_SCHOOLS 교체
  const schools = MOCK_SCHOOLS;

  return (
    <main className="mx-auto max-w-[71.25rem] px-[1.75rem] pt-[2.75rem] pb-[3.5rem]">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.625rem] font-bold tracking-[-0.02em]">폐교 활용계획 검토</h1>
          <p className="mt-2 text-[0.9375rem] text-muted">
            폐교를 선택하면 공간·지역·정책·사례 자료를 모아 활용기획안 초안을 만듭니다.
          </p>
        </div>
        <button
          type="button"
          className="rounded-[0.625rem] border border-line bg-surface px-4 py-[0.5625rem] text-[0.84375rem] font-medium hover:border-faint"
        >
          기획 이력
        </button>
      </div>

      <SchoolReviewBoard schools={schools} />
    </main>
  );
}
