"use client";

import { Fragment } from "react";
import { useClaim } from "@/components/plan/plan-context";
import { Rich } from "@/components/plan/plan-inline";
import type { Block, Evidence, Metric, PlanSection } from "@/types/plan";

const TABLE = "w-full border-collapse text-[0.84375rem]";
const TH =
  "border-b border-line pr-[0.75rem] pb-[0.5625rem] text-left text-[0.78125rem] font-semibold whitespace-nowrap text-muted";
const TD = "border-b border-line py-[0.6875rem] pr-[0.75rem] align-top";
/** 마지막 행은 밑줄 제거 */
const TR = "[&:last-child>td]:border-b-0";

/** 근거가 연결될 수 있는 지표 카드 */
function MetricCard({ item }: { item: Metric }) {
  const { className, handlers } = useClaim(item.ev);
  return (
    <div className={`rounded-xl bg-bg px-[1rem] py-[0.875rem] ${className}`} {...handlers}>
      <div className="text-[1.0625rem] font-bold tracking-[-0.01em]">{item.value}</div>
      <div className="mt-[0.1875rem] text-xs text-muted">{item.label}</div>
    </div>
  );
}

/** 블록 사이 여백 — 시안의 section 내부 마진 규칙 */
function gap(kind: Block["kind"], first: boolean) {
  if (first) return kind === "metrics" ? "mb-[0.25rem]" : "";
  switch (kind) {
    case "h3":
      return "mt-[1.375rem]";
    case "p":
      return "mt-[0.625rem]";
    case "metrics":
      return "mt-[0.375rem] mb-[0.25rem]";
    case "highlight":
      return "mt-[0.875rem] mb-[0.25rem]";
    case "notice":
      return "mt-[0.875rem]";
    default:
      return "";
  }
}

/**
 * 자유 편집을 허용하는 블록 종류.
 *
 * <p>표·정의목록·지표 카드는 제외한다. contentEditable 로 자유롭게 고치면 구조가 무너지고,
 * 서버는 그 결과를 문단 하나로밖에 되돌릴 수 없다. 산문만 고치게 둔다.
 */
const EDITABLE_KINDS = new Set<Block["kind"]>(["p", "h3", "note", "notice", "highlight"]);

function BlockView({
  block,
  first,
  evidence,
  index,
  editing,
}: {
  block: Block;
  first: boolean;
  evidence: Evidence[];
  /** 섹션 안에서의 위치 — 서버가 어느 문단인지 식별하는 값 */
  index: number;
  editing: boolean;
}) {
  const m = gap(block.kind, first);
  const canEdit = editing && EDITABLE_KINDS.has(block.kind);
  // 수정된 문단은 근거가 떨어져 있으므로 표시로 구분한다
  const editedMark = "edited" in block && block.edited ? " border-l-[3px] border-indigo pl-[0.75rem]" : "";
  const edit = {
    "data-block-index": index,
    contentEditable: canEdit,
    suppressContentEditableWarning: true,
    className: canEdit ? "outline-none focus:bg-lavender/40 rounded-[0.25rem]" : "",
  };

  switch (block.kind) {
    case "h3":
      return (
        <h3 {...edit} className={`mb-[0.625rem] text-sm font-bold ${m} ${edit.className}`}>
          {block.text}
        </h3>
      );

    case "p":
      return (
        <p {...edit} className={`text-[0.90625rem] ${m}${editedMark} ${edit.className}`}>
          <Rich nodes={block.text} />
        </p>
      );

    case "note":
      return (
        <p
          {...edit}
          className={`mb-[0.875rem] text-[0.8125rem] text-muted ${m} ${edit.className}`}
        >
          <Rich nodes={block.text} />
        </p>
      );

    case "metrics":
      return (
        <div className={`grid grid-cols-3 gap-[0.625rem] ${m}`}>
          {block.items.map((item) => (
            <MetricCard key={item.label} item={item} />
          ))}
        </div>
      );

    case "kv":
      return (
        <dl
          className={`grid grid-cols-[7.5rem_1fr] gap-x-[1rem] gap-y-[0.5rem] text-[0.90625rem] ${m}`}
        >
          {block.rows.map((row) => (
            <Fragment key={row.key}>
              <dt className="pt-[0.0625rem] text-[0.84375rem] text-muted">{row.key}</dt>
              <dd>
                <Rich nodes={row.value} />
              </dd>
            </Fragment>
          ))}
        </dl>
      );

    case "list":
      return (
        <ul className={m}>
          {block.items.map((item, i) => (
            <li
              key={i}
              className="border-b border-line py-[0.625rem] text-[0.90625rem] last:border-b-0"
            >
              {item.label && <b className="font-semibold">{item.label}</b>}
              <Rich nodes={item.text} />
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <table className={`${TABLE} ${m}`}>
          <thead>
            <tr>
              {block.head.map((h) => (
                <th key={h} className={TH}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className={TR}>
                {row.map((c, j) => (
                  <td key={j} className={TD} rowSpan={c.rowSpan}>
                    <Rich nodes={c.text} />
                    {c.note && (
                      <>
                        <br />
                        <span className="text-xs text-faint">{c.note}</span>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case "highlight":
      return (
        <div className={`rounded-xl bg-lavender px-[1.25rem] py-[1rem] text-[0.875rem] ${m}`}>
          {block.label && <b className="font-semibold text-indigo-deep">{block.label}</b>}
          <Rich nodes={block.text} />
        </div>
      );

    case "notice":
      return (
        <div
          className={`rounded-xl bg-amber-tint px-[1.125rem] py-[0.875rem] text-[0.84375rem] text-amber ${m}`}
        >
          <Rich nodes={block.text} />
        </div>
      );

    case "evidence-table":
      return (
        <table className={TABLE}>
          <thead>
            <tr>
              {["ID", "내용", "출처", "기준시점"].map((h) => (
                <th key={h} className={TH}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {evidence.map((e) => (
              <tr key={e.id} className={TR}>
                <td className={`${TD} tabular-nums`}>{e.id}</td>
                <td className={TD}>{e.desc}</td>
                <td className={TD}>{e.source}</td>
                <td className={TD}>{e.asOf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
  }
}

export function PlanSectionView({
  section,
  evidence,
  editing,
}: {
  section: PlanSection;
  evidence: Evidence[];
  /** 편집 모드에서는 섹션 본문을 직접 수정할 수 있다 */
  editing: boolean;
}) {
  return (
    <section
      id={section.id}
      data-section-id={section.id}
      className={`mb-[1rem] scroll-mt-[1.25rem] rounded-[1.125rem] bg-surface px-[1.875rem] pt-[1.625rem] pb-[1.75rem] ${
        editing ? "editing-section" : ""
      }`}
    >
      <h2 className="mb-[0.875rem] flex items-baseline gap-[0.625rem] text-[1.03125rem] font-bold tracking-[-0.01em]">
        <span className="text-xs font-semibold tabular-nums text-faint">{section.no}</span>
        {section.title}
      </h2>
      {section.blocks.map((block, i) => (
        <BlockView
          key={i}
          block={block}
          first={i === 0}
          evidence={evidence}
          index={i}
          editing={editing}
        />
      ))}
    </section>
  );
}
