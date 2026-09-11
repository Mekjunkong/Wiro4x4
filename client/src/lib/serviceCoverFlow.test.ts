import { describe, expect, it } from "vitest";

import { getServiceCoverFlowPosition } from "./serviceCoverFlow";

describe("getServiceCoverFlowPosition", () => {
  it("maps the selected service and its neighbors", () => {
    expect(getServiceCoverFlowPosition(2, 2, 5)).toBe("active");
    expect(getServiceCoverFlowPosition(1, 2, 5)).toBe("previous");
    expect(getServiceCoverFlowPosition(3, 2, 5)).toBe("next");
    expect(getServiceCoverFlowPosition(0, 2, 5)).toBe("far-previous");
    expect(getServiceCoverFlowPosition(4, 2, 5)).toBe("far-next");
  });

  it("wraps the first and last services as adjacent slides", () => {
    expect(getServiceCoverFlowPosition(4, 0, 5)).toBe("previous");
    expect(getServiceCoverFlowPosition(1, 0, 5)).toBe("next");
    expect(getServiceCoverFlowPosition(3, 4, 5)).toBe("previous");
    expect(getServiceCoverFlowPosition(0, 4, 5)).toBe("next");
  });

  it("returns a safe active fallback before slides initialize", () => {
    expect(getServiceCoverFlowPosition(0, 0, 0)).toBe("active");
  });
});
