import { ReelDetailPanel } from "@/components/ReelDetailPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

const DOMAINS = ["all", "Psychology", "Neuroscience", "Mental Health Literacy", "Diet and Brain Health", "Spiritual Traditions", "Philosophy of Mind", "Consciousness", "Human Behaviour", "Memory", "Emotions", "Habits", "Meditation", "Learning", "Decision Making", "Sleep and Stress"];
const STATUSES = ["all", "pending", "verified_against_existing_research_notes", "complete", "rendered_local_fallback", "passed_local_and_visual", "blocked_gws_authentication", "verified", "failed"];

export default function ReelsPage() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedReelId, setSelectedReelId] = useState("REEL_0001");
  const input = useMemo(() => ({ search, domain, workflowStatus: status, page, pageSize: 25 }), [search, domain, status, page]);
  const reels = trpc.reels.list.useQuery(input);
  const detail = trpc.reels.detail.useQuery({ reelId: selectedReelId });
  const totalPages = Math.max(1, Math.ceil((reels.data?.total ?? 0) / 25));

  const resetPage = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="eyebrow">Reel registry</p><h1 className="page-title">Search the production record</h1><p className="page-copy">Filter the persisted artifact snapshot by topic and workflow state. Planned items remain visible; no missing artifact is hidden.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm"><span className="font-semibold text-slate-950">{reels.data?.total ?? 0}</span> matching records</div>
      </header>

      <section className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
          <label className="relative block"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search reel ID, domain, angle or format" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" /></label>
          <select value={domain} onChange={event => resetPage(setDomain, event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-indigo-400"><option value="all">All domains</option>{DOMAINS.slice(1).map(item => <option key={item} value={item}>{item}</option>)}</select>
          <select value={status} onChange={event => resetPage(setStatus, event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-indigo-400"><option value="all">All workflow states</option>{STATUSES.slice(1).map(item => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select>
        </div>
      </section>

      {reels.error && <section className="rounded-[1.2rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">The reel registry could not be loaded. Filters remain unchanged and no missing records are being inferred.</section>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.8fr)]">
        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-indigo-600" /><span className="text-sm font-semibold text-slate-900">Artifact inventory</span></div><span className="text-xs text-slate-500">Page {page} of {totalPages}</span></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left"><thead className="bg-slate-50 text-[11px] uppercase tracking-[0.1em] text-slate-500"><tr><th className="px-5 py-3 font-semibold">Reel</th><th className="px-4 py-3 font-semibold">Domain</th><th className="px-4 py-3 font-semibold">Research</th><th className="px-4 py-3 font-semibold">Media / QC</th><th className="px-4 py-3 font-semibold">Drive</th></tr></thead><tbody className="divide-y divide-slate-100">{reels.isLoading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">Loading persisted artifacts…</td></tr> : reels.error ? <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-rose-700">The registry request failed.</td></tr> : reels.data?.items.length ? reels.data.items.map(reel => <tr key={reel.reelId} onClick={() => setSelectedReelId(reel.reelId)} className={`cursor-pointer transition-colors hover:bg-indigo-50/45 ${selectedReelId === reel.reelId ? "bg-indigo-50/70" : ""}`}><td className="px-5 py-4"><p className="font-semibold text-slate-950">{reel.reelId}</p><p className="mt-1 text-xs text-slate-500">{reel.batchId} · {reel.angle}</p></td><td className="px-4 py-4 text-sm text-slate-700">{reel.domain}</td><td className="px-4 py-4"><StatusBadge status={reel.researchStatus} /></td><td className="px-4 py-4"><div className="space-y-1"><StatusBadge status={reel.mediaStatus} /><StatusBadge status={reel.qcStatus} /></div></td><td className="px-4 py-4"><StatusBadge status={reel.driveStatus} /></td></tr>) : <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">No reels match the current filters.</td></tr>}</tbody></table></div>
          <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><p className="text-xs text-slate-500">Use a record to open its artifact detail.</p><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(value => Math.max(1, value - 1))} className="icon-button disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button disabled={page === totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))} className="icon-button disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></footer>
        </section>
        {detail.error ? <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">The selected reel detail could not be loaded.</div> : <ReelDetailPanel reel={detail.data} />}
      </div>
    </div>
  );
}
