/** 대비되는 두 사각형으로 된 로고 마크 */
export function LogoMark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const box = size === "sm" ? "size-5" : "size-[2.125rem]";
  const square = size === "sm" ? "size-[0.8125rem]" : "size-[1.375rem]";

  return (
    <span className={`relative block flex-none ${box}`}>
      <i className={`absolute top-0 left-0 block bg-ink ${square}`} />
      <i className={`absolute right-0 bottom-0 block bg-indigo ${square}`} />
    </span>
  );
}
