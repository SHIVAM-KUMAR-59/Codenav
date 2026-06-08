import simpleGit from "simple-git";
import fs from "fs/promises";

export async function cloneRepository(
  owner: string,
  name: string,
  clonePath: string
): Promise<void> {
  await fs.mkdir(clonePath, { recursive: true });

  const url = `https://github.com/${owner}/${name}.git`;

  await simpleGit().clone(url, clonePath, ["--depth=1"]);
}
