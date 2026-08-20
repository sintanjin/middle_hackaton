import { Pill } from "@/components/ui/pill";
import type { School, UsageStatus } from "@/types/school";

/** 활용 상태별 배지 색. 미활용만 주황으로 눈에 띄게 하고 나머지는 구분만 준다. */
function statusTone(status: UsageStatus) {
  if (status === "미활용") return "amber" as const;
  if (status === "대부") return "default" as const;
  return "plain" as const; // 자체활용
}

export function SchoolCard({
  school,
  selected,
  onSelect,
}: {
  school: School;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(school.id)}
      aria-pressed={selected}
      className={`mb-3 block w-full rounded-[0.875rem] border bg-surface px-5 py-[1.125rem] text-left ${
        selected ? "border-indigo" : "border-transparent hover:border-line"
      }`}
    >
      <div className="flex items-baseline justify-between gap-[0.625rem]">
        <h3 className="text-base font-bold tracking-[-0.01em]">{school.name}</h3>
        <Pill tone={statusTone(school.usageStatus)}>
          {school.usageStatus}
        </Pill>
      </div>
      <div className="mt-[0.5625rem] flex flex-wrap gap-1.5">
        <Pill>{school.district}</Pill>
        <Pill>{school.closedYear}년 폐교</Pill>
      </div>
    </button>
  );
}
