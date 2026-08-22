import { ExternalLink, FileText, HardDrive, ShieldCheck, Sparkles } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

type Source = { title: string; url: string };

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function ReelDetailPanel({ reel }: { reel: any }) {
  if (!reel) {
    return <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">Select a reel to inspect its artifact record.</div>;
  }

  const sources = parseJson<Source[]>(reel.sourceRefsJson, []);
  const meta = parseJson<Record<string, string>>(reel.artifactMetaJson, {});
  const isReelOne = reel.reelId === "REEL_0001";

  return (
    <aside className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_56%,#ecfdf5_100%)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">Artifact detail</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-slate-950">{reel.reelId}</h2>
            <p className="mt-1 text-sm text-slate-500">{reel.batchId} · {reel.domain} · {reel.angle}</p>
          </div>
          <StatusBadge status={reel.driveStatus} />
        </div>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">{reel.summary}</p>
      </div>

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Research", reel.researchStatus],
            ["Script", reel.scriptStatus],
            ["Media", reel.mediaStatus],
            ["QC", reel.qcStatus],
          ].map(([label, status]) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <StatusBadge status={status} className="mt-2" />
            </div>
          ))}
        </section>

        {isReelOne && (
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/45 p-4">
            <div className="flex items-center gap-2 text-indigo-900"><Sparkles className="h-4 w-4" /><h3 className="text-sm font-semibold">Hindi script and evidence notes</h3></div>
            <p className="mt-3 text-sm leading-6 text-slate-700">{meta.scriptExcerpt}</p>
            <p className="mt-3 border-t border-indigo-100 pt-3 text-sm leading-6 text-slate-600">{meta.evidenceNotes}</p>
            <div className="mt-3 rounded-xl bg-white/70 p-3 text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-800">Caption:</span> {meta.captionText}</div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 text-slate-900"><FileText className="h-4 w-4" /><h3 className="text-sm font-semibold">Source metadata</h3></div>
          {sources.length ? (
            <div className="mt-3 space-y-2">
              {sources.map(source => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-sm text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40">
                  <span className="min-w-0 truncate">{source.title}</span><ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </a>
              ))}
            </div>
          ) : <p className="mt-3 text-sm text-slate-500">Source links will be attached after the research stage.</p>}
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <div className="flex items-center gap-2 text-amber-900"><HardDrive className="h-4 w-4" /><h3 className="text-sm font-semibold">Drive completion state</h3></div>
          <p className="mt-2 text-sm leading-6 text-amber-900/80">{meta.driveBlocker ?? "Drive verification has not started for this planned reel."}</p>
          {isReelOne && <p className="mt-2 text-xs leading-5 text-amber-800">Local render: {meta.renderFile ?? "not recorded"}. The dashboard does not label this reel complete until a verified Drive upload exists.</p>}
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/65 p-4">
          <div className="flex items-center gap-2 text-emerald-900"><ShieldCheck className="h-4 w-4" /><h3 className="text-sm font-semibold">Artifact integrity</h3></div>
          <p className="mt-2 text-sm leading-6 text-emerald-900/80">This view is a persisted snapshot of known local artifact metadata. It does not expose credentials or claim a connection that has not been verified.</p>
        </section>
      </div>
    </aside>
  );
}
