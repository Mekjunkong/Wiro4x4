import type { Express } from "express";
import { recordPostTourReviewClickByToken } from "../postTourReviewService";

const DEFAULT_REDIRECT = "https://wiro4x4indochina.com/reviews";

export function registerPostTourReviewClickRoute(app: Express) {
  app.get("/api/post-tour-review/click/:token", async (req, res) => {
    const token = String(req.params.token ?? "").trim();

    if (!token) {
      res.redirect(302, DEFAULT_REDIRECT);
      return;
    }

    try {
      const entry = await recordPostTourReviewClickByToken(token);
      if (!entry) {
        res.redirect(302, DEFAULT_REDIRECT);
        return;
      }

      const redirectUrl = `${DEFAULT_REDIRECT}?bookingId=${entry.bookingId}&source=whatsapp`;
      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("[PostTourReview] Click tracking error:", error);
      res.redirect(302, DEFAULT_REDIRECT);
    }
  });
}
