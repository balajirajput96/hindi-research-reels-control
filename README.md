# Hindi Research Reels Control Center

This web dashboard is a full-stack control center for the 3,000-item Hindi research-reel pipeline. It turns the existing local pipeline structure into persisted reel, operation, and import-audit records, while distinguishing verified facts from pending work and access blockers.

## What the dashboard shows

The overview reports planned, locally rendered, QC-passed, Drive-verified, blocked, and failed reels. The reel registry supports search and filtering across the 3,000-record manifest. The Reel 0001 detail panel exposes its Hindi script excerpt, evidence notes, caption metadata, source links, local render/QC state, and the exact reason it is not Drive-complete. The operations page records the GPT-OSS feasibility decision, video-generation quota gate, Google Drive verification state, and daily continuation schedule.

## Artifact model

The dashboard persists an auditable snapshot of the following known source structure:

| Artifact | Dashboard treatment |
|---|---|
| 3,000-reel manifest | Stored as 3,000 records organized into 100 batches of 30. |
| Reel 0001 script, render and QC metadata | Stored as the only locally rendered and locally QC-passed record. |
| Research/source notes | Rendered as source metadata for Reel 0001; future reels remain pending until researched. |
| Pipeline checkpoint | Represented through current blocker and operations-state records. |
| Model and Drive feasibility reports | Stored as operation snapshots; they do not claim unavailable services are connected. |

## Truthfulness rules

The app never exposes a credential, token, password, or OAuth value. It does not claim that Google Drive, Hugging Face, a remote GPT-OSS provider, or Facebook is connected unless a verified operation records that state. In the current snapshot, Google Drive is blocked because the local Google Workspace CLI returned HTTP 401, and the next video-generation request was blocked by the free-plan daily limit. Reel 0001 remains locally QC-passed rather than complete until a verified Drive upload exists.

## Local development

Run the following from the project root:

```bash
pnpm test
pnpm check
pnpm build
```

The database schema is managed with Drizzle. The migration creates `reels`, `operation_snapshots`, and `artifact_imports`; the first dashboard query imports the actual 3,000-record JSONL manifest and enriches Reel 0001 from its local script, metadata, QC, research, and checkpoint files. If the required manifest is unavailable, the import fails visibly: the app does **not** manufacture substitute reel records. The app uses tRPC procedures only, not direct client-side fetch wrappers.

## Production and persistence

The deployed web application runs as a request-driven autoscaling service. It is a dashboard and persisted control plane, not an always-on media-generation worker. Long-running model execution, authenticated Google Drive upload, and quota-dependent video generation require a separate verified execution environment. The existing daily continuation schedule remains the system of record for resumable batch work.

## Publishing

After a project checkpoint is created, use the **Publish** button in the Management UI to deploy. The code can be exported to a private GitHub repository after validation. Do not place large media assets in the application repository or client public directory; use persistent storage and store only metadata in the database.
