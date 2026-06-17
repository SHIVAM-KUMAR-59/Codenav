import { describe, expect, it, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { cleanupRepository } from "../cleaner";

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codenav-cleaner-"));
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

describe("cleanupRepository", () => {
  it("removes the cloned repository directory", async () => {
    const repoDir = path.join(tempDir, "repo");
    await fs.mkdir(repoDir, { recursive: true });
    await fs.writeFile(path.join(repoDir, "index.ts"), "");

    await cleanupRepository(repoDir);

    await expect(fs.access(repoDir)).rejects.toThrow();
  });

  it("does not throw if directory does not exist", async () => {
    const missingDir = path.join(tempDir, "missing");

    await expect(cleanupRepository(missingDir)).resolves.toBeUndefined();
  });
});
