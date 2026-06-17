import fs from "node:fs/promises";
import path from "node:path";

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export function safeJoin(root: string, childPath: string) {
  const resolved = path.resolve(root, childPath);
  const normalizedRoot = path.resolve(root);

  if (resolved !== normalizedRoot && !resolved.startsWith(`${normalizedRoot}${path.sep}`)) {
    throw new Error(`Path escapes allowed root: ${childPath}`);
  }

  return resolved;
}

export function toPosixPath(value: string) {
  return value.split(path.sep).join("/");
}
