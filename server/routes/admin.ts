import { z } from "zod";
import {
  router,
  secureOwnerProcedure,
  checkAdminRateLimit,
  logAdminAction,
  TRPCError,
} from "./_helpers";
import { getAllAdminUsers, updateUserRole, removeAdminAccess } from "../db";
import { updateUserRoleSchema } from "../../shared/schemas";

export const adminRouter = router({
  listUsers: secureOwnerProcedure.query(async () => {
    return await getAllAdminUsers();
  }),

  updateUserRole: secureOwnerProcedure
    .input(updateUserRoleSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      if (input.userId === ctx.user?.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change your own role",
        });
      }
      await updateUserRole(input.userId, input.role);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "user",
        resourceId: input.userId,
        newValue: JSON.stringify({ role: input.role }),
      });
      return { success: true };
    }),

  removeUser: secureOwnerProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      if (input.userId === ctx.user?.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove your own admin access",
        });
      }
      await removeAdminAccess(input.userId);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "user",
        resourceId: input.userId,
      });
      return { success: true };
    }),
});
