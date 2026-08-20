/** 검토 현황의 최근 기록 한 줄 */
export interface HistoryEntry {
  id: string;
  /** 기록 대상 이름 (폐교명 또는 검색어) */
  title: string;
  /** 무엇을 했는지 — 활용기획안 생성, 보고서 내보내기 등 */
  sub: string;
  /** 기록 시각 (ISO 문자열) */
  createdAt: string;
  /** 누르면 이동할 경로. 예전 기록에는 없을 수 있다 */
  href?: string;
}
