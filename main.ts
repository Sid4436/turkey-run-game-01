// Gobble Getaway's hand-in program (Node 22, standard library only).
// It copies the static game in game/ and its screenshots in screenshots/ to /output and
// writes /output/dossier.json with the kit's buildDossier, unchanged in vendor/.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyFolder(name: string): void {
  const from = join(repoRoot, name);
  mkdirSync(join(outputDir, name), { recursive: true });
  if (existsSync(from)) cpSync(from, join(outputDir, name), { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
// game/ is the playable game; screenshots/ holds its 3 or 4 renders, the first the cover.
for (const folder of ['game', 'screenshots']) copyFolder(folder);

// The scorer's caps: the dossier text is capped at 160 KiB; at most 4 screenshots of
// 256 KiB each; game/ holds at most 993 entries, 48 MiB, paths of at most 1000 bytes.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
