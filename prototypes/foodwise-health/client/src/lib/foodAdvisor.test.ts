import { describe, expect, it } from "vitest";
import { evaluateFoodForGout } from "./foodAdvisor";

describe("evaluateFoodForGout", () => {
  it("marks organ meats as avoid", () => {
    const verdict = evaluateFoodForGout({
      foodName: "ตับหมู",
      isFlare: false,
    });

    expect(verdict.status).toBe("avoid");
    expect(verdict.label).toBe("ไม่ควรกินเลย");
    expect(verdict.tags).toContain("พิวรีนสูง");
  });

  it("marks red meat as limit rather than an absolute ban", () => {
    const verdict = evaluateFoodForGout({
      foodName: "หมูย่าง",
      isFlare: false,
    });

    expect(verdict.status).toBe("limit");
    expect(verdict.label).toBe("ควรจำกัด");
  });

  it("recognizes tofu as a plant protein option", () => {
    const verdict = evaluateFoodForGout({
      foodName: "เต้าหู้",
      isFlare: false,
    });

    expect(verdict.status).toBe("ok");
    expect(verdict.label).toBe("กินได้");
  });

  it("never treats an unknown food as automatically safe", () => {
    const verdict = evaluateFoodForGout({
      foodName: "แกงกะหรี่สูตรครอบครัว",
      isFlare: false,
    });

    expect(verdict.status).toBe("needs-review");
    expect(verdict.label).toBe("ต้องดูส่วนผสมเพิ่ม");
  });

  it("keeps beer in the avoid category during a flare", () => {
    const verdict = evaluateFoodForGout({
      foodName: "เบียร์",
      isFlare: true,
    });

    expect(verdict.status).toBe("avoid");
    expect(verdict.isFlareSensitive).toBe(true);
  });
});
