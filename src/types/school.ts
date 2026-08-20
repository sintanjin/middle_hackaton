/**
 * 폐교의 현재 활용 상태. 교육청 공식 분류값을 그대로 쓴다.
 *
 * - 미활용   : 쓰이지 않는 상태
 * - 대부     : 외부 주체가 대부계약으로 사용 중 (계약 만료 시점이 협의 대상)
 * - 자체활용 : 교육청이 직접 사용 중 (교육청 내부 결정 사안)
 */
export type UsageStatus = "미활용" | "대부" | "자체활용";

/** 상세 화면의 현황 4항목 (시설 상태 / 접근성 / 주변 자원 / 시설 세부) */
export interface FacilityInfo {
  /** 시설 상태 */
  condition: string;
  /** 접근성 */
  access: string;
  /** 주변 자원 */
  surroundings: string;
  /** 시설 세부 */
  details: string;
}

export interface School {
  id: string;
  name: string;
  /** 전체 주소 */
  address: string;
  /** 목록 배지에 쓰는 읍·면·동 단위 표기 */
  district: string;
  closedYear: number;
  /** 대지면적 (m²). 공개 데이터에 값이 없거나 신뢰할 수 없으면 null */
  siteArea: number | null;
  /** 교실 수 (실). 공개 데이터에 없으므로 대부분 null — 추정하지 않는다 */
  classroomCount: number | null;
  /** 부속시설 (강당, 급식실 등) */
  annexFacility: string;
  usageStatus: UsageStatus;
  /** 데이터 기준일 표기 (예: "2026. 7.") */
  dataAsOf: string;
  facility: FacilityInfo;
}
