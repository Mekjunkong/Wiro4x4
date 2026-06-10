import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "fs";
import { dispatchN8nEvent } from "./n8nAutomation";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("dispatchN8nEvent", () => {
  it("skips dispatch when n8n is not configured", async () => {
    delete process.env.N8N_WEBHOOK_URL;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await dispatchN8nEvent("lead.created", { id: 1 });

    expect(result).toEqual({
      dispatched: false,
      reason: "n8n_webhook_not_configured",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("skips dispatch when explicitly disabled", async () => {
    process.env.N8N_AUTOMATION_ENABLED = "false";
    process.env.N8N_WEBHOOK_URL = "https://n8n.example/webhook/wiro";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await dispatchN8nEvent("booking.created", { id: 2 });

    expect(result).toEqual({ dispatched: false, reason: "n8n_disabled" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts a signed event envelope to the configured webhook", async () => {
    process.env.N8N_WEBHOOK_URL = "https://n8n.example/webhook/wiro";
    process.env.N8N_WEBHOOK_SECRET = "secret-123";
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await dispatchN8nEvent("booking.completed", {
      bookingId: 42,
    });

    expect(result.dispatched).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://n8n.example/webhook/wiro");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      "X-Wiro-Event": "booking.completed",
      "X-Wiro-Automation-Secret": "secret-123",
    });
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      source: "wiro4x4",
      schemaVersion: 1,
      event: "booking.completed",
      payload: { bookingId: 42 },
    });
    expect(body.eventId).toMatch(/^booking\.completed:/);
    expect(new Date(body.occurredAt).toString()).not.toBe("Invalid Date");
  });

  it("returns a non-throwing failure when n8n rejects the event", async () => {
    process.env.N8N_WEBHOOK_URL = "https://n8n.example/webhook/wiro";
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 401 }))
    );

    const result = await dispatchN8nEvent("lead.created", { id: 3 });

    expect(result).toEqual({
      dispatched: false,
      reason: "n8n_webhook_rejected",
      status: 401,
    });
  });
});

describe("n8n workflow exports", () => {
  it("routes every emitted Wiro event in the importable n8n router", () => {
    const expectedEvents = [
      "lead.created",
      "estimate.requested",
      "booking.created",
      "booking.status_changed",
      "booking.completed",
      "review.submitted",
      "review.status_updated",
      "newsletter.subscribed",
      "newsletter.sent",
      "abandoned.recovery_sent",
      "abandoned.batch_recovery_sent",
      "post_tour_review.scheduled",
      "post_tour_review.processed",
      "post_tour_review.event_tracked",
      "whatsapp.status_updated",
      "whatsapp.message_received",
    ];
    const workflow = JSON.parse(
      readFileSync("workflows/n8n/wiro-automation-router.json", "utf8")
    );
    const switchNode = workflow.nodes.find(
      (node: { id?: string }) => node.id === "route-event"
    );
    const routedEvents = switchNode.parameters.rules.values.map(
      (rule: { outputKey: string }) => rule.outputKey
    );

    expect(routedEvents).toEqual(expectedEvents);
    expect(workflow.connections["Route by Event Name"].main).toHaveLength(
      expectedEvents.length + 1
    );
  });
});
