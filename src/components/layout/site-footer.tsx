const ITEMS = [
  "AI 기반 폐교 활용가능성 진단 서비스",
  "2026 한동대 AI × 경북 해커톤",
  "TEAM 오합지졸",
  "다시, 학교",
];

/** 본문과의 간격 */
const GAP = {
  lg: "mt-14", // 56px — 업무 화면 공통
  none: "", // 화면 하단에 붙는 로그인 화면
} as const;

export function SiteFooter({ gap = "lg" }: { gap?: keyof typeof GAP }) {
  return (
    <footer className={`border-t border-line ${GAP[gap]}`}>
      <div className="mx-auto flex max-w-[71.25rem] justify-between gap-5 px-[1.75rem] py-[1.375rem] text-[0.78125rem] text-muted">
        {ITEMS.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </footer>
  );
}
