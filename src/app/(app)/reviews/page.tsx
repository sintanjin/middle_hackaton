import type { Metadata } from "next";
import { RecentHistory } from "@/components/review/recent-history";

export const metadata: Metadata = { title: "검토 현황" };

export default function ReviewsPage() {
  return (
    <main className="mx-auto max-w-[47.5rem] px-[1.75rem] pt-[2.75rem] pb-[4rem]">
      <h1 className="mb-[1.75rem] text-[1.625rem] font-bold tracking-[-0.02em]">검토 현황</h1>
      <RecentHistory />
    </main>
  );
}
