import type { ReactNode } from "react";
import clsx from "clsx";

export function DotGridBackground({
  children,
  className,
  variant = "default",
}: {
  children?: ReactNode;
  className?: string;
  variant?: "default" | "faint";
}) {
  return (
    <div
      className={clsx(
        variant === "faint" ? "dot-grid-faint" : "dot-grid",
        "bg-board",
        className
      )}
    >
      {children}
    </div>
  );
}
