import { describe, expect, it } from "vitest";
import { startScheduler } from "./scheduler";

describe("Scheduler", () => {
  it("exports startScheduler as a function", () => {
    expect(typeof startScheduler).toBe("function");
  });

  it("is idempotent — calling twice does not throw", () => {
    // startScheduler guards against double-start with `started` flag
    // Note: this will register intervals but they won't fire during tests
    expect(() => {
      startScheduler();
      startScheduler();
    }).not.toThrow();
  });
});
