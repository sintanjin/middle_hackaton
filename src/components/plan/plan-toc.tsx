"use client";

import { useEffect, useState } from "react";
import type { PlanSection } from "@/types/plan";

/** 스크롤 위치에 따라 현재 섹션을 표시하는 목차 */
export function PlanToc({ sections }: { sections: PlanSection[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      let current = 0;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < 120) current = i;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <aside className="sticky top-[1.5rem]">
      {sections.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`block border-l-2 px-[0.75rem] py-[0.4375rem] text-[0.84375rem] ${
            i === active
              ? "border-indigo font-bold text-indigo"
              : "border-line text-muted hover:text-ink"
          }`}
        >
          {s.tocLabel ?? s.title}
        </a>
      ))}
    </aside>
  );
}
