import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type SourceReference = {
  title: string;
  url: string;
};

export type ArtifactReelSeed = {
  reelId: string;
  sequence: number;
  batchId: string;
  domain: string;
  angle: string;
  format: string;
  language: string;
  durationTargetSeconds: number;
  aspectRatio: string;
  researchStatus: string;
  scriptStatus: string;
  mediaStatus: string;
  qcStatus: string;
  driveStatus: string;
  sourceRefs: SourceReference[];
  artifactMeta: Record<string, unknown>;
  summary: string;
};

const DOMAINS = [
  "Psychology",
  "Neuroscience",
  "Mental Health Literacy",
  "Diet and Brain Health",
  "Spiritual Traditions",
  "Philosophy of Mind",
  "Consciousness",
  "Human Behaviour",
  "Memory",
  "Emotions",
  "Habits",
  "Meditation",
  "Learning",
  "Decision Making",
  "Sleep and Stress",
] as const;

const ANGLES = [
  "definition",
  "mechanism",
  "evidence",
  "myth check",
  "daily observation",
  "safe experiment",
  "individual differences",
  "measurement",
  "limits of evidence",
  "social context",
  "student context",
  "work context",
  "family context",
  "older-adult context",
  "cultural context",
  "history of ideas",
  "ethical question",
  "expert question",
  "comparison",
  "source literacy",
] as const;

const FORMATS = [
  "strong hook with three points",
  "question and evidence answer",
  "visual metaphor and takeaway",
  "myth versus evidence",
  "one-minute explainer",
  "common mistake and correction",
  "three-step reflection",
  "research finding with caveat",
  "daily practice with boundary",
  "book or expert idea separated from evidence",
] as const;

const REEL_0001_SOURCES: SourceReference[] = [
  { title: "American Psychological Association — Stress", url: "https://www.apa.org/topics/stress" },
  { title: "CDC — Managing Stress", url: "https://www.cdc.gov/mental-health/living-with/index.html" },
];

/** Deterministic fixture generator used by unit tests only; runtime imports never call this. */
export function buildArtifactSeeds(): ArtifactReelSeed[] {
  const seeds: ArtifactReelSeed[] = [];
  let sequence = 1;

  for (const domain of DOMAINS) {
    for (const angle of ANGLES) {
      for (const format of FORMATS) {
        const reelId = `REEL_${String(sequence).padStart(4, "0")}`;
        const batchId = `Batch_${String(Math.floor((sequence - 1) / 30) + 1).padStart(3, "0")}`;
        const isFirst = sequence === 1;
        seeds.push({
          reelId,
          sequence,
          batchId,
          domain,
          angle,
          format,
          language: "hi-IN",
          durationTargetSeconds: 60,
          aspectRatio: "9:16",
          researchStatus: isFirst ? "verified_against_existing_research_notes" : "pending",
          scriptStatus: isFirst ? "complete" : "pending",
          mediaStatus: isFirst ? "rendered_local_fallback" : "pending",
          qcStatus: isFirst ? "passed_local_and_visual" : "pending",
          driveStatus: isFirst ? "blocked_gws_authentication" : "pending",
          sourceRefs: isFirst ? REEL_0001_SOURCES : [],
          artifactMeta: isFirst
            ? {
                captionFile: "Batch_001/metadata/REEL_0001_captions.srt",
                renderFile: "Batch_001/renders/REEL_0001.mp4",
                localMetadataFile: "Batch_001/metadata/REEL_0001_manifest.json",
                localQcFile: "Batch_001/qc/REEL_0001_qc.json",
                animationMethod: "gentle Ken Burns motion over AI-generated first keyframe",
                videoGeneration: "blocked by free plan limit 1/1",
                driveBlocker: "Google Workspace CLI returned 401: no credentials provided",
                scriptExcerpt: "तनाव अक्सर किसी पहचाने जा सकने वाले दबाव के जवाब में आता है—जैसे परीक्षा, समय-सीमा, बहस या आर्थिक समस्या। चिंता कभी-कभी बिना स्पष्ट कारण के भी लगातार चिंता या आशंका के रूप में बनी रह सकती है। दोनों मन और शरीर को प्रभावित कर सकते हैं, लेकिन निदान केवल योग्य पेशेवर कर सकता है। अगली बार ट्रिगर को नाम दें, शरीर की संवेदना पर ध्यान दें, और वह अगला कदम लिखें जिसे आप नियंत्रित कर सकते हैं।",
                evidenceNotes: "APA stress को internal या external stressor के प्रति physiological या psychological response के रूप में समझाता है। CDC occasional stress को सामान्य बताता है, पर लंबे समय तक चलने वाले तनाव के लिए सहायता लेने की बात करता है।",
                captionText: "तनाव और चिंता संबंधित हो सकते हैं, लेकिन हमेशा एक जैसे नहीं होते। लगातार असर हो तो qualified professional से बात करें। यह सामान्य जानकारी है, व्यक्तिगत चिकित्सा सलाह नहीं।",
              }
            : {
                source: "Existing local 3,000-reel manifest snapshot",
                workflowState: "planned",
              },
          summary: isFirst
            ? "Hindi explainer distinguishing stress from anxiety; locally rendered, technical and visual QC passed, but not Drive-verified."
            : `Planned ${domain} reel using the ${angle} angle and ${format} format.`,
        });
        sequence += 1;
      }
    }
  }

  return seeds;
}

export const OPERATION_SEEDS = [
  {
    operationKey: "gpt_oss_120b",
    label: "GPT-OSS-120B feasibility",
    status: "blocked",
    detail: "The public model is not downloaded locally. This sandbox has no GPU, approximately 3.8 GiB RAM, and approximately 13 GiB free disk, so remote inference or a GPU host is required.",
    metadata: { model: "openai/gpt-oss-120b", route: "remote_provider_or_gpu_host_required", localDownload: false },
  },
  {
    operationKey: "video_generation_quota",
    label: "Video generation quota",
    status: "blocked",
    detail: "The next AI video clip was blocked by the free-plan daily generation limit (1/1). Reel 0001 uses a transparent local motion fallback and is not labelled as a fully AI-animated render.",
    metadata: { plan: "free", dailyLimit: "1/1", fallback: "Ken Burns motion over AI keyframe" },
  },
  {
    operationKey: "google_drive_verification",
    label: "Google Drive verification",
    status: "blocked",
    detail: "The local Google Workspace CLI returned HTTP 401 because no credentials were provided. No Drive folder or file upload is claimed as verified.",
    metadata: { requiredPath: "/content/drive/MyDrive/AI_Assistant/", verification: false },
  },
  {
    operationKey: "daily_continuation_schedule",
    label: "Daily continuation schedule",
    status: "active",
    detail: "The continuation schedule is active at 09:00 Asia/Kolkata. It resumes only when research, quota, model access, and authenticated storage are available.",
    metadata: { cron: "0 0 9 * * *", timezone: "Asia/Kolkata", scheduleStatus: "active" },
  },
] as const;

type LocalManifestRecord = {
  reel_id: string;
  sequence: number;
  batch: string;
  language: string;
  duration_target_seconds: number;
  aspect_ratio: string;
  domain: string;
  angle: string;
  format: string;
  research_status: string;
  script_status: string;
  media_status: string;
  qc_status: string;
  drive_status: string;
  source_refs?: SourceReference[];
  local_render_file?: string;
  local_metadata_file?: string;
  local_qc_file?: string;
  caption_file?: string;
  render_file?: string;
  last_error?: string;
};

type ReelOneArtifacts = {
  metadata: Record<string, unknown>;
  qc: Record<string, unknown>;
  script: string;
  research: string;
  checkpoint: Record<string, unknown>;
};

export type ArtifactImportSnapshot = {
  seeds: ArtifactReelSeed[];
  sourceName: string;
  detail: string;
};

const DEFAULT_ARTIFACT_ROOT = "/home/ubuntu/AI_Assistant";

async function readTextIfPresent(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

function jsonFromText<T>(text: string | null, fallback: T): T {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function section(markdown: string, heading: string, nextHeading: string) {
  const start = markdown.indexOf(heading);
  if (start < 0) return "";
  const fromStart = markdown.slice(start + heading.length);
  const end = fromStart.indexOf(nextHeading);
  return (end < 0 ? fromStart : fromStart.slice(0, end)).trim();
}

export function mapLocalManifestRecord(record: LocalManifestRecord, reelOne?: ReelOneArtifacts): ArtifactReelSeed {
  const isReelOne = record.reel_id === "REEL_0001" && reelOne;
  const metadata = isReelOne ? reelOne.metadata : {};
  const qc = isReelOne ? reelOne.qc : {};
  const scriptExcerpt = isReelOne ? section(reelOne.script, "## Voiceover", "## Visual beats") : "";
  const evidenceNotes = isReelOne ? section(reelOne.script, "## Evidence framing", "## Caption") : "";
  const captionText = isReelOne ? section(reelOne.script, "## Caption", "**Hashtags:") : "";
  const sourceRefs = isReelOne
    ? ((metadata.source_refs as SourceReference[] | undefined) ?? record.source_refs ?? [])
    : (record.source_refs ?? []);
  const artifactMeta: Record<string, unknown> = {
    localRenderFile: record.local_render_file ?? record.render_file ?? null,
    localMetadataFile: record.local_metadata_file ?? null,
    localQcFile: record.local_qc_file ?? null,
    captionFile: record.caption_file ?? null,
    lastError: record.last_error ?? null,
  };

  if (isReelOne) {
    Object.assign(artifactMeta, {
      scriptExcerpt,
      evidenceNotes,
      captionText,
      renderFile: metadata.render_file ?? record.render_file ?? null,
      animationMethod: metadata.animation_method ?? null,
      aiVideoGenerationStatus: metadata.ai_video_generation_status ?? null,
      driveBlocker: record.last_error ?? metadata.drive_status ?? null,
      qcPassed: qc.qc_passed ?? null,
      visualQcPassed: qc.visual_qc_passed ?? null,
      researchArtifactPresent: reelOne.research.length > 0,
      checkpointDriveStatus: reelOne.checkpoint.drive_status ?? null,
    });
  }

  const driveBlocker = typeof artifactMeta.driveBlocker === "string" ? artifactMeta.driveBlocker : "";
  return {
    reelId: record.reel_id,
    sequence: record.sequence,
    batchId: record.batch,
    domain: record.domain,
    angle: record.angle,
    format: record.format,
    language: record.language,
    durationTargetSeconds: record.duration_target_seconds,
    aspectRatio: record.aspect_ratio,
    researchStatus: record.research_status,
    scriptStatus: record.script_status,
    mediaStatus: record.media_status,
    qcStatus: record.qc_status,
    driveStatus: record.drive_status,
    sourceRefs,
    artifactMeta,
    summary: isReelOne
      ? `Hindi explainer from the existing Reel 0001 artifact set. Local QC is ${record.qc_status}; Drive status is ${record.drive_status}${driveBlocker ? ` because ${driveBlocker}` : ""}.`
      : `Existing manifest record for ${record.domain}: ${record.research_status} research, ${record.script_status} script, ${record.media_status} media, ${record.qc_status} QC, and ${record.drive_status} Drive state.`,
  };
}

export async function loadArtifactSnapshot(artifactRoot = process.env.REEL_ARTIFACT_ROOT ?? DEFAULT_ARTIFACT_ROOT): Promise<ArtifactImportSnapshot> {
  const manifestPath = join(artifactRoot, "manifests", "reel_manifest.jsonl");
  const reelOneRoot = join(artifactRoot, "3000_HINDI_RESEARCH_REELS", "Batch_001");
  const [manifestText, metadataText, qcText, scriptText, researchText, checkpointText] = await Promise.all([
    readTextIfPresent(manifestPath),
    readTextIfPresent(join(reelOneRoot, "metadata", "REEL_0001_manifest.json")),
    readTextIfPresent(join(reelOneRoot, "qc", "REEL_0001_qc.json")),
    readTextIfPresent(join(reelOneRoot, "scripts", "REEL_0001_script.md")),
    readTextIfPresent(join(artifactRoot, "documents", "existing_reel_seed", "68_reels_research.md")),
    readTextIfPresent(join(artifactRoot, "checkpoints", "pipeline_state.json")),
  ]);

  if (!manifestText) {
    throw new Error(`Required artifact manifest is unavailable at ${manifestPath}. No synthetic reel records are generated at runtime.`);
  }

  const reelOne: ReelOneArtifacts = {
    metadata: jsonFromText<Record<string, unknown>>(metadataText, {}),
    qc: jsonFromText<Record<string, unknown>>(qcText, {}),
    script: scriptText ?? "",
    research: researchText ?? "",
    checkpoint: jsonFromText<Record<string, unknown>>(checkpointText, {}),
  };
  const records = manifestText
    .split("\n")
    .filter(Boolean)
    .map(line => jsonFromText<LocalManifestRecord | null>(line, null))
    .filter((record): record is LocalManifestRecord => record !== null);

  if (records.length !== 3000) {
    throw new Error(`Expected 3,000 imported manifest records but found ${records.length}. The dashboard will not substitute generated records.`);
  }

  return {
    seeds: records.map(record => mapLocalManifestRecord(record, reelOne)),
    sourceName: "Existing local 3,000-reel artifact files",
    detail: `Imported ${records.length} records from the existing JSONL manifest with Reel 0001 script, metadata, QC, research, and checkpoint enrichment from ${artifactRoot}.`,
  };
}
