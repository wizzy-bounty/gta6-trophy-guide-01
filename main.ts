// Leonida Platinum Atlas — the entrypoint for gta6-trophy-guide-01 (Node 22, stdlib only).
// The guide itself is the static app/ folder: plain files a browser opens at
// app/index.html, offline, with its trophy data in app/data/trophies.json. This
// program hands it in: it copies app/ and screenshots/ from beside this file into
// the output directory and writes output/dossier.json, the summary the judge reads
// (the screenshots, the first load's files and bytes, and the source), using the
// vendored make.fun library. vendor/makefun-frontend.ts stays exactly as the kit
// shipped it: the scorer rebuilds the dossier with its own copy and compares bytes.
//
// Run it locally with: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead. The
// program never deletes the output directory itself — the grader's /output is a
// fresh writable folder, and deleting it would fail on its read-only parent.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTreeIntoOutput(sourceName) {
  const source = join(repoRoot, sourceName);
  const target = join(outDir, sourceName);
  if (!existsSync(source)) return;
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyTreeIntoOutput('app');
copyTreeIntoOutput('screenshots');

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in app/
// or 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
