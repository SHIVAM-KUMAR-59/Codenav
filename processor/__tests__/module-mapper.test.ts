import { describe, expect, it, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { buildModuleMap } from "../module-mapper";

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codenav-modules-"));
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

describe("buildModuleMap", () => {
  it("groups files by top-level directory", async () => {
    await fs.mkdir(path.join(tempDir, "server"), { recursive: true });
    await fs.mkdir(path.join(tempDir, "client"), { recursive: true });

    await fs.writeFile(path.join(tempDir, "server/index.ts"), "");
    await fs.writeFile(path.join(tempDir, "server/app.ts"), "");
    await fs.writeFile(path.join(tempDir, "client/page.tsx"), "");

    const result = await buildModuleMap(tempDir);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "server",
          name: "server",
          fileCount: 2,
          files: expect.arrayContaining(["server/index.ts", "server/app.ts"]),
        }),
        expect.objectContaining({
          id: "client",
          name: "client",
          fileCount: 1,
          files: ["client/page.tsx"],
        }),
      ])
    );
  });

  it("groups root files under root module", async () => {
    await fs.writeFile(path.join(tempDir, "package.json"), "{}");
    await fs.writeFile(path.join(tempDir, "README.md"), "");

    const result = await buildModuleMap(tempDir);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "root",
          name: "root",
          fileCount: 2,
          files: expect.arrayContaining(["package.json", "README.md"]),
        }),
      ])
    );
  });

  it("ignores generated directories", async () => {
    await fs.mkdir(path.join(tempDir, "dist"), { recursive: true });
    await fs.mkdir(path.join(tempDir, "src"), { recursive: true });

    await fs.writeFile(path.join(tempDir, "dist/index.js"), "");
    await fs.writeFile(path.join(tempDir, "src/index.ts"), "");

    const result = await buildModuleMap(tempDir);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("src");
  });
});
