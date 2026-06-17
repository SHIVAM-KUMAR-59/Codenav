import { describe, expect, it, vi, beforeEach } from "vitest";

const cloneMock = vi.fn();

vi.mock("simple-git", () => ({
  default: () => ({
    clone: cloneMock,
  }),
}));

vi.mock("fs/promises", () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
  },
}));

import fs from "fs/promises";
import { cloneRepository } from "../cloner";

describe("cloneRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates clone directory and clones GitHub repository", async () => {
    await cloneRepository("expressjs", "express", "/tmp/codenav/test");

    expect(fs.mkdir).toHaveBeenCalledWith("/tmp/codenav/test", {
      recursive: true,
    });

    expect(cloneMock).toHaveBeenCalledWith(
      "https://github.com/expressjs/express.git",
      "/tmp/codenav/test",
      ["--depth=1"]
    );
  });
});
