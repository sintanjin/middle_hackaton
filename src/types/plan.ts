/**
 * 최종 활용기획안 문서 구조.
 * 백엔드가 이 형태의 JSON을 돌려주면 화면은 그대로 렌더링된다.
 */

/** 근거 ID가 연결된 문장 조각 */
export interface ClaimNode {
  text: string;
  /** Evidence ID 목록 (예: ["REGION_001", "REGION_002"]) */
  ev: string[];
}

/** 확정하지 않은 항목 표시 (미확인 / 미검증 / 운영주체 미확정 등) */
export interface UnknownNode {
  unknown: string;
}

/** 문장 = 일반 텍스트 · 근거 연결 문장 · 미확인 배지의 배열 */
export type InlineNode = string | ClaimNode | UnknownNode;
export type RichText = InlineNode[];

export interface Metric {
  value: string;
  label: string;
  ev?: string[];
}

export interface TableCell {
  text: RichText;
  /** 셀 아래에 작게 붙는 보조 표기 (기관·연도 등) */
  note?: string;
  rowSpan?: number;
}

export type Block =
  | { kind: "p"; text: RichText; /** 담당자가 고친 문단 — 근거 연결이 없다 */ edited?: boolean }
  | { kind: "h3"; text: string }
  | { kind: "metrics"; items: Metric[] }
  | { kind: "kv"; rows: { key: string; value: RichText }[] }
  | { kind: "list"; items: { label?: string; text: RichText }[] }
  | { kind: "table"; head: string[]; rows: TableCell[][] }
  | { kind: "highlight"; label?: string; text: RichText }
  | { kind: "notice"; text: RichText }
  | { kind: "note"; text: RichText }
  /** 근거 목록 표 — plan.evidence 로부터 생성된다 */
  | { kind: "evidence-table" };

export interface PlanSection {
  /** 앵커 id (예: "s01") */
  id: string;
  /** 번호 표기 (예: "01") */
  no: string;
  title: string;
  /** 목차에 짧게 표기할 이름 (없으면 title 사용) */
  tocLabel?: string;
  blocks: Block[];
}

export interface Evidence {
  id: string;
  desc: string;
  source: string;
  /** 기준시점 (예: "2026.07") */
  asOf: string;
}

/** 검토자료 확보 현황 한 줄 */
export interface CoverageItem {
  label: string;
  covered: boolean;
}

export interface PlanLabel {
  text: string;
  tone: "default" | "plain" | "amber" | "solid";
}

export interface PlanDocument {
  /** 서버가 부여한 기획안 ID. 보고서 내보내기에 쓴다 */
  id: string;
  /** 어느 폐교의 기획안인지 */
  schoolId: string;
  title: string;
  /** 생성일 표기 (예: "2026. 8. 20.") */
  createdAt: string;
  labels: PlanLabel[];
  coverage: CoverageItem[];
  sections: PlanSection[];
  evidence: Evidence[];
  footNote: string;
}
