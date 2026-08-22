import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowRight, BadgeCheck, CheckCircle2, CloudOff, Film, LayoutList, PlayCircle, ShieldAlert, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const overview = trpc.reels.overview.useQuery();
  const operations = trpc.reels.operations.useQuery();
  const preview = trpc.reels.list.useQuery({ page: 1, pageSize: 5 });
  const metrics = overview.data?.metrics;
  const metricCards = [
    { label: "Planned reels", value: metrics?.planned ?? "—", detail: "100 batches of 30 in the persisted manifest.", icon: LayoutList, tone: "slate" as const },
    { label: "Locally rendered", value: metrics?.locallyRendered ?? "—", detail: "Local artifacts that exist before Drive verification.", icon: Film, tone: "indigo" as const },
    { label: "QC passed", value: metrics?.qcPassed ?? "—", detail: "Technical and visual checks recorded in the artifact snapshot.", icon: BadgeCheck, tone: "emerald" as const },
    { label: "Drive verified", value: metrics?.driveVerified ?? "—", detail: "Only verified uploads qualify as complete reels.", icon: CloudOff, tone: "emerald" as const },
    { label: "Blocked", value: metrics?.blocked ?? "—", detail: "Visible production gates requiring authenticated access or quota.", icon: ShieldAlert, tone: "amber" as const },
    { label: "Failed", value: metrics?.failed ?? "—", detail: "No failure is silently removed from the operational record.", icon: AlertTriangle, tone: "rose" as const },
  ];
  const activeSchedule = operations.data?.find(operation => operation.operationKey === "daily_continuation_schedule");

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[1.8rem] bg-slate-950 px-6 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:px-9 lg:py-10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/35 blur-3xl" /><div className="absolute bottom-0 left-[28%] h-32 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">Hindi research reel pipeline</p><h1 className="mt-4 text-3xl font-semibold tracking-[-0.055em] sm:text-5xl">Evidence-led creativity, tracked with operational honesty.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">A control center for 3,000 planned Hindi reels across psychology, neuroscience, consciousness, habits, learning, diet and mental-health literacy.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => setLocation("/reels")} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition-transform active:scale-[0.98]"><PlayCircle className="h-4 w-4" />Open Reel 0001</button><button onClick={() => setLocation("/operations")} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"><Sparkles className="h-4 w-4" />Review operations</button></div></div>
      </section>

      <section className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-5 py-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><p className="font-semibold text-amber-950">Drive verification is currently blocked</p><p className="mt-1 text-sm leading-6 text-amber-900/80">{overview.data?.currentBlocker ?? "Checking persisted operation state…"}</p></div></div></section>

      {(overview.error || operations.error || preview.error) && <section className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900"><p className="font-semibold">A dashboard data request could not be completed.</p><p className="mt-1 text-rose-800">Refresh the page after the backend is available. No operational state has been inferred from the failed request.</p></section>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{metricCards.map(card => <MetricCard key={card.label} {...card} />)}</section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><p className="eyebrow">Artifact pulse</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-slate-950">Latest production records</h2></div><button onClick={() => setLocation("/reels")} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900">View registry <ArrowRight className="h-4 w-4" /></button></div><div className="divide-y divide-slate-100">{preview.error ? <p className="p-6 text-sm text-rose-700">Artifact records are unavailable right now.</p> : preview.isLoading ? <p className="p-6 text-sm text-slate-500">Loading the persisted artifact snapshot…</p> : preview.data?.items.length ? preview.data.items.map(reel => <button key={reel.reelId} onClick={() => setLocation("/reels")} className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-indigo-50/40"><div><p className="font-semibold text-slate-950">{reel.reelId} <span className="font-normal text-slate-400">· {reel.batchId}</span></p><p className="mt-1 text-sm text-slate-500">{reel.domain} · {reel.angle}</p></div><div className="flex flex-wrap justify-end gap-2"><StatusBadge status={reel.qcStatus} /><StatusBadge status={reel.driveStatus} /></div></button>) : <p className="p-6 text-sm text-slate-500">No persisted artifact records are available yet.</p>}</div></article>
        <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"><p className="eyebrow">Continuation</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">Daily workflow state</h2><div className="mt-5 rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-800">09:00 Asia/Kolkata</p><StatusBadge status={activeSchedule?.status ?? "pending"} /></div><p className="mt-3 text-sm leading-6 text-slate-600">{activeSchedule?.detail ?? "Loading schedule state…"}</p></div><div className="mt-4 flex items-center gap-2 text-xs leading-5 text-slate-500"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />The next run preserves the checkpoint rather than recreating completed work.</div></aside>
      </section>
    </div>
  );
}
