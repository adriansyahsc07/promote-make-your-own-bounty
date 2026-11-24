// Entry program for make.fun's "Promote make.fun's make-your-own-bounty post
// on X" bounty (post-x-promote-make-your-own-bounty-01). Node 22, standard
// library only, no network.
//
// The entry itself is a post on X; this repository only has to hand the
// post's address to the house. POST.json at the repository root names the
// post. This program reads that file, checks it really is a JSON object
// carrying a string "url", and writes its bytes unchanged into the output
// directory, where the gate reads them before the house reads the post
// itself from X. It prints nothing on success; on any problem it writes a
// message to stderr and exits 1.
//
// Local run:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Where the submitted repository is mounted in the grader; locally the
// caller points this at the repository root instead.
function sourceDir(): string {
  return process.env.MAKEFUN_BOT_DIR ?? '/bot';
}

// Where the gate expects POST.json to land.
function targetDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
}

// Read POST.json from the repository and return its raw bytes, so the copy
// the gate sees is byte for byte the file that was submitted. Throws a
// descriptive error when the file is absent or is not the expected shape.
function loadPostBytes(dir: string): Buffer {
  const path = join(dir, 'POST.json');
  if (!existsSync(path)) {
    throw new Error(`POST.json is missing from ${dir}`);
  }
  const bytes = readFileSync(path);
  const parsed: unknown = JSON.parse(bytes.toString('utf8'));
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('POST.json must hold a JSON object');
  }
  const url = (parsed as { url?: unknown }).url;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('POST.json must carry a non-empty string "url"');
  }
  return bytes;
}

function run(): void {
  const bytes = loadPostBytes(sourceDir());
  const out = targetDir();
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'POST.json'), bytes);
}

try {
  run();
} catch (err) {
  const detail = err instanceof Error ? err.message : String(err);
  console.error(`post-x-promote entry failed: ${detail}`);
  process.exit(1);
}
