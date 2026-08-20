import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanLoader } from "@/components/plan/plan-loader";
import { fetchLatestPlan, fetchSchools } from "@/lib/api";

export const metadata: Metadata = { title: "활용계획안" };

export const dynamic = "force-dynamic";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;

  const schools = await fetchSchools().catch(() => []);
  const school = schools.find((s) => s.id === schoolId);
  if (!school) notFound();

  // 이미 만들어 둔 기획안이 있으면 그대로 쓴다. 없으면 클라이언트가 생성한다.
  const plan = await fetchLatestPlan(schoolId).catch(() => null);

  return <PlanLoader school={school} initialPlan={plan} />;
}
