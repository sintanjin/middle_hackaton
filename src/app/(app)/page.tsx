import type { Metadata } from "next";
import { SchoolReviewBoard } from "@/components/school/school-review-board";
import { fetchSchools } from "@/lib/api";
import type { School } from "@/types/school";

export const metadata: Metadata = { title: "홈" };

/** 목록은 매 요청 시 서버에서 가져온다. 폐교 자료는 자주 바뀌지 않지만 캐시로 굳히지 않는다. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let schools: School[];
  try {
    schools = await fetchSchools();
  } catch {
    // 백엔드가 내려가 있어도 화면 자체는 뜨게 한다
    schools = [];
  }

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

      {schools.length === 0 ? (
        <div className="rounded-[0.875rem] border border-line bg-surface px-[1.75rem] py-[3rem] text-center">
          <p className="text-[0.9375rem] font-medium">폐교 목록을 불러오지 못했습니다.</p>
          <p className="mt-2 text-[0.84375rem] text-muted">
            백엔드 서버가 실행 중인지 확인해 주세요. (NEXT_PUBLIC_API_BASE_URL)
          </p>
        </div>
      ) : (
        <SchoolReviewBoard schools={schools} />
      )}
    </main>
  );
}
