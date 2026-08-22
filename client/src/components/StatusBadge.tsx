import { cn } from "@/lib/utils";

const palette = (status: string) => {
  const value = status.toLowerCase();
  if (value.includes("blocked")) return "border-amber-200 bg-amber-50 text-amber-800";
  if (value.includes("failed")) return "border-rose-200 bg-rose-50 text-rose-800";
  if (value.includes("verified") || value.includes("passed") || value.includes("complete") || value.includes("active")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (value.includes("rendered")) return "border-indigo-200 bg-indigo-50 text-indigo-800";
  return "border-slate-200 bg-slate-50 text-slate-600";
};

export function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.02em]", palette(status), className)}>
      {statusLabel(status)}
    </span>
  );
}
