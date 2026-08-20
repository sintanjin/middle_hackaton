import Link from "next/link";
import { addHistory } from "@/lib/history-store";
import { Pill } from "@/components/ui/pill";
import type { School } from "@/types/school";

/** 기본정보 4칸 (.facts) */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg px-4 py-[0.875rem]">
      <dt className="mb-1 text-xs text-muted">{label}</dt>
      <dd className="text-[1.03125rem] font-bold tracking-[-0.01em]">{value}</dd>
    </div>
  );
}

/** 현황 2열 그리드 (.info) */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line py-[0.8125rem]">
      <dt className="mb-1 text-[0.78125rem] text-muted">{label}</dt>
      <dd className="text-[0.9375rem] font-semibold tracking-[-0.01em]">{value}</dd>
    </div>
  );
}

export function SchoolDetail({ school }: { school: School }) {
  return (
    <div className="overflow-hidden rounded-[1.125rem] bg-surface">
      <div className="flex items-start justify-between gap-4 px-[1.875rem] pt-7 pb-[0.375rem]">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.02em]">{school.name}</h2>
          <div className="mt-[0.3125rem] text-[0.84375rem] text-muted">{school.address}</div>
        </div>
        <div className="text-right">
          <Pill tone={school.usageStatus === "미활용" ? "amber" : "default"}>
            {school.usageStatus}
          </Pill>
          <div className="mt-[0.4375rem] text-[0.78125rem] text-faint">기준일 {school.dataAsOf}</div>
        </div>
      </div>

      <dl className="grid grid-cols-4 gap-[0.625rem] px-[1.875rem] pt-[1.375rem] pb-[0.25rem]">
        <Fact label="폐교연도" value={String(school.closedYear)} />
        <Fact
          label="대지면적"
          value={
            school.siteArea === null
              ? "확인 필요"
              : `${school.siteArea.toLocaleString("ko-KR")}m²`
          }
        />
        <Fact
          label="교실 수"
          value={school.classroomCount === null ? "확인 필요" : `${school.classroomCount}실`}
        />
        <Fact label="부속시설" value={school.annexFacility} />
      </dl>

      <dl className="grid grid-cols-2 gap-x-[1.75rem] gap-y-[0.125rem] px-[1.875rem] pt-[0.875rem] pb-[0.375rem]">
        <InfoRow label="시설 상태" value={school.facility.condition} />
        <InfoRow label="접근성" value={school.facility.access} />
        <InfoRow label="주변 자원" value={school.facility.surroundings} />
        <InfoRow label="시설 세부" value={school.facility.details} />
      </dl>

      <div className="flex items-center gap-[0.625rem] px-[1.875rem] pt-6 pb-5">
        <Link
          href={`/plans/${school.id}`}
          onClick={() =>
            addHistory({
              title: school.name,
              sub: "활용기획안 생성",
              href: `/plans/${school.id}`,
            })
          }
          className="flex-1 rounded-xl bg-indigo py-[0.875rem] text-center text-[0.9375rem] font-bold tracking-[-0.01em] text-white hover:bg-indigo-deep"
        >
          활용기획안 만들기
        </Link>
        <button
          type="button"
          className="rounded-xl border border-line bg-surface px-[1.375rem] py-[0.8125rem] text-sm font-semibold hover:border-faint"
        >
          상세정보
        </button>
      </div>

      <p className="px-[1.875rem] pb-[1.625rem] text-[0.78125rem] text-faint">
        기획안은 확보된 공공데이터를 바탕으로 한 초안이며, 행정·법적 확정안이 아닙니다.
      </p>
    </div>
  );
}
