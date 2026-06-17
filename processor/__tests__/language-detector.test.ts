import { describe, expect, it, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { detectLanguages } from "../language-detector";

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codenav-lang-"));
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

describe("detectLanguages", () => {
  it("detects languages from file extensions", async () => {
    await fs.writeFile(path.join(tempDir, "index.ts"), "");
    await fs.writeFile(path.join(tempDir, "app.tsx"), "");
    await fs.writeFile(path.join(tempDir, "server.js"), "");
    await fs.writeFile(path.join(tempDir, "README.md"), "");

    const result = await detectLanguages(tempDir);

    expect(result).toEqual(
      expect.arrayContaining([
        { language: "TypeScript", fileCount: 2, percentage: 50 },
        { language: "JavaScript", fileCount: 1, percentage: 25 },
        { language: "Markdown", fileCount: 1, percentage: 25 },
      ])
    );

    expect(result).toHaveLength(3);
  });

  it("ignores unsupported extensions", async () => {
    await fs.writeFile(path.join(tempDir, "notes.txt"), "");
    await fs.writeFile(path.join(tempDir, "binary.exe"), "");

    const result = await detectLanguages(tempDir);

    expect(result).toEqual([]);
  });

  it("ignores node_modules and build output", async () => {
    await fs.mkdir(path.join(tempDir, "node_modules/pkg"), { recursive: true });
    await fs.mkdir(path.join(tempDir, "dist"), { recursive: true });

    await fs.writeFile(path.join(tempDir, "index.ts"), "");
    await fs.writeFile(path.join(tempDir, "node_modules/pkg/index.js"), "");
    await fs.writeFile(path.join(tempDir, "dist/bundle.js"), "");

    const result = await detectLanguages(tempDir);

    expect(result).toEqual([{ language: "TypeScript", fileCount: 1, percentage: 100 }]);
  });
});
