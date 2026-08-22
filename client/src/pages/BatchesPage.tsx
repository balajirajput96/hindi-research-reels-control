import { StatusBadge } from "@/components/StatusBadge";
import { trpc } from "@/lib/trpc";
import { Boxes, CheckCircle2, ChevronLeft, ChevronRight, CloudOff, Film } from "lucide-react";
import { useState } from "react";

export default function BatchesPage() {
  const batches = trpc.reels.batches.useQuery();
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil((batches.data?.length ?? 0) / pageSize));
  const visibleBatches = batches.data?.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="space-y-6">
      <header><p className="eyebrow">Batch progress</p><h1 className="page-title">100 batches, one verifiable chain</h1><p className="page-copy">Each batch contains 30 planned reels. A batch cannot be represented as Drive-complete until its individual artifacts have verified uploads.</p></header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Batch size", value: "30", icon: Boxes }, { label: "Total batches", value: "100", icon: Film }, { label: "QC-passed items", value: String(batches.data?.reduce((sum, item) => sum + item.qcPassed, 0) ?? 0), icon: CheckCircle2 }, { label: "Drive verified", value: String(batches.data?.reduce((sum, item) => sum + item.driveVerified, 0) ?? 0), icon: CloudOff }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-indigo-600" /><p className="mt-5 text-3xl font-semibold tracking-[-0.06em] text-slate-950">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>)}
      </section>
      {batches.error && <section className="rounded-[1.2rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">Batch data could not be loaded. The dashboard is not treating that failure as an empty production queue.</section>}
      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-semibold text-slate-900">Batch registry</h2><span className="text-xs text-slate-500">Page {page} of {totalPages}</span></div><div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3">{batches.isLoading ? <p className="bg-white p-8 text-sm text-slate-500">Loading batches…</p> : batches.error ? <p className="bg-white p-8 text-sm text-rose-700">Batch registry is unavailable.</p> : visibleBatches?.length ? visibleBatches.map(batch => <article key={batch.batchId} className="bg-white p-5 transition-colors hover:bg-indigo-50/25"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-950">{batch.batchId}</h3><StatusBadge status={batch.blocked ? "blocked" : batch.driveVerified ? "verified" : "pending"} /></div><div className="mt-4 grid grid-cols-3 gap-3 text-center"><div><p className="text-lg font-semibold text-slate-950">{batch.reelCount}</p><p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">Planned</p></div><div><p className="text-lg font-semibold text-indigo-700">{batch.qcPassed}</p><p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">QC passed</p></div><div><p className="text-lg font-semibold text-emerald-700">{batch.driveVerified}</p><p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">Drive</p></div></div></article>) : <p className="bg-white p-8 text-sm text-slate-500">No batch records are available.</p>}</div><footer className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><p className="text-xs text-slate-500">Showing up to 24 batches per page.</p><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(value => Math.max(1, value - 1))} className="icon-button disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button disabled={page === totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))} className="icon-button disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></footer></section>
    </div>
  );
}
