import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "다시, 학교",
    template: "다시, 학교 — %s",
  },
  description: "공간·지역·정책·사례 자료를 모아 폐교 활용기획안 초안을 만드는 검토 도구",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
