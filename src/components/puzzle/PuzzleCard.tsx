import type { ElementType, ComponentPropsWithoutRef } from "react";
import clsx from "clsx";

type PuzzleCardProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function PuzzleCard<T extends ElementType = "div">({
  as,
  className,
  ...props
}: PuzzleCardProps<T>) {
  const Component = as ?? "div";
  return (
    <Component className={clsx("puzzle-card", className)} {...props} />
  );
}
