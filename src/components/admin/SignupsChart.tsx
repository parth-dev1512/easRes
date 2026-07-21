"use client";

import { useState } from "react";
import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import type { SignupBucket } from "@/lib/admin/signups";

const WIDTH = 720;
const HEIGHT = 220;
const PADDING_LEFT = 32;
const PADDING_BOTTOM = 24;
const PADDING_TOP = 12;
const BAR_GAP = 2;

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SignupsChart({ data }: { data: SignupBucket[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const yMax = Math.ceil(maxCount / 5) * 5 || 5;
  const plotWidth = WIDTH - PADDING_LEFT;
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const slotWidth = plotWidth / data.length;
  const barWidth = Math.min(24, slotWidth - BAR_GAP);

  const yTicks = [0, yMax / 2, yMax].map((v) => Math.round(v));
  const tickIndices = [0, Math.floor(data.length / 2), data.length - 1];

  const active = hovered !== null ? data[hovered] : null;

  return (
    <PuzzleCard className="bg-white text-black p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
          Signups — last {data.length} days
        </h3>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label={`Daily signups over the last ${data.length} days`}
        >
          {yTicks.map((tick, i) => {
            const y = PADDING_TOP + plotHeight - (tick / yMax) * plotHeight;
            return (
              <g key={i}>
                <line
                  x1={PADDING_LEFT}
                  x2={WIDTH}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                />
                <text x={0} y={y + 4} fontSize={10} fill="#64748b">
                  {tick}
                </text>
              </g>
            );
          })}

          {data.map((bucket, i) => {
            const barHeight = (bucket.count / yMax) * plotHeight;
            const x = PADDING_LEFT + i * slotWidth + (slotWidth - barWidth) / 2;
            const y = PADDING_TOP + plotHeight - barHeight;
            const isHovered = hovered === i;
            return (
              <g key={bucket.date}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 1)}
                  rx={4}
                  fill={isHovered ? "#1c3fd9" : "#2e5bff"}
                />
                <rect
                  x={PADDING_LEFT + i * slotWidth}
                  y={PADDING_TOP}
                  width={slotWidth}
                  height={plotHeight}
                  fill="transparent"
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${formatDate(bucket.date)}: ${bucket.count} signups`}
                />
              </g>
            );
          })}

          {tickIndices.map((i) => (
            <text
              key={i}
              x={PADDING_LEFT + i * slotWidth + slotWidth / 2}
              y={HEIGHT - 6}
              fontSize={10}
              fill="#64748b"
              textAnchor="middle"
            >
              {formatDate(data[i].date)}
            </text>
          ))}
        </svg>

        {active && hovered !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full bg-black text-white text-xs font-bold px-2 py-1 whitespace-nowrap"
            style={{
              left: `${((PADDING_LEFT + hovered * slotWidth + slotWidth / 2) / WIDTH) * 100}%`,
              top: `${((PADDING_TOP + plotHeight - (active.count / yMax) * plotHeight) / HEIGHT) * 100}%`,
            }}
          >
            {formatDate(active.date)}: {active.count}
          </div>
        )}
      </div>
    </PuzzleCard>
  );
}
