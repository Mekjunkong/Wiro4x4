import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { router, securePublicProcedure } from "./_helpers";

export const authRouter = router({
  me: securePublicProcedure.query(opts => opts.ctx.user),
  logout: securePublicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});
