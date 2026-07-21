import { PuzzleCard } from "@/components/puzzle/PuzzleCard";
import type { KpiResult } from "@/lib/admin/kpis";

export function KpiCard({ label, value, helpText }: KpiResult) {
  return (
    <PuzzleCard className="bg-white text-black p-6 flex flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <span className="text-4xl font-[900] tracking-tighter">{value}</span>
      {helpText && <span className="text-xs text-slate-500">{helpText}</span>}
    </PuzzleCard>
  );
}
