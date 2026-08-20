import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanView } from "@/components/plan/plan-view";
import { MOCK_PLAN } from "@/lib/mock-plan";
import { MOCK_SCHOOLS } from "@/lib/mock-schools";

export const metadata: Metadata = { title: "활용계획안" };

export default async function PlanPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;

  // TODO: 백엔드 /plans/generate 연결 시 교체 (현재는 폐교 조회 + 목 기획안)
  const school = MOCK_SCHOOLS.find((s) => s.id === schoolId);
  if (!school) notFound();

  return <PlanView school={school} plan={MOCK_PLAN} />;
}
