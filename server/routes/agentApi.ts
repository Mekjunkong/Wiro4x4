import { Router } from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { getDb } from "../db";
import {
  getAnalyticsOverview,
  getRevenueByMonth,
  getLeadFunnel,
  getTopTours,
  getRecentActivity,
} from "../db/analytics";
import { bookings } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const agentApi = Router();

// Auth middleware: require AGENT_API_KEY
agentApi.use((req: Request, res: Response, next: NextFunction) => {
  const key = req.headers["x-agent-key"];
  if (!process.env.AGENT_API_KEY) {
    res.status(503).json({ error: "Agent API not configured" });
    return;
  }
  if (key !== process.env.AGENT_API_KEY) {
    res.status(401).json({ error: "Invalid agent API key" });
    return;
  }
  next();
});

// Analytics summary
agentApi.get("/analytics/summary", async (_req: Request, res: Response) => {
  try {
    const overview = await getAnalyticsOverview();
    const topTours = await getTopTours();
    const funnel = await getLeadFunnel();
    res.json({ overview, topTours, funnel });
  } catch (_e) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Top pages
agentApi.get("/analytics/top-pages", async (_req: Request, res: Response) => {
  try {
    const topTours = await getTopTours();
    res.json({ topTours });
  } catch (_e) {
    res.status(500).json({ error: "Failed to fetch top pages" });
  }
});

// Pending bookings
agentApi.get("/bookings/pending", async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      res.json({ count: 0, pending: [] });
      return;
    }

    const pending = await db
      .select()
      .from(bookings)
      .where(eq(bookings.status, "pending"))
      .orderBy(desc(bookings.createdAt))
      .limit(20);

    res.json({ count: pending.length, pending });
  } catch (_e) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Booking pipeline / lead funnel
agentApi.get("/bookings/pipeline", async (_req: Request, res: Response) => {
  try {
    const funnel = await getLeadFunnel();
    res.json(funnel);
  } catch (_e) {
    res.status(500).json({ error: "Failed to fetch pipeline" });
  }
});

// Finance summary
agentApi.get("/finance/summary", async (_req: Request, res: Response) => {
  try {
    const revenue = await getRevenueByMonth();
    res.json({ revenue });
  } catch (_e) {
    res.status(500).json({ error: "Failed to fetch finance data" });
  }
});

// Recent activity
agentApi.get("/activity/recent", async (_req: Request, res: Response) => {
  try {
    const activity = await getRecentActivity();
    res.json({ activity });
  } catch (_e) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

export function registerAgentApiRoutes(app: Express) {
  app.use("/api/agent", agentApi);
}
