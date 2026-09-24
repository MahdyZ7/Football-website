// Compiles .design-sync/styles.src.css with the app's own Tailwind v4 PostCSS
// plugin into .design-sync/.cache/ds.css (cfg.cssEntry). Called by prepare.mjs.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(join(root, 'package.json'));
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');

const from = join(here, 'styles.src.css');
const to = join(here, '.cache', 'ds.css');
const result = await postcss([tailwind({ base: root })]).process(readFileSync(from, 'utf8'), { from, to });
mkdirSync(dirname(to), { recursive: true });
writeFileSync(to, result.css);
console.log(`ds.css: ${(result.css.length / 1024).toFixed(0)} KB`);
