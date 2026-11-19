// Leonida Platinum Atlas — hand-in program for gta6-trophy-guide-01 (Node 22, stdlib only).
// The guide itself is plain static files in app/ (index.html + style.css + app.js +
// data/trophies.json), served from app/index.html with no build step and no network
// at run time. This program copies app/ and screenshots/ from beside this file
// into /output and writes /output/dossier.json with the vendored make.fun library,
// byte for byte the dossier the scorer rebuilds. vendor/makefun-frontend.ts is the
// kit's copy and must not change. Outside the grader, MAKEFUN_OUTPUT_DIR stands
// in for /output:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps: at most 4 screenshots of 256 KiB each, app/ at most 993
// files and 48 MiB, and the dossier text capped at 160 KiB.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
