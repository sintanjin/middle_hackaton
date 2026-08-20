import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/layout/logo-mark";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = { title: "로그인" };

const INPUT =
  "w-full rounded-[0.625rem] border border-line bg-surface px-[0.875rem] py-[0.75rem] text-[0.90625rem] transition-colors placeholder:text-faint focus:border-indigo focus:outline-none";

/**
 * 로그인 화면 (GUI만). 인증은 백엔드 연동 시 form action 으로 교체한다.
 * GNB·유저 영역이 없어 (app) 레이아웃을 쓰지 않고 골격을 직접 그린다.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[71.25rem] items-center px-[1.75rem]">
          <div className="flex items-center gap-[0.5625rem] text-base font-bold tracking-[-0.01em]">
            <LogoMark />
            다시, 학교
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-[1.75rem] py-[3rem]">
        <div>
          <div className="w-full max-w-[25rem] rounded-[1.125rem] bg-surface px-[2.25rem] pt-[2.5rem] pb-[2.125rem]">
            <div className="mb-[1.375rem]">
              <LogoMark size="lg" />
            </div>

            <h1 className="text-[1.3125rem] font-bold tracking-[-0.02em]">로그인</h1>
            <p className="mt-[0.375rem] mb-[1.75rem] text-sm text-muted">
              기관 계정으로 폐교 활용기획 업무를 시작하세요.
            </p>

            <div className="mb-[0.875rem]">
              <label
                htmlFor="email"
                className="mb-[0.4375rem] block text-[0.8125rem] font-semibold"
              >
                기관 이메일
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@korea.kr"
                autoComplete="username"
                className={INPUT}
              />
            </div>

            <div className="mb-[0.875rem]">
              <label htmlFor="pw" className="mb-[0.4375rem] block text-[0.8125rem] font-semibold">
                비밀번호
              </label>
              <input
                id="pw"
                type="password"
                placeholder="비밀번호 입력"
                autoComplete="current-password"
                className={INPUT}
              />
            </div>

            <div className="mt-[0.25rem] mb-[1.375rem] flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-[0.4375rem] text-[0.84375rem] text-muted select-none">
                <input type="checkbox" className="size-[0.9375rem] accent-indigo" />
                로그인 유지
              </label>
              <a href="#" className="text-[0.84375rem] text-muted hover:text-indigo">
                비밀번호 재설정
              </a>
            </div>

            <Link
              href="/"
              className="block w-full rounded-xl bg-indigo py-[0.875rem] text-center text-[0.9375rem] font-bold tracking-[-0.01em] text-white hover:bg-indigo-deep"
            >
              로그인
            </Link>

            <div className="mt-[1.5rem] mb-[1.125rem] flex items-center gap-[0.75rem] text-[0.78125rem] text-faint before:h-px before:flex-1 before:bg-line before:content-[''] after:h-px after:flex-1 after:bg-line after:content-['']">
              계정이 없으신가요?
            </div>

            <p className="text-center text-[0.84375rem] text-muted">
              지자체·교육청 담당자 계정은 기관 단위로 발급됩니다.
              {/* 링크가 단어 중간에서 줄바꿈되지 않도록 한 줄을 차지하게 둔다 */}
              <a
                href="#"
                className="mt-[0.25rem] block font-semibold text-indigo hover:underline"
              >
                도입 문의
              </a>
            </p>
          </div>

          <p className="mx-auto mt-[0.875rem] max-w-[25rem] text-center text-[0.78125rem] leading-[1.6] text-faint">
            이 서비스는 공무 목적의 기관 담당자용입니다.
            <br />
            계정 공유는 기관 보안 정책에 따라 제한될 수 있습니다.
          </p>
        </div>
      </main>

      <SiteFooter gap="none" />
    </div>
  );
}
