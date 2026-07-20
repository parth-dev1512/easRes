import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { PuzzleCard } from "./PuzzleCard";

const colorClasses = {
  red: "bg-puzzle-red",
  green: "bg-puzzle-green",
  blue: "bg-puzzle-blue",
  yellow: "bg-puzzle-yellow",
  pink: "bg-puzzle-pink",
} as const;

type PuzzleColor = keyof typeof colorClasses;

export function PuzzleTag({
  icon: Icon,
  title,
  subtitle,
  color,
  rotate = 0,
  className,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: PuzzleColor;
  rotate?: number;
  className?: string;
}) {
  return (
    <PuzzleCard
      className={clsx(
        "flex items-center gap-6 p-6",
        colorClasses[color],
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="bg-black w-20 h-20 flex items-center justify-center shrink-0">
        <Icon className="text-white" size={36} strokeWidth={2} />
      </div>
      <div>
        <h4 className="text-black font-impact text-3xl font-[900] leading-none uppercase tracking-tighter">
          {title.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h4>
        <p className="text-black/70 font-black text-[10px] mt-1 uppercase">
          {subtitle}
        </p>
      </div>
    </PuzzleCard>
  );
}
