import type { HistoryEntry } from "@/types/history";
import { deleteAllHistory, deleteHistory, fetchHistory, postHistory } from "@/lib/api";

/**
 * 최근 기록 저장소. 서버(/history)에 보관한다.
 *
 * 화면은 useSyncExternalStore 로 구독하므로 스냅샷은 동기여야 한다.
 * 그래서 메모리 캐시를 두고, 서버 응답이 오면 캐시를 바꾼 뒤 구독자에게 알린다.
 * 쓰기는 낙관적으로 반영하지 않는다 — 서버 응답을 받은 뒤 다시 읽어 상태를 맞춘다.
 */

/** 서버 렌더 및 스냅샷 캐시용 고정 빈 배열 (참조가 매번 바뀌면 무한 렌더가 된다) */
const EMPTY: HistoryEntry[] = [];

let cache: HistoryEntry[] = EMPTY;
let loaded = false;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

/** 서버에서 다시 읽어 캐시를 채운다. 동시에 여러 번 불려도 요청은 한 번만 나간다. */
function refresh(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = fetchHistory()
    .then((list) => {
      cache = list.length === 0 ? EMPTY : list;
    })
    .catch(() => {
      // 서버가 없거나 실패해도 화면을 막지 않는다. 목록이 비어 보일 뿐이다.
      cache = EMPTY;
    })
    .finally(() => {
      loaded = true;
      inFlight = null;
      notify();
    });
  return inFlight;
}

export function subscribeHistory(onChange: () => void) {
  listeners.add(onChange);
  if (!loaded) void refresh();
  return () => {
    listeners.delete(onChange);
  };
}

/** 같은 내용이면 같은 참조를 돌려줘야 하므로 캐시를 둔다 */
export function getHistorySnapshot(): HistoryEntry[] {
  return cache;
}

/** 서버 렌더 시점에는 아직 가져온 것이 없다 */
export function getHistoryServerSnapshot(): HistoryEntry[] {
  return EMPTY;
}

/** 기록 한 줄을 추가한다 */
export async function addHistory(entry: { title: string; sub: string; href?: string }) {
  try {
    await postHistory(entry);
  } catch {
    // 기록 실패가 본래 작업(기획안 생성·내보내기)을 막지 않는다
    return;
  }
  await refresh();
}

/** 기록 한 줄을 삭제한다 */
export async function removeHistory(id: string) {
  try {
    await deleteHistory(id);
  } catch {
    return;
  }
  await refresh();
}

export async function clearHistory() {
  try {
    await deleteAllHistory();
  } catch {
    return;
  }
  await refresh();
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
