import fs from "fs/promises";

export async function cleanupRepository(clonePath: string): Promise<void> {
  try {
    await fs.rm(clonePath, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Failed to cleanup clone at ${clonePath}: ${error}`);
  }
}
