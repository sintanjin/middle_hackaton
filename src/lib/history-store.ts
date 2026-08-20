import type { HistoryEntry } from "@/types/history";

/**
 * 최근 기록 저장소. 백엔드가 없는 동안 브라우저 localStorage 에 담는다.
 * React 에서는 useSyncExternalStore 로 구독한다 (subscribe / getSnapshot).
 * 서버 연동 시 read·add·clear 세 함수만 API 호출로 바꾸면 된다.
 */

const KEY = "dasi-school:history";
/** 표시 기간 — 화면 안내문("최근 30일")과 같은 값 */
const DAYS = 30;
/** 저장 상한 */
const MAX = 50;

/** 서버 렌더 및 스냅샷 캐시용 고정 빈 배열 (참조가 매번 바뀌면 무한 렌더가 된다) */
const EMPTY: HistoryEntry[] = [];

let cache: HistoryEntry[] | null = null;
const listeners = new Set<() => void>();

function invalidate() {
  cache = null;
  listeners.forEach((notify) => notify());
}

/** 최근 30일 기록을 최신순으로 읽는다 (클라이언트에서만 동작) */
function read(): HistoryEntry[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const list = JSON.parse(raw) as HistoryEntry[];
    const cutoff = Date.now() - DAYS * 24 * 60 * 60 * 1000;
    return list.filter((e) => new Date(e.createdAt).getTime() >= cutoff);
  } catch {
    // 저장 형식이 깨졌거나 localStorage 를 쓸 수 없는 경우
    return EMPTY;
  }
}

export function subscribeHistory(onChange: () => void) {
  listeners.add(onChange);
  // 다른 탭에서의 변경도 반영한다
  window.addEventListener("storage", invalidate);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", invalidate);
  };
}

/** 같은 내용이면 같은 참조를 돌려줘야 하므로 캐시를 둔다 */
export function getHistorySnapshot(): HistoryEntry[] {
  if (cache === null) cache = read();
  return cache;
}

/** 서버 렌더 시점에는 localStorage 를 읽을 수 없다 */
export function getHistoryServerSnapshot(): HistoryEntry[] {
  return EMPTY;
}

function write(list: HistoryEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // 저장 실패(용량·프라이버시 모드)는 기능을 막지 않는다
  }
  invalidate();
}

/** 기록 한 줄을 추가한다 */
export function addHistory(entry: { title: string; sub: string; href?: string }) {
  if (typeof window === "undefined") return;
  write(
    [
      { id: crypto.randomUUID(), ...entry, createdAt: new Date().toISOString() },
      ...getHistorySnapshot(),
    ].slice(0, MAX),
  );
}

/** 기록 한 줄을 삭제한다 */
export function removeHistory(id: string) {
  if (typeof window === "undefined") return;
  write(getHistorySnapshot().filter((entry) => entry.id !== id));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  invalidate();
}

/** 시안 표기 규칙: 오늘 20:41 / 어제 16:37 / 8. 18. */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((dayStart(new Date()) - dayStart(date)) / (24 * 60 * 60 * 1000));

  if (days <= 1) {
    const hm = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return `${days === 0 ? "오늘" : "어제"} ${hm}`;
  }
  return `${date.getMonth() + 1}. ${date.getDate()}.`;
}
