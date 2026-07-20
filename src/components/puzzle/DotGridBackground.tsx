import type { ReactNode } from "react";
import clsx from "clsx";

export function DotGridBackground({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("dot-grid bg-board", className)}>{children}</div>
  );
}
