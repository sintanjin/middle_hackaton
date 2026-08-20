"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  clearHistory,
  formatTime,
  getHistorySnapshot,
  getHistoryServerSnapshot,
  removeHistory,
  subscribeHistory,
} from "@/lib/history-store";
import type { HistoryEntry } from "@/types/history";

/** 기록 종류와 무관하게 문서 아이콘으로 통일 */
function DocIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

/** 아이콘 · 이름 · 보조설명 · 시각 */
function EntryBody({ entry }: { entry: HistoryEntry }) {
  return (
    <>
      <span className="flex flex-none text-faint">
        <DocIcon />
      </span>
      <div className="min-w-0">
        <div className="text-[0.90625rem] font-medium transition-colors group-hover:text-indigo">
          {entry.title}
        </div>
        <div className="mt-[0.125rem] text-[0.78125rem] text-muted">{entry.sub}</div>
      </div>
      <span className="ml-auto text-[0.78125rem] whitespace-nowrap text-faint">
        {formatTime(entry.createdAt)}
      </span>
    </>
  );
}

export function RecentHistory() {
  // localStorage 는 마운트 후에만 읽을 수 있어 서버 렌더 시점에는 빈 목록이다
  const entries = useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    getHistoryServerSnapshot,
  );

  const ROW = "flex min-w-0 flex-1 items-center gap-[0.875rem]";

  return (
    <div className="mb-[1rem] rounded-[1.125rem] bg-surface px-[1.875rem] py-[1.625rem]">
      <div className="mb-[0.375rem] flex items-baseline justify-between">
        <h2 className="text-[0.9375rem] font-bold tracking-[-0.01em]">최근 기록</h2>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="text-[0.8125rem] text-muted hover:text-indigo"
          >
            기록 전체 삭제
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="py-[1.75rem] text-center text-[0.875rem] text-muted">
          아직 기록이 없습니다. 활용기획안을 만들면 여기에 쌓입니다.
        </p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="group flex items-center gap-[0.75rem] border-b border-line py-[0.875rem] last:border-b-0"
            >
              {entry.href ? (
                <Link href={entry.href} className={ROW}>
                  <EntryBody entry={entry} />
                </Link>
              ) : (
                // 이동 경로가 없는 기록은 링크로 만들지 않는다
                <div className={ROW}>
                  <EntryBody entry={entry} />
                </div>
              )}

              <button
                type="button"
                onClick={() => removeHistory(entry.id)}
                aria-label={`${entry.title} 기록 삭제`}
                className="flex flex-none text-danger hover:opacity-70"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-[0.875rem] text-[0.78125rem] text-faint">
        최근 30일의 기록이 표시됩니다. 항목을 누르면 해당 활용기획안으로 이동합니다.
      </p>
    </div>
  );
}
