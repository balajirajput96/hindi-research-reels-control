import { StatusBadge } from "@/components/StatusBadge";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CalendarClock, Cpu, Database, HardDrive, Sparkles } from "lucide-react";

const icons: Record<string, typeof Cpu> = { gpt_oss_120b: Cpu, video_generation_quota: Sparkles, google_drive_verification: HardDrive, daily_continuation_schedule: CalendarClock };

export default function OperationsPage() {
  const operations = trpc.reels.operations.useQuery();
  return (
    <div className="space-y-6">
      <header><p className="eyebrow">Operations console</p><h1 className="page-title">State before assumption</h1><p className="page-copy">The control center records the known model, quota, storage, and schedule states without presenting unavailable integrations as connected.</p></header>
      <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h2 className="font-semibold text-amber-950">Current production gate</h2><p className="mt-1 text-sm leading-6 text-amber-900/80">Google Drive verification is not available to the local runner because the Google Workspace CLI returned HTTP 401. Reel 0001 is kept as locally QC-passed, not falsely marked complete.</p></div></div></section>
      {operations.error && <section className="rounded-[1.2rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">Operation snapshots could not be loaded. No unavailable service is being represented as connected.</section>}
      <section className="grid gap-5 lg:grid-cols-2">{operations.isLoading ? <p className="text-sm text-slate-500">Loading operation snapshots…</p> : operations.error ? <p className="text-sm text-rose-700">Operation snapshots are unavailable.</p> : operations.data?.length ? operations.data.map(operation => { const Icon = icons[operation.operationKey] ?? Database; let metadata: Record<string, string> = {}; try { metadata = JSON.parse(operation.metadataJson); } catch { metadata = {}; } return <article key={operation.operationKey} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"><div className="flex items-start justify-between gap-4"><div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700"><Icon className="h-5 w-5" /></div><StatusBadge status={operation.status} /></div><h2 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-slate-950">{operation.label}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{operation.detail}</p><div className="mt-5 grid gap-2 border-t border-slate-100 pt-4">{Object.entries(metadata).map(([key, value]) => <div key={key} className="flex items-start justify-between gap-5 text-xs"><span className="font-medium text-slate-500">{key.replaceAll(/([A-Z])/g, " $1")}</span><span className="max-w-[60%] text-right text-slate-700">{String(value)}</span></div>)}</div></article>}) : <p className="text-sm text-slate-500">No operation snapshots are recorded yet.</p>}</section>
    </div>
  );
}
