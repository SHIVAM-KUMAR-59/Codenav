import fg from "fast-glob";
import path from "path";
import { EntryPoint } from "./types";

const ENTRY_POINT_PATTERNS: { pattern: string; type: EntryPoint["type"]; description: string }[] = [
  { pattern: "**/app.ts", type: "server", description: "Main application entry point" },
  { pattern: "**/app.js", type: "server", description: "Main application entry point" },
  { pattern: "**/main.ts", type: "server", description: "Main entry point" },
  { pattern: "**/main.js", type: "server", description: "Main entry point" },
  { pattern: "**/index.ts", type: "export", description: "Module entry point" },
  { pattern: "**/index.js", type: "export", description: "Module entry point" },
  { pattern: "**/server.ts", type: "server", description: "Server entry point" },
  { pattern: "**/server.js", type: "server", description: "Server entry point" },
  { pattern: "**/cli.ts", type: "cli", description: "CLI entry point" },
  { pattern: "**/cli.js", type: "cli", description: "CLI entry point" },
  { pattern: "**/routes/**/*.ts", type: "route", description: "Route definition" },
  { pattern: "**/routes/**/*.js", type: "route", description: "Route definition" },
  { pattern: "**/worker.ts", type: "worker", description: "Worker entry point" },
  { pattern: "**/worker.js", type: "worker", description: "Worker entry point" },
  { pattern: "**/workers/**/*.ts", type: "worker", description: "Worker definition" },
  { pattern: "**/workers/**/*.js", type: "worker", description: "Worker definition" },
];

const IGNORE_DIRS = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/coverage/**",
];

export async function detectEntryPoints(clonePath: string): Promise<EntryPoint[]> {
  const entryPoints: EntryPoint[] = [];
  const seen = new Set<string>();

  for (const { pattern, type, description } of ENTRY_POINT_PATTERNS) {
    const matches = await fg(pattern, {
      cwd: clonePath,
      onlyFiles: true,
      ignore: IGNORE_DIRS,
    });

    for (const match of matches) {
      const relativePath = path.relative(clonePath, path.join(clonePath, match));

      if (seen.has(relativePath)) continue;
      seen.add(relativePath);

      entryPoints.push({
        id: relativePath,
        path: relativePath,
        type,
        description,
      });
    }
  }

  return entryPoints;
}
