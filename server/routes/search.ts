import { z } from "zod";
import { router, secureProtectedProcedure } from "./_helpers";
import { globalSearch } from "../db/search";

export const searchRouter = router({
  global: secureProtectedProcedure
    .input(
      z.object({
        query: z.string().min(2).max(200),
      })
    )
    .query(async ({ input }) => {
      return await globalSearch(input.query);
    }),
});
