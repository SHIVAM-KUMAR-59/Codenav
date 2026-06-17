import { describe, expect, it, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { detectEntryPoints } from "../entry-point-detector";

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codenav-entry-"));
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

describe("detectEntryPoints", () => {
  it("detects server entry points", async () => {
    await fs.writeFile(path.join(tempDir, "server.ts"), "");

    const result = await detectEntryPoints(tempDir);

    expect(result).toEqual(
      expect.arrayContaining([
        {
          id: "server.ts",
          path: "server.ts",
          type: "server",
          description: "Server entry point",
        },
      ])
    );
  });

  it("detects route files", async () => {
    await fs.mkdir(path.join(tempDir, "src/routes"), { recursive: true });
    await fs.writeFile(path.join(tempDir, "src/routes/auth.ts"), "");

    const result = await detectEntryPoints(tempDir);

    expect(result).toEqual(
      expect.arrayContaining([
        {
          id: "src/routes/auth.ts",
          path: "src/routes/auth.ts",
          type: "route",
          description: "Route definition",
        },
      ])
    );
  });

  it("does not duplicate files matched by multiple patterns", async () => {
    await fs.writeFile(path.join(tempDir, "index.ts"), "");

    const result = await detectEntryPoints(tempDir);

    expect(result.filter((entry) => entry.path === "index.ts")).toHaveLength(1);
  });

  it("ignores files inside node_modules", async () => {
    await fs.mkdir(path.join(tempDir, "node_modules/pkg"), { recursive: true });
    await fs.writeFile(path.join(tempDir, "node_modules/pkg/index.ts"), "");

    const result = await detectEntryPoints(tempDir);

    expect(result).toEqual([]);
  });
});
