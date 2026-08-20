"use client";

import { Fragment, type ReactNode } from "react";
import { useClaim } from "@/components/plan/plan-context";
import type { RichText } from "@/types/plan";

/** 확정하지 않은 항목 배지 (미확인 / 미검증 등) */
export function UnknownBadge({ label }: { label: string }) {
  return (
    <span className="ml-[0.25rem] inline-block rounded-[0.3125rem] bg-amber-tint px-[0.375rem] py-[0.0625rem] align-[0.0625rem] text-[0.6875rem] font-semibold text-amber">
      {label}
    </span>
  );
}

/** 근거 ID가 연결된 문장 */
export function Claim({ ev, children }: { ev: string[]; children: ReactNode }) {
  const { className, handlers } = useClaim(ev);
  return (
    <span className={className} {...handlers}>
      {children}
    </span>
  );
}

/** 일반 텍스트 · 근거 문장 · 미확인 배지가 섞인 문장을 렌더링한다 */
export function Rich({ nodes }: { nodes: RichText }) {
  return (
    <>
      {nodes.map((node, i) => {
        if (typeof node === "string") return <Fragment key={i}>{node}</Fragment>;
        if ("unknown" in node) return <UnknownBadge key={i} label={node.unknown} />;
        return (
          <Claim key={i} ev={node.ev}>
            {node.text}
          </Claim>
        );
      })}
    </>
  );
}
