/**
 * 백엔드 API 클라이언트.
 *
 * 주소는 NEXT_PUBLIC_API_BASE_URL 로 주입한다 (로컬 http://localhost:8080).
 * 서버 컴포넌트와 클라이언트 컴포넌트 양쪽에서 쓰이므로 fetch 만 사용한다.
 */

import type { School } from "@/types/school";
import type { PlanDocument } from "@/types/plan";
import type { HistoryEntry } from "@/types/history";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/** 기획안 생성은 LLM 호출 때문에 20초 안팎 걸린다. 넉넉히 잡는다. */
const GENERATE_TIMEOUT_MS = 60_000;
const DEFAULT_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
  /** 404 는 "아직 없음"이라 화면에서 정상 흐름으로 다뤄야 할 때가 있다 */
  get isNotFound() {
    return this.status === 404;
  }
}

async function request<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(rest.headers ?? {}) },
      cache: "no-store",
    });
  } catch (e) {
    clearTimeout(timer);
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new ApiError(0, "TIMEOUT", "서버 응답이 없습니다. 잠시 후 다시 시도해 주세요.");
    }
    throw new ApiError(0, "NETWORK", "서버에 연결할 수 없습니다.");
  }
  clearTimeout(timer);

  if (!res.ok) {
    // 백엔드 오류는 { code, message, requestId } 형식으로 통일되어 있다
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.code ?? "UNKNOWN", body?.message ?? "요청을 처리하지 못했습니다.");
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// ---------------------------------------------------------------- 폐교

export function fetchSchools(): Promise<School[]> {
  return request<School[]>("/schools");
}

// ---------------------------------------------------------------- 기획안

/** 이 폐교로 만들어 둔 최신 기획안. 없으면 null. */
export async function fetchLatestPlan(schoolId: string): Promise<PlanDocument | null> {
  try {
    return await request<PlanDocument>(`/schools/${encodeURIComponent(schoolId)}/plan`);
  } catch (e) {
    if (e instanceof ApiError && e.isNotFound) return null;
    throw e;
  }
}

/** 새 기획안 생성. LLM 을 호출하므로 20초 안팎 걸린다. */
export function generatePlan(schoolId: string): Promise<PlanDocument> {
  return request<PlanDocument>("/plans/generate", {
    method: "POST",
    body: JSON.stringify({ schoolId }),
    timeoutMs: GENERATE_TIMEOUT_MS,
  });
}

/** 보고서 PDF 를 내려받는다. */
export async function exportPlanPdf(planId: string, filename: string): Promise<void> {
  const res = await fetch(`${BASE}/plans/${encodeURIComponent(planId)}/export`, {
    method: "POST",
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError(res.status, "EXPORT_FAILED", "보고서를 만들지 못했습니다.");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------- 최근 기록

export function fetchHistory(): Promise<HistoryEntry[]> {
  return request<HistoryEntry[]>("/history");
}

export function postHistory(entry: { title: string; sub: string; href?: string }) {
  return request<HistoryEntry>("/history", { method: "POST", body: JSON.stringify(entry) });
}

export function deleteHistory(id: string) {
  return request<void>(`/history/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function deleteAllHistory() {
  return request<void>("/history", { method: "DELETE" });
}
