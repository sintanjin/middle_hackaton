import type { ReactNode } from "react";

const TONES = {
  default: "bg-lavender text-indigo",
  amber: "bg-amber-tint text-amber",
  plain: "bg-bg text-muted",
  solid: "bg-indigo text-white",
} as const;

export function Pill({
  tone = "default",
  children,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-[0.4375rem] px-[0.5625rem] py-[0.1875rem] text-[0.78125rem] font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
