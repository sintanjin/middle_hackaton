/** 폐교의 현재 활용 상태 */
export type UsageStatus = "미활용" | "일부활용";

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
  /** 대지면적 (m²) */
  siteArea: number;
  /** 교실 수 (실) */
  classroomCount: number;
  /** 부속시설 (강당, 급식실 등) */
  annexFacility: string;
  usageStatus: UsageStatus;
  /** 데이터 기준일 표기 (예: "2026. 7.") */
  dataAsOf: string;
  facility: FacilityInfo;
}
