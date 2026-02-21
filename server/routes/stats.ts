import { router, securePublicProcedure } from "./_helpers";
import { getPublicStats, getRecentBookings } from "../db";
import { formatDistanceToNow } from "date-fns";

export const statsRouter = router({
  public: securePublicProcedure.query(async () => {
    return await getPublicStats();
  }),

  recentBookings: securePublicProcedure.query(async () => {
    const rows = await getRecentBookings(5);
    return rows.map(r => ({
      firstName: r.firstName,
      tourName: r.tourName,
      timeAgo: formatDistanceToNow(new Date(r.createdAt), { addSuffix: true }),
    }));
  }),
});
