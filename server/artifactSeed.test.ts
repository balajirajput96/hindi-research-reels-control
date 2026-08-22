import { describe, expect, it } from "vitest";
import { buildArtifactSeeds, mapLocalManifestRecord, OPERATION_SEEDS } from "./artifactSeed";
import { normalizeBatchAggregates, normalizeOverviewMetrics } from "./reelsDb";

describe("buildArtifactSeeds", () => {
  it("creates the expected 3,000-item, 100-batch pipeline snapshot", () => {
    const seeds = buildArtifactSeeds();

    expect(seeds).toHaveLength(3000);
    expect(new Set(seeds.map(seed => seed.reelId)).size).toBe(3000);
    expect(new Set(seeds.map(seed => seed.batchId)).size).toBe(100);
    expect(seeds[0]).toMatchObject({ reelId: "REEL_0001", batchId: "Batch_001", sequence: 1, language: "hi-IN" });
    expect(seeds.at(-1)).toMatchObject({ reelId: "REEL_3000", batchId: "Batch_100", sequence: 3000 });
  });

  it("preserves the verified local facts and unresolved Drive blocker for Reel 0001", () => {
    const reelOne = buildArtifactSeeds()[0];

    expect(reelOne.qcStatus).toBe("passed_local_and_visual");
    expect(reelOne.driveStatus).toBe("blocked_gws_authentication");
    expect(reelOne.sourceRefs).toHaveLength(2);
    expect(reelOne.artifactMeta.driveBlocker).toContain("401");
  });
});

describe("operation seeds", () => {
  it("does not claim blocked integrations are connected", () => {
    const drive = OPERATION_SEEDS.find(operation => operation.operationKey === "google_drive_verification");
    const model = OPERATION_SEEDS.find(operation => operation.operationKey === "gpt_oss_120b");

    expect(drive?.status).toBe("blocked");
    expect(drive?.detail).toContain("No Drive folder or file upload is claimed as verified");
    expect(model?.status).toBe("blocked");
  });
});

describe("mapLocalManifestRecord", () => {
  it("maps an imported manifest record without inventing a verified Drive state", () => {
    const result = mapLocalManifestRecord({
      reel_id: "REEL_0042",
      sequence: 42,
      batch: "Batch_002",
      language: "hi-IN",
      duration_target_seconds: 60,
      aspect_ratio: "9:16",
      domain: "Neuroscience",
      angle: "evidence",
      format: "one-minute explainer",
      research_status: "pending",
      script_status: "pending",
      media_status: "pending",
      qc_status: "pending",
      drive_status: "pending",
      source_refs: [],
    });

    expect(result).toMatchObject({ reelId: "REEL_0042", batchId: "Batch_002", driveStatus: "pending" });
    expect(result.summary).toContain("Existing manifest record");
  });
});

describe("operational aggregate normalization", () => {
  it("preserves all dashboard metric states from persisted SQL aggregate values", () => {
    expect(normalizeOverviewMetrics({
      planned: "3000",
      locallyRendered: "1",
      qcPassed: "1",
      driveVerified: "0",
      blocked: "1",
      failed: "0",
    })).toEqual({ planned: 3000, locallyRendered: 1, qcPassed: 1, driveVerified: 0, blocked: 1, failed: 0 });
  });

  it("normalizes batch aggregates without hiding zero-value states", () => {
    expect(normalizeBatchAggregates([{ batchId: "Batch_001", reelCount: "30", localRenders: "1", qcPassed: "1", driveVerified: "0", blocked: "1" }]))
      .toEqual([{ batchId: "Batch_001", reelCount: 30, localRenders: 1, qcPassed: 1, driveVerified: 0, blocked: 1 }]);
  });
});
