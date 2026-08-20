"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/layout/logo-mark";

const NAV = [
  // 활용계획안은 홈에서 진입하는 화면이라 별도 메뉴 없이 홈이 활성 상태를 유지한다
  { label: "홈", href: "/", match: (path: string) => path === "/" || path.startsWith("/plans") },
  { label: "최근 기록", href: "/reviews", match: (path: string) => path.startsWith("/reviews") },
] satisfies { label: string; href: string; match?: (path: string) => boolean }[];

export function SiteHeader() {
  // TODO: 로그인 연동 후 실제 담당자 정보로 교체
  const user = { name: "홍길동" };
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex h-16 max-w-[71.25rem] items-center gap-10 px-[1.75rem]">
        <Link
          href="/"
          aria-label="다시, 학교 홈으로"
          className="flex items-center gap-[0.5625rem] text-base font-bold tracking-[-0.01em] transition-opacity hover:opacity-70"
        >
          <LogoMark />
          다시, 학교
        </Link>

        <nav className="flex flex-1 gap-[1.625rem]">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                item.match?.(pathname)
                  ? "py-1 text-sm font-bold text-indigo"
                  : "py-1 text-sm font-medium text-muted hover:text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-[0.875rem]">
          <span className="text-[0.84375rem] font-semibold">{user.name} 님</span>
          <Link
            href="/login"
            className="text-[0.84375rem] font-medium text-muted hover:text-ink"
          >
            로그아웃
          </Link>
        </div>
      </div>
    </header>
  );
}
