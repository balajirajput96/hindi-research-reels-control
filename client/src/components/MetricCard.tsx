import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: number | string;
  detail: string;
  icon: LucideIcon;
  tone?: "slate" | "indigo" | "emerald" | "amber" | "rose";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-100 text-indigo-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return (
    <article className="group rounded-[1.35rem] border border-slate-200/80 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.045)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-950">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${tones[tone]}`}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-4 text-sm leading-5 text-slate-500">{detail}</p>
    </article>
  );
}
