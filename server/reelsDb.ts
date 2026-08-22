import { and, asc, count, desc, eq, like, or, sql } from "drizzle-orm";
import { artifactImports, operationSnapshots, reels } from "../drizzle/schema";
import { getDb } from "./db";
import { loadArtifactSnapshot, OPERATION_SEEDS, type ArtifactReelSeed } from "./artifactSeed";

type ReelFilters = {
  search?: string;
  domain?: string;
  workflowStatus?: string;
  batchId?: string;
  page: number;
  pageSize: number;
};

type OverviewAggregate = {
  planned: number | string | null;
  locallyRendered: number | string | null;
  qcPassed: number | string | null;
  driveVerified: number | string | null;
  blocked: number | string | null;
  failed: number | string | null;
};

type BatchAggregate = {
  batchId: string;
  reelCount: number | string | null;
  localRenders: number | string | null;
  qcPassed: number | string | null;
  driveVerified: number | string | null;
  blocked: number | string | null;
};

let artifactSnapshotPromise: Promise<void> | null = null;

export function normalizeOverviewMetrics(metrics: OverviewAggregate | undefined) {
  return {
    planned: Number(metrics?.planned ?? 0),
    locallyRendered: Number(metrics?.locallyRendered ?? 0),
    qcPassed: Number(metrics?.qcPassed ?? 0),
    driveVerified: Number(metrics?.driveVerified ?? 0),
    blocked: Number(metrics?.blocked ?? 0),
    failed: Number(metrics?.failed ?? 0),
  };
}

export function normalizeBatchAggregates(rows: BatchAggregate[]) {
  return rows.map(row => ({
    batchId: row.batchId,
    reelCount: Number(row.reelCount ?? 0),
    localRenders: Number(row.localRenders ?? 0),
    qcPassed: Number(row.qcPassed ?? 0),
    driveVerified: Number(row.driveVerified ?? 0),
    blocked: Number(row.blocked ?? 0),
  }));
}

const toInsert = (seed: ArtifactReelSeed) => ({
  reelId: seed.reelId,
  sequence: seed.sequence,
  batchId: seed.batchId,
  domain: seed.domain,
  angle: seed.angle,
  format: seed.format,
  language: seed.language,
  durationTargetSeconds: seed.durationTargetSeconds,
  aspectRatio: seed.aspectRatio,
  researchStatus: seed.researchStatus,
  scriptStatus: seed.scriptStatus,
  mediaStatus: seed.mediaStatus,
  qcStatus: seed.qcStatus,
  driveStatus: seed.driveStatus,
  sourceRefsJson: JSON.stringify(seed.sourceRefs),
  artifactMetaJson: JSON.stringify(seed.artifactMeta),
  summary: seed.summary,
});

async function initializeArtifactSnapshot() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const snapshot = await loadArtifactSnapshot();
  const [reelCountResult, importCountResult, operationCountResult] = await Promise.all([
    db.select({ value: count() }).from(reels),
    db.select({ value: count() }).from(artifactImports).where(eq(artifactImports.sourceName, snapshot.sourceName)),
    db.select({ value: count() }).from(operationSnapshots),
  ]);
  const reelCount = Number(reelCountResult[0]?.value ?? 0);
  const importCount = Number(importCountResult[0]?.value ?? 0);
  const operationCount = Number(operationCountResult[0]?.value ?? 0);

  if (reelCount >= snapshot.seeds.length && importCount > 0 && operationCount >= OPERATION_SEEDS.length) {
    return;
  }

  const inserts = snapshot.seeds.map(toInsert);
  if (reelCount < snapshot.seeds.length || importCount === 0) {
    for (let index = 0; index < inserts.length; index += 200) {
      const batch = inserts.slice(index, index + 200);
      await db.insert(reels).values(batch).onDuplicateKeyUpdate({
        set: {
          batchId: sql`VALUES(${reels.batchId})`,
          domain: sql`VALUES(${reels.domain})`,
          angle: sql`VALUES(${reels.angle})`,
          format: sql`VALUES(${reels.format})`,
          language: sql`VALUES(${reels.language})`,
          durationTargetSeconds: sql`VALUES(${reels.durationTargetSeconds})`,
          aspectRatio: sql`VALUES(${reels.aspectRatio})`,
          researchStatus: sql`VALUES(${reels.researchStatus})`,
          scriptStatus: sql`VALUES(${reels.scriptStatus})`,
          mediaStatus: sql`VALUES(${reels.mediaStatus})`,
          qcStatus: sql`VALUES(${reels.qcStatus})`,
          driveStatus: sql`VALUES(${reels.driveStatus})`,
          sourceRefsJson: sql`VALUES(${reels.sourceRefsJson})`,
          artifactMetaJson: sql`VALUES(${reels.artifactMetaJson})`,
          summary: sql`VALUES(${reels.summary})`,
          updatedAt: new Date(),
        },
      });
    }
  }
  if (importCount === 0) {
    await db.insert(artifactImports).values({
      sourceName: snapshot.sourceName,
      importedCount: inserts.length,
      status: "complete",
      detail: snapshot.detail,
    });
  }

  if (operationCount < OPERATION_SEEDS.length) {
    for (const operation of OPERATION_SEEDS) {
      await db
        .insert(operationSnapshots)
        .values({
          operationKey: operation.operationKey,
          label: operation.label,
          status: operation.status,
          detail: operation.detail,
          metadataJson: JSON.stringify(operation.metadata),
        })
        .onDuplicateKeyUpdate({
          set: {
            label: operation.label,
            status: operation.status,
            detail: operation.detail,
            metadataJson: JSON.stringify(operation.metadata),
            updatedAt: new Date(),
          },
        });
    }
  }
}

export function ensureArtifactSnapshot() {
  if (!artifactSnapshotPromise) {
    artifactSnapshotPromise = initializeArtifactSnapshot().catch(error => {
      artifactSnapshotPromise = null;
      throw error;
    });
  }
  return artifactSnapshotPromise;
}

export async function getDashboardOverview() {
  await ensureArtifactSnapshot();
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const [metricRows, imports] = await Promise.all([
    db.select({
      planned: count(),
      locallyRendered: sql<number>`SUM(CASE WHEN ${reels.mediaStatus} <> 'pending' THEN 1 ELSE 0 END)`,
      qcPassed: sql<number>`SUM(CASE WHEN ${reels.qcStatus} LIKE '%passed%' THEN 1 ELSE 0 END)`,
      driveVerified: sql<number>`SUM(CASE WHEN ${reels.driveStatus} = 'verified' THEN 1 ELSE 0 END)`,
      blocked: sql<number>`SUM(CASE WHEN ${reels.driveStatus} LIKE '%blocked%' OR ${reels.mediaStatus} LIKE '%blocked%' THEN 1 ELSE 0 END)`,
      failed: sql<number>`SUM(CASE WHEN ${reels.researchStatus} = 'failed' OR ${reels.scriptStatus} = 'failed' OR ${reels.mediaStatus} = 'failed' OR ${reels.qcStatus} = 'failed' OR ${reels.driveStatus} = 'failed' THEN 1 ELSE 0 END)`,
    }).from(reels),
    db.select().from(artifactImports).orderBy(desc(artifactImports.createdAt)).limit(1),
  ]);
  const metrics = metricRows[0];
  return {
    metrics: normalizeOverviewMetrics(metrics),
    latestImport: imports[0] ?? null,
    currentBlocker: "Google Drive verification is blocked: the local Google Workspace CLI returned HTTP 401 because no credentials were available.",
  };
}

export async function listReels(filters: ReelFilters) {
  await ensureArtifactSnapshot();
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const clauses = [];
  if (filters.search?.trim()) {
    const value = `%${filters.search.trim()}%`;
    clauses.push(or(like(reels.reelId, value), like(reels.domain, value), like(reels.angle, value), like(reels.format, value)));
  }
  if (filters.domain && filters.domain !== "all") clauses.push(eq(reels.domain, filters.domain));
  if (filters.batchId && filters.batchId !== "all") clauses.push(eq(reels.batchId, filters.batchId));
  if (filters.workflowStatus && filters.workflowStatus !== "all") {
    clauses.push(
      or(
        eq(reels.researchStatus, filters.workflowStatus),
        eq(reels.scriptStatus, filters.workflowStatus),
        eq(reels.mediaStatus, filters.workflowStatus),
        eq(reels.qcStatus, filters.workflowStatus),
        eq(reels.driveStatus, filters.workflowStatus),
      ),
    );
  }
  const where = clauses.length ? and(...clauses) : undefined;
  const offset = (filters.page - 1) * filters.pageSize;
  const [items, totalResult] = await Promise.all([
    db.select().from(reels).where(where).orderBy(asc(reels.sequence)).limit(filters.pageSize).offset(offset),
    db.select({ value: count() }).from(reels).where(where),
  ]);
  return { items, total: totalResult[0]?.value ?? 0 };
}

export async function getReelDetail(reelId: string) {
  await ensureArtifactSnapshot();
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db.select().from(reels).where(eq(reels.reelId, reelId)).limit(1);
  return result[0] ?? null;
}

export async function listBatches() {
  await ensureArtifactSnapshot();
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const rows = await db.select({
    batchId: reels.batchId,
    reelCount: count(),
    localRenders: sql<number>`SUM(CASE WHEN ${reels.mediaStatus} <> 'pending' THEN 1 ELSE 0 END)`,
    qcPassed: sql<number>`SUM(CASE WHEN ${reels.qcStatus} LIKE '%passed%' THEN 1 ELSE 0 END)`,
    driveVerified: sql<number>`SUM(CASE WHEN ${reels.driveStatus} = 'verified' THEN 1 ELSE 0 END)`,
    blocked: sql<number>`SUM(CASE WHEN ${reels.driveStatus} LIKE '%blocked%' OR ${reels.mediaStatus} LIKE '%blocked%' THEN 1 ELSE 0 END)`,
  }).from(reels).groupBy(reels.batchId).orderBy(asc(reels.batchId));
  return normalizeBatchAggregates(rows);
}

export async function listOperations() {
  await ensureArtifactSnapshot();
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  return db.select().from(operationSnapshots).orderBy(asc(operationSnapshots.operationKey));
}
