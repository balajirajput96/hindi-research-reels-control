import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDashboardOverview, getReelDetail, listBatches, listOperations, listReels } from "../reelsDb";

export const reelsRouter = router({
  overview: publicProcedure.query(() => getDashboardOverview()),
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        domain: z.string().optional(),
        workflowStatus: z.string().optional(),
        batchId: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(25),
      }),
    )
    .query(({ input }) => listReels(input)),
  detail: publicProcedure.input(z.object({ reelId: z.string().min(1) })).query(({ input }) => getReelDetail(input.reelId)),
  batches: publicProcedure.query(() => listBatches()),
  operations: publicProcedure.query(() => listOperations()),
});
