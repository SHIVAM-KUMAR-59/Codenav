import { classifyQuery } from "../../modules/analysis/analysis.utils.";
import { describe, it, expect } from "vitest";

describe("classifyQuery", () => {
  describe("flow queries", () => {
    it("classifies 'how does X work' as flow", () => {
      expect(classifyQuery("How does authentication work?")).toBe("flow");
    });

    it("classifies 'walk me through' as flow", () => {
      expect(classifyQuery("Walk me through the request lifecycle")).toBe("flow");
    });

    it("classifies 'what happens when' as flow", () => {
      expect(classifyQuery("What happens when a user logs in?")).toBe("flow");
    });

    it("classifies 'explain X flow' as flow", () => {
      expect(classifyQuery("Explain the auth flow")).toBe("flow");
    });

    it("classifies 'lifecycle' as flow", () => {
      expect(classifyQuery("Show me the request lifecycle")).toBe("flow");
    });
  });

  describe("impact queries", () => {
    it("classifies 'what depends on' as impact", () => {
      expect(classifyQuery("What depends on the auth module?")).toBe("impact");
    });

    it("classifies 'what would break' as impact", () => {
      expect(classifyQuery("What would break if I change auth.service.ts?")).toBe("impact");
    });

    it("classifies 'who uses' as impact", () => {
      expect(classifyQuery("Who uses the database layer?")).toBe("impact");
    });

    it("classifies 'affected by' as impact", () => {
      expect(classifyQuery("What is affected by changing the user model?")).toBe("impact");
    });
  });

  describe("file queries", () => {
    it("classifies generic questions as file", () => {
      expect(classifyQuery("What does auth.service.ts do?")).toBe("file");
    });

    it("classifies module questions as file", () => {
      expect(classifyQuery("Explain the repository module")).toBe("file");
    });
  });
});
