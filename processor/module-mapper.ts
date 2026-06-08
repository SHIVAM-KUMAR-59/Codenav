import fg from "fast-glob";
import path from "path";
import { Module } from "./types";

const IGNORE_DIRS = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/coverage/**",
  "**/.turbo/**",
];

export async function buildModuleMap(clonePath: string): Promise<Module[]> {
  const files = await fg("**/*", {
    cwd: clonePath,
    onlyFiles: true,
    ignore: IGNORE_DIRS,
  });

  const moduleMap: Record<string, string[]> = {};

  for (const file of files) {
    const parts = file.split("/");
    const topLevel = parts[0];

    if (!topLevel) continue;

    if (parts.length === 1) {
      moduleMap["root"] = [...(moduleMap["root"] ?? []), file];
    } else {
      moduleMap[topLevel] = [...(moduleMap[topLevel] ?? []), file];
    }
  }

  return Object.entries(moduleMap).map(([name, files]) => ({
    id: name,
    name,
    path: path.join(clonePath, name),
    fileCount: files.length,
    description: null,
    files,
  }));
}
