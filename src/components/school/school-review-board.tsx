"use client";

import { useState } from "react";
import { SchoolCard } from "@/components/school/school-card";
import { SchoolDetail } from "@/components/school/school-detail";
import type { School, UsageStatus } from "@/types/school";

type Tab = "전체" | UsageStatus;

const TABS: Tab[] = ["전체", "미활용", "대부", "자체활용"];

/** 한 번에 보여주는 목록 개수 (더보기 단위) */
const PAGE_SIZE = 3;

export function SchoolReviewBoard({ schools }: { schools: School[] }) {
  const [tab, setTab] = useState<Tab>("전체");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState(schools[0]?.id);

  const count = (t: Tab) =>
    t === "전체" ? schools.length : schools.filter((s) => s.usageStatus === t).length;

  const filtered = schools.filter(
    (s) =>
      (tab === "전체" || s.usageStatus === tab) && s.name.includes(query.trim()),
  );
  const visible = filtered.slice(0, limit);
  const selected = schools.find((s) => s.id === selectedId);

  const reset = () => setLimit(PAGE_SIZE);

  return (
    <div className="grid grid-cols-[25rem_1fr] items-start gap-6">
      {/* 왼쪽: 폐교 목록 */}
      <div>
        <div className="mb-[1.125rem] flex gap-[1.375rem] border-b border-line">
          {TABS.map((t) => {
            const on = t === tab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  reset();
                }}
                className={`-mb-px border-b-2 px-[0.125rem] pb-[0.6875rem] text-[0.90625rem] ${
                  on
                    ? "border-indigo font-bold text-indigo"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {t}
                <span className={`ml-[0.1875rem] text-[0.78125rem] ${on ? "opacity-65" : "text-faint"}`}>
                  {count(t)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-4 flex gap-2">
          <select
            defaultValue="포항시"
            className="w-[6.875rem] rounded-[0.625rem] border border-line bg-surface px-3 py-[0.5625rem] text-sm"
          >
            <option value="포항시">포항시</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              reset();
            }}
            placeholder="학교명 검색"
            className="flex-1 rounded-[0.625rem] border border-line bg-surface px-3 py-[0.5625rem] text-sm placeholder:text-faint"
          />
        </div>

        {visible.map((school) => (
          <SchoolCard
            key={school.id}
            school={school}
            selected={school.id === selectedId}
            onSelect={setSelectedId}
          />
        ))}

        {visible.length === 0 && (
          <p className="rounded-[0.875rem] bg-surface px-5 py-[1.125rem] text-sm text-muted">
            조건에 맞는 폐교가 없습니다.
          </p>
        )}

        <p className="mt-4 text-[0.8125rem] text-muted">
          포항시 폐교 {filtered.length}곳 중 {visible.length}곳 표시
          {visible.length < filtered.length && (
            <>
              {" · "}
              <button
                type="button"
                onClick={() => setLimit((n) => n + PAGE_SIZE)}
                className="font-semibold text-indigo"
              >
                더보기
              </button>
            </>
          )}
        </p>
      </div>

      {/* 오른쪽: 선택한 폐교 상세 */}
      {selected && <SchoolDetail school={selected} />}
    </div>
  );
}
