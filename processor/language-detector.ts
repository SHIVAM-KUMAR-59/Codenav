import fg from "fast-glob";
import path from "path";
import { LanguageStat } from "./types";

const EXTENSION_MAP: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".py": "Python",
  ".go": "Go",
  ".rs": "Rust",
  ".java": "Java",
  ".cpp": "C++",
  ".c": "C",
  ".cs": "C#",
  ".rb": "Ruby",
  ".php": "PHP",
  ".swift": "Swift",
  ".kt": "Kotlin",
  ".md": "Markdown",
  ".json": "JSON",
  ".yaml": "YAML",
  ".yml": "YAML",
  ".html": "HTML",
  ".css": "CSS",
  ".scss": "SCSS",
};

export async function detectLanguages(clonePath: string): Promise<LanguageStat[]> {
  const files = await fg("**/*", {
    cwd: clonePath,
    onlyFiles: true,
    ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
  });

  const languageCounts: Record<string, number> = {};
  let totalFiles = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const language = EXTENSION_MAP[ext];
    if (language) {
      languageCounts[language] = (languageCounts[language] ?? 0) + 1;
      totalFiles++;
    }
  }

  return Object.entries(languageCounts)
    .map(([language, fileCount]) => ({
      language,
      fileCount,
      percentage: Math.round((fileCount / totalFiles) * 100),
    }))
    .sort((a, b) => b.fileCount - a.fileCount);
}
